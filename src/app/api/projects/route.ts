
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { generateChapterContent, CHAPTERS_LIST } from "@/lib/ai-service";

export const dynamic = 'force-dynamic';

/**
 * GET /api/projects - Fetch all projects for a user
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const supervisorId = searchParams.get('supervisorId');

    if (!studentId && !supervisorId) {
        return NextResponse.json({ error: "Student ID or Supervisor ID required" }, { status: 400 });
    }

    try {
        const where: { studentId?: number; supervisorId?: number } = {};
        if (studentId) where.studentId = parseInt(studentId);
        if (supervisorId) where.supervisorId = parseInt(supervisorId);

        const projects = await prisma.project.findMany({
            where,
            include: { chapters: true },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
    }
}

/**
 * POST /api/projects - Create a new project
 * Moving logic here prevents Vercel routing collisions with [projectId]
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

        if (!studentId || !title || !level || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

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
                console.error("Extraction error:", err);
            }
        }

        let finalSupervisorId = supervisorId ? parseInt(supervisorId) : null;
        if (inviteCode) {
            const invite = await prisma.supervisorInvite.findUnique({ where: { code: inviteCode } });
            if (invite && invite.expiresAt > new Date()) {
                finalSupervisorId = invite.supervisorId;
            } else {
                return NextResponse.json({ error: "Invalid/Expired code" }, { status: 400 });
            }
        }

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

        // Batch chapter generation
        const generatePromises = CHAPTERS_LIST.map(chapterPlan =>
            generateChapterContent(project.project_id, chapterPlan.id, chapterPlan.title, project.title, project.level, extractedText)
        );
        await Promise.all(generatePromises);

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        console.error("Create Project Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
