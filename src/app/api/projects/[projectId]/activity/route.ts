
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const { projectId } = await params;
        const activities = await prisma.projectActivity.findMany({
            where: { projectId: parseInt(projectId) },
            include: {
                user: {
                    select: { name: true, role: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        return NextResponse.json(activities);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
    }
}
