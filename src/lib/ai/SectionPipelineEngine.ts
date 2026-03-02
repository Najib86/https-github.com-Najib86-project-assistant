import { ValidationEngine } from "./ValidationEngine";
import { RepairEngine } from "./RepairEngine";
import { FeedbackAnalytics } from "./FeedbackAnalytics";
import { NotificationService } from "./NotificationService";
import { AIProvider } from "./ai.types";
import { AI_CONFIG } from "./ai.config";
import { GroqProvider } from "./providers/groq";
import { GeminiProvider } from "./providers/gemini";
import { HuggingFaceProvider } from "./providers/huggingface";
import prisma from "@/lib/prisma";
import { RESEARCH_GUIDELINES } from "@/lib/guidelines";

export class SectionPipelineEngine {
    private providers: Map<string, AIProvider>;
    private unhealthyProviders: Set<string> = new Set();

    private validationEngine = new ValidationEngine();
    private repairEngine = new RepairEngine();
    private feedbackAnalytics = new FeedbackAnalytics();
    private notificationService = new NotificationService();

    constructor() {
        this.providers = new Map([
            ["groq", new GroqProvider()],
            ["gemini", new GeminiProvider()],
            ["huggingface", new HuggingFaceProvider()]
        ]);
    }

    private isPermanentError(message: string): boolean {
        const permanentIndicators = ["PERMANENT_ERROR", "model_decommissioned", "404", "410", "gone"];
        return permanentIndicators.some(indicator => message.toLowerCase().includes(indicator.toLowerCase()));
    }

    async processSection(
        projectId: number,
        chapterNumber: number,
        chapterTitle: string,
        topic: string,
        level: string,
        sampleText?: string,
        academicMetadata?: Record<string, any>
    ) {
        let initialPrompt = this.buildInitialPrompt(chapterNumber, chapterTitle, topic, level, sampleText, academicMetadata);
        let currentPrompt = initialPrompt;

        await this.notificationService.emitChapterStarted(projectId, chapterNumber);

        let lastError: string | null = null;

        for (const providerName of AI_CONFIG.priority) {
            const provider = this.providers.get(providerName);

            if (!provider || !provider.isEnabled()) continue;
            if (this.unhealthyProviders.has(providerName)) continue;

            let attempt = 0;
            const maxStructuralRetries = 3;

            while (attempt < maxStructuralRetries) {
                if (attempt > 0) {
                    await this.notificationService.emitChapterRetrying(projectId, chapterNumber, attempt, "Structural Repair");
                }

                try {
                    console.log(`[SectionPipeline] Generating ${chapterTitle} via ${providerName} (Attempt ${attempt + 1})`);

                    const startRawContent = await provider.generate(currentPrompt); // generate using the prompt
                    const content = startRawContent.replace(/```markdown/gi, "").replace(/```/g, "").trim();

                    if (!content || content.length < 50) {
                        throw new Error("Response critically short or empty");
                    }

                    // Validation Layer
                    await this.notificationService.emitChapterValidating(projectId, chapterNumber);
                    const validationResult = this.validationEngine.validateSection(chapterTitle, content);

                    if (validationResult.isValid) {
                        // Success!
                        await this.feedbackAnalytics.recordGenerationMetrics({
                            projectId, chapterNumber, provider: providerName,
                            retries: attempt, validationScore: validationResult.score,
                            wordCount: validationResult.wordCount, success: true
                        });

                        await this.notificationService.emitChapterCompleted(projectId, chapterNumber);

                        return await this.saveValidatedSection(projectId, chapterNumber, chapterTitle, content);
                    } else {
                        // Structural Failure - Auto-Repair
                        console.warn(`[SectionPipeline] Validation failed for ${chapterTitle}. Score: ${validationResult.score}. Errors: ${validationResult.errors.join(", ")}`);

                        await this.feedbackAnalytics.recordGenerationMetrics({
                            projectId, chapterNumber, provider: providerName,
                            retries: attempt, validationScore: validationResult.score,
                            wordCount: validationResult.wordCount, success: false,
                            failureReason: validationResult.errors.join(", ")
                        });

                        currentPrompt = initialPrompt + "\n\n" + this.repairEngine.generateRepairPrompt(chapterTitle, validationResult);
                        attempt++;

                        if (attempt >= maxStructuralRetries) {
                            console.error(`[SectionPipeline] Max retries reached for ${chapterTitle} on provider ${providerName}. Switching provider...`);
                        }
                    }
                } catch (error: any) {
                    const errorMessage = error.message || String(error);

                    if (this.isPermanentError(errorMessage)) {
                        this.unhealthyProviders.add(providerName);
                        lastError = errorMessage;
                        break; // Move to next provider
                    }

                    console.warn(`[SectionPipeline] Transient error on ${providerName}: ${errorMessage}`);
                    lastError = errorMessage;
                    attempt++; // Will retry on same provider if < maxStructuralRetries, but prompt remains unchanged.
                }
            } // end while attempt < maxStructuralRetries

            await this.notificationService.emitProviderSwitched(projectId, "next-provider");
        } // end provider loop

        // Fallback to mock removed for production reliability
        // If we reach here, all providers failed
        throw new Error(`Failed to generate section ${chapterTitle} successfully. Last error: ${lastError}`);
    }

    private buildInitialPrompt(chapterNum: number, chapterTitle: string, topic: string, level: string, sampleText?: string, academicMetadata?: any) {
        let contextStr = "";
        if (academicMetadata) {
            contextStr += `Student Context:
- Programme: ${academicMetadata.institution?.programme || "N/A"}
- Faculty: ${academicMetadata.institution?.faculty || "N/A"}
- Department: ${academicMetadata.institution?.department || "N/A"}
- Institution: ${academicMetadata.institution?.name || "N/A"}
- Research Area: ${academicMetadata.research?.area || "N/A"}
- Keywords: ${Array.isArray(academicMetadata.research?.keywords) ? academicMetadata.research.keywords.join(", ") : academicMetadata.research?.keywords || ""}\n`;
        }

        // Extract template structure if available
        let templateStructure = "";
        if (academicMetadata?.templateStructureReference && Array.isArray(academicMetadata.templateStructureReference)) {
            const templateChapter = academicMetadata.templateStructureReference.find((ch: any) => ch.id === chapterNum || ch.chapterNumber === chapterNum);
            if (templateChapter) {
                templateStructure = `\n=== TEMPLATE STRUCTURE FOR THIS CHAPTER ===
Chapter Title: ${templateChapter.title || chapterTitle}
${templateChapter.subsections ? `Required Subsections:\n${templateChapter.subsections.map((s: any) => `- ${s.title || s}`).join('\n')}` : ''}
${templateChapter.description ? `Description: ${templateChapter.description}` : ''}
${templateChapter.wordCount ? `Target Word Count: ${templateChapter.wordCount} words` : ''}
${templateChapter.guidelines ? `Additional Guidelines: ${templateChapter.guidelines}` : ''}
===========================================\n`;
            }
        }

        return `Context: You are an expert academic writer and researcher. You are writing a specific section/chapter for a final year project report (Level: ${level || "University"}).
        
Project Topic: "${topic}"
Current Section/Chapter: ${chapterTitle} (ID: ${chapterNum})
${contextStr}
${templateStructure}

=== STRICT UNIVERSITY GUIDELINES ===
${RESEARCH_GUIDELINES}
====================================

CRITICAL INSTRUCTIONS:
1. **ELABORATE & DETAILED**: Write the actual full content. Do NOT write an outline or summary.
2. **FORMATTING**: Use Markdown formatting (## for main headings, ### for subheadings).
3. **NEVER USE AI ARTIFICIAL FILLERS**: Start exactly with the academic text. Do not include phrases like "As an AI" or "Here is the chapter".
4. **SECTION REQUIREMENTS**: You are writing ONLY "${chapterTitle}". Be exhaustive and comprehensive.
5. **FOLLOW TEMPLATE**: If a template structure is provided above, strictly follow the subsections and guidelines specified.
6. **ACADEMIC STANDARDS**: Ensure proper academic tone, citations where needed, and formal language throughout.
7. **MINIMUM LENGTH**: Write at least 2500 words for major chapters (Chapter 1-5). Preliminary pages can be shorter but must be complete.

TASK: Write the COMPLETE and EXTREMELY DETAILED content for "${chapterTitle}" now.
${sampleText ? `\nStyle Reference (match this writing style):\n"${sampleText.substring(0, 4000)}..."\n` : ""}

BEGIN WRITING NOW:`;
    }

    private async saveValidatedSection(projectId: number, chapterNumber: number, title: string, content: string) {
        return await prisma.chapter.upsert({
            where: {
                projectId_chapterNumber: { projectId, chapterNumber }
            },
            update: {
                content,
                status: "Draft",
                updatedAt: new Date()
            },
            create: {
                projectId,
                chapterNumber,
                title,
                content,
                status: "Draft"
            }
        });
    }
}
