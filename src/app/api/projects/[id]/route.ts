
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const projectId = parseInt(id);

    try {
        const project = await prisma.project.findUnique({
            where: { project_id: projectId },
            include: {
                chapters: {
                    orderBy: { chapterNumber: 'asc' }
                },
                questionnaires: true,
            },
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
