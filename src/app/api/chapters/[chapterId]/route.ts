
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ chapterId: string }> }) {
    try {
        const { chapterId } = await params;
        const chapter = await prisma.chapter.findUnique({
            where: { chapter_id: parseInt(chapterId) },
        });

        if (!chapter) {
            return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
        }

        return NextResponse.json(chapter);
    } catch (error) {
        console.error("Error fetching chapter:", error);
        return NextResponse.json({ error: "Failed to fetch chapter" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ chapterId: string }> }) {
    try {
        const { chapterId } = await params;
        const body = await req.json();
        const { content, status } = body;

        // Check if versioning is requested
        const shouldCreateVersion = body.createVersion;

        const updatedChapter = await prisma.chapter.update({
            where: { chapter_id: parseInt(chapterId) },
            data: {
                content,
                status,
                updatedAt: new Date(),
            }
        });

        if (shouldCreateVersion) {
            await prisma.chapterVersion.create({
                data: {
                    chapterId: parseInt(chapterId),
                    contentSnapshot: content || "",
                    versionNumber: await getNextVersionNumber(parseInt(chapterId)),
                    createdAt: new Date()
                }
            });
        }

        return NextResponse.json(updatedChapter);
    } catch (error) {
        console.error("Error updating chapter:", error);
        return NextResponse.json({ error: "Failed to update chapter" }, { status: 500 });
    }
}

async function getNextVersionNumber(chapterId: number) {
    const lastVersion = await prisma.chapterVersion.findFirst({
        where: { chapterId },
        orderBy: { versionNumber: 'desc' }
    });
    return (lastVersion?.versionNumber || 0) + 1;
}
