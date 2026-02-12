import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/ai-service";
import { redis } from "@/lib/redis";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const { topic, query, userId } = await req.json();

        if (!topic || !query) {
            return NextResponse.json({ error: "Missing topic or query" }, { status: 400 });
        }

        const topicHash = crypto.createHash("md5").update(topic).digest("hex");
        const queryHash = crypto.createHash("md5").update(query).digest("hex");
        const cacheKey = `synthesis:${topicHash}:${queryHash}`;

        // Check cache
        const cachedResult = await redis.get(cacheKey);
        if (cachedResult) {
            console.log("Serving synthesis from cache");
            return NextResponse.json({ result: cachedResult });
        }

        const prompt = `Perform a smart synthesis for the topic: "${topic}" based on the query: "${query}". Provide a coherent academic summary.`;
        const result = await generateAIResponse(prompt, "text");

        // Store in Redis with TTL = 6 hours
        await redis.set(cacheKey, result, { ex: 21600 });

        return NextResponse.json({ result });
    } catch (error: any) {
        console.error("Synthesis error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
