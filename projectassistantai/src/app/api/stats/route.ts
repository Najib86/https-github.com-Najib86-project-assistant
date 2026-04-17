// src/app/api/stats/route.ts
// GET public platform statistics

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Cache for 5 minutes
let cache: { data: object; ts: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export async function GET() {
  // Return cached stats if fresh
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    const [users, projects, prompts, chapters] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.generatedPrompt.count(),
      prisma.chapter.count({ where: { status: { not: "NOT_STARTED" } } }),
    ]);

    const data = {
      totalUsers:    users,
      totalProjects: projects,
      totalPrompts:  prompts,
      totalChapters: chapters,
      updatedAt:     new Date().toISOString(),
    };

    // Update DB stats
    await prisma.siteStats.upsert({
      where: { id: "main" },
      create: { id: "main", ...data },
      update: data,
    }).catch(() => {}); // Non-blocking

    cache = { data, ts: Date.now() };
    return NextResponse.json(data);
  } catch {
    // Return fallback stats if DB fails
    return NextResponse.json({
      totalUsers: 0, totalProjects: 0,
      totalPrompts: 0, totalChapters: 0,
    });
  }
}
