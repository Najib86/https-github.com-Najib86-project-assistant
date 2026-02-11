
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as mammoth from "mammoth";
import { PDFParse } from "pdf-parse"; // Reverted to named import
import { generateChapterContent, CHAPTERS_LIST } from "@/lib/ai-service";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const studentId = formData.get("studentId") as string;
        const title = formData.get("title") as string;
        const level = formData.get("level") as string;
        const type = formData.get("type") as string;
        const supervisorId = formData.get("supervisorId") as string;
        const file = formData.get("file") as File | null;

        // Basic validation
        if (!studentId || !title || !level || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        let extractedText = "";
        if (file && file.size > 0) {
            try {
                const buffer = Buffer.from(await file.arrayBuffer());
                if (file.type === "application/pdf") {
                    const parser = new PDFParse({ data: buffer }); // Reverted to class usage
                    const result = await parser.getText();
                    extractedText = result.text;
                } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                    const result = await mammoth.extractRawText({ buffer: buffer });
                    extractedText = result.value;
                } else if (file.type === "text/plain") {
                    extractedText = buffer.toString("utf-8");
                }
            } catch (err) {
                console.error("Error extracting text from uploaded file:", err);
                // We continue even if file parsing fails, as the file is optional
            }
        }

        const project = await prisma.project.create({
            data: {
                title,
                level,
                type,
                studentId: parseInt(studentId),
                supervisorId: supervisorId ? parseInt(supervisorId) : null,
                referenceText: extractedText,
            },
        });

        // Trigger AI generation of all chapters immediately
        // We do this sequentially to follow the user's request, but it might take a while.
        // In a production environment, this should be a background task (queue).

        const generatePromises = CHAPTERS_LIST.map(chapterPlan =>
            generateChapterContent(
                project.project_id,
                chapterPlan.id,
                chapterPlan.title,
                project.title,
                project.level,
                extractedText // Use extracted text as reference for ALL chapters
            ).catch(err => {
                console.error(`Failed to generate chapter ${chapterPlan.id}:`, err);
                return null;
            })
        );

        // We wait for all generations to finish before returning to ensure "immediate" availability
        // though this increases response time.
        await Promise.all(generatePromises);

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        console.error("Error creating project:", error);
        return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
    }
}
