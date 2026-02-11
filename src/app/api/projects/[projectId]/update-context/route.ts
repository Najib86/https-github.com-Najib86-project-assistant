
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;
    const project_id = parseInt(projectId);

    try {
        const { problemStatement, objectives, methodology, referenceText } = await req.json();

        // Update Project Context
        const updatedProject = await prisma.project.update({
            where: { project_id },
            data: {
                problemStatement,
                objectives,
                methodology,
                referenceText,
                updatedAt: new Date()
            }
        });

        return NextResponse.json(updatedProject);

    } catch (error) {
        console.error("Error updating project context:", error);
        return NextResponse.json({ error: "Failed to update project context" }, { status: 500 });
    }
}
