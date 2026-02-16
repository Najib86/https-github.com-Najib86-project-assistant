import crypto from "crypto";

/**
 * Generate a secure random token
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hash a token using SHA256
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Verify a raw token against a hashed version
 */
export function verifyToken(rawToken: string, hashedToken: string): boolean {
  return hashToken(rawToken) === hashedToken;
}
