import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

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
        const body = await req.json();
        const validated = generateSchema.safeParse(body);

        if (!validated.success) {
            return new Response(JSON.stringify({ error: validated.error.message }), { status: 400 });
        }

        const { chapterNumber, chapterTitle, topic, level } = validated.data;

        const prompt = `
            Context: Writing an academic project report at ${level || "University"} level.
            Chapter ${chapterNumber}: ${chapterTitle || "General"}
            Topic: "${topic}"
            Instructions: Write a detailed academic draft with proper headings and APA-style citations.
        `;

        const result = await streamText({
            model: google("gemini-1.5-flash"),
            prompt: prompt,
        });

        return result.toTextStreamResponse();

    } catch (error: any) {
        console.error("Error generating chapter:", error);
        return new Response(JSON.stringify({ error: "Generation failed" }), { status: 500 });
    }
}
