
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateChapterContent, CHAPTERS_LIST } from "@/lib/ai-service";

export const dynamic = 'force-dynamic';

/**
 * GET /api/projects
 * Fetches projects for a student or supervisor.
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const studentIdStr = searchParams.get('studentId');
        const supervisorIdStr = searchParams.get('supervisorId');

        if (!studentIdStr && !supervisorIdStr) {
            return NextResponse.json({ error: "Student ID or Supervisor ID required" }, { status: 400 });
        }

        // Validate DB connection
        try {
            await prisma.$connect();
        } catch (dbErr: any) {
            console.error("DB connection error in GET:", dbErr.message);
            return NextResponse.json({ error: "Database connection failed", details: dbErr.message }, { status: 503 });
        }

        const where: { studentId?: number; supervisorId?: number } = {};
        if (studentIdStr) {
            const sid = parseInt(studentIdStr);
            if (!isNaN(sid)) where.studentId = sid;
        }
        if (supervisorIdStr) {
            const svid = parseInt(supervisorIdStr);
            if (!isNaN(svid)) where.supervisorId = svid;
        }

        const projects = await prisma.project.findMany({
            where,
            include: { chapters: true },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json(projects || []);
    } catch (error: any) {
        console.error("Critical GET error:", error);
        return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
    }
}

/**
 * POST /api/projects
 * Creates a new project with dynamic module loading.
 */
export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const studentIdStr = formData.get("studentId") as string;
        const title = formData.get("title") as string;
        const level = formData.get("level") as string;
        const type = formData.get("type") as string;
        const supervisorIdStr = formData.get("supervisorId") as string;
        const file = formData.get("file") as File | null;
        const inviteCode = formData.get("inviteCode") as string;

        if (!studentIdStr || !title || !level || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // DB Heartbeat
        await prisma.$connect();

        let extractedText = "";
        if (file && file.size > 0) {
            try {
                const buffer = Buffer.from(await file.arrayBuffer());
                if (file.type === "application/pdf") {
                    // Dynamic import to prevent top-level failures on Vercel
                    const { PDFParse } = await import("pdf-parse");
                    const parser = new PDFParse({ data: buffer });
                    const result = await parser.getText();
                    extractedText = result.text;
                } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                    const mammoth = await import("mammoth");
                    const result = await mammoth.extractRawText({ buffer: buffer });
                    extractedText = result.value;
                } else if (file.type === "text/plain") {
                    extractedText = buffer.toString("utf-8");
                }
            } catch (err: any) {
                console.warn("Soft failure in file extraction:", err.message);
            }
        }

        const studentId = parseInt(studentIdStr);
        let finalSupervisorId = supervisorIdStr ? parseInt(supervisorIdStr) : null;

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
                studentId,
                supervisorId: finalSupervisorId,
                referenceText: extractedText,
            },
        });

        // Trigger AI chapter generation in parallel
        const chapterPromises = CHAPTERS_LIST.map(chapter =>
            generateChapterContent(project.project_id, chapter.id, chapter.title, project.title, project.level, extractedText)
                .catch(e => {
                    console.error("AI Error for chapter:", chapter.title, e);
                    return null;
                })
        );

        await Promise.all(chapterPromises);

        return NextResponse.json(project, { status: 201 });
    } catch (error: any) {
        console.error("Critical POST error:", error);
        return NextResponse.json({ error: "Failed to create project", message: error.message }, { status: 500 });
    }
}

/**
 * Preflight support
 */
export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Allow': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
