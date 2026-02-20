
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const { projectId, email, userId, supervisorCode } = await req.json();

        if (!projectId) {
            return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
        }

        let targetEmail = email;

        // If supervisor code is provided, fetch their email
        if (supervisorCode) {
            const supervisor = await prisma.user.findUnique({
                where: { inviteCode: supervisorCode },
                select: { email: true, role: true }
            });

            if (!supervisor || supervisor.role !== 'supervisor') {
                return NextResponse.json({ error: "Invalid supervisor code" }, { status: 400 });
            }
            targetEmail = supervisor.email;
        }

        // Verify project exists and user has permission
        const project = await prisma.project.findUnique({
            where: { project_id: parseInt(projectId) },
            select: { studentId: true, supervisorId: true, title: true, level: true, type: true }
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Only project owner can create invites
        if (userId && project.studentId !== parseInt(userId)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Check if project already has a supervisor
        if (project.supervisorId) {
            return NextResponse.json({ error: "Project already has a supervisor" }, { status: 400 });
        }

        // Validate supervisor and check for immediate connection
        if (targetEmail) {
            const supervisorUser = await prisma.user.findUnique({
                where: { email: targetEmail },
                select: { id: true, role: true, name: true }
            });

            if (supervisorUser) {
                if (supervisorUser.role !== "supervisor") {
                    return NextResponse.json({
                        error: "The user with this email is registered as a student. You can only invite supervisors."
                    }, { status: 400 });
                }

                // --- IMMEDIATE CONNECTION LOGIC ---
                // Automatically connect the supervisor to the project
                await prisma.project.update({
                    where: { project_id: parseInt(projectId) },
                    data: { supervisorId: supervisorUser.id }
                });

                // Log activity
                if (userId) {
                    await prisma.projectActivity.create({
                        data: {
                            projectId: parseInt(projectId),
                            userId: parseInt(userId),
                            action: "assigned_supervisor",
                            details: `Connected supervisor ${supervisorUser.name} (${targetEmail}) directly to the project.`
                        }
                    });
                }

                // Send notification email
                try {
                    const { sendSupervisorAssignedEmail } = await import("@/lib/email");
                    const projectUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/supervisor/project/${projectId}`;
                    await sendSupervisorAssignedEmail({
                        to: targetEmail,
                        supervisorName: supervisorUser.name,
                        projectTitle: project.title,
                        projectLevel: project.level || "Research",
                        projectType: project.type || "Thesis",
                        projectUrl
                    });
                } catch (e) {
                    console.error("Failed to send supervisor assignment email:", e);
                }

                return NextResponse.json({
                    success: true,
                    type: "connected",
                    message: "Supervisor connected successfully",
                    supervisor: {
                        id: supervisorUser.id,
                        name: supervisorUser.name,
                        email: targetEmail
                    }
                });
            }
        }

        // --- Standard Invitation Logic (New Supervisor or General Link) ---
        // Generate a secure random token
        const token = crypto.randomBytes(16).toString("hex");
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

        const invite = await prisma.supervisorInvite.create({
            data: {
                token,
                projectId: parseInt(projectId),
                email: targetEmail || null,
                expiresAt,
            },
        });

        // Log activity
        if (userId) {
            await prisma.projectActivity.create({
                data: {
                    projectId: parseInt(projectId),
                    userId: parseInt(userId),
                    action: "created_invite",
                    details: targetEmail ? `Invited ${targetEmail} as supervisor` : "Created supervisor invite link"
                }
            });
        }

        return NextResponse.json({
            token: invite.token,
            expiresAt: invite.expiresAt,
            url: `/invite/${token}`,
            type: "invite_sent"
        });

    } catch (error) {
        console.error("Error creating invite:", error);
        return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId");

        if (!projectId) {
            return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
        }

        const invites = await prisma.supervisorInvite.findMany({
            where: {
                projectId: parseInt(projectId),
                status: "pending",
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(invites);

    } catch (error) {
        console.error("Error fetching invites:", error);
        return NextResponse.json({ error: "Failed to fetch invites" }, { status: 500 });
    }
}
