
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { projectId: string } }) {
    try {
        const { email } = await req.json();
        const { projectId } = await params;

        if (!email) {
            return NextResponse.json({ error: "Email required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (user.role !== 'student') {
            return NextResponse.json({ error: "Only students can be members" }, { status: 400 });
        }

        const existingMember = await prisma.projectMember.findFirst({
            where: {
                studentId: user.id,
                projectId: parseInt(projectId)
            }
        });

        if (existingMember) {
            return NextResponse.json({ error: "Already a member" }, { status: 400 });
        }

        const project = await prisma.project.findUnique({
            where: { project_id: parseInt(projectId) }
        });

        if (project && project.studentId === user.id) {
            return NextResponse.json({ error: "User is the project owner" }, { status: 400 });
        }

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

        return NextResponse.json(newMember);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
    }
}

export async function GET(req: Request, { params }: { params: { projectId: string } }) {
    try {
        const { projectId } = await params;
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
        return NextResponse.json(members);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
    }
}
