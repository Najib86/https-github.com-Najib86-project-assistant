
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: Promise<{ chapterId: string }> }) {
    try {
        const { chapterId } = await params;
        const versions = await prisma.chapterVersion.findMany({
            where: { chapterId: parseInt(chapterId) },
            orderBy: { versionNumber: 'desc' }
        });

        return NextResponse.json(versions);
    } catch (error) {
        console.error("Error fetching versions:", error);
        return NextResponse.json({ error: "Failed to fetch versions" }, { status: 500 });
    }
}

export async function POST(_: Request, { params }: { params: Promise<{ chapterId: string }> }) {
    try {
        const { chapterId } = await params;
        // Allows forcing a version creation manually via API if needed
        const chapter = await prisma.chapter.findUnique({
            where: { chapter_id: parseInt(chapterId) }
        });

        if (!chapter) {
            return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
        }

        // Logic to get next version number
        const lastVersion = await prisma.chapterVersion.findFirst({
            where: { chapterId: parseInt(chapterId) },
            orderBy: { versionNumber: 'desc' }
        });
        const nextVersion = (lastVersion?.versionNumber || 0) + 1;

        const newVersion = await prisma.chapterVersion.create({
            data: {
                chapterId: parseInt(chapterId),
                contentSnapshot: chapter.content || "",
                versionNumber: nextVersion,
                createdAt: new Date()
            }
        });

        return NextResponse.json(newVersion);
    } catch (error) {
        console.error("Error creating version:", error);
        return NextResponse.json({ error: "Failed to create version" }, { status: 500 });
    }
}
