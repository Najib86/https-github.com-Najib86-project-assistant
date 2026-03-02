import { PrismaClient } from "@prisma/client";
import { generateChapterContent, CHAPTERS_LIST } from "./src/lib/ai-service";

const prisma = new PrismaClient();

async function runTest() {
    console.log("Creating a temporary student...");
    const student = await prisma.user.create({
        data: {
            name: "Test Student",
            email: `teststudent@example.com`,
            role: "student",
        }
    });

    console.log("Student created with ID:", student.id);

    // Simulate API logic
    console.log("Creating project and 12 chapters inside transaction...");

    const project = await prisma.$transaction(async (tx) => {
        const newProject = await tx.project.create({
            data: {
                title: "Impact of AI on Modern Healthcare",
                level: "University",
                type: "Research",
                studentId: student.id,
            },
        });

        const chapterData = CHAPTERS_LIST.map(ch => ({
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

    console.log("Project created with ID:", project.project_id);

    // Now trigger chapters
    console.log("Triggering 12 chapter generation...");

    const metadataForGeneration = {
        institution: {
            name: "Test University",
            faculty: "Medicine",
            department: "Health Systems",
            programme: "MD"
        },
        research: {
            area: "Health Tech",
            keywords: "AI, Healthcare, Automation"
        }
    };

    const generationPromise = Promise.all(
        CHAPTERS_LIST.map(async (chapter) => {
            let attempts = 0;
            while (attempts < 2) {
                try {
                    console.log(`[Background] Starting Generation for: ${chapter.title}`);
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 60000);

                    const genTask = generateChapterContent(
                        project.project_id,
                        chapter.id,
                        chapter.title,
                        project.title,
                        project.level,
                        undefined,
                        metadataForGeneration
                    );

                    const timeoutTask = new Promise((_, reject) => {
                        setTimeout(() => reject(new Error("Timeout generation max 60s")), 60000);
                    });

                    await Promise.race([genTask, timeoutTask]);
                    clearTimeout(timeoutId);

                    console.log(`[Background] Finished Generation for: ${chapter.title}`);
                    return;
                } catch (e: any) {
                    attempts++;
                    console.error("[CHAPTER-GENERATION-FAILED]", {
                        chapterNumber: chapter.id,
                        attempt: attempts,
                        error: e.message || String(e)
                    });

                    if (attempts >= 2) {
                        await prisma.chapter.update({
                            where: { projectId_chapterNumber: { projectId: project.project_id, chapterNumber: chapter.id } },
                            data: { status: "Pending Regeneration" }
                        }).catch(() => { });
                    }
                }
            }
        })
    );

    await generationPromise;

    console.log("\n=== VALIDATION ===");
    const chapters = await prisma.chapter.findMany({
        where: { projectId: project.project_id },
        orderBy: { chapterNumber: "asc" }
    });

    console.log(`Found ${chapters.length} chapters.`);

    let allValid = true;
    for (const c of chapters) {
        const words = c.content ? c.content.split(/\s+/).length : 0;
        console.log(`Chapter ${c.chapterNumber} - ${c.title}: ${c.status} | Words: ${words}`);
        if (words < 100 || c.status === "Pending Regeneration" || c.status === "Generating") {
            allValid = false;
        }
    }

    if (chapters.length === 12 && allValid) {
        console.log("✅ TEST PASSED: All 12 chapters reliably created and validated.");
    } else {
        console.log("❌ TEST FAILED: Chapters missing or failed validation.");
    }

    return;
}

runTest().then(() => {
    console.log("Exiting.");
    process.exit(0);
}).catch(console.error);
