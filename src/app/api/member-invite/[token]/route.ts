import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;

        const invite = await prisma.memberInvite.findUnique({
            where: { token },
            include: {
                project: {
                    select: {
                        project_id: true,
                        title: true,
                        level: true,
                        type: true,
                        student: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                inviter: {
                    select: {
                        name: true
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
        const sessionUser = await getCurrentUser();

        if (!sessionUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Cast user to include custom properties
        const user = sessionUser as { id: string; role: string; name?: string | null; email?: string | null };

        const invite = await prisma.memberInvite.findUnique({
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

        // Verify email match (case insensitive) - RELAXED for user request "share or allow same project"
        // We log a warning but allow the user to proceed if they have the valid token
        if (user.email?.toLowerCase() !== invite.email.toLowerCase()) {
            console.warn(`Invite for ${invite.email} accepted by ${user.email}`);
        }

        if (user.role !== "student") {
            return NextResponse.json({
                error: "Only students can join as team members"
            }, { status: 403 });
        }

        // Check if already a member
        const existingMember = await prisma.projectMember.findFirst({
            where: {
                studentId: parseInt(user.id),
                projectId: invite.projectId
            }
        });

        if (existingMember) {
            // Mark invite as accepted anyway as cleanup
            await prisma.memberInvite.update({
                where: { invite_id: invite.invite_id },
                data: {
                    status: "accepted",
                    acceptedAt: new Date()
                }
            });

            return NextResponse.json({
                success: true,
                projectId: invite.projectId,
                message: "You are already a member of this project"
            });
        }

        // Check if user is the project owner
        if (invite.project.studentId === parseInt(user.id)) {
            return NextResponse.json({
                error: "You are the owner of this project"
            }, { status: 400 });
        }

        // Transaction to update invite and add member
        await prisma.$transaction([
            prisma.memberInvite.update({
                where: { invite_id: invite.invite_id },
                data: {
                    status: "accepted",
                    acceptedAt: new Date()
                }
            }),
            prisma.projectMember.create({
                data: {
                    projectId: invite.projectId,
                    studentId: parseInt(user.id),
                    role: "member"
                }
            }),
            prisma.projectActivity.create({
                data: {
                    projectId: invite.projectId,
                    userId: parseInt(user.id),
                    action: "accepted_member_invite",
                    details: `${user.name} joined the team via invitation`
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
        const sessionUser = await getCurrentUser();

        if (!sessionUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = sessionUser as { id: string; role: string; name?: string | null; email?: string | null };

        const invite = await prisma.memberInvite.findUnique({
            where: { token },
            include: { project: true }
        });

        if (!invite) {
            return NextResponse.json({ error: "Invite not found" }, { status: 404 });
        }

        // Only project owner or inviter can delete
        const userId = parseInt(user.id);
        if (invite.project.studentId !== userId && invite.invitedBy !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await prisma.memberInvite.delete({
            where: { invite_id: invite.invite_id }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error deleting invite:", error);
        return NextResponse.json({ error: "Failed to delete invite" }, { status: 500 });
    }
}
