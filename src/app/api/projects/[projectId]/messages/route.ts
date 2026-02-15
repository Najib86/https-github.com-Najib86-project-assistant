
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const { projectId } = await params;
        const messages = await prisma.message.findMany({
            where: { projectId: parseInt(projectId) },
            include: {
                sender: {
                    select: { id: true, name: true, role: true }
                }
            },
            orderBy: { createdAt: 'asc' }
        });
        return NextResponse.json(messages);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const { projectId } = await params;
        const { content, senderId } = await req.json();

        if (!content || !senderId) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const message = await prisma.message.create({
            data: {
                content,
                projectId: parseInt(projectId),
                senderId: parseInt(senderId)
            },
            include: {
                sender: {
                    select: { id: true, name: true, role: true }
                }
            }
        });

        return NextResponse.json(message);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }
}
