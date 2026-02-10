
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { projectId, chapterNumber, content, title } = await req.json();

        if (!projectId || !chapterNumber) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Upsert guarantees we either update the existing or create new one cleanly
        // relying on @@unique([projectId, chapterNumber])
        const savedChapter = await prisma.chapter.upsert({
            where: {
                projectId_chapterNumber: {
                    projectId: parseInt(projectId),
                    chapterNumber: parseInt(chapterNumber)
                }
            },
            update: {
                content,
                title,
                updatedAt: new Date()
            },
            create: {
                projectId: parseInt(projectId),
                chapterNumber: parseInt(chapterNumber),
                content: content || "",
                title: title || `Chapter ${chapterNumber}`,
                status: "Draft"
            }
        });

        return NextResponse.json(savedChapter);

    } catch (error) {
        console.error("Error saving chapter:", error);
        return NextResponse.json({ error: "Failed to save chapter" }, { status: 500 });
    }
}
