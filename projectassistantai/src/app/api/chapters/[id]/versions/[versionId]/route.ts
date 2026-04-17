// src/app/api/chapters/[id]/versions/[versionId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: chapterId, versionId } = await params;

  const version = await prisma.chapterVersion.findFirst({
    where: {
      id: versionId,
      chapterId,
      chapter: {
        project: {
          OR: [
            { ownerId: session.user.id },
            { supervisorId: session.user.id },
          ],
        },
      },
    },
  });

  if (!version) return NextResponse.json({ error: "Version not found" }, { status: 404 });

  return NextResponse.json({
    id: version.id,
    content: version.content,
    wordCount: version.wordCount,
    createdAt: version.createdAt,
  });
}
