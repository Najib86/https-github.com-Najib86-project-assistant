export const AI_CONFIG = {
    models: {
        groq: "llama-3.1-8b-instant",
        huggingface: "google/flan-t5-large",
        gemini: "gemini-1.5-flash-latest"
    },
    priority: ["groq", "gemini", "huggingface"],
    timeouts: {
        default: 45000 // Increased from 30s to 45s for longer content
    },
    retries: {
        max: 2, // Increased from 1 to 2 retries
        backoff: 1500 // Increased from 1000ms to 1500ms
    },
    mock: {
        enabled: process.env.NODE_ENV === "development"
    },
    maxTokens: 6000 // Increased from 4000 to 6000 for longer chapters
};
