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
        const session = await getServerSession(authOptions);
        const user = session?.user as { id?: string | number } | undefined;
        if (user?.id) {
            await rateLimit(`project-create:${user.id}`);
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

        // Run learning optimization asynchronously so it doesn't block the request
        if (parsedMetadata) {
            updateInstitutionsData(parsedMetadata).catch(console.error);
        }

        // Determine chapters to generate
        // We use the fully automated 12-chapter sequence as the primary priority.
        const chaptersToGenerate = CHAPTERS_LIST;
        let templateStructureReference = null;

        if (templateIdStr) {
            try {
                const template = await prisma.template.findUnique({
                    where: { id: parseInt(templateIdStr) }
                });
                if (template && Array.isArray(template.content)) {
                    // We only use the legacy template structure as a format/structure reference,
                    // we DO NOT overwrite our fully automated 12-chapter list sequence.
                    templateStructureReference = template.content;
                }
            } catch (templateError) {
                console.warn("Failed to fetch template chapters:", templateError);
                // Fallback to null
            }
        }

        const metadataForGeneration = {
            ...parsedMetadata,
            ...(templateStructureReference ? { templateStructureReference } : {})
        };

        // Trigger AI chapter generation deliberately in smaller batches (1 at a time) to prevent Gemini Rate Limits (429 errors).
        // Since we now generate a massive 12-chapter pipeline, sending multiple requests simultaneously
        // often causes the AI provider to instantly block the request, resulting in NO chapters being generated.
        const { runInBatches } = await import("@/lib/utils");

        // Fire and forget (don't await) the generation process so the user gets the project ID immediately.
        // We use batch size 1 to pace the AI.
        runInBatches(chaptersToGenerate, 1, async (chapter) => {
            try {
                console.log(`[Background] Starting Generation for: ${chapter.title}`);
                await generateChapterContent(
                    project.project_id,
                    chapter.id,
                    chapter.title,
                    project.title,
                    project.level,
                    project.referenceText || undefined,
                    metadataForGeneration
                );
                console.log(`[Background] Finished Generation for: ${chapter.title}`);

                // Add a small 2-second delay between chapters to avoid rate limits
                await new Promise(res => setTimeout(res, 2000));
            } catch (e) {
                console.error(`[Background] AI Error for chapter ${chapter.title}:`, e);
            }
        }).catch(err => {
            console.error("[Background] Chapter Generation Loop crashed:", err);
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
