import prisma from "@/lib/prisma";

export class ExportAuditEngine {
    async auditProject(projectId: number): Promise<{ isReady: boolean; errors: string[] }> {
        const errors: string[] = [];

        const project = await prisma.project.findUnique({
            where: { project_id: projectId },
            include: { chapters: true }
        });

        if (!project) {
            return { isReady: false, errors: ["Project not found"] };
        }

        const requiredChapters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        const existingChapters = project.chapters.map(c => c.chapterNumber);

        for (const req of requiredChapters) {
            if (!existingChapters.includes(req)) {
                errors.push(`Missing chapter/section ID: ${req}`);
            }
        }

        let totalWordCount = 0;
        let hasPlaceholders = false;
        let hasEmptySections = false;

        for (const chapter of project.chapters) {
            const content = chapter.content || "";
            if (content.trim().length === 0) {
                errors.push(`Chapter ${chapter.chapterNumber} is empty.`);
                hasEmptySections = true;
                continue;
            }

            const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
            totalWordCount += wordCount;

            if (content.includes("[Insert") || content.includes("[Your")) {
                hasPlaceholders = true;
                errors.push(`Chapter ${chapter.chapterNumber} contains unresolved placeholders.`);
            }
        }

        const MIN_TOTAL_WORDS = 6000;
        if (totalWordCount < MIN_TOTAL_WORDS) {
            errors.push(`Total project word count (${totalWordCount}) is below the required academic threshold (${MIN_TOTAL_WORDS}).`);
        }

        const isReady = errors.length === 0 && !hasPlaceholders && !hasEmptySections;

        return { isReady, errors };
    }
}
