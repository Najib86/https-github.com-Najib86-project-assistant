
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


function getMockContent(prompt: string): string {
    // Interactive or JSON check for Mock
    const isJson = prompt.includes("JSON Output Format") || prompt.includes("JSON format");

    if (isJson) {
        return JSON.stringify({
            status: {
                chapter1: "Draft",
                chapter2: "Draft",
                chapter3: "Draft",
                chapter4: "Draft",
                chapter5: "Draft",
                full_report: "Draft"
            },
            plagiarism_notes: {
                chapter1: "Mock plagiarism note 1",
                chapter2: "Mock plagiarism note 2",
                chapter3: "Mock plagiarism note 3",
                chapter4: "Mock plagiarism note 4",
                chapter5: "Mock plagiarism note 5"
            },
            outline: {
                chapter1: "Mock Outline 1",
                chapter2: "Mock Outline 2",
                chapter3: "Mock Outline 3",
                chapter4: "Mock Outline 4",
                chapter5: "Mock Outline 5"
            },
            draft: {
                chapter1: "Mock Chapter 1 Content...",
                chapter2: "Mock Chapter 2 Content...",
                chapter3: "Mock Chapter 3 Content...",
                chapter4: "Mock Chapter 4 Content...",
                chapter5: "Mock Chapter 5 Content..."
            },
            full_report: "Mock Full Report Content..."
        });
    }

    return `[MOCK GENERATED CONTENT]
            
This is a mock generated content because AI APIs are unavailable.
            
Original Prompt: ${prompt.substring(0, 100)}...`;
}

export async function generateAIContent(prompt: string): Promise<string> {
    let geminiError: any = null;

    // Try Gemini first
    if (geminiApiKey) {
        try {
            const genAI = new GoogleGenerativeAI(geminiApiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error: any) {
            console.warn("Gemini generation failed, attempting fallback to Hugging Face...", error.message);
            geminiError = error;
        }
    }

    // Fallback to Hugging Face
    if (hfApiKey) {
        try {
            const hf = new HfInference(hfApiKey);
            // Using chatCompletion for Instruct model
            const result = await hf.chatCompletion({
                model: "mistralai/Mistral-7B-Instruct-v0.3",
                messages: [
                    { role: "user", content: prompt }
                ],
                max_tokens: 4000
            });
            return result.choices[0].message.content || "";
        } catch (error: any) {
            console.error("Hugging Face generation failed:", error);

            // Fallback to Mock generation for testing purposes if real APIs fail
            console.warn("Both AI providers failed. Falling back to MOCK generation.");
            return getMockContent(prompt);
        }
    }

    // If no API keys or both failed (and we didn't return above)
    // Actually the above catch returns, so we just need to handle the case where HF key is missing but Gemini failed.
    if (geminiError && !hfApiKey) {
        console.warn("Gemini failed and no HF key provided. Falling back to MOCK generation.");
        return getMockContent(prompt);
    }

    if (!geminiApiKey && !hfApiKey) {
        console.warn("No AI API keys provided. Falling back to MOCK generation.");
        return getMockContent(prompt);
    }

    throw new Error("No valid API keys found for Gemini or Hugging Face");
}


export async function generateChapterContent(projectId: number, chapterNumber: number, chapterTitle: string, topic: string, level: string, sampleText?: string) {
    const prompt = `
        Context: Writing an academic project report for a ${level || "University"} level requirement.
            Chapter: ${chapterTitle}
    Topic / Focus: "${topic}"

    Instructions:
    1. Write a comprehensive, high - quality academic draft for this specific chapter.
2. Use formal, objective academic tone.
3. Organize with clear headings(## Heading 2) and subheadings(### Heading 3).
4. Include placeholder citations in APA / MLA format where appropriate(e.g., [Author, Year]).
5. Ensure logical flow and coherence.

        ${sampleText ? `Style Reference (Mimic this writing style/tone and incorporate relevant data if any): \n"${sampleText.substring(0, 4000)}..."` : ""}

    Task: Generate the content for this chapter now.Do not include introductory conversational text, just the chapter content.
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
