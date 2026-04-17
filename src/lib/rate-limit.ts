import { redis } from "@/lib/redis";

export async function rateLimit(userId: string) {
    try {
        const key = `ratelimit:user:${userId}`;

        const count = await redis.incr(key);

        if (count === 1) await redis.expire(key, 60);

        if (count > 10) {
            throw new Error("Too many AI requests. Try again in 1 minute.");
        }
    } catch (error) {
        if (error instanceof Error && error.message.includes("Too many AI requests")) {
            throw error;
        }
        console.warn("Rate limit check failed due to Redis issue, bypassing...", error);
    }
}
