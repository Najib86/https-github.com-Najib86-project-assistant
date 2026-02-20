
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
        } catch (dbErr: unknown) {
            const errorMessage = dbErr instanceof Error ? dbErr.message : "Unknown database error";
            console.error("DB connection error in GET:", errorMessage);
            return NextResponse.json({ error: "Database connection failed", details: errorMessage }, { status: 503 });
        }

        const sid = studentIdStr ? parseInt(studentIdStr) : null;
        const svid = supervisorIdStr ? parseInt(supervisorIdStr) : null;

        const projects = await prisma.project.findMany({
            where: {
                OR: [
                    sid ? { studentId: sid } : {},
                    sid ? { members: { some: { studentId: sid } } } : {},
                    svid ? { supervisorId: svid } : {}
                ].filter(condition => Object.keys(condition).length > 0)
            },
            include: {
                chapters: true,
                student: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json(projects || []);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        console.error("Critical GET error:", error);
        return NextResponse.json({ error: "Internal Server Error", message: errorMessage }, { status: 500 });
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
        const academicMetadataStr = formData.get("academicMetadata") as string; // NEW

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
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : "Unknown extraction error";
                console.warn("Soft failure in file extraction:", errorMessage);
            }
        }

        const studentId = parseInt(studentIdStr);
        let finalSupervisorId = supervisorIdStr ? parseInt(supervisorIdStr) : null;

        // Validation: Ensure student exists
        const studentExists = await prisma.user.findUnique({
            where: { id: studentId }
        });

        if (!studentExists) {
            return NextResponse.json({ error: "User not found. Please log in again." }, { status: 401 });
        }

        if (inviteCode) {
            // First check SupervisorInvite table (student-invited)
            const invite = await prisma.supervisorInvite.findUnique({
                where: { token: inviteCode },
                include: { project: true }
            });

            if (invite && invite.expiresAt > new Date()) {
                finalSupervisorId = invite.project.supervisorId;
            } else {
                // If not found, check User table for supervisor-generated code
                const supervisor = await prisma.user.findFirst({
                    where: {
                        inviteCode: inviteCode,
                        role: 'supervisor'
                    }
                });

                if (supervisor) {
                    finalSupervisorId = supervisor.id;
                } else {
                    return NextResponse.json({ error: "Invalid/Expired code" }, { status: 400 });
                }
            }
        }

        // Parse academic metadata safely
        let parsedMetadata = undefined;
        if (academicMetadataStr) {
            try {
                parsedMetadata = JSON.parse(academicMetadataStr);
            } catch (e) {
                console.warn("Failed to parse academicMetadata JSON", e);
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
                academicMetadata: parsedMetadata // Save the metadata
            },
        });

        // Trigger AI chapter generation in batches to prevent rate limits
        const { runInBatches } = await import("@/lib/utils");

        await runInBatches(CHAPTERS_LIST, 2, async (chapter) => {
            try {
                await generateChapterContent(
                    project.project_id,
                    chapter.id,
                    chapter.title,
                    project.title,
                    project.level,
                    extractedText,
                    parsedMetadata
                );
            } catch (e) {
                console.error("AI Error for chapter:", chapter.title, e);
            }
        });

        return NextResponse.json(project, { status: 201 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to create project";
        console.error("Critical POST error:", error);
        return NextResponse.json({ error: "Failed to create project", message: errorMessage }, { status: 500 });
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
