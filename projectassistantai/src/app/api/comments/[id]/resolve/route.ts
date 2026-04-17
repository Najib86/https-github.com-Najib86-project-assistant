// src/app/api/comments/[id]/resolve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const comment = await prisma.comment.findFirst({
    where: {
      id,
      project: {
        OR: [
          { ownerId: session.user.id },
          { supervisorId: session.user.id },
        ],
      },
    },
  });

  if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

  const updated = await prisma.comment.update({
    where: { id },
    data: { resolved: true, resolvedAt: new Date() },
  });

  return NextResponse.json({ success: true, comment: updated });
}
