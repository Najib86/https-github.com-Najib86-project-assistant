import { generateChapterContent } from "./src/lib/ai-service";
import prisma from "./src/lib/prisma";

async function runTest() {
    console.log("Checking for a user to attach project to...");
    let user = await prisma.user.findFirst();
    if (!user) {
        console.log("No user found, creating a dummy user...");
        user = await prisma.user.create({
            data: {
                name: "Test User",
                email: "test.ai@example.com",
                password: "password"
            }
        });
    }

    console.log("Creating a temporary project...");
    const project = await prisma.project.create({
        data: {
            title: "Evaluating Artificial Intelligence in Modern Software Engineering",
            level: "Undergraduate",
            type: "Capstone",
            studentId: user.id
        }
    });

    console.log(`Project created with ID: ${project.project_id}`);
    console.log("Testing generation of 'Chapter One: Introduction'...");

    try {
        const chapter = await generateChapterContent(
            project.project_id,
            7, // ID for Chapter One
            "Chapter One: Introduction",
            project.title,
            project.level
        );

        console.log("\n=== GENERATION SUCCESS ===");
        console.log("Chapter Number:", chapter.chapterNumber);
        console.log("Title :", chapter.title);
        console.log("Status:", chapter.status);
        console.log("Content Preview:", chapter.content?.substring(0, 300) + "...\n");
        console.log("Content Length:", chapter.content?.length, "characters");

        // Optional: Let's check the GenerationLog
        const logs = await prisma.generationLog.findMany({
            where: { projectId: project.project_id }
        });
        console.log("\n=== GENERATION LOGS ===");
        console.dir(logs, { depth: null });

    } catch (error) {
        console.error("\n=== GENERATION FAILED ===");
        console.error(error);
    }
}

runTest()
    .catch(console.error)
    .finally(() => process.exit(0));
