
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";
import prisma from "@/lib/prisma";
import { generateToken, hashToken } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { checkRateLimit, getRateLimitKey } from "@/lib/auth/rateLimit";

export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const email = session.user.email;

        // Rate limiting
        const rateLimitKey = getRateLimitKey("resend-verification", email);
        const rateLimit = checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000); // 3 attempts per hour

        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: "Too many attempts. Please try again later." },
                { status: 429, headers: { "Retry-After": rateLimit.retryAfter.toString() } }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (user.email_verified) {
            return NextResponse.json({ message: "Email already verified" }, { status: 200 });
        }

        // Generate new token
        const rawToken = generateToken();
        const hashedToken = hashToken(rawToken);
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Delete old tokens for this user to keep it clean
        await prisma.verificationToken.deleteMany({
            where: { userId: user.id }
        });

        await prisma.verificationToken.create({
            data: {
                userId: user.id,
                token: hashedToken,
                expiresAt
            }
        });

        // Send email
        const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${rawToken}`;

        try {
            await sendVerificationEmail({
                to: email,
                name: user.name,
                verificationUrl
            });
        } catch (emailError: unknown) {
            console.error("Failed to send verification email:", emailError);
            const errorMessage = emailError instanceof Error ? emailError.message : "Unknown email error";
            return NextResponse.json({
                error: "Failed to send email. Please try again later.",
                details: errorMessage
            }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Verification email sent" });

    } catch (error) {
        console.error("Resend verification error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
