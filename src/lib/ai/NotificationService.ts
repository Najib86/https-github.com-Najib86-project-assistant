import { redis } from "@/lib/redis";

export class NotificationService {
    // We emit events via Redis PubSub so that a separate SSE/WebSocket server can broadcast it.

    async emit(projectId: number, event: string, data: any) {
        const payload = {
            projectId,
            event,
            timestamp: new Date().toISOString(),
            data
        };
        try {
            if ('publish' in redis) {
                await (redis as any).publish(`project:${projectId}:events`, JSON.stringify(payload));
            }
            console.log(`[NotificationService] Emitted ${event} for project ${projectId}`);
        } catch (e) {
            console.error("[NotificationService] Error emitting event:", e);
        }
    }

    async emitChapterStarted(projectId: number, chapterNumber: number) {
        await this.emit(projectId, "CHAPTER_GENERATION_STARTED", { chapterNumber });
    }

    async emitChapterValidating(projectId: number, chapterNumber: number) {
        await this.emit(projectId, "CHAPTER_VALIDATING", { chapterNumber });
    }

    async emitChapterRetrying(projectId: number, chapterNumber: number, attempt: number, reason: string) {
        await this.emit(projectId, "CHAPTER_RETRYING", { chapterNumber, attempt, reason });
    }

    async emitProviderSwitched(projectId: number, newProvider: string) {
        await this.emit(projectId, "PROVIDER_SWITCHED", { newProvider });
    }

    async emitChapterCompleted(projectId: number, chapterNumber: number) {
        await this.emit(projectId, "CHAPTER_COMPLETED", { chapterNumber });
    }

    async emitProjectCompleted(projectId: number) {
        await this.emit(projectId, "PROJECT_FULLY_COMPLETED", {});
    }
}
