import { GroqProvider } from "./providers/groq";
import { HuggingFaceProvider } from "./providers/huggingface";
import { GeminiProvider } from "./providers/gemini";
import { AIProvider, AIResponse } from "./ai.types";
import { AI_CONFIG } from "./ai.config";

export class AIOrchestrator {
    private providers: Map<string, AIProvider>;
    private unhealthyProviders: Set<string> = new Set();

    constructor() {
        this.providers = new Map([
            ["groq", new GroqProvider()],
            ["gemini", new GeminiProvider()],
            ["huggingface", new HuggingFaceProvider()]
        ]);

        const enabledCount = Array.from(this.providers.values()).filter(p => p.isEnabled()).length;
        if (enabledCount === 0 && !AI_CONFIG.mock.enabled) {
            console.error("[AI] CRITICAL CONFIGURATION ERROR: No AI providers enabled.");
        } else {
            console.log(`[AI] Orchestrator initialized with ${enabledCount} enabled providers in order: ${AI_CONFIG.priority.join(", ")}`);
        }
    }

    private isPermanentError(message: string): boolean {
        const permanentIndicators = [
            "PERMANENT_ERROR",
            "model_decommissioned",
            "404",
            "410",
            "gone",
            "invalid_request_error",
            "not found"
        ];
        return permanentIndicators.some(indicator => message.toLowerCase().includes(indicator.toLowerCase()));
    }

    async generate(prompt: string): Promise<AIResponse> {
        let lastError: string | null = null;

        for (const providerName of AI_CONFIG.priority) {
            const provider = this.providers.get(providerName);

            if (!provider || !provider.isEnabled()) continue;

            if (this.unhealthyProviders.has(providerName)) {
                console.log(`[AI] Skipping unhealthy provider: ${providerName}`);
                continue;
            }

            for (let attempt = 0; attempt <= AI_CONFIG.retries.max; attempt++) {
                if (attempt === 0) {
                    console.log(`[AI] Trying provider: ${providerName}`);
                } else {
                    console.log(`[AI] Retrying provider: ${providerName} (Attempt ${attempt + 1})`);
                    await new Promise(resolve => setTimeout(resolve, AI_CONFIG.retries.backoff));
                }

                try {
                    const content = await provider.generate(prompt);

                    if (content && content.length >= 50) {
                        console.log(`[AI] Success with: ${providerName}`);
                        return { success: true, content, provider: providerName };
                    }
                    throw new Error("Response too short or invalid");

                } catch (error: unknown) {
                    const errorMessage = error instanceof Error ? error.message : String(error);

                    if (this.isPermanentError(errorMessage)) {
                        console.error(`[AI] Permanent failure detected: ${errorMessage}`);
                        console.log(`[AI] Switching to next provider`);
                        this.unhealthyProviders.add(providerName);
                        lastError = errorMessage;
                        break; // Stop retrying this provider
                    }

                    console.warn(`[AI] Provider transient failure: ${providerName} - ${errorMessage}`);
                    lastError = errorMessage;

                    if (attempt === AI_CONFIG.retries.max) {
                        break; // Done with this provider
                    }
                }
            }
        }

        if (AI_CONFIG.mock.enabled) {
            console.warn("[AI] All providers failed. Falling back to Mock.");
            return {
                success: true,
                content: `[MOCK GENERATED CONTENT]\nThis is a mock response because all real providers failed.\n\nOriginal Prompt: ${prompt.substring(0, 100)}...`,
                provider: "mock"
            };
        }

        return {
            success: false,
            content: "",
            error: lastError || "AI Service Unavailable"
        };
    }
}
