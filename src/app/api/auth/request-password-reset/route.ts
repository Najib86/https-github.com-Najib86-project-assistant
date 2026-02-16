import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateToken, hashToken } from "@/lib/auth/tokens";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit, getRateLimitKey } from "@/lib/auth/rateLimit";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Rate limiting by email
    const rateLimitKey = getRateLimitKey("reset", email);
    const rateLimit = checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000); // 3 per hour

    if (!rateLimit.allowed) {
      // Still return 200 to avoid user enumeration
      return NextResponse.json(
        { message: "If email exists, password reset link will be sent." },
        { status: 200 }
      );
    }

    // Find user (silently fail to avoid enumeration)
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (user) {
      // Generate reset token
      const rawToken = generateToken();
      const hashedTokenValue = hashToken(rawToken);

      // Delete any existing reset tokens for this user
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id }
      });

      // Create new reset token
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: hashedTokenValue,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        }
      });

      // Send email
      const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${rawToken}`;

      try {
        await sendPasswordResetEmail({
          to: email,
          name: user.name,
          resetUrl
        });
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
      }
    }

    // Always return generic response
    return NextResponse.json(
      { message: "If email exists, password reset link will be sent." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
