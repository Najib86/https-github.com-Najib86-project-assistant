
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HfInference } from "@huggingface/inference";
import prisma from "@/lib/prisma";

const geminiApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const hfApiKey = process.env.HUGGINGFACE_API_TOKEN || process.env.NEXT_PUBLIC_HUGGINGFACE_API_TOKEN;

export const CHAPTERS_LIST = [
    { id: 1, title: "Abstract" },
    { id: 2, title: "Introduction" },
    { id: 3, title: "Literature Review" },
    { id: 4, title: "Methodology" },
    { id: 5, title: "Implementation" },
    { id: 6, title: "Results" },
    { id: 7, title: "Discussion" },
    { id: 8, title: "Conclusion" },
    { id: 9, title: "References" }
];

export async function generateAIContent(prompt: string): Promise<string> {
    // Try Gemini first
    if (geminiApiKey) {
        try {
            const genAI = new GoogleGenerativeAI(geminiApiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.warn("Gemini generation failed, attempting fallback to Hugging Face...", error);
        }
    }

    // Fallback to Hugging Face
    if (hfApiKey) {
        try {
            const hf = new HfInference(hfApiKey);
            // Using a reliable instruction-tuned model
            const result = await hf.textGeneration({
                model: "mistralai/Mistral-7B-Instruct-v0.3", 
                inputs: prompt,
                parameters: {
                    max_new_tokens: 4000,
                    return_full_text: false
                }
            });
            return result.generated_text;
        } catch (error) {
            console.error("Hugging Face generation failed:", error);
            throw error; // Rethrow if both fail
        }
    }

    throw new Error("No valid API keys found for Gemini or Hugging Face");
}

export async function generateChapterContent(projectId: number, chapterNumber: number, chapterTitle: string, topic: string, level: string, sampleText?: string) {
    const prompt = `
Context: Writing an academic project report for a ${level || "University"} level requirement.
Chapter: ${chapterTitle}
Topic/Focus: "${topic}"

Instructions:
1. Write a comprehensive, high-quality academic draft for this specific chapter.
2. Use formal, objective academic tone.
3. Organize with clear headings (## Heading 2) and subheadings (### Heading 3).
4. Include placeholder citations in APA/MLA format where appropriate (e.g., [Author, Year]).
5. Ensure logical flow and coherence.

${sampleText ? `Style Reference (Mimic this writing style/tone and incorporate relevant data if any): \n"${sampleText.substring(0, 4000)}..."` : ""}

Task: Generate the content for this chapter now. Do not include introductory conversational text, just the chapter content.
`;

    const content = await generateAIContent(prompt);

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
