// src/app/api/auth/request-password-reset/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const rl = await checkRateLimit("signup", ip); // Reuse signup limiter
    if (!rl.success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    // Always return success (don't reveal if email exists)
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (user && user.emailVerified) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

      // Delete any existing reset tokens for this user
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${rawToken}`;
      await sendPasswordResetEmail({ to: user.email, name: user.name ?? "User", resetUrl });
    }

    return NextResponse.json({
      success: true,
      message: "If this email is registered, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("[request-password-reset]", error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
