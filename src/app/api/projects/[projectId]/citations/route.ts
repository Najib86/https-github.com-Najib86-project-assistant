import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        const { projectId } = await params;
        const citations = await prisma.citation.findMany({
            where: { projectId: parseInt(projectId) },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(citations);
    } catch (error) {
        console.error("Failed to fetch citations", error);
        return NextResponse.json({ error: "Failed to fetch citations" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        const { projectId } = await params;
        const { source, author, year, title, url } = await req.json();

        if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

        const citation = await prisma.citation.create({
            data: {
                projectId: parseInt(projectId),
                style: "APA", // Default style
                sourceText: source || "Manual",
                formatted: `${author ? author + '. ' : ''}(${year || 'n.d.'}). ${title}. ${url ? 'Retrieved from ' + url : ''}`
            }
        });
        return NextResponse.json(citation);
    } catch (error) {
        console.error("Failed to add citation", error);
        return NextResponse.json({ error: "Failed to add citation" }, { status: 500 });
    }
}
