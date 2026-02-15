
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const { projectId, email, userId } = await req.json();

        if (!projectId) {
            return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
        }

        // Verify project exists and user has permission
        const project = await prisma.project.findUnique({
            where: { project_id: parseInt(projectId) },
            select: { studentId: true, supervisorId: true }
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

        // Generate a secure random token
        const token = crypto.randomBytes(16).toString("hex");
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

        const invite = await prisma.supervisorInvite.create({
            data: {
                token,
                projectId: parseInt(projectId),
                email: email || null,
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
                    details: email ? `Invited ${email} as supervisor` : "Created supervisor invite link"
                }
            });
        }

        return NextResponse.json({
            token: invite.token,
            expiresAt: invite.expiresAt,
            url: `/invite/${token}`
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
