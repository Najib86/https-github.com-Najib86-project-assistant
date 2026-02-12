import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
    _: Request,
    { params }: { params: Promise<{ projectId: string; memberId: string }> }
) {
    try {
        const { projectId, memberId } = await params;

        // Verify if the member exists and belongs to the project
        const member = await prisma.projectMember.findFirst({
            where: {
                member_id: parseInt(memberId),
                projectId: parseInt(projectId)
            }
        });

        if (!member) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        // Optional: Check if the requester is the project owner (requires authentication context, simplified here)
        // In a real app, you'd decode the session/token

        await prisma.projectMember.delete({
            where: {
                member_id: parseInt(memberId)
            }
        });

        return NextResponse.json({ message: "Member removed" });
    } catch (error) {
        console.error("Failed to remove member", error);
        return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
    }
}
