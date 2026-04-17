// src/app/api/chapters/[id]/route.ts
// GET + PUT chapter content with version history

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateSchema = z.object({
  content: z.string(),
  status: z.enum(["DRAFT", "SUBMITTED", "APPROVED", "NEEDS_REVISION", "NOT_STARTED"]).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const chapter = await prisma.chapter.findFirst({
    where: {
      id,
      project: {
        OR: [
          { ownerId: session.user.id },
          { supervisorId: session.user.id },
          { members: { some: { userId: session.user.id } } },
        ],
      },
    },
    include: {
      project: { select: { title: true, topic: true, level: true, ownerId: true } },
      versions: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, wordCount: true, createdAt: true, snapshot: true },
      },
      comments: {
        where: { resolved: false },
        include: { author: { select: { name: true, role: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }

  return NextResponse.json(chapter);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { content, status } = parsed.data;

  // Verify access
  const chapter = await prisma.chapter.findFirst({
    where: {
      id,
      project: {
        OR: [
          { ownerId: session.user.id },
          { supervisorId: session.user.id },
        ],
      },
    },
    include: { project: { select: { ownerId: true, supervisorId: true } } },
  });

  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }

  // Supervisors can only change status (approve/request revision), not content
  const isSupervisor = chapter.project.supervisorId === session.user.id;
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  const updated = await prisma.$transaction(async (tx) => {
    const updatedChapter = await tx.chapter.update({
      where: { id },
      data: {
        content: isSupervisor ? chapter.content : content,
        wordCount: isSupervisor ? chapter.wordCount : wordCount,
        status: status ?? chapter.status,
        updatedAt: new Date(),
        // Set submittedAt when status changes to SUBMITTED
        ...(status === "SUBMITTED" && !chapter.submittedAt ? { submittedAt: new Date() } : {}),
        // Set approvedAt when status changes to APPROVED
        ...(status === "APPROVED" && !chapter.approvedAt ? { approvedAt: new Date() } : {}),
      },
    });

    // Save version if content changed
    if (!isSupervisor && content !== chapter.content) {
      await tx.chapterVersion.create({
        data: {
          chapterId: id,
          content,
          wordCount,
          snapshot: JSON.stringify({ savedBy: session.user.id, savedAt: new Date() }),
        },
      });
    }

    // Log activity
    await tx.activityLog.create({
      data: {
        userId: session.user.id,
        projectId: chapter.projectId,
        action: status ? `CHAPTER_${status}` : "CHAPTER_SAVED",
        metadata: JSON.stringify({ chapterNumber: chapter.number, wordCount }),
      },
    });

    return updatedChapter;
  });

  return NextResponse.json({ success: true, chapter: updated });
}
