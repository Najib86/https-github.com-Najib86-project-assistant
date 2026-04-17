// src/app/api/prompts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const prompt = await prisma.generatedPrompt.findFirst({
    where: {
      id,
      OR: [
        { userId: session.user.id },
        { isPublic: true },
      ],
    },
  });

  if (!prompt) {
    return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
  }

  // Increment use count
  await prisma.generatedPrompt.update({
    where: { id },
    data: { useCount: { increment: 1 } },
  });

  return NextResponse.json({
    id: prompt.id,
    title: prompt.title,
    promptText: prompt.promptText,
    wordCount: prompt.wordCount,
    config: JSON.parse(prompt.config),
    createdAt: prompt.createdAt,
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const prompt = await prisma.generatedPrompt.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!prompt) {
    return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
  }

  await prisma.generatedPrompt.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
