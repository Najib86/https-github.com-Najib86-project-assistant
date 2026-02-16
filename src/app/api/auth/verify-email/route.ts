import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { hashToken } from "@/lib/auth/tokens";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const rawToken = searchParams.get("token");

    if (!rawToken) {
      return NextResponse.json(
        { error: "Verification token missing" },
        { status: 400 }
      );
    }

    // Hash the token to compare with stored version
    const hashedToken = hashToken(rawToken);

    // Find verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token: hashedToken },
      include: { user: true }
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid or expired verification link" },
        { status: 400 }
      );
    }

    // Check if token expired
    if (verificationToken.expiresAt < new Date()) {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id }
      });

      return NextResponse.json(
        { error: "Verification link expired. Please sign up again." },
        { status: 410 }
      );
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { email_verified: true }
    });

    // Delete used token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id }
    });

    // Redirect to login with success message
    return NextResponse.redirect(
      new URL("/auth/login?verified=true", req.nextUrl.origin)
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
