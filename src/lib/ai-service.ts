import Groq from "groq-sdk";
import prisma from "@/lib/prisma";
import { GEMINI_API_ENDPOINT } from "./constants";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";

const geminiApiKey = process.env.GEMINI_API_KEY;
const groqApiKey = process.env.GROQ_API_KEY;
const openRouterApiKey = process.env.OPENROUTER_API_KEY;
const hfApiKey = process.env.HUGGINGFACE_API_TOKEN;


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

async function fetchWithTimeout(resource: RequestInfo, options: RequestInit & { timeout?: number } = {}) {
    const { timeout = 15000, ...rest } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(resource, {
            ...rest,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (err) {
        clearTimeout(id);
        throw err;
    }
}

async function generateWithGemini(prompt: string, mode: string = "text"): Promise<string> {
    if (!geminiApiKey) throw new Error("Gemini API key missing");

    const endpoint = `${GEMINI_API_ENDPOINT}?key=${geminiApiKey}`;

    // Append JSON instruction if needed
    const finalPrompt = mode === "json"
        ? `${prompt}\n\nIMPORTANT: Output ONLY valid JSON code. No markdown formatting.`
        : prompt;

    try {
        const response = await fetchWithTimeout(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: finalPrompt }] }]
            }),
            timeout: 20000 // 20s timeout for Gemini
        });

        if (!response.ok) {
            if (response.status === 429) throw new Error("Gemini Quota Exceeded");
            if (response.status === 401) throw new Error("Gemini Invalid Key");
            throw new Error(`Gemini API Error: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            let text = data.candidates[0].content.parts[0].text;
            if (mode === "json") {
                // Clean up potential markdown code blocks
                text = text.replace(/```json/g, "").replace(/```/g, "").trim();
            }
            return text;
        }

        throw new Error("Gemini response format invalid");
    } catch (error: any) {
        if (error.name === 'AbortError') throw new Error("Gemini Request Timed Out");
        throw error;
    }
}

async function generateWithGroq(prompt: string, mode: string = "text"): Promise<string> {
    if (!groqApiKey) throw new Error("Groq API key missing");

    const groq = new Groq({ apiKey: groqApiKey });

    const finalPrompt = mode === "json"
        ? `${prompt}\n\nIMPORTANT: Output ONLY valid JSON code. No markdown formatting.`
        : prompt;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "user", content: finalPrompt }
            ],
            model: "llama3-70b-8192",
            response_format: mode === "json" ? { type: "json_object" } : undefined,
        }, {
            timeout: 20000 // 20s timeout
        });

        const content = completion.choices[0]?.message?.content || "";
        return content;
    } catch (error: any) {
        throw error;
    }
}

async function generateWithOpenRouter(prompt: string, mode: string = "text"): Promise<string> {
    if (!openRouterApiKey) throw new Error("OpenRouter API key missing");

    const finalPrompt = mode === "json"
        ? `${prompt}\n\nIMPORTANT: Output ONLY valid JSON code. No markdown formatting.`
        : prompt;

    try {
        const response = await fetchWithTimeout("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${openRouterApiKey}`,
                "HTTP-Referer": "ProjectAssistant", // Site URL for rankings on openrouter.ai
                "X-Title": "ProjectAssistant", // Site title for rankings on openrouter.ai
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "mistralai/mixtral-8x7b-instruct",
                messages: [
                    { role: "user", content: finalPrompt }
                ]
            }),
            timeout: 20000
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API Error: ${response.statusText}`);
        }

        const data = await response.json();
        let content = data.choices[0]?.message?.content || "";

        if (mode === "json") {
            content = content.replace(/```json/g, "").replace(/```/g, "").trim();
        }

        return content;
    } catch (error: any) {
        if (error.name === 'AbortError') throw new Error("OpenRouter Request Timed Out");
        throw error;
    }
}

async function generateWithHuggingFace(prompt: string, mode: string = "text"): Promise<string> {
    if (!hfApiKey) throw new Error("Hugging Face API key missing");

    const finalPrompt = mode === "json"
        ? `${prompt}\n\nIMPORTANT: Output ONLY valid JSON code. No markdown formatting.`
        : prompt;

    try {
        const response = await fetchWithTimeout("https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-8B-Instruct", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${hfApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: finalPrompt,
                parameters: {
                    max_new_tokens: 4000,
                    return_full_text: false
                }
            }),
            timeout: 25000 // HF can be slow
        });

        if (!response.ok) {
            throw new Error(`Hugging Face API Error: ${response.statusText}`);
        }

        const data = await response.json();

        // HF Inference usually returns an array of objects
        if (Array.isArray(data) && data[0]?.generated_text) {
            let content = data[0].generated_text;
            if (mode === "json") {
                content = content.replace(/```json/g, "").replace(/```/g, "").trim();
            }
            return content;
        }

        throw new Error("Hugging Face response format invalid");
    } catch (error: any) {
        if (error.name === 'AbortError') throw new Error("Hugging Face Request Timed Out");
        throw error;
    }
}

async function generateMock(prompt: string, mode: string = "text"): Promise<string> {
    console.warn("Using Mock Generator for prompt:", prompt.substring(0, 50));

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (mode === "json" || prompt.includes("JSON")) {
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

export async function streamAIResponse(prompt: string) {
    return streamText({
        model: google("gemini-1.5-flash"),
        prompt: prompt,
    });
}

export async function generateAIResponse(prompt: string, mode: string = "text"): Promise<string> {
    // 1. Gemini
    try {
        console.log("Attempting Gemini...");
        return await generateWithGemini(prompt, mode);
    } catch (err: any) {
        console.warn("Gemini failed:", err.message);
    }

    // 2. Groq
    try {
        console.log("Attempting Groq...");
        return await generateWithGroq(prompt, mode);
    } catch (err: any) {
        console.warn("Groq failed:", err.message);
    }

    // 3. OpenRouter
    try {
        console.log("Attempting OpenRouter...");
        return await generateWithOpenRouter(prompt, mode);
    } catch (err: any) {
        console.warn("OpenRouter failed:", err.message);
    }

    // 4. Hugging Face
    try {
        console.log("Attempting Hugging Face...");
        return await generateWithHuggingFace(prompt, mode);
    } catch (err: any) {
        console.warn("Hugging Face failed:", err.message);
    }

    // 5. Mock
    console.warn("All AI providers failed. Falling back to Mock.");
    return await generateMock(prompt, mode);
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
