import Groq from "groq-sdk";
import { AIProvider } from "../ai.types";
import { AI_CONFIG } from "../ai.config";

export class GroqProvider implements AIProvider {
    name = "groq";
    private client: Groq | null = null;

    constructor() {
        if (this.isEnabled()) {
            this.client = new Groq({
                apiKey: process.env.GROQ_API_KEY,
            });
        }
    }

    isEnabled(): boolean {
        return !!process.env.GROQ_API_KEY;
    }

    async generate(prompt: string): Promise<string> {
        if (!this.client) throw new Error("Groq API key not configured");

        try {
            const completion = await this.client.chat.completions.create({
                messages: [
                    { role: "user", content: prompt }
                ],
                model: AI_CONFIG.models.groq,
                max_tokens: AI_CONFIG.maxTokens,
            }, {
                timeout: AI_CONFIG.timeouts.default,
            });

            const content = completion.choices[0]?.message?.content || "";
            if (!content || content.length < 50) {
                throw new Error("Groq response too short or empty");
            }

            return content;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);

            // Handle permanent decommissioned model error
            if (message.includes("model_decommissioned") || message.includes("400") || message.includes("not found")) {
                throw new Error(`PERMANENT_ERROR: Groq model decommissioned or invalid: ${message}`);
            }

            throw new Error(`Groq API Error: ${message}`);
        }
    }
}
