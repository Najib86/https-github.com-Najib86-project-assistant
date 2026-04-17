// src/app/api/projects/[id]/route.ts
// GET, PUT, DELETE a single project

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateSchema = z.object({
  title:         z.string().min(5).max(300).optional(),
  topic:         z.string().min(5).optional(),
  description:   z.string().optional(),
  status:        z.enum(["DRAFT","IN_PROGRESS","SUBMITTED","UNDER_REVIEW","APPROVED","REJECTED"]).optional(),
  level:         z.enum(["BSc","MSc","PhD"]).optional(),
  department:    z.string().optional(),
  faculty:       z.string().optional(),
  studyLocation: z.string().optional(),
  theory1:       z.string().optional(),
  theory2:       z.string().optional(),
  researchDesign:z.string().optional(),
  sampleSize:    z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: {
      id,
      OR: [
        { ownerId: session.user.id },
        { supervisorId: session.user.id },
        { members: { some: { userId: session.user.id } } },
      ],
    },
    include: {
      owner:      { select: { id: true, name: true, email: true, department: true } },
      supervisor: { select: { id: true, name: true, email: true } },
      chapters: {
        orderBy: { number: "asc" },
        include: {
          comments: { where: { resolved: false }, select: { id: true } },
        },
      },
      citations:  { orderBy: { createdAt: "desc" }, take: 10 },
      _count: {
        select: { comments: { where: { resolved: false } }, members: true },
      },
    },
  });

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const totalWords = project.chapters.reduce((a, c) => a + c.wordCount, 0);
  const completedChapters = project.chapters.filter(c => c.status === "APPROVED").length;

  return NextResponse.json({
    ...project,
    totalWords,
    progress: Math.round((completedChapters / 5) * 100),
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });

  const project = await prisma.project.findFirst({
    where: { id, ownerId: session.user.id },
  });
  if (!project) return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });

  const updated = await prisma.project.update({
    where: { id },
    data: { ...parsed.data, updatedAt: new Date() },
  });

  return NextResponse.json({ success: true, project: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const project = await prisma.project.findFirst({ where: { id, ownerId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
