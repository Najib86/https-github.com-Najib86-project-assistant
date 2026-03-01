
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        const { projectId } = await params;
        const project = await prisma.project.findUnique({
            where: { project_id: parseInt(projectId) },
            include: {
                chapters: true,
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                supervisor: {
                    select: {
                        id: true,
                        name: true,
                        email: true
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

export async function DELETE(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        const { projectId } = await params;
        const projectIdInt = parseInt(projectId);

        if (isNaN(projectIdInt)) {
            return NextResponse.json({ error: "Invalid Project ID" }, { status: 400 });
        }

        // Delete project (cascade will handle related records if configured in DB, otherwise Prisma schema relations will handle it)
        await prisma.project.delete({
            where: { project_id: projectIdInt }
        });

        return NextResponse.json({ message: "Project deleted successfully" });
    } catch (error) {
        console.error("Error deleting project:", error);
        return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
    }
}
