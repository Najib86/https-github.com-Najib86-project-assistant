import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function POST(req: Request) {
    try {
        const { userId, projectId, progress } = await req.json();

        if (!userId || !projectId || progress === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const key = `progress:user:${userId}:project:${projectId}`;

        // Store progress with TTL = 24 hours
        await redis.set(key, progress, { ex: 86400 });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error saving progress:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
