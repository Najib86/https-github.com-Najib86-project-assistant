import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const projectId = searchParams.get("projectId");

        if (!userId || !projectId) {
            return NextResponse.json({ error: "Missing userId or projectId" }, { status: 400 });
        }

        const key = `progress:user:${userId}:project:${projectId}`;
        const progress = await redis.get(key);

        return NextResponse.json({ progress });
    } catch (error: any) {
        console.error("Error loading progress:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
