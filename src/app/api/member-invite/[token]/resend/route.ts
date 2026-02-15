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
