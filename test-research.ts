import { autoUpdateProjectWithResearch } from "./src/lib/ai-service";
import prisma from "./src/lib/prisma";

async function runTest() {
    console.log("Creating a temporary user and project...");
    let user = await prisma.user.findFirst();
    if (!user) {
        user = await prisma.user.create({
            data: {
                name: "Test User",
                email: "test.research@example.com",
                password: "password"
            }
        });
    }

    const project = await prisma.project.create({
        data: {
            title: "Evaluating Artificial Intelligence in Modern Software Engineering",
            level: "Undergraduate",
            type: "Capstone",
            studentId: user.id
        }
    });

    console.log(`Project created with ID: ${project.project_id}`);

    // Create Chapter 4 (Results & Discussion) which is ID 10
    console.log("Creating dummy Chapter 4...");
    await prisma.chapter.create({
        data: {
            projectId: project.project_id,
            chapterNumber: 10,
            title: "Chapter Four: Results and Discussion",
            content: "## Chapter Four\n\n### Presentation of Results\nInitial findings suggest AI is useful. More data is needed.",
            status: "Draft"
        }
    });

    console.log("Creating Research Submission...");
    const submission = await prisma.researchSubmission.create({
        data: {
            userId: user.id,
            projectId: project.project_id,
            category: "engineering",
            title: "Analysis of AI Productivity Gains",
            supervisor: "Dr. Smith",
            abstract: "This paper measures time saved using AI coding assistants. Result: 30% reduction in debugging time.",
            keywords: "AI, Productivity, Debugging",
            researchType: "Experimental",
            files: {
                create: [
                    {
                        fileName: "productivity_data.pdf",
                        fileType: "application/pdf",
                        fileUrl: "http://example.com/data.pdf",
                        fileSize: 1024
                    }
                ]
            }
        }
    });

    console.log(`Research Submission created with ID: ${submission.id}`);
    console.log("Triggering autoUpdateProjectWithResearch...");

    try {
        const result = await autoUpdateProjectWithResearch(submission.id);
        console.log("\n=== RESEARCH UPDATE SUCCESS ===");
        console.log("Updated Chapters:", result?.updatedChapters);

        // Fetch Chapter 4 to see modifications
        const updatedChapter = await prisma.chapter.findUnique({
            where: {
                projectId_chapterNumber: {
                    projectId: project.project_id,
                    chapterNumber: 10
                }
            }
        });

        console.log("\n=== CHAPTER 4 NEW CONTENT ===");
        console.log(updatedChapter?.content);

        // Fetch latest version
        const versions = await prisma.chapterVersion.findMany({
            where: { chapterId: updatedChapter?.chapter_id }
        });

        console.log(`\n=== CHAPTER 4 VERSIONS (${versions.length}) ===`);
        if (versions.length > 0) {
            console.log("Latest change summary:", versions[versions.length - 1].changeSummary);
            console.log("Has Old Content?:", !!versions[versions.length - 1].oldContent);
            console.log("Has New Content?:", !!versions[versions.length - 1].newContent);
        }

    } catch (error) {
        console.error("\n=== RESEARCH UPDATE FAILED ===");
        console.error(error);
    }
}

runTest()
    .catch(console.error)
    .finally(() => process.exit(0));
