
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signupSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate input
        const validation = signupSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                error: "Invalid input",
                details: validation.error.format()
            }, { status: 400 });
        }

        const { name, email, password, role } = validation.data;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 409 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || "student",
                provider: "credentials",
                email_verified: false // Require email verification
            },
        });

        // TODO: Send verification email here
        // For now, we'll auto-verify in development
        if (process.env.NODE_ENV === "development") {
            await prisma.user.update({
                where: { id: newUser.id },
                data: { email_verified: true }
            });
        }

        return NextResponse.json({
            success: true,
            message: "Account created successfully",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        }, { status: 201 });
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
