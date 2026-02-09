
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(

    req: Request,

    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const { projectId: projectIdStr } = await params;
        const projectId = parseInt(projectIdStr);

        const project = await prisma.project.findUnique({
            where: { project_id: projectId },
            include: {
                student: {
                    select: { name: true, email: true }
                },
                chapters: {
                    orderBy: { chapterNumber: 'asc' }
                },
                comments: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: { select: { name: true, role: true } }
                    }
                }
            }
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        return NextResponse.json(project);
    } catch (error) {
        console.error("Error fetching project:", error);
        return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
    }
}
