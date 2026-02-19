interface RateLimitEntry {
  attempts: number;
  resetTime: number;
}

// In-memory rate limiter (for small deployments)
// For production at scale, use Upstash Redis
const rateLimitMap = new Map<string, RateLimitEntry>();

export function getRateLimitKey(type: "signup" | "login" | "reset" | "resend-verification", identifier: string): string {
  return `${type}:${identifier}`;
}

export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  // Reset if window expired
  if (!entry || entry.resetTime < now) {
    rateLimitMap.set(key, { attempts: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, retryAfter: 0 };
  }

  // Check if limit exceeded
  if (entry.attempts >= maxAttempts) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  // Increment and allow
  entry.attempts++;
  return {
    allowed: true,
    remaining: maxAttempts - entry.attempts,
    retryAfter: 0
  };
}

/**
 * Cleanup old entries (run periodically)
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.resetTime < now) {
      rateLimitMap.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupRateLimits, 5 * 60 * 1000);
