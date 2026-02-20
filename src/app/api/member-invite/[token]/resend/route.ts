import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendMemberInviteEmail } from "@/lib/email";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;
        const sessionUser = await getCurrentUser() as { id: string; name?: string; email?: string } | null;

        if (!sessionUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const invite = await prisma.memberInvite.findUnique({
            where: { token },
            include: {
                project: {
                    select: {
                        project_id: true,
                        title: true,
                        level: true,
                        type: true,
                        studentId: true
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
            return NextResponse.json({ error: "Invite not found" }, { status: 404 });
        }

        // Only project owner or inviter can resend
        const userId = parseInt(sessionUser.id);
        if (invite.project.studentId !== userId && invite.invitedBy !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Validate invite status
        if (invite.status !== "pending") {
            return NextResponse.json({ error: "Can only resend pending invites" }, { status: 400 });
        }

        // Check if user has registered in the meantime
        const existingUser = await prisma.user.findUnique({
            where: { email: invite.email },
            select: { id: true, name: true, role: true, email: true }
        });

        if (existingUser) {
            if (existingUser.role !== 'student') {
                return NextResponse.json({ error: "The invited user is not a student" }, { status: 400 });
            }

            // Check if already a member
            const existingMember = await prisma.projectMember.findFirst({
                where: {
                    studentId: existingUser.id,
                    projectId: invite.projectId
                }
            });

            if (existingMember) {
                // Mark invite as accepted since they are already a member
                await prisma.memberInvite.update({
                    where: { invite_id: invite.invite_id },
                    data: { status: "accepted" }
                });
                return NextResponse.json({ message: "User is already a project member" });
            }

            // Add as member immediately
            await prisma.projectMember.create({
                data: {
                    projectId: invite.projectId,
                    studentId: existingUser.id,
                    role: "member"
                }
            });

            // Mark invite as accepted
            await prisma.memberInvite.update({
                where: { invite_id: invite.invite_id },
                data: { status: "accepted" }
            });

            // Log activity
            await prisma.projectActivity.create({
                data: {
                    projectId: invite.projectId,
                    userId: userId,
                    action: "added_member",
                    details: `Added ${existingUser.name} to the team (Invitation accepted)`
                }
            });

            const inviter = await prisma.user.findUnique({
                where: { id: userId },
                select: { name: true }
            });

            // Send notification email
            const projectUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/student/project/${invite.projectId}`;
            try {
                const { sendMemberAddedEmail } = await import("@/lib/email");
                await sendMemberAddedEmail({
                    to: existingUser.email!,
                    inviterName: inviter?.name || 'A team member',
                    projectTitle: invite.project.title,
                    projectLevel: invite.project.level,
                    projectType: invite.project.type,
                    projectUrl
                });
            } catch (emailError) {
                console.error('Failed to send added member email:', emailError);
            }

            return NextResponse.json({
                success: true,
                type: "member_added",
                message: `User detected. ${existingUser.name} has been added to the project.`
            });
        }

        // --- Standard Resend Logic for non-existing users ---
        // Refresh expiration date: add 7 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Update verify date
        await prisma.memberInvite.update({
            where: { invite_id: invite.invite_id },
            data: {
                expiresAt,
                createdAt: new Date() // Reset sent date to now
            }
        });

        const inviteUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/member-invite/${token}`;

        try {
            await sendMemberInviteEmail({
                to: invite.email,
                inviterName: invite.inviter.name || "A team member",
                projectTitle: invite.project.title,
                projectLevel: invite.project.level,
                projectType: invite.project.type,
                inviteUrl,
                expiresAt
            });
            console.log(`Resent invitation email to ${invite.email}`);
        } catch (emailError) {
            console.error('Failed to resend invitation email:', emailError);
            return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            expiresAt: expiresAt.toISOString()
        });

    } catch (error) {
        console.error("Error resending invite:", error);
        return NextResponse.json({ error: "Failed to resend invite" }, { status: 500 });
    }
}
