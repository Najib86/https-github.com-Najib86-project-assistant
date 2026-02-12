import { NextResponse } from "next/server";
import { generateChapterContent } from "@/lib/ai-service";
import { redis } from "@/lib/redis";
import { rateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const { projectId, chapterNumber, chapterTitle, topic, level, sampleText, userId, department } = await req.json();

        if (!projectId || !chapterNumber || !topic) {
            return NextResponse.json({ error: "Missing required fields (Project ID, Chapter Number, Topic)" }, { status: 400 });
        }

        // 1. Rate Limiting
        if (userId) {
            await rateLimit(userId.toString());
        }

        // 2. Redis Caching
        const topicHash = crypto.createHash("md5").update(topic).digest("hex");
        const cacheKey = `chapter:${department || "general"}:${topicHash}:${chapterNumber}`;

        const cachedChapter = await redis.get(cacheKey);
        if (cachedChapter) {
            console.log("Serving from cache:", cacheKey);
            return NextResponse.json(cachedChapter);
        }

        const chapter = await generateChapterContent(
            parseInt(projectId),
            parseInt(chapterNumber),
            chapterTitle || `Chapter ${chapterNumber}`,
            topic,
            level,
            sampleText
        );

        // Store in Redis with TTL = 1 hour
        await redis.set(cacheKey, chapter, { ex: 3600 });

        return NextResponse.json(chapter);

    } catch (error: any) {
        console.error("Error generating chapter:", error);
        return NextResponse.json({ error: error.message || "Failed to generate chapter" }, { status: 500 });
    }
}

