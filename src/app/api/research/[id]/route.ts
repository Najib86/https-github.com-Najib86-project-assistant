
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const submission = await prisma.researchSubmission.findUnique({
            where: { id: parseInt(id) },
            include: { files: true }
        });

        if (!submission) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // @ts-expect-error
        if (submission.userId !== parseInt(session.user.id)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(submission);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch submission" }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const data = await req.json();

        const existing = await prisma.researchSubmission.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existing) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // @ts-expect-error
        if (existing.userId !== parseInt(session.user.id)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updated = await prisma.researchSubmission.update({
            where: { id: parseInt(id) },
            data: {
                title: data.title,
                courseName: data.courseName,
                department: data.department,
                supervisor: data.supervisor,
                researchType: data.researchType,
                abstract: data.abstract,
                keywords: data.keywords,
                status: data.status,
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const existing = await prisma.researchSubmission.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existing) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // @ts-expect-error
        if (existing.userId !== parseInt(session.user.id)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.researchSubmission.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
