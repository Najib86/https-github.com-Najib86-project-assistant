import prisma from "@/lib/prisma";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";

import { AcademicOrchestrator } from "./ai/AcademicOrchestrator";
import { redis } from "./redis";
import crypto from "crypto";

export const CHAPTERS_LIST = [
    { id: 1, title: "Title Page" },
    { id: 2, title: "Certification" },
    { id: 3, title: "Dedication" },
    { id: 4, title: "Acknowledgement" },
    { id: 5, title: "Table of Contents" },
    { id: 6, title: "Abstract" },
    { id: 7, title: "Chapter One: Introduction" },
    { id: 8, title: "Chapter Two: Literature Review" },
    { id: 9, title: "Chapter Three: Methodology" },
    { id: 10, title: "Chapter Four: Results and Discussion" },
    { id: 11, title: "Chapter Five: Summary, Conclusion and Recommendations" },
    { id: 12, title: "Bibliography" }
];

const orchestrator = new AcademicOrchestrator();

// A basic AI generate function for smaller utilities
export async function generateAIResponse(prompt: string, mode: string = "text"): Promise<string> {
    const finalPrompt = mode === "json"
        ? `${prompt}\n\nIMPORTANT: Output ONLY valid JSON code. No markdown formatting.`
        : prompt;

    const promptHash = crypto.createHash("md5").update(finalPrompt).digest("hex");
    const cacheKey = `ai:gen:${promptHash}`;

    // If using huggingface or fallback, we might not have a generic provider instance here.
    // Instead we can temporarily bypass by calling a single provider directly or instantiate one.
    // However, ai.orchestrator had a generic generate method.
    // Since we removed it, I'll instantiate Groq directly or use a simple fetch.
    // Actually we can just use Gemini directly for general stuff.
    try {
        const cached = await redis.get<string>(cacheKey);
        if (cached) return cached;
    } catch { }

    const result = await orchestrator.generateRaw(finalPrompt);

    if (!result.success) {
        throw new Error(result.error || "AI Service Unavailable");
    }

    let cleaned = result.content;

    if (mode === "json") {
        cleaned = cleaned.replace(/```json/gi, "").replace(/```/g, "").trim();
    }

    try { await redis.set(cacheKey, cleaned, { ex: 3600 }); } catch { }
    return cleaned;
}

export async function streamAIResponse(prompt: string) {
    return streamText({
        model: google("gemini-1.5-flash-latest"),
        prompt: prompt,
    });
}

/**
 * Chapter content generation using the resilient Academic Orchestrator Pipeline
 */
export async function generateChapterContent(
    projectId: number,
    chapterNumber: number,
    chapterTitle: string,
    topic: string,
    level: string,
    sampleText?: string,
    academicMetadata?: Record<string, any>
) {
    const lockKey = `lock:chapter:${projectId}:${chapterNumber}`;
    const locked = await redis.set(lockKey, "1", { nx: true, ex: 60 });

    if (!locked) {
        throw new Error("Chapter generation already in progress.");
    }

    try {
        return await orchestrator.generateSection(
            projectId,
            chapterNumber,
            chapterTitle,
            topic,
            level,
            sampleText,
            academicMetadata
        );
    } finally {
        await redis.del(lockKey);
    }
}

/**
 * Audit project before export
 */
export async function auditProjectForExport(projectId: number) {
    return await orchestrator.auditProjectRequirements(projectId);
}

const generateDiffHighlighting = (oldStr: string, newStr: string) => {
    // In a real sophisticated system we use jsdiff. For here, a block-based diff 
    // or just appending with highlights. 
    // We will simulate the diff since standard JS doesn't have a built-in diff.
    // We'll highlight the AI added section in Green for new research.
    return `
<div class="diff-container">
    <div class="old-content" style="opacity: 0.6; text-decoration: line-through; color: #cc0000;">
        <!-- Hidden or minimized old content summarize -->
        <details><summary>Previous Version</summary>${oldStr}</details>
    </div>
    <div class="new-content" style="background-color: #e6ffed; border-left: 4px solid #00a023; padding: 10px;">
        ${newStr}
    </div>
</div>
    `.trim();
};

/**
 * Automatically analyze research materials and update relevant project chapters safely.
 */
export async function autoUpdateProjectWithResearch(submissionId: number) {
    try {
        const submission = await (prisma as any).researchSubmission.findUnique({
            where: { id: submissionId },
            include: {
                files: true,
                project: {
                    include: { chapters: true }
                }
            }
        });

        if (!submission || !submission.projectId || !submission.project) return;

        const project = submission.project;

        // 1. Prepare Research Context for AI Analysis
        const researchContext = `
            NEW RESEARCH DATA SUBMITTED:
            - Title: ${submission.title}
            - Category: ${submission.category}
            - Type: ${submission.researchType}
            - Abstract: ${submission.abstract}
            - Keywords: ${submission.keywords}
            - Files Uploaded: ${submission.files.map((f: { fileName: string }) => f.fileName).join(", ")}
        `;

        // 2. Ask AI to synthesize this research into specific chapter insights
        // UPDATED MAPPING: 9 -> Chapter Three (Methodology), 10 -> Chapter Four (Results), 11 -> Chapter Five (Conclusion)
        const analysisPrompt = `
            Analyze the following research materials submitted by a student. 
            Synthesize this data into meaningful academic paragraphs that can be added to the Methodology (Chapter 3 -> mapped to ID 9), Results & Discussion (Chapter 4 -> mapped to ID 10), or Conclusion (Chapter 5 -> mapped to ID 11) of their project titled "${project.title}".
            
            ${researchContext}
            
            Format your response as a JSON object with chapter number IDs as keys and the synthesized text as values.
            Example: {"9": "Methodology update...", "10": "Results analysis...", "11": "Discussion points..."}
            ONLY return the JSON.
        `;

        const analysisJson = await generateAIResponse(analysisPrompt, "json");
        let updates: Record<string, string> = {};

        const firstBrace = analysisJson.indexOf("{");
        const lastBrace = analysisJson.lastIndexOf("}");

        if (firstBrace !== -1) {
            try {
                let jsonSlice = "";
                if (lastBrace !== -1 && lastBrace > firstBrace) {
                    jsonSlice = analysisJson.slice(firstBrace, lastBrace + 1);
                } else {
                    jsonSlice = analysisJson.slice(firstBrace) + '"}'; // basic heal
                }

                // Final sanitization for inline breaks
                jsonSlice = jsonSlice.replace(/\n/g, '\\n').replace(/\r/g, '');

                updates = JSON.parse(jsonSlice);
            } catch (e) {
                console.warn("[AI-RESEARCH] JSON Parse Failed:", e);
                // Primitive fallback
                updates = { "10": "Research Integrated successfully (Raw fallback):\n" + analysisJson.substring(0, 200) };
            }
        } else {
            throw new Error("Could not extract any JSON from AI output.");
        }

        // 3. Update the chapters in the database with diff highlighting and versioning
        for (const [chapterNum, synthesizedNewContext] of Object.entries(updates as Record<string, string>)) {
            const chapNum = parseInt(chapterNum);

            if (synthesizedNewContext.length < 300) {
                console.warn(`[AI-RESEARCH] Ignored short synthesized content for chapter ${chapNum}`);
                continue;
            }

            if (!orchestrator.validateSectionStructure(chapNum, synthesizedNewContext)) {
                console.warn(`[AI-RESEARCH] Structural validation failed for synthesized content on chapter ${chapNum}`);
            }

            const existingChapter = (project.chapters as any[]).find((c: any) => c.chapterNumber === chapNum);

            const lockKey = `lock:chapter:${project.project_id}:${chapNum}`;
            const locked = await redis.set(lockKey, "1", { nx: true, ex: 60 });

            if (!locked) {
                console.warn(`[AI-RESEARCH] Chapter ${chapNum} is currently locked. Skipping research update.`);
                continue;
            }

            try {
                if (existingChapter) {
                    const oldContent = existingChapter.content || "";

                    // Construct diff
                    const diffContent = generateDiffHighlighting(oldContent, synthesizedNewContext);
                    const updatedContent = `${oldContent}\n\n<br/><hr/><h3>AI RELIANCE: INTEGRATED RESEARCH DATA (${new Date().toLocaleDateString()})</h3>\n${diffContent}`;

                    // Create a ChapterVersion for history highlighting
                    await prisma.chapterVersion.create({
                        data: {
                            chapterId: existingChapter.chapter_id,
                            oldContent: oldContent,
                            newContent: updatedContent,
                            changeSummary: "Integrated new research data from submission ID: " + submissionId
                        }
                    });

                    // Update actual chapter
                    await prisma.chapter.update({
                        where: { chapter_id: existingChapter.chapter_id },
                        data: {
                            content: updatedContent,
                            status: "Draft",
                            updatedAt: new Date()
                        }
                    });

                } else {
                    console.log(`[AI-RESEARCH] Chapter ID ${chapNum} not found for project ${project.project_id}`);
                }
            } finally {
                await redis.del(lockKey);
            }
        }

        return { success: true, updatedChapters: Object.keys(updates) };

    } catch (error) {
        console.error("[AI-RESEARCH] Error in auto-update:", error);
        throw error;
    }
}
