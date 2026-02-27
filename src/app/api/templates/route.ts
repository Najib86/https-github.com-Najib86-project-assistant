
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const templates = await prisma.template.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(templates);
    } catch (error) {
        console.error("Templates fetch error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, description, type, content, isDefault } = body;

        // If setting as default, unset others of same type
        if (isDefault) {
            await prisma.template.updateMany({
                where: { type },
                data: { isDefault: false },
            });
        }

        const template = await prisma.template.create({
            data: {
                name,
                description,
                type,
                content: content || {},
                isDefault: isDefault || false,
            },
        });

        return NextResponse.json(template);
    } catch (error) {
        console.error("Template create error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
