import { NextResponse } from "next/server";
import { generateChapterContent } from "@/lib/ai-service";

export async function POST(req: Request) {
    try {
        const { projectId, chapterNumber, chapterTitle, topic, level, sampleText } = await req.json();

        if (!projectId || !chapterNumber || !topic) {
            return NextResponse.json({ error: "Missing required fields (Project ID, Chapter Number, Topic)" }, { status: 400 });
        }

        const chapter = await generateChapterContent(
            parseInt(projectId),
            parseInt(chapterNumber),
            chapterTitle || `Chapter ${chapterNumber}`,
            topic,
            level,
            sampleText
        );

        return NextResponse.json(chapter);

    } catch (error: unknown) {
        console.error("Error generating chapter:", error);
        return NextResponse.json({ error: (error as Error).message || "Failed to generate chapter" }, { status: 500 });
    }
}
