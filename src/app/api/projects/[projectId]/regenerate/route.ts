
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateChapterContent, CHAPTERS_LIST } from "@/lib/ai-service";
import { runInBatches } from "@/lib/utils";

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        const { projectId } = await params;
        const projectIdInt = parseInt(projectId);

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

        const mockIndicator = "[MOCK GENERATED CONTENT]";
        const chaptersToRegenerate = [];

        // Identify chapters needing regeneration
        for (const chapDef of CHAPTERS_LIST) {
            const existingChapter = project.chapters.find(c => c.chapterNumber === chapDef.id);
            const isMissing = !existingChapter;
            const hasMockContent = existingChapter?.content?.includes(mockIndicator);

            if (isMissing || hasMockContent) {
                chaptersToRegenerate.push(chapDef);
            }
        }

        if (chaptersToRegenerate.length === 0) {
            return NextResponse.json({ message: "All chapters are valid. No regeneration needed." }, { status: 200 });
        }

        let regeneratedCount = 0;

        // Process in batches (sequential)
        await runInBatches(chaptersToRegenerate, 1, async (chapDef) => {
            console.log(`Regenerating chapter ${chapDef.id}: ${chapDef.title}`);
            try {
                await generateChapterContent(
                    project.project_id,
                    chapDef.id,
                    chapDef.title,
                    project.title, // Topic
                    project.level,
                    project.referenceText || undefined,
                    (project as any).academicMetadata
                );
                regeneratedCount++;
            } catch (e) {
                console.error(`Failed to regenerate chapter ${chapDef.id}:`, e);
            }
        });

        // Touch project updated time
        await prisma.project.update({
            where: { project_id: projectIdInt },
            data: { updatedAt: new Date() }
        });

        return NextResponse.json({
            message: `Regeneration complete. Processed ${regeneratedCount} chapters.`,
            regeneratedCount
        }, { status: 200 });

    } catch (error) {
        console.error("Regeneration error:", error);
        return NextResponse.json({ error: "Failed to regenerate project content" }, { status: 500 });
    }
}
