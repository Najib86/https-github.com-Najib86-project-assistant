import prisma from "@/lib/prisma";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { RESEARCH_GUIDELINES } from "@/lib/guidelines";
import { AIOrchestrator } from "./ai/ai.orchestrator";

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

import { redis } from "./redis";
import crypto from "crypto";

const orchestrator = new AIOrchestrator();

export async function generateAIResponse(prompt: string, mode: string = "text"): Promise<string> {
    const finalPrompt = mode === "json"
        ? `${prompt}\n\nIMPORTANT: Output ONLY valid JSON code. No markdown formatting.`
        : prompt;

    // Redis Caching Logic
    const promptHash = crypto.createHash("md5").update(finalPrompt).digest("hex");
    const cacheKey = `ai:gen:${promptHash}`;

    try {
        const cached = await redis.get<string>(cacheKey);
        if (cached) {
            console.log("[AI-REDIS] Serving cached AI response");
            return cached;
        }
    } catch (e) {
        console.error("[AI-REDIS] Cache read error:", e);
    }

    // Use our new production-grade orchestrator
    const response = await orchestrator.generate(finalPrompt);

    if (response.success) {
        let text = response.content;
        if (mode === "json") {
            // Clean up potential markdown code blocks
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        }

        // Cache for 1 hour
        try {
            await redis.set(cacheKey, text, { ex: 3600 });
        } catch (e) {
            console.error("[AI-REDIS] Cache write error:", e);
        }

        return text;
    }

    // Comprehensive error logging has already happened in the orchestrator
    throw new Error(response.error || "AI Service Unavailable");
}

export async function streamAIResponse(prompt: string) {
    // Keeping this for streaming UI components, using gemini as preferred streamer
    return streamText({
        model: google("gemini-1.5-flash"),
        prompt: prompt,
    });
}

export async function generateChapterContent(
    projectId: number,
    chapterNumber: number,
    chapterTitle: string,
    topic: string,
    level: string,
    sampleText?: string,
    academicMetadata?: Record<string, any>
) {
    let contextStr = "";
    if (academicMetadata) {
        contextStr += `
    Student Context:
    - Programme: ${academicMetadata.institution?.programme || "N/A"}
    - Faculty: ${academicMetadata.institution?.faculty || "N/A"}
    - Research Area: ${academicMetadata.research?.area || "N/A"}
    - Keywords: ${Array.isArray(academicMetadata.research?.keywords) ? academicMetadata.research.keywords.join(", ") : academicMetadata.research?.keywords || ""}
        `;
    }

    const prompt = `
        Context: You are an expert academic writer and researcher. You are writing a specific section/chapter for a final year project report (Level: ${level || "University"}).
        
        Project Topic: "${topic}"
        Current Section/Chapter: ${chapterTitle} (ID: ${chapterNumber})
        ${contextStr}

        === STRICT UNIVERSITY GUIDELINES ===
        You must strictly adhere to the following guidelines:
        ${RESEARCH_GUIDELINES}
        ====================================

        CRITICAL INSTRUCTIONS:
        1. **ELABORATE & DETAILED**: This must be a full, comprehensive academic text. Do NOT write a summary or an outline. Write the actual full content.
        2. **LENGTH**: Target 40-60 pages total across the project. For major chapters (Chapters 1-5), you MUST write at least 3000-5000 words. Expand heavily on literature, methodology details, and findings.
        3. **STRUCTURE**: Expand each subsection significantly to ensure the total project length reaches 40-60 pages.
        4. **TONE**: Use a formal, objective, and scholarly tone.
        5. **CITATIONS**: You MUST include in-text citations in APA style (Author, Year) to support arguments. Provide a comprehensive list in the Bibliography section.
        6. **FORMAT**: Use Markdown for headings (## for main sections, ### for subsections).
        7. **SPECIFIC SECTIONS TARGETS**:
           - Title Page/Certification/Dedication/Acknowledgement: Write appropriate formal templates filled with dummy academic names (e.g., Dr. A. B. Smith) where relevant.
           - Table of Contents: Generate a detailed mockup Table of Contents mapping out Chapters 1-5 with standard pagination.
           - Abstract: Provide a comprehensive 275-350 word summary covering objectives, methodology, findings, and conclusion. Do not exceed 400 words.
           - Chapter One (Introduction): Minimum 10 pages worth of content. Cover Background, Statement of Problem, Objectives, Research Questions, Hypotheses, Significance, Scope, and Definition of Terms.
           - Chapter Two (Lit Review): Minimum 15 pages worth of content. Extensive conceptual review, theoretical framework (multiple theories), and empirical review of at least 15 past studies.
           - Chapter Three (Methodology): Minimum 10 pages worth of content. Detailed Research Design, Population, Sample/Sampling, Instruments, Validity/Reliability, and Step-by-step Data Analysis procedure.
           - Chapter Four (Results): Present extensive mock data analysis, tables, charts, and deep-dive discussion of findings linked to research questions and prior literature.
           - Chapter Five: Detailed Summary of Findings, Conclusion, and actionable Recommendations.
           - Bibliography: Generate at least 30-40 credible academic references in APA format.

        ${sampleText ? `Style Reference (Mimic this writing style/tone and incorporate relevant data if any): \n"${sampleText.substring(0, 4000)}..."` : ""}

        TASK: Write the COMPLETE and EXTREMELY DETAILED content for "${chapterTitle}" now. Do not start with "Here is the chapter" or "Sure". specific content only.
    `;

    const content = await generateAIResponse(prompt, "text");

    return await prisma.chapter.upsert({
        where: {
            projectId_chapterNumber: {
                projectId,
                chapterNumber
            }
        },
        update: {
            content,
            status: "Draft",
            updatedAt: new Date()
        },
        create: {
            projectId,
            chapterNumber,
            title: chapterTitle,
            content,
            status: "Draft"
        }
    });
}

/**
 * Automatically analyze research materials and update relevant project chapters.
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
        const analysisPrompt = `
            Analyze the following research materials submitted by a student. 
            Synthesize this data into meaningful academic paragraphs that can be added to the Results (Chapter 4), Discussion (Chapter 7), or Methodology (Chapter 3) of their project titled "${project.title}".
            
            ${researchContext}
            
            Format your response as a JSON object with chapter numbers as keys and the synthesized text as values.
            Example: {"3": "Methodology update...", "4": "Results analysis...", "7": "Discussion points..."}
            ONLY return the JSON.
        `;

        const analysisJson = await generateAIResponse(analysisPrompt, "json");
        const updates = JSON.parse(analysisJson);

        // 3. Update the chapters in the database
        for (const [chapterNum, newContent] of Object.entries(updates as Record<string, string>)) {
            const chapNum = parseInt(chapterNum);
            const existingChapter = (project.chapters as any[]).find((c: any) => c.chapterNumber === chapNum);

            if (existingChapter) {
                // Determine if we should append or prepend
                const updatedContent = `
${existingChapter.content}

<br/><hr/>
<h3>AI RELIANCE: INTEGRATED RESEARCH DATA (${new Date().toLocaleDateString()})</h3>
<p>${newContent}</p>
                `.trim();

                await prisma.chapter.update({
                    where: { chapter_id: existingChapter.chapter_id },
                    data: {
                        content: updatedContent,
                        status: "Draft", // Set back to draft so user can review
                        updatedAt: new Date()
                    }
                });
            } else {
                // If chapter doesn't exist, we might want to skip or create it
                // For now, let's just log
                console.log(`[AI-RESEARCH] Chapter ${chapNum} not found for project ${project.project_id}`);
            }
        }

        return { success: true, updatedChapters: Object.keys(updates) };

    } catch (error) {
        console.error("[AI-RESEARCH] Error in auto-update:", error);
        throw error;
    }
}

