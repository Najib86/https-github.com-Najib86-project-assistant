// src/app/api/auth/signup/route.ts
// POST — User registration with email verification

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { sendVerificationEmail } from "@/lib/email";
import { z } from "zod";
import { Role } from "@prisma/client";

const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: z.enum(["STUDENT", "SUPERVISOR"]).default("STUDENT"),
  department: z.string().optional(),
  faculty: z.string().optional(),
  institution: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // ── Rate limiting ─────────────────────────────────────────────
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const rateCheck = await checkRateLimit("signup", ip);

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        { status: 429 }
      );
    }

    // ── Validate input ────────────────────────────────────────────
    const body = await req.json();
    const parsed = SignupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, password, role, department, faculty, institution } =
      parsed.data;

    // ── Check existing user ───────────────────────────────────────
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Don't reveal if email exists (security best practice)
      return NextResponse.json(
        {
          success: true,
          message:
            "If this email is new, a verification link has been sent to it.",
        },
        { status: 200 }
      );
    }

    // ── Hash password ─────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 12);

    // ── Generate verification token ───────────────────────────────
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // ── Create user + token in transaction ────────────────────────
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role as Role,
          department,
          faculty,
          institution: institution ?? "National Open University of Nigeria",
        },
      });

      await tx.verificationToken.create({
        data: {
          userId: newUser.id,
          tokenHash,
          expiresAt: tokenExpiry,
        },
      });

      // Update site stats
      await tx.siteStats.upsert({
        where: { id: "main" },
        create: { id: "main", totalUsers: 1 },
        update: { totalUsers: { increment: 1 } },
      });

      return newUser;
    });

    // ── Send verification email ───────────────────────────────────
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${rawToken}`;
    await sendVerificationEmail({ to: email, name, verifyUrl });

    // ── Log activity ──────────────────────────────────────────────
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "USER_REGISTERED",
        ipAddress: ip,
        metadata: JSON.stringify({ role, institution }),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Account created! Please check your email to verify your account.",
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API /auth/signup]", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
