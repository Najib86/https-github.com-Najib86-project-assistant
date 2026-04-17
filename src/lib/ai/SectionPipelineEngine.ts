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
        academicMetadata?: Record<string, unknown>
    ) {
        const initialPrompt = this.buildInitialPrompt(chapterNumber, chapterTitle, topic, level, sampleText, academicMetadata);
        let currentPrompt = initialPrompt;

        await this.notificationService.emitChapterStarted(projectId, chapterNumber);

        let lastError: string | null = null;

        for (const providerName of AI_CONFIG.priority) {
            const provider = this.providers.get(providerName);

            if (!provider || !provider.isEnabled()) continue;
            if (this.unhealthyProviders.has(providerName)) continue;

            let attempt = 0;
            const maxStructuralRetries = 4; // Increased from 3 to 4

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
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error ? error.message : String(error);

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

    private buildInitialPrompt(chapterNum: number, chapterTitle: string, topic: string, level: string, sampleText?: string, academicMetadata?: Record<string, unknown> | null) {
        let contextStr = "";
        if (academicMetadata) {
            const institution = academicMetadata.institution as Record<string, unknown> | undefined;
            const research = academicMetadata.research as Record<string, unknown> | undefined;
            contextStr += `Student Context:
- Programme: ${institution?.programme || "N/A"}
- Faculty: ${institution?.faculty || "N/A"}
- Department: ${institution?.department || "N/A"}
- Institution: ${institution?.name || "N/A"}
- Research Area: ${research?.area || "N/A"}
- Keywords: ${Array.isArray(research?.keywords) ? research.keywords.join(", ") : research?.keywords || ""}\n`;
        }

        // Extract template structure if available
        let templateStructure = "";
        const templateRef = academicMetadata?.templateStructureReference;
        if (templateRef && Array.isArray(templateRef)) {
            const templateChapter = templateRef.find((ch: Record<string, unknown>) => ch.id === chapterNum || ch.chapterNumber === chapterNum);
            if (templateChapter) {
                const subSecs = templateChapter.subsections as Array<Record<string, unknown> | string> | undefined;
                templateStructure = `\n=== TEMPLATE STRUCTURE FOR THIS CHAPTER ===
Chapter Title: ${templateChapter.title || chapterTitle}
${subSecs ? `Required Subsections:\n${subSecs.map((s) => `- ${typeof s === 'string' ? s : s?.title || ''}`).join('\n')}` : ''}
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

CRITICAL INSTRUCTIONS - READ CAREFULLY:
1. **WRITE COMPLETE CONTENT**: This is NOT an outline. Write the FULL, DETAILED chapter content.
2. **MINIMUM LENGTH**: Write at least 2000 words for major chapters (Chapter 1-5). Do not stop early. Ensure comprehensive coverage.
3. **FORMATTING**: Use Markdown formatting (## for main headings, ### for subheadings).
4. **NO AI LANGUAGE - CRITICAL**: AVOID the following AI-sounding words and phrases AT ALL COSTS: "Delve", "Moreover", "Furthermore", "In conclusion", "Robust", "Seamless", "Tapestry", "Crucial", "Vital", "It is important to note", "As a matter of fact", "Sheds light", "Navigating", "Landscape", "Realm", "In today's fast-paced world". USE NATURAL, ACADEMIC SYNONYMS OR OMIT ENTIRELY. NEVER use phrases like "As an AI", "Here is the chapter", "Certainly", "I'll help you".
5. **TONE AND STYLE**: Write in a formal, scholarly third-person tone (e.g., "This study investigates..."). No first-person or second-person pronouns.
6. **START DIRECTLY**: Begin immediately with the academic content. No introductions about what you're doing.
7. **SECTION REQUIREMENTS**: Include ALL subsections listed in the template above.
8. **ACADEMIC STANDARDS**: Use formal academic tone, adhere to the specified citation style, and provide clear, well-supported explanations based on empirical literature and theoretical frameworks.
9. **COMPLETE ENDINGS**: End each section properly with conclusions. Do not truncate.
10. **CONTINUOUS WRITING**: Write continuously without stopping. Fill out all sections completely. Ensure semantic richness and avoid structural redundancy.

IMPORTANT: You must write the ENTIRE chapter content now. Do not summarize or outline. Write full paragraphs with detailed explanations for each subsection.

${sampleText ? `\nSTYLE REFERENCE (match this writing style):\n"${sampleText.substring(0, 4000)}..."\n` : ""}

BEGIN WRITING THE COMPLETE CHAPTER NOW (Start directly with content, no preamble):`;
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
