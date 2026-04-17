// src/app/api/comments/route.ts
// POST — create a comment on a project/chapter

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CommentSchema = z.object({
  projectId:  z.string(),
  chapterId:  z.string().optional(),
  content:    z.string().min(1).max(2000),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = CommentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const { projectId, chapterId, content } = parsed.data;

  // Verify access to the project
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: session.user.id },
        { supervisorId: session.user.id },
        { members: { some: { userId: session.user.id } } },
      ],
    },
  });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const comment = await prisma.comment.create({
    data: {
      projectId,
      chapterId: chapterId ?? null,
      authorId: session.user.id,
      content,
    },
    include: {
      author: { select: { name: true, role: true } },
    },
  });

  return NextResponse.json({ success: true, comment }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const chapterId = searchParams.get("chapterId");

  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

  const comments = await prisma.comment.findMany({
    where: {
      projectId,
      ...(chapterId ? { chapterId } : {}),
      project: {
        OR: [
          { ownerId: session.user.id },
          { supervisorId: session.user.id },
        ],
      },
    },
    include: {
      author: { select: { name: true, role: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ comments });
}
