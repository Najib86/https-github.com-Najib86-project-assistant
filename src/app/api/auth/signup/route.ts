
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signupSchema } from "@/lib/validations/auth";
import { generateToken, hashToken } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { checkRateLimit, getRateLimitKey } from "@/lib/auth/rateLimit";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Rate limiting by email
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: "Email required" }, { status: 400 });
        }

        const rateLimitKey = getRateLimitKey("signup", email);
        const rateLimit = checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000); // 3 attempts per hour

        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: "Too many signup attempts. Please try again later." },
                { status: 429, headers: { "Retry-After": rateLimit.retryAfter.toString() } }
            );
        }

        // Validate input
        const validation = signupSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                error: "Invalid input",
                details: validation.error.format()
            }, { status: 400 });
        }

        const { name, password, role } = validation.data;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Email already registered" },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with email_verified: true (Instant Verification)
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || "student",
                provider: "credentials",
                email_verified: true
            }
        });

        // Generate verification token
        const rawToken = generateToken();
        const hashedTokenValue = hashToken(rawToken);

        await prisma.verificationToken.create({
            data: {
                userId: newUser.id,
                token: hashedTokenValue,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
            }
        });

        // Send verification email
        const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${rawToken}`;

        try {
            await sendVerificationEmail({
                to: email,
                name,
                verificationUrl
            });
        } catch (emailError) {
            console.error("Failed to send verification email:", emailError);
            // Don't fail signup if email fails to send
        }

        return NextResponse.json(
            {
                success: true,
                message: "Account created. Please check your email to verify.",
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role
                }
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
