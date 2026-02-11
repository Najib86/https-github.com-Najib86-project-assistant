
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { projectId, code } = await req.json();

        if (!projectId || !code) {
            return NextResponse.json({ error: "Project ID and Code required" }, { status: 400 });
        }

        // Find the invite
        const invite = await prisma.supervisorInvite.findUnique({
            where: { code },
            include: { supervisor: true }
        });

        if (!invite) {
            return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
        }

        if (new Date() > invite.expiresAt) {
            return NextResponse.json({ error: "Invite code expired" }, { status: 400 });
        }

        // Link supervisor to project
        const updatedProject = await prisma.project.update({
            where: { project_id: parseInt(projectId) },
            data: {
                supervisorId: invite.supervisorId,
                status: "In Progress" // Update status to In Progress
            },
            include: { supervisor: true }
        });

        return NextResponse.json({ success: true, project: updatedProject });

    } catch (error) {
        console.error("Error accepting invite:", error);
        return NextResponse.json({ error: "Failed to accept invite" }, { status: 500 });
    }
}
