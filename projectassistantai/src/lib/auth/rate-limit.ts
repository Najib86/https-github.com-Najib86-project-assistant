// src/lib/auth/rate-limit.ts
// Rate limiting for auth endpoints using Upstash Redis

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialise Redis client (null if not configured — falls back to in-memory)
let redis: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch {
  console.warn("[RateLimit] Redis not available, using in-memory fallback");
}

// In-memory fallback for development
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

async function inMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ success: boolean; remaining: number; reset: Date }> {
  const now = Date.now();
  const record = inMemoryStore.get(key);

  if (!record || record.resetAt < now) {
    inMemoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, reset: new Date(now + windowMs) };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, reset: new Date(record.resetAt) };
  }

  record.count++;
  return {
    success: true,
    remaining: limit - record.count,
    reset: new Date(record.resetAt),
  };
}

// ── Rate limiters ──────────────────────────────────────────────────────────

// Login: 5 attempts per 15 minutes
export const loginRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(5, "15 m"),
      prefix: "rl:login",
    })
  : null;

// Signup: 3 attempts per hour
export const signupRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(3, "1 h"),
      prefix: "rl:signup",
    })
  : null;

// AI generation: 10 requests per minute per user
export const aiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      prefix: "rl:ai",
    })
  : null;

// Prompt export: 20 per hour
export const exportRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(20, "1 h"),
      prefix: "rl:export",
    })
  : null;

// ── Unified check function ────────────────────────────────────────────────

type RateLimitType = "login" | "signup" | "ai" | "export";

export async function checkRateLimit(
  type: RateLimitType,
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: Date }> {
  const configs: Record<RateLimitType, { limit: number; windowMs: number; limiter: Ratelimit | null }> = {
    login:  { limit: 5,  windowMs: 15 * 60 * 1000, limiter: loginRateLimit },
    signup: { limit: 3,  windowMs: 60 * 60 * 1000, limiter: signupRateLimit },
    ai:     { limit: 10, windowMs: 60 * 1000,       limiter: aiRateLimit },
    export: { limit: 20, windowMs: 60 * 60 * 1000,  limiter: exportRateLimit },
  };

  const config = configs[type];

  if (config.limiter) {
    const result = await config.limiter.limit(identifier);
    return {
      success: result.success,
      remaining: result.remaining,
      reset: new Date(result.reset),
    };
  }

  // In-memory fallback
  return inMemoryRateLimit(
    `${type}:${identifier}`,
    config.limit,
    config.windowMs
  );
}

// ── AI Response Cache ─────────────────────────────────────────────────────

export async function getCachedAIResponse(
  promptHash: string
): Promise<string | null> {
  if (!redis) return null;
  try {
    return await redis.get<string>(`ai:cache:${promptHash}`);
  } catch {
    return null;
  }
}

export async function setCachedAIResponse(
  promptHash: string,
  response: string,
  ttlSeconds = 3600 // 1 hour
): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(`ai:cache:${promptHash}`, response, { ex: ttlSeconds });
  } catch {
    // Cache miss is acceptable
  }
}

// Simple hash function for prompt caching
export function hashPrompt(prompt: string): string {
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
