
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const projects = await prisma.project.findMany({
            include: {
                student: {
                    select: { name: true, email: true }
                },
                chapters: {
                    select: { status: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Add computed progress
        const projectsWithProgress = projects.map(project => {
            const totalChapters = 5;
            const completedChapters = project.chapters.filter(c => c.status === 'Completed' || c.status === 'Approved').length;
            const progress = Math.round((completedChapters / totalChapters) * 100);
            return { ...project, progress };
        });

        return NextResponse.json(projectsWithProgress);
    } catch (error) {
        console.error("Error fetching projects:", error);
        return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
    }
}
