export const AI_CONFIG = {
    models: {
        groq: "llama-3.1-8b-instant",
        huggingface: "google/flan-t5-large",
        gemini: "gemini-1.5-flash-latest"
    },
    priority: ["groq", "gemini", "huggingface"],
    timeouts: {
        default: 30000 // 30 seconds
    },
    retries: {
        max: 1,
        backoff: 1000 // ms
    },
    mock: {
        enabled: process.env.NODE_ENV === "development"
    },
    maxTokens: 4000
};
