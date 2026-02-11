
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ chapterId: string }> }) {
    try {
        const { chapterId } = await params;
        const comments = await prisma.comment.findMany({
            where: { chapterId: parseInt(chapterId) },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(comments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ chapterId: string }> }) {
    try {
        const { chapterId } = await params;
        const { content, userId, anchorText, positionIndex } = await req.json();

        if (!content || !userId) {
            return NextResponse.json({ error: "Content and User ID required" }, { status: 400 });
        }

        const newComment = await prisma.comment.create({
            data: {
                chapterId: parseInt(chapterId),
                userId: parseInt(userId),
                content,
                anchorText, // Text selected
                positionIndex, // Position in content
                resolved: false,
                createdAt: new Date()
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                }
            }
        });

        return NextResponse.json(newComment);
    } catch (error) {
        console.error("Error creating comment:", error);
        return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
    }
}
