
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { projectId, chapterNumber, topic, level, sampleText } = await req.json();

        if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
            return NextResponse.json({ error: "Gemini API Key missing" }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
Generate Chapter ${chapterNumber} for a ${level} university project on: "${topic}".
Use formal academic style, structured headings/subheadings, and include citation placeholders (APA/MLA).
Reference the following sample text for style/tone if provided: "${sampleText || "None"}".
The content should be detailed and supervisor-ready.
`;

        const result = await model.generateContent(prompt);
        const draftContent = result.response.text();

        const chapter = await prisma.chapter.create({
            data: {
                projectId: parseInt(projectId),
                chapterNumber: parseInt(chapterNumber),
                content: draftContent,
                title: `Chapter ${chapterNumber}`,
                status: "Draft"
            },
        });

        return NextResponse.json(chapter);

    } catch (error) {
        console.error("Error generating chapter:", error);
        return NextResponse.json({ error: "Failed to generate chapter" }, { status: 500 });
    }
}
