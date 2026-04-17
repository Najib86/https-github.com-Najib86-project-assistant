// src/app/api/invite/accept/route.ts
// POST — Supervisor accepts project invitation via code

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const AcceptSchema = z.object({ code: z.string().min(8) });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role !== "SUPERVISOR") {
    return NextResponse.json(
      { error: "Only supervisors can accept invitations" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsed = AcceptSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid code" }, { status: 400 });

  const project = await prisma.project.findFirst({
    where: { supervisorCode: parsed.data.code },
    include: { owner: { select: { name: true, email: true } } },
  });

  if (!project) return NextResponse.json({ error: "Invalid or expired invitation code" }, { status: 404 });

  if (project.supervisorId) {
    return NextResponse.json({ error: "This project already has a supervisor" }, { status: 409 });
  }

  if (project.ownerId === session.user.id) {
    return NextResponse.json({ error: "You cannot supervise your own project" }, { status: 400 });
  }

  const updated = await prisma.project.update({
    where: { id: project.id },
    data: { supervisorId: session.user.id },
  });

  await prisma.activityLog.create({
    data: {
      userId: session.user.id,
      projectId: project.id,
      action: "SUPERVISOR_JOINED",
      metadata: JSON.stringify({ projectTitle: project.title }),
    },
  });

  return NextResponse.json({
    success: true,
    project: {
      id: updated.id,
      title: updated.title,
      level: updated.level,
      owner: project.owner,
    },
  });
}
