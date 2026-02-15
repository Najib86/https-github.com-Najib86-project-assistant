
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;

        const invite = await prisma.supervisorInvite.findUnique({
            where: { token },
            include: {
                project: {
                    include: {
                        student: {
                            select: { 
                                id: true,
                                name: true, 
                                email: true 
                            }
                        }
                    }
                }
            }
        });

        if (!invite) {
            return NextResponse.json({ error: "Invalid invite token" }, { status: 404 });
        }

        if (new Date() > invite.expiresAt) {
            return NextResponse.json({ error: "Invite expired" }, { status: 410 });
        }

        if (invite.status !== "pending") {
            return NextResponse.json({ error: "Invite already used" }, { status: 409 });
        }

        return NextResponse.json(invite);

    } catch (error) {
        console.error("Error fetching invite:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 401 });
        }

        const invite = await prisma.supervisorInvite.findUnique({
            where: { token },
            include: { project: true }
        });

        if (!invite) {
            return NextResponse.json({ error: "Invalid invite token" }, { status: 404 });
        }

        if (new Date() > invite.expiresAt) {
            return NextResponse.json({ error: "Invite expired" }, { status: 410 });
        }

        if (invite.status !== "pending") {
            return NextResponse.json({ error: "Invite already used" }, { status: 409 });
        }

        // Verify user exists and has supervisor role
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: { id: true, role: true, name: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (user.role !== "supervisor") {
            return NextResponse.json({ error: "Only supervisors can accept this invite" }, { status: 403 });
        }

        // Check if project already has a supervisor
        if (invite.project.supervisorId) {
            return NextResponse.json({ error: "Project already has a supervisor" }, { status: 400 });
        }

        // Transaction to update invite and project
        await prisma.$transaction([
            prisma.supervisorInvite.update({
                where: { invite_id: invite.invite_id },
                data: {
                    status: "accepted",
                    acceptedById: parseInt(userId),
                    acceptedAt: new Date(),
                },
            }),
            prisma.project.update({
                where: { project_id: invite.projectId },
                data: {
                    supervisorId: parseInt(userId),
                    status: "In Progress"
                },
            }),
            prisma.projectActivity.create({
                data: {
                    projectId: invite.projectId,
                    userId: parseInt(userId),
                    action: "accepted_supervision",
                    details: `${user.name} joined as supervisor`
                }
            })
        ]);

        return NextResponse.json({ 
            success: true,
            projectId: invite.projectId 
        });

    } catch (error) {
        console.error("Error accepting invite:", error);
        return NextResponse.json({ error: "Failed to accept invite" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 401 });
        }

        const invite = await prisma.supervisorInvite.findUnique({
            where: { token },
            include: { project: true }
        });

        if (!invite) {
            return NextResponse.json({ error: "Invite not found" }, { status: 404 });
        }

        // Only project owner can delete invites
        if (invite.project.studentId !== parseInt(userId)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await prisma.supervisorInvite.delete({
            where: { invite_id: invite.invite_id }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error deleting invite:", error);
        return NextResponse.json({ error: "Failed to delete invite" }, { status: 500 });
    }
}
