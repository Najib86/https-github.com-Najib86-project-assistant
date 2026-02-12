import { redis } from "@/lib/redis";

export async function rateLimit(userId: string) {
    const key = `ratelimit:user:${userId}`;

    const count = await redis.incr(key);

    if (count === 1) await redis.expire(key, 60);

    if (count > 10) {
        throw new Error("Too many AI requests. Try again in 1 minute.");
    }
}
