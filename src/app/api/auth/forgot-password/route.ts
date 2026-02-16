import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';
import { generateToken, hashToken } from "@/lib/auth/tokens";
import { checkRateLimit, getRateLimitKey } from "@/lib/auth/rateLimit";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Rate Limit Check
        const rateLimitKey = getRateLimitKey("reset", email);
        const rateLimit = checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000); // 3 attempts per hour

        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: "Too many reset attempts. Please try again later." },
                { status: 429, headers: { "Retry-After": rateLimit.retryAfter.toString() } }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Always return success to prevent email enumeration
        if (!user) {
            return NextResponse.json({ message: "If an account exists, a reset link has been sent." }, { status: 200 });
        }

        // Generate token
        const rawToken = generateToken();
        const hashedToken = hashToken(rawToken);
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour

        // Save hashed token
        await prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token: hashedToken,
                expiresAt,
            },
        });

        // Send email with raw token
        const resetUrl = `${process.env.NEXT_PUBLIC_URL}/reset-password?token=${rawToken}`;

        await sendPasswordResetEmail({
            to: user.email,
            name: user.name,
            resetUrl,
        });

        return NextResponse.json({ message: "If an account exists, a reset link has been sent." }, { status: 200 });
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
