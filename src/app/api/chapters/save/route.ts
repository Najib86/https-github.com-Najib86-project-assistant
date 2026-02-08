
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { projectId, chapterNumber, content, title } = await req.json();

        if (!projectId || !chapterNumber) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check if chapter already exists for this project
        const existingChapter = await prisma.chapter.findFirst({
            where: {
                projectId: parseInt(projectId),
                chapterNumber: parseInt(chapterNumber)
            }
        });

        if (existingChapter) {
            // Update existing chapter
            const updatedChapter = await prisma.chapter.update({
                where: { chapter_id: existingChapter.chapter_id },
                data: {
                    content,
                    title: title || existingChapter.title,
                    updatedAt: new Date()
                }
            });
            return NextResponse.json(updatedChapter);
        } else {
            // Create new chapter (if saving before generating)
            const newChapter = await prisma.chapter.create({
                data: {
                    projectId: parseInt(projectId),
                    chapterNumber: parseInt(chapterNumber),
                    content: content || "",
                    title: title || `Chapter ${chapterNumber}`,
                    status: "Draft"
                }
            });
            return NextResponse.json(newChapter);
        }

    } catch (error) {
        console.error("Error saving chapter:", error);
        return NextResponse.json({ error: "Failed to save chapter" }, { status: 500 });
    }
}
