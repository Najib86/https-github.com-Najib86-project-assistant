import { AIProvider } from "../ai.types";
import { AI_CONFIG } from "../ai.config";

export class HuggingFaceProvider implements AIProvider {
    name = "huggingface";

    isEnabled(): boolean {
        return !!process.env.HUGGINGFACE_API_TOKEN;
    }

    async generate(prompt: string): Promise<string> {
        if (!this.isEnabled()) throw new Error("HuggingFace API token not configured");

        try {
            const response = await fetch(
                `https://api-inference.huggingface.co/models/${AI_CONFIG.models.huggingface}`,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                    method: "POST",
                    body: JSON.stringify({
                        inputs: prompt,
                        parameters: {
                            max_new_tokens: AI_CONFIG.maxTokens,
                            return_full_text: false,
                        },
                    }),
                    signal: AbortSignal.timeout(AI_CONFIG.timeouts.default),
                }
            );

            if (response.status === 410 || response.status === 404) {
                const errorData = await response.text();
                throw new Error(`PERMANENT_ERROR: HuggingFace model gone or not found (Status ${response.status}): ${errorData}`);
            }

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Status ${response.status}: ${errorData}`);
            }

            const result = await response.json();

            // HF Inference API returns an array for text generation
            const content = Array.isArray(result)
                ? result[0]?.generated_text
                : result.generated_text;

            if (!content || content.length < 50) {
                throw new Error("HuggingFace response too short or empty");
            }

            return content;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`HuggingFace API Error: ${message}`);
        }
    }
}
