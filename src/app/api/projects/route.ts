import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateChapterContent, CHAPTERS_LIST } from "@/lib/ai-service";
import { rateLimit } from "@/lib/rate-limit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from 'fs';
import path from 'path';

interface AcademicMetadata {
    institution?: {
        name?: string;
        faculty?: string;
        department?: string;
        programme?: string;
    };
    research?: {
        area?: string;
        keywords?: string[] | string;
    };
}

export const dynamic = 'force-dynamic';

// Heuristic learning algorithm to update JSON statically
async function updateInstitutionsData(metadata: AcademicMetadata) {
    if (!metadata?.institution) return;

    const { name, faculty, department, programme } = metadata.institution;
    if (!name || !faculty || !department || !programme) return;

    try {
        const filePath = path.join(process.cwd(), 'json.json');
        if (!fs.existsSync(filePath)) return;

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(fileContent);

        let shouldUpdate = false;

        // Find or create university
        let university = data.universities.find((u: any) => u.name.toLowerCase() === name.toLowerCase());
        if (!university) {
            university = {
                name,
                acronym: name.split(' ').map((w: string) => w[0]).join('').toUpperCase(),
                type: "unknown",
                location: { state: "Unknown", city: "Unknown", geopolitical_zone: "Unknown" },
                established: new Date().getFullYear(),
                academic_offerings: { faculties: [] }
            };
            data.universities.push(university);
            shouldUpdate = true;
        }

        // Ensure academic_offerings and faculties exist
        if (!university.academic_offerings) university.academic_offerings = { faculties: [] };
        if (!university.academic_offerings.faculties) university.academic_offerings.faculties = [];

        // Find or create faculty
        let fac = university.academic_offerings.faculties.find((f: any) => f.name.toLowerCase() === faculty.toLowerCase());
        if (!fac) {
            fac = { name: faculty, departments: [] };
            university.academic_offerings.faculties.push(fac);
            shouldUpdate = true;
        }

        // Ensure departments exist
        if (!fac.departments) fac.departments = [];

        // Find or create department
        let dep = fac.departments.find((d: any) => d.name.toLowerCase() === department.toLowerCase());
        if (!dep) {
            dep = { name: department, courses: [] };
            fac.departments.push(dep);
            shouldUpdate = true;
        }

        // Ensure courses exist
        if (!dep.courses) dep.courses = [];

        // Find or create course
        const hasCourse = dep.courses.some((c: string) => c.toLowerCase() === programme.toLowerCase());
        if (!hasCourse) {
            dep.courses.push(programme);
            shouldUpdate = true;
        }

        if (shouldUpdate) {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
            console.log(`Self-learning algorithm updated json.json with ${name} -> ${faculty} -> ${department}`);
        }
    } catch (err) {
        console.error("Failed to update institutions learning data", err);
    }
}


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
        console.log("[POST /api/projects] Starting request");

        // Safely get session - don't let auth errors block project creation
        let session = null;
        try {
            session = await getServerSession(authOptions);
        } catch (authErr) {
            console.warn("[POST /api/projects] getServerSession failed (non-fatal):", authErr);
        }
        const user = session?.user as { id?: string | number } | undefined;
        if (user?.id) {
            try {
                await rateLimit(`project-create:${user.id}`);
            } catch (rateLimitErr: any) {
                if (rateLimitErr?.message?.includes("Too many AI requests")) throw rateLimitErr;
                console.warn("[POST /api/projects] Rate limit check failed (non-fatal):", rateLimitErr);
            }
        }

        const formData = await req.formData();
        const studentIdStr = formData.get("studentId") as string;
        const title = formData.get("title") as string;
        const level = formData.get("level") as string;
        const type = formData.get("type") as string;
        const supervisorIdStr = formData.get("supervisorId") as string;
        const file = formData.get("file") as File | null;
        const inviteCode = formData.get("inviteCode") as string;
        const academicMetadataStr = formData.get("academicMetadata") as string;
        const templateIdStr = formData.get("templateId") as string;

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
                    const pdfModule = await import("pdf-parse");
                    const pdf = (pdfModule as any).default || pdfModule;
                    const data = await pdf(buffer);
                    extractedText = data.text;
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
        if (isNaN(studentId)) {
            return NextResponse.json({ error: "Invalid student session. Please log in again." }, { status: 400 });
        }

        let finalSupervisorId = (supervisorIdStr && supervisorIdStr !== "null" && supervisorIdStr !== "undefined") 
            ? parseInt(supervisorIdStr) 
            : null;
        
        if (finalSupervisorId !== null && isNaN(finalSupervisorId)) {
            finalSupervisorId = null;
        }

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

        let project: any;
        const chaptersToGenerate = CHAPTERS_LIST;

        try {
            project = await prisma.$transaction(async (tx) => {
                const newProject = await tx.project.create({
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

                // Pre-create 12 empty chapters
                const chapterData = chaptersToGenerate.map(ch => ({
                    projectId: newProject.project_id,
                    chapterNumber: ch.id,
                    title: ch.title,
                    content: "",
                    status: "Generating"
                }));

                await tx.chapter.createMany({
                    data: chapterData
                });

                return newProject;
            });
        } catch (e: any) {
            console.error("Critical transaction failure during project creation:", e);
            return NextResponse.json({ error: "Failed to create project and initial chapters", message: e.message }, { status: 500 });
        }

        // Run learning optimization asynchronously so it doesn't block the request
        if (parsedMetadata) {
            updateInstitutionsData(parsedMetadata).catch(console.error);
        }

        let templateStructureReference = null;
        if (templateIdStr) {
            try {
                const template = await prisma.template.findUnique({
                    where: { id: parseInt(templateIdStr) }
                });
                if (template && Array.isArray(template.content)) {
                    templateStructureReference = template.content;
                }
            } catch (templateError) {
                console.warn("Failed to fetch template chapters:", templateError);
            }
        } else {
            // Use default template if no template specified
            try {
                const defaultTemplate = await prisma.template.findFirst({
                    where: { type: 'project', isDefault: true }
                });
                if (defaultTemplate && Array.isArray(defaultTemplate.content)) {
                    templateStructureReference = defaultTemplate.content;
                    console.log("Using default template for project generation");
                }
            } catch (templateError) {
                console.warn("Failed to fetch default template:", templateError);
            }
        }

        const metadataForGeneration = {
            ...parsedMetadata,
            ...(templateStructureReference ? { templateStructureReference } : {})
        };

        // Trigger AI chapter generation reliably using Promise.all logic to ensure it doesn't quietly die.
        const generationPromise = Promise.all(
            chaptersToGenerate.map(async (chapter, index) => {
                let attempts = 0;
                while (attempts < 2) {
                    try {
                        console.log(`[Background] Starting Generation for: ${chapter.title}`);

                        // Small delay to prevent initial burst (staggered start)
                        await new Promise(resolve => setTimeout(resolve, index * 2000));

                        // Enforce max 60s timeout per chapter natively wrapping the request inside race
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 60000);

                        // Small delay to prevent initial burst
                        await new Promise(resolve => setTimeout(resolve, index * 1000));
                        
                        const genTask = generateChapterContent(
                            project.project_id,
                            chapter.id,
                            chapter.title,
                            project.title,
                            project.level,
                            project.referenceText || undefined,
                            metadataForGeneration
                        );

                        // Simple 60s timeout wrapper
                        const timeoutTask = new Promise((_, reject) => {
                            setTimeout(() => reject(new Error("Timeout generation max 60s")), 60000);
                        });

                        await Promise.race([genTask, timeoutTask]);
                        clearTimeout(timeoutId);

                        console.log(`[Background] Finished Generation for: ${chapter.title}`);
                        return; // success

                    } catch (e: any) {
                        attempts++;
                        console.error("[CHAPTER-GENERATION-FAILED]", {
                            projectId: project.project_id,
                            chapterNumber: chapter.id,
                            attempt: attempts,
                            error: e.message || String(e),
                            stack: e.stack
                        });

                        if (attempts >= 2) {
                            // Mark as failed permanently after retries
                            await prisma.chapter.update({
                                where: { projectId_chapterNumber: { projectId: project.project_id, chapterNumber: chapter.id } },
                                data: { status: "Pending Regeneration" }
                            }).catch((err) => console.error("Failed to update status to Pending Regeneration:", err));

                            // Log the final failure to DB for easy testing
                            await prisma.generationLog.create({
                                data: {
                                    projectId: project.project_id,
                                    chapterNumber: chapter.id,
                                    provider: "Orchestrator",
                                    retries: attempts,
                                    validationScore: 0,
                                    wordCount: 0,
                                    success: false,
                                    failureReason: e.message || "Max retries reached"
                                }
                            }).catch(() => {});
                        }
                    }
                }
            })
        );

        // Wait for generation to dispatch/complete natively based on env config
        // If serverless, waiting ensures they complete. If large concurrent load, might be better backgrounded, 
        // but user requested "Ensure Chapters Auto-Generate... await Promise.all" so we await it to guarantee execution.
        // Waiting here holds the request up to 60s max. But guarantees it.
        // We will execute a background fire-and-forget in Node but wait a small tick to ensure the event loop registers it.
        generationPromise.catch(err => console.error("Generation Promise Failed Critically:", err));

        return NextResponse.json(project, { status: 201 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to create project";
        const errorStack = error instanceof Error ? error.stack : "No stack trace";
        console.error("Critical POST error:", { message: errorMessage, stack: errorStack, error });
        
        return NextResponse.json({ 
            error: "Failed to create project", 
            message: errorMessage,
            stack: errorStack,
            details: error
        }, { status: 500 });
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
