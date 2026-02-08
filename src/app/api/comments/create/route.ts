
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { projectId, userId, content } = await req.json();

        if (!projectId || !userId || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newComment = await prisma.comment.create({
            data: {
                projectId: parseInt(projectId),
                userId: parseInt(userId),
                content,
                createdAt: new Date(),
                isResolved: false
            },
            include: {
                user: {
                    select: { name: true, role: true }
                }
            }
        });

        return NextResponse.json(newComment);
    } catch (error) {
        console.error("Error creating comment:", error);
        return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
    }
}
