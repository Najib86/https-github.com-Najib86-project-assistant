import prisma from "@/lib/prisma";

export class FeedbackAnalytics {
    async recordGenerationMetrics(data: {
        projectId: number;
        chapterNumber: number;
        provider: string;
        retries: number;
        validationScore: number;
        wordCount: number;
        success: boolean;
        failureReason?: string;
    }) {
        try {
            await prisma.generationLog.create({
                data: {
                    projectId: data.projectId,
                    chapterNumber: data.chapterNumber,
                    provider: data.provider,
                    retries: data.retries,
                    validationScore: data.validationScore,
                    wordCount: data.wordCount,
                    success: data.success,
                    failureReason: data.failureReason
                }
            });
            console.log(`[FeedbackAnalytics] Metrics recorded for Chapter ${data.chapterNumber} (Provider: ${data.provider})`);
        } catch (error) {
            console.error("[FeedbackAnalytics] Error recording metrics:", error);
        }
    }
}
