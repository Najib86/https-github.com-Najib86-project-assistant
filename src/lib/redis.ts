import Redis from "ioredis";

const redisClient = new Redis(process.env.REDIS_URL!);

export const redis = {
    async get<T>(key: string): Promise<T | null> {
        const data = await redisClient.get(key);
        if (!data) return null;
        try {
            return JSON.parse(data) as T;
        } catch {
            return data as unknown as T;
        }
    },
    async set(key: string, value: any, options?: { ex?: number }): Promise<string | null> {
        const stringValue = typeof value === "string" ? value : JSON.stringify(value);
        if (options?.ex) {
            return await redisClient.set(key, stringValue, "EX", options.ex);
        } else {
            return await redisClient.set(key, stringValue);
        }
    },
    async incr(key: string): Promise<number> {
        return await redisClient.incr(key);
    },
    async expire(key: string, seconds: number): Promise<number> {
        return await redisClient.expire(key, seconds);
    }
};
