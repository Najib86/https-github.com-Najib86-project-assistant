/**
 * Redis is currently REMOVED from the system.
 * This file provides a no-op implementation of the redis utility 
 * to maintain compatibility with existing code without requiring a Redis server.
 */

export const redis = {
    async get<T>(key: string): Promise<T | null> {
        return null;
    },
    async set(key: string, value: any, options?: { ex?: number, nx?: boolean }): Promise<string | null> {
        return "OK";
    },
    async incr(key: string): Promise<number> {
        return 1;
    },
    async expire(key: string, seconds: number): Promise<number> {
        return 1;
    },
    async del(key: string): Promise<number> {
        return 1;
    },
    async publish(channel: string, message: string): Promise<number> {
        console.log(`[StubRedis] Publish to ${channel}: ${message.substring(0, 50)}...`);
        return 1;
    }
};
