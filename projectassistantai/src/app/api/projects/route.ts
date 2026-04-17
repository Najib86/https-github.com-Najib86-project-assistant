// src/app/api/projects/route.ts
// GET (list) + POST (create) projects

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { nanoid } from "nanoid"; // Note: add nanoid to package.json

const CreateProjectSchema = z.object({
  title: z.string().min(5).max(300),
  topic: z.string().min(5),
  description: z.string().optional(),
  level: z.enum(["BSc", "MSc", "PhD"]).default("BSc"),
  department: z.string().optional(),
  faculty: z.string().optional(),
  institution: z.string().optional(),
  studyLocation: z.string().optional(),
  theory1: z.string().optional(),
  theory2: z.string().optional(),
  researchDesign: z.string().optional(),
  sampleSize: z.string().optional(),
  targetPages: z.string().default("90-120"),
});

// ── GET — List user's projects ────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 50);
  const status = searchParams.get("status");

  const where =
    session.user.role === "SUPERVISOR"
      ? {
          OR: [
            { supervisorId: session.user.id },
            { ownerId: session.user.id },
          ],
          ...(status ? { status: status as never } : {}),
        }
      : {
          OR: [
            { ownerId: session.user.id },
            { members: { some: { userId: session.user.id } } },
          ],
          ...(status ? { status: status as never } : {}),
        };

  const [projects, total] = await prisma.$transaction([
    prisma.project.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        owner: { select: { name: true, email: true } },
        supervisor: { select: { name: true } },
        chapters: {
          select: { number: true, status: true, wordCount: true },
        },
        _count: { select: { comments: true } },
      },
    }),
    prisma.project.count({ where }),
  ]);

  return NextResponse.json({
    projects: projects.map(p => ({
      ...p,
      progress: Math.round(
        (p.chapters.filter(c => c.status === "APPROVED").length / 5) * 100
      ),
    })),
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
}

// ── POST — Create new project ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = CreateProjectSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Generate unique supervisor invite code
  const supervisorCode = nanoid(12);

  const project = await prisma.$transaction(async tx => {
    const newProject = await tx.project.create({
      data: {
        ...data,
        ownerId: session.user.id,
        supervisorCode,
      },
    });

    // Pre-create all 5 chapters
    const chapterTitles = [
      "Introduction",
      "Literature Review",
      "Research Methodology",
      "Data Presentation and Analysis",
      "Summary, Conclusion and Recommendations",
    ];

    await tx.chapter.createMany({
      data: chapterTitles.map((title, i) => ({
        projectId: newProject.id,
        number: i + 1,
        title,
        status: "NOT_STARTED",
      })),
    });

    // Log activity
    await tx.activityLog.create({
      data: {
        userId: session.user.id,
        projectId: newProject.id,
        action: "PROJECT_CREATED",
        metadata: JSON.stringify({ title: data.title, level: data.level }),
      },
    });

    // Update site stats
    await tx.siteStats.upsert({
      where: { id: "main" },
      create: { id: "main", totalProjects: 1 },
      update: { totalProjects: { increment: 1 } },
    });

    return newProject;
  });

  return NextResponse.json({ success: true, project }, { status: 201 });
}
