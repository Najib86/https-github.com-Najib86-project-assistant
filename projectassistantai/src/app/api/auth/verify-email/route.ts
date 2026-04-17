// src/app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const record = await prisma.verificationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!record) {
      return NextResponse.json({ error: "Invalid or expired verification link" }, { status: 400 });
    }
    if (record.expiresAt < new Date()) {
      await prisma.verificationToken.delete({ where: { id: record.id } });
      return NextResponse.json({ error: "Verification link has expired. Please request a new one." }, { status: 400 });
    }

    // Mark email as verified and delete token (single-use)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationToken.delete({ where: { id: record.id } }),
    ]);

    return NextResponse.json({ success: true, message: "Email verified successfully. You can now sign in." });
  } catch (error) {
    console.error("[verify-email]", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
