
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(_: Request, { params }: { params: Promise<{ chapterId: string }> }) {
    try {
        const { chapterId } = await params;
        const currentChapterId = parseInt(chapterId);

        // Fetch current chapter content
        const currentChapter = await prisma.chapter.findUnique({
            where: { chapter_id: currentChapterId },
            select: { content: true, projectId: true }
        });

        if (!currentChapter || !currentChapter.content) {
            return NextResponse.json({ score: 0, note: "No content to check", date: new Date() });
        }

        // Fetch all other chapters (simple plagiarism check against internal DB)
        // In a real app, this would use a vector DB or external API
        const otherChapters = await prisma.chapter.findMany({
            where: {
                chapter_id: { not: currentChapterId },
                content: { not: null }
            },
            select: { content: true, project: { select: { title: true } } }
        });

        let maxSimilarity = 0;
        let matchedSource = "Internal Database";

        const normalize = (text: string) => text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 4);
        const currentTokens = new Set(normalize(currentChapter.content));

        if (currentTokens.size > 0) {
            for (const other of otherChapters) {
                if (!other.content) continue;
                const otherTokens = new Set(normalize(other.content));
                const intersection = new Set([...currentTokens].filter(x => otherTokens.has(x)));
                const similarity = (intersection.size / currentTokens.size) * 100;

                if (similarity > maxSimilarity) {
                    maxSimilarity = similarity;
                    matchedSource = `Project: ${other.project.title}`;
                }
            }
        }

        const score = Math.min(Math.round(maxSimilarity), 100);
        const noteText = score > 0 ? `Similarity detected with ${matchedSource}` : "No significant similarity found in internal database.";

        const note = await prisma.plagiarismNote.create({
            data: {
                chapterId: currentChapterId,
                score,
                note: noteText,
            }
        });

        return NextResponse.json({ score: note.score, note: note.note, date: note.createdAt });
    } catch (error) {
        console.error("Plagiarism check failed", error);
        return NextResponse.json({ error: "Failed to run plagiarism check" }, { status: 500 });
    }
}

export async function GET(_: Request, { params }: { params: Promise<{ chapterId: string }> }) {
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
        console.error("Failed to fetch plagiarism record", error);
        return NextResponse.json({ error: "Failed to fetch plagiarism record" }, { status: 500 });
    }
}

