// src/app/api/projects/[id]/citations/route.ts
// GET + POST citations for a project

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CitationSchema = z.object({
  authors:   z.string().min(1),
  year:      z.string().min(4).max(4),
  title:     z.string().min(3),
  journal:   z.string().optional(),
  volume:    z.string().optional(),
  issue:     z.string().optional(),
  pages:     z.string().optional(),
  doi:       z.string().optional(),
  url:       z.string().optional(),
  publisher: z.string().optional(),
  style:     z.enum(["APA", "Harvard", "Chicago", "MLA"]).default("APA"),
});

function formatAPA(c: z.infer<typeof CitationSchema>): string {
  let formatted = `${c.authors} (${c.year}). ${c.title}.`;
  if (c.journal) {
    formatted += ` ${c.journal}`;
    if (c.volume) formatted += `, ${c.volume}`;
    if (c.issue)  formatted += `(${c.issue})`;
    if (c.pages)  formatted += `, ${c.pages}`;
    formatted += ".";
  } else if (c.publisher) {
    formatted += ` ${c.publisher}.`;
  }
  if (c.doi) formatted += ` https://doi.org/${c.doi}`;
  else if (c.url) formatted += ` Retrieved from ${c.url}`;
  return formatted;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const citations = await prisma.citation.findMany({
    where: {
      projectId: id,
      project: {
        OR: [
          { ownerId: session.user.id },
          { supervisorId: session.user.id },
        ],
      },
    },
    orderBy: [{ authors: "asc" }, { year: "desc" }],
  });

  return NextResponse.json({ citations });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Verify ownership
  const project = await prisma.project.findFirst({
    where: { id, ownerId: session.user.id },
  });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const body = await req.json();
  const parsed = CitationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  const formatted = formatAPA(parsed.data);

  const citation = await prisma.citation.create({
    data: {
      projectId: id,
      ...parsed.data,
      formatted,
    },
  });

  return NextResponse.json({ success: true, citation }, { status: 201 });
}
