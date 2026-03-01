import { SectionPipelineEngine } from "./SectionPipelineEngine";
import { ExportAuditEngine } from "./ExportAuditEngine";

export class AcademicOrchestrator {
    private pipelineEngine = new SectionPipelineEngine();
    private exportAuditEngine = new ExportAuditEngine();

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
