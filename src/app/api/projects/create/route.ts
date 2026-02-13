
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { generateChapterContent, CHAPTERS_LIST } from "@/lib/ai-service";

/**
 * POST /api/projects/create
 * Production-ready project creation handler for Next.js 14/15 App Router
 */
export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const studentId = formData.get("studentId") as string;
        const title = formData.get("title") as string;
        const level = formData.get("level") as string;
        const type = formData.get("type") as string;
        const supervisorId = formData.get("supervisorId") as string;
        const file = formData.get("file") as File | null;
        const inviteCode = formData.get("inviteCode") as string;

        // 1. Basic validation
        if (!studentId || !title || !level || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 2. Extract text from optional reference file
        let extractedText = "";
        if (file && file.size > 0) {
            try {
                const buffer = Buffer.from(await file.arrayBuffer());
                if (file.type === "application/pdf") {
                    const parser = new PDFParse({ data: buffer });
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
                // Non-blocking error, allow project creation to continue
            }
        }

        // 3. Handle Supervisor Logic (Invite Code)
        let finalSupervisorId = supervisorId ? parseInt(supervisorId) : null;
        if (inviteCode) {
            const invite = await prisma.supervisorInvite.findUnique({
                where: { code: inviteCode }
            });

            if (invite && invite.expiresAt > new Date()) {
                finalSupervisorId = invite.supervisorId;
            } else {
                if (!invite) return NextResponse.json({ error: "Invalid invite code" }, { status: 400 });
                if (invite.expiresAt <= new Date()) return NextResponse.json({ error: "Invite code expired" }, { status: 400 });
            }
        }

        // 4. Create Project in DB
        const project = await prisma.project.create({
            data: {
                title,
                level,
                type,
                studentId: parseInt(studentId),
                supervisorId: finalSupervisorId,
                referenceText: extractedText,
            },
        });

        // 5. Trigger AI Generation (Sequential but immediate for initial project setup)
        const generatePromises = CHAPTERS_LIST.map(chapterPlan =>
            generateChapterContent(
                project.project_id,
                chapterPlan.id,
                chapterPlan.title,
                project.title,
                project.level,
                extractedText
            ).catch(err => {
                console.error(`Failed to generate chapter ${chapterPlan.id}:`, err);
                return null;
            })
        );

        // Wait for generation to ensure chapters exist immediately upon redirect
        await Promise.all(generatePromises);

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        console.error("Error creating project:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * Handle Method Not Allowed
 */
export async function GET() {
    return new Response("Method Not Allowed", {
        status: 405,
        headers: { "Allow": "POST" }
    });
}
