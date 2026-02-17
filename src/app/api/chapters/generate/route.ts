import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { RESEARCH_GUIDELINES } from "@/lib/guidelines";
import { rateLimit } from "@/lib/rate-limit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface SessionUser {
    id?: string | number;
    name?: string | null;
    email?: string | null;
    role?: string;
}

const generateSchema = z.object({
    projectId: z.coerce.number(),
    chapterNumber: z.coerce.number(),
    chapterTitle: z.string().optional(),
    topic: z.string().min(5),
    level: z.string().optional(),
    sampleText: z.string().optional(),
    stream: z.boolean().optional().default(true),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const user = session?.user as SessionUser;

        if (user?.id) {
            await rateLimit(`chapter-gen:${user.id}`);
        }

        const body = await req.json();
        const validated = generateSchema.safeParse(body);

        if (!validated.success) {
            return new Response(JSON.stringify({ error: validated.error.message }), { status: 400 });
        }

        const { projectId, chapterNumber, chapterTitle, topic, level } = validated.data;

        // Fetch Project Context (Interview Bot Data)
        const project = await prisma.project.findUnique({
            where: { project_id: projectId },
            select: {
                problemStatement: true,
                objectives: true,
                methodology: true,
                title: true,
                level: true,
            }
        });

        // Build rich context from interview bot questionnaire
        let contextSection = "";

        if (project) {
            contextSection += `\n=== PROJECT CONTEXT ===\n`;
            contextSection += `Project Title: ${project.title}\n`;
            contextSection += `Academic Level: ${project.level || level || "University"}\n\n`;

            if (project.problemStatement) {
                contextSection += `Problem Statement:\n${project.problemStatement}\n\n`;
            }

            if (project.objectives) {
                try {
                    const objectives = JSON.parse(project.objectives);
                    if (Array.isArray(objectives) && objectives.length > 0) {
                        contextSection += `Research Objectives:\n`;
                        objectives.forEach((obj, idx) => {
                            contextSection += `${idx + 1}. ${obj}\n`;
                        });
                        contextSection += `\n`;
                    }
                } catch {
                    contextSection += `Research Objectives: ${project.objectives}\n\n`;
                }
            }

            if (project.methodology) {
                contextSection += `Methodology:\n${project.methodology}\n\n`;
            }
        }



        const prompt = `You are an expert academic writer helping a ${project?.level || level || "university"} student write their research project.

${contextSection}

=== STRICT UNIVERSITY GUIDELINES ===
You must strictly adhere to the following guidelines for structure, content, and formatting.
${RESEARCH_GUIDELINES}
=====================================

=== WRITING TASK ===
Chapter ${chapterNumber}: ${chapterTitle || "General"}
Topic: "${topic}"

=== INSTRUCTIONS ===
1. Write detailed, well-structured academic content appropriate for ${project?.level || level || "university"} level.
2. STRICTLY FOLLOW the "GUIDELINES FOR RESEARCH PROJECT EXECUTION" provided above.
3. Ensure the content directly addresses the problem statement and objectives listed above.
4. Use the methodology context to inform your approach.
5. Write in formal academic tone with clear, precise language.
6. Include relevant examples and explanations.

Write the chapter content now:`;

        const result = await streamText({
            model: google("gemini-1.5-flash"),
            prompt: prompt,
        });

        return result.toTextStreamResponse();

    } catch (error: unknown) {
        console.error("Error generating chapter:", error);
        return new Response(JSON.stringify({ error: "Generation failed" }), { status: 500 });
    }
}

