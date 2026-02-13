
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const supervisorId = searchParams.get('supervisorId');

    if (!studentId && !supervisorId) {
        return NextResponse.json({ error: "Student ID or Supervisor ID required" }, { status: 400 });
    }

    try {
        const where: { studentId?: number; supervisorId?: number } = {};
        if (studentId) where.studentId = parseInt(studentId);
        if (supervisorId) where.supervisorId = parseInt(supervisorId);

        const projects = await prisma.project.findMany({
            where,
            include: {
                chapters: true,
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        return NextResponse.json(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
    }
}
