import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider } from "../ai.types";
import { AI_CONFIG } from "../ai.config";

export class GeminiProvider implements AIProvider {
    name = "gemini";
    private genAI: GoogleGenerativeAI | null = null;

    constructor() {
        if (this.isEnabled()) {
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        }
    }

    isEnabled(): boolean {
        return !!process.env.GEMINI_API_KEY;
    }

    async generate(prompt: string): Promise<string> {
        if (!this.genAI) throw new Error("Gemini API key not configured");

        try {
            const model = this.genAI.getGenerativeModel({
                model: AI_CONFIG.models.gemini,
                generationConfig: {
                    maxOutputTokens: AI_CONFIG.maxTokens,
                }
            });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            if (!text || text.length < 50) {
                throw new Error("Gemini response too short or empty");
            }

            return text;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);

            // Map common errors to permanent if applicable
            if (message.includes("404") || message.includes("not found") || message.includes("invalid model")) {
                throw new Error(`PERMANENT_ERROR: Gemini model not found or invalid: ${message}`);
            }
            if (message.includes("429") || message.includes("quota")) {
                throw new Error(`Gemini Quota Exceeded: ${message}`);
            }

            throw new Error(`Gemini API Error: ${message}`);
        }
    }
}
