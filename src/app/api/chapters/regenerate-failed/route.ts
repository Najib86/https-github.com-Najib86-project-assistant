import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        if (!userId) {
            return NextResponse.json({ error: "User ID not found" }, { status: 400 });
        }

        const { projectId } = await req.json();

        // If projectId is provided, regenerate only that project's failed chapters
        // Otherwise, regenerate all failed chapters for the user
        const where: any = {
            status: "Pending Regeneration"
        };

        if (projectId) {
            where.projectId = projectId;
        } else {
            // Get all projects for this user
            const userProjects = await prisma.project.findMany({
                where: {
                    OR: [
                        { studentId: parseInt(userId) },
                        { members: { some: { studentId: parseInt(userId) } } }
                    ]
                },
                select: { project_id: true }
            });

            where.projectId = {
                in: userProjects.map(p => p.project_id)
            };
        }

        // Find failed chapters
        const failedChapters = await prisma.chapter.findMany({
            where,
            include: {
                project: {
                    select: {
                        project_id: true,
                        title: true
                    }
                }
            }
        });

        if (failedChapters.length === 0) {
            return NextResponse.json({
                success: true,
                message: "No failed chapters found",
                count: 0
            });
        }

        // Reset status to "Generating"
        const result = await prisma.chapter.updateMany({
            where,
            data: {
                status: "Generating",
                updatedAt: new Date()
            }
        });

        // Group by project for response
        const byProject: Record<number, { title: string; count: number }> = {};
        failedChapters.forEach(ch => {
            if (!byProject[ch.projectId]) {
                byProject[ch.projectId] = {
                    title: ch.project.title,
                    count: 0
                };
            }
            byProject[ch.projectId].count++;
        });

        return NextResponse.json({
            success: true,
            message: `Reset ${result.count} failed chapters to regenerate`,
            count: result.count,
            projects: byProject
        });

    } catch (error) {
        console.error("Regenerate failed chapters error:", error);
        return NextResponse.json(
            { error: "Failed to regenerate chapters" },
            { status: 500 }
        );
    }
}
