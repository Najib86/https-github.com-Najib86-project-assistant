import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import crypto from "crypto";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');

    if (!query) {
        return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
    }

    const cacheKey = `lit:search:${crypto.createHash("md5").update(query).digest("hex")}`;

    try {
        // Check cache
        const cached = await redis.get(cacheKey);
        if (cached) {
            console.log("Serving literature search from cache:", query);
            return NextResponse.json(cached);
        }

        const response = await fetch(`https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=5&fields=title,authors,year,url,abstract`, {
            headers: {
                // If you have an API key, add it here: 'x-api-key': process.env.SEMANTIC_SCHOLAR_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`Semantic Scholar API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Cache for 1 hour
        await redis.set(cacheKey, data, { ex: 3600 });

        return NextResponse.json(data);
    } catch (error) {
        console.error("Literature search error:", error);
        return NextResponse.json({ error: "Failed to fetch literature" }, { status: 500 });
    }
}
