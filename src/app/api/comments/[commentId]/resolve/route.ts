
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { commentId: string } }) {
    try {
        const { commentId } = await params;
        const resolved = await prisma.comment.update({
            where: { comment_id: parseInt(commentId) },
            data: { isResolved: true }
        });
        return NextResponse.json(resolved);
    } catch (error) {
        console.error("Resolve failed", error);
        return NextResponse.json({ error: "Failed to resolve comment" }, { status: 500 });
    }
}
