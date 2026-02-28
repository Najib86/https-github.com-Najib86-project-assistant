import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateChapterContent, CHAPTERS_LIST, generateAIResponse } from "@/lib/ai-service";
import { runInBatches } from "@/lib/utils";

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        const { projectId } = await params;
        const projectIdInt = parseInt(projectId);
        const { validation } = await req.json();

        if (isNaN(projectIdInt)) {
            return NextResponse.json({ error: "Invalid Project ID" }, { status: 400 });
        }

        const project = await prisma.project.findUnique({
            where: { project_id: projectIdInt },
            include: { chapters: true }
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const { missingRequiredSections } = validation.metrics;

        const chaptersToRegenerate: { id: number; title: string }[] = [];

        // Match missing sections to our predefined CHAPTERS_LIST
        for (const missing of missingRequiredSections) {
            // Check if our CHAPTERS_LIST covers it
            const chapDef = CHAPTERS_LIST.find(c => missing.toLowerCase().includes(c.title.toLowerCase()) || c.title.toLowerCase().includes(missing.toLowerCase()));

            if (chapDef) {
                // Check if it's actually missing in DB
                const existingChapter = project.chapters.find(c => c.chapterNumber === chapDef.id);
                if (!existingChapter || existingChapter.content === null || existingChapter.content === "") {
                    chaptersToRegenerate.push(chapDef);
                }
            } else {
                // Create a custom chapter definition for sections like "Declaration", "Certification"
                // Give it a generic ID like 100 + index to separate it from main chapters
                const newId = 100 + chaptersToRegenerate.length;
                chaptersToRegenerate.push({ id: newId, title: missing });
            }
        }

        // Handle Abstract Length fix in the background as well
        const abstractChap = project.chapters.find(c => c.title?.toLowerCase().includes("abstract"));
        if (abstractChap && validation.metrics.abstractWordCount > 400) {
            // We'll queue abstract for rewriting
            runInBatches([{ id: abstractChap.chapterNumber, title: abstractChap.title || "Abstract" }], 1, async () => {
                try {
                    const prompt = `
                        You are an academic editor. Please rewrite the following abstract to strictly be under 400 words while retaining the core problem, methodology, results, and conclusion. 
                        Target Word Count: 350 max.
                        Format: Output the content in HTML with a <h2>Abstract</h2> heading. Do not include introductory conversational filler.
                        
                        Original Abstract:
                        ${abstractChap.content}
                     `;
                    const newContent = await generateAIResponse(prompt, "text");
                    await prisma.chapter.update({
                        where: { chapter_id: abstractChap.chapter_id },
                        data: { content: newContent, updatedAt: new Date() }
                    });
                } catch (e) {
                    console.error("Failed to fix abstract:", e);
                }
            }).catch(console.error);
        }

        // Fix Chapters (Run in batches asynchronously so client gets immediate response)
        if (chaptersToRegenerate.length > 0) {
            runInBatches(chaptersToRegenerate, 1, async (chapDef) => {
                console.log(`Auto-Fixing chapter ${chapDef.id}: ${chapDef.title}`);
                try {
                    await generateChapterContent(
                        project.project_id,
                        chapDef.id,
                        chapDef.title,
                        project.title,
                        project.level,
                        project.referenceText || undefined,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (project as any).academicMetadata
                    );
                } catch (e) {
                    console.error(`Failed to auto-fix chapter ${chapDef.id}:`, e);
                }
            }).catch(err => console.error("Auto fix failed:", err));
        }

        // Touch project updated time
        await prisma.project.update({
            where: { project_id: projectIdInt },
            data: { updatedAt: new Date() }
        });

        return NextResponse.json({
            message: `Optimization task started. Processes will run in background.`
        }, { status: 200 });

    } catch (error) {
        console.error("Optimization error:", error);
        return NextResponse.json({ error: "Failed to start optimization" }, { status: 500 });
    }
}
