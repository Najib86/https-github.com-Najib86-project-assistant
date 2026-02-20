
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // @ts-ignore - session id is available
        const userId = parseInt(session.user.id);

        const submissions = await (prisma as any).researchSubmission.findMany({
            where: { userId },
            include: {
                files: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        // Manually stitch project titles
        const submissionsWithProject = await Promise.all((submissions as any[]).map(async (sub) => {
            if (sub.projectId) {
                const project = await prisma.project.findUnique({
                    where: { project_id: sub.projectId },
                    select: { title: true }
                });
                return { ...sub, project };
            }
            return { ...sub, project: null };
        }));

        return NextResponse.json(submissionsWithProject);

    } catch (error) {
        console.error("Error fetching research submissions:", error);
        return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
    }
}
