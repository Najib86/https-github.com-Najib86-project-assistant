// src/lib/ai/ai.orchestrator.ts
// Multi-provider AI orchestrator with fallback chain and circuit breaking

import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

type Provider = "anthropic" | "gemini" | "groq" | "mock";

interface GenerateOptions {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

interface GenerateResult {
  text: string;
  provider: Provider;
  tokensUsed?: number;
}

// Circuit breaker state (in-memory for single instance; use Redis for multi-instance)
const circuitBreaker: Record<Provider, { healthy: boolean; lastError?: Date }> = {
  anthropic: { healthy: true },
  gemini: { healthy: true },
  groq: { healthy: true },
  mock: { healthy: true },
};

// Reset circuit breaker after 5 minutes
function isProviderHealthy(provider: Provider): boolean {
  const state = circuitBreaker[provider];
  if (!state.healthy && state.lastError) {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (state.lastError < fiveMinutesAgo) {
      circuitBreaker[provider].healthy = true;
      circuitBreaker[provider].lastError = undefined;
    }
  }
  return circuitBreaker[provider].healthy;
}

function markProviderUnhealthy(provider: Provider, error: Error) {
  // Don't mark unhealthy for rate limits (429) — just skip this request
  if (error.message.includes("429") || error.message.includes("rate")) return;
  // Mark permanently unhealthy for auth errors (401/403) until manual reset
  if (error.message.includes("401") || error.message.includes("403")) {
    circuitBreaker[provider] = { healthy: false, lastError: new Date() };
  }
}

// ── Provider implementations ──────────────────────────────────────────────

async function generateWithAnthropic(opts: GenerateOptions): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: opts.maxTokens ?? 8192,
    system: opts.systemPrompt,
    messages: [{ role: "user", content: opts.prompt }],
  });
  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type");
  return block.text;
}

async function generateWithGemini(opts: GenerateOptions): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      maxOutputTokens: opts.maxTokens ?? 8192,
      temperature: opts.temperature ?? 0.7,
    },
    systemInstruction: opts.systemPrompt,
  });
  const fullPrompt = opts.systemPrompt
    ? `${opts.systemPrompt}\n\n${opts.prompt}`
    : opts.prompt;
  const result = await model.generateContent(fullPrompt);
  return result.response.text();
}

async function generateWithGroq(opts: GenerateOptions): Promise<string> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const messages: Array<{ role: "system" | "user"; content: string }> = [];
  if (opts.systemPrompt) {
    messages.push({ role: "system", content: opts.systemPrompt });
  }
  messages.push({ role: "user", content: opts.prompt });
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-70b-versatile",
    messages,
    max_tokens: opts.maxTokens ?? 8192,
    temperature: opts.temperature ?? 0.7,
  });
  return completion.choices[0].message.content ?? "";
}

// Mock fallback for development/testing
async function generateMock(opts: GenerateOptions): Promise<string> {
  await new Promise((r) => setTimeout(r, 500)); // Simulate delay
  return `[MOCK RESPONSE - Configure AI API keys in .env]\n\nPrompt received: ${opts.prompt.slice(0, 100)}...\n\nTo enable real AI generation:\n1. Add ANTHROPIC_API_KEY to .env.local\n2. Or add GEMINI_API_KEY\n3. Or add GROQ_API_KEY`;
}

// ── Main orchestrator ─────────────────────────────────────────────────────

const PROVIDER_ORDER: Provider[] = ["anthropic", "gemini", "groq", "mock"];

export async function generateText(
  opts: GenerateOptions
): Promise<GenerateResult> {
  const errors: Record<string, string> = {};

  for (const provider of PROVIDER_ORDER) {
    if (!isProviderHealthy(provider)) continue;

    // Skip if API key not configured (except mock)
    if (provider === "anthropic" && !process.env.ANTHROPIC_API_KEY) continue;
    if (provider === "gemini" && !process.env.GEMINI_API_KEY) continue;
    if (provider === "groq" && !process.env.GROQ_API_KEY) continue;

    try {
      let text: string;
      switch (provider) {
        case "anthropic":
          text = await generateWithAnthropic(opts);
          break;
        case "gemini":
          text = await generateWithGemini(opts);
          break;
        case "groq":
          text = await generateWithGroq(opts);
          break;
        default:
          text = await generateMock(opts);
      }
      return { text, provider };
    } catch (error) {
      const err = error as Error;
      errors[provider] = err.message;
      markProviderUnhealthy(provider, err);
      console.error(`[AI Orchestrator] ${provider} failed:`, err.message);
      // Continue to next provider
    }
  }

  // All providers failed — return error message
  throw new Error(
    `All AI providers failed: ${JSON.stringify(errors, null, 2)}`
  );
}

// ── Streaming version (for chapter generation) ───────────────────────────

export async function streamText(
  opts: GenerateOptions,
  onChunk: (chunk: string) => void
): Promise<{ provider: Provider }> {
  // Try Anthropic streaming first
  if (process.env.ANTHROPIC_API_KEY && isProviderHealthy("anthropic")) {
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const stream = client.messages.stream({
        model: "claude-sonnet-4-5",
        max_tokens: opts.maxTokens ?? 8192,
        system: opts.systemPrompt,
        messages: [{ role: "user", content: opts.prompt }],
      });
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          onChunk(event.delta.text);
        }
      }
      return { provider: "anthropic" };
    } catch (error) {
      markProviderUnhealthy("anthropic", error as Error);
    }
  }

  // Fallback to non-streaming
  const result = await generateText(opts);
  onChunk(result.text);
  return { provider: result.provider };
}

export type { GenerateOptions, GenerateResult, Provider };
