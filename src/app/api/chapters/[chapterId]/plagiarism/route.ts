
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ chapterId: string }> }) {
    try {
        const { chapterId } = await params;

        // Mock score logic: Random score between 0 and 25 (safe zone) or higher occasionally
        const score = Math.floor(Math.random() * 30);

        const note = await prisma.plagiarismNote.create({
            data: {
                chapterId: parseInt(chapterId),
                score,
                note: "Automated scan completed via External API (Mock)",
            }
        });

        return NextResponse.json({ score: note.score, note: note.note, date: note.createdAt });
    } catch (error) {
        console.error("Plagiarism check failed", error);
        return NextResponse.json({ error: "Failed to run plagiarism check" }, { status: 500 });
    }
}

export async function GET(req: Request, { params }: { params: Promise<{ chapterId: string }> }) {
    // Get latest check
    try {
        const { chapterId } = await params;
        const note = await prisma.plagiarismNote.findFirst({
            where: { chapterId: parseInt(chapterId) },
            orderBy: { createdAt: 'desc' }
        });
        if (!note) return NextResponse.json(null);
        return NextResponse.json(note);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch plagiarism record" }, { status: 500 });
    }
}
