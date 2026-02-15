import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendMemberInviteEmail } from "@/lib/email";

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        const { email, invitedBy } = await req.json();
        const { projectId } = await params;

        if (!email) {
            return NextResponse.json({ error: "Email required" }, { status: 400 });
        }

        if (!invitedBy) {
            return NextResponse.json({ error: "Inviter ID required" }, { status: 400 });
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // If user exists, add them directly
        if (user) {
            // Validate user is a student
            if (user.role !== 'student') {
                return NextResponse.json({ error: "Only students can be members" }, { status: 400 });
            }

            // Check if already a member
            const existingMember = await prisma.projectMember.findFirst({
                where: {
                    studentId: user.id,
                    projectId: parseInt(projectId)
                }
            });

            if (existingMember) {
                return NextResponse.json({ error: "Already a member" }, { status: 400 });
            }

            // Check if user is the project owner
            const project = await prisma.project.findUnique({
                where: { project_id: parseInt(projectId) }
            });

            if (project && project.studentId === user.id) {
                return NextResponse.json({ error: "User is the project owner" }, { status: 400 });
            }

            // Add as member immediately
            const newMember = await prisma.projectMember.create({
                data: {
                    projectId: parseInt(projectId),
                    studentId: user.id,
                    role: "member"
                },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            // Log activity
            await prisma.projectActivity.create({
                data: {
                    projectId: parseInt(projectId),
                    userId: parseInt(invitedBy),
                    action: "added_member",
                    details: `Added ${user.name} to the team`
                }
            });

            return NextResponse.json({
                type: "member_added",
                member: newMember
            });
        }

        // User doesn't exist - create invitation
        // Check if invitation already exists for this email
        // Check if invitation already exists for this email
        const existingInvite = await prisma.memberInvite.findFirst({
            where: {
                email,
                projectId: parseInt(projectId),
                status: "pending"
            }
        });

        if (existingInvite) {
            return NextResponse.json({
                error: "Invitation already sent to this email"
            }, { status: 400 });
        }

        // Generate secure token
        const token = crypto.randomBytes(16).toString("hex");
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        // Create invitation
        // Create invitation
        const invite = await prisma.memberInvite.create({
            data: {
                token,
                projectId: parseInt(projectId),
                email,
                invitedBy: parseInt(invitedBy),
                expiresAt
            },
            include: {
                project: {
                    select: {
                        title: true,
                        level: true,
                        type: true,
                        student: {
                            select: {
                                name: true
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

        // Log activity
        await prisma.projectActivity.create({
            data: {
                projectId: parseInt(projectId),
                userId: parseInt(invitedBy),
                action: "sent_member_invite",
                details: `Sent invitation to ${email}`
            }
        });

        // Send email invitation
        const inviteUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/member-invite/${token}`;

        try {
            await sendMemberInviteEmail({
                to: email,
                inviterName: invite.inviter.name,
                projectTitle: invite.project.title,
                projectLevel: invite.project.level,
                projectType: invite.project.type,
                inviteUrl,
                expiresAt: invite.expiresAt
            });
            console.log(`Invitation email sent to ${email}`);
        } catch (emailError) {
            console.error('Failed to send invitation email:', emailError);
            // Don't fail the request if email fails - invitation still created
        }

        return NextResponse.json({
            type: "invite_sent",
            invite: {
                email: invite.email,
                token: invite.token,
                url: `/member-invite/${token}`,
                expiresAt: invite.expiresAt
            }
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
    }
}

export async function GET(_: Request, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        const { projectId } = await params;

        // Get existing members
        const members = await prisma.projectMember.findMany({
            where: { projectId: parseInt(projectId) },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        // Get pending invites
        // Get pending invites
        const pendingInvites = await prisma.memberInvite.findMany({
            where: {
                projectId: parseInt(projectId),
                status: "pending",
                expiresAt: { gt: new Date() }
            },
            select: {
                invite_id: true,
                email: true,
                createdAt: true,
                expiresAt: true,
                token: true
            }
        });

        return NextResponse.json({
            members,
            pendingInvites
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
    }
}
