import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const cacheKey = "stats:dashboard";

        // Check cache
        const cachedStats = await redis.get(cacheKey);
        if (cachedStats) {
            return NextResponse.json(cachedStats);
        }

        // Calculate stats from DB
        const [projectCount, userCount, chapterCount] = await Promise.all([
            prisma.project.count(),
            prisma.user.count(),
            prisma.chapter.count()
        ]);

        const stats = {
            projectCount,
            userCount,
            chapterCount,
            updatedAt: new Date().toISOString()
        };

        // Cache for 5 minutes
        await redis.set(cacheKey, stats, { ex: 300 });

        return NextResponse.json(stats);
    } catch (error: any) {
        console.error("Dashboard stats error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
