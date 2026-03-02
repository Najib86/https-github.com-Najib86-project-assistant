import { SectionPipelineEngine } from "./SectionPipelineEngine";
import { ExportAuditEngine } from "./ExportAuditEngine";
import { GroqProvider } from "./providers/groq";
import { FeedbackAnalytics } from "./FeedbackAnalytics";
import { ValidationEngine } from "./ValidationEngine";
import { AIProvider } from "./ai.types";

export class AcademicOrchestrator {
    private pipelineEngine = new SectionPipelineEngine();
    private exportAuditEngine = new ExportAuditEngine();
    private feedbackAnalytics = new FeedbackAnalytics();
    private validationEngine = new ValidationEngine();

    async generateRaw(prompt: string): Promise<{ success: boolean; content: string; error?: string }> {
        let provider: AIProvider = new GroqProvider();

        if (!provider.isEnabled()) {
            const { GeminiProvider } = await import("./providers/gemini");
            provider = new GeminiProvider();

            if (!provider.isEnabled()) {
                return { success: false, content: "", error: "No AI Providers available. Please configure Groq or Gemini." };
            }
        }

        try {
            const content = await provider.generate(prompt);
            await this.feedbackAnalytics.recordGenerationMetrics({
                projectId: 0,
                chapterNumber: 0,
                provider: provider.name,
                retries: 0,
                validationScore: 100,
                wordCount: content.split(/\s+/).length,
                success: true
            });
            return { success: true, content };
        } catch (e: any) {
            await this.feedbackAnalytics.recordGenerationMetrics({
                projectId: 0,
                chapterNumber: 0,
                provider: provider.name,
                retries: 0,
                validationScore: 0,
                wordCount: 0,
                success: false,
                failureReason: e.message
            });
            return { success: false, content: "", error: e.message };
        }
    }

    validateSectionStructure(chapterNum: number, content: string): boolean {
        const res = this.validationEngine.validateSection("Chapter " + chapterNum, content);
        return res.isValid || res.wordCount > 100;
    }

    calculateValidationScore(content: string): number {
        return this.validationEngine.validateSection("Chapter", content).score;
    }

    /**
     * Generates a specific chapter or section reliably with validation and self-healing.
     */
    async generateSection(
        projectId: number,
        chapterNumber: number,
        chapterTitle: string,
        topic: string,
        level: string,
        sampleText?: string,
        academicMetadata?: Record<string, any>
    ) {
        return await this.pipelineEngine.processSection(
            projectId,
            chapterNumber,
            chapterTitle,
            topic,
            level,
            sampleText,
            academicMetadata
        );
    }

    /**
     * Runs export safety checks
     */
    async auditProjectRequirements(projectId: number) {
        return await this.exportAuditEngine.auditProject(projectId);
    }
}
