
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { autoUpdateProjectWithResearch } from "@/lib/ai-service";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const {
            category,
            title,
            courseName,
            department,
            supervisor,
            researchType,
            abstract,
            keywords,
            status,
            files,
            projectId
        } = data;

        if (!category) {
            return NextResponse.json({ error: "Missing category" }, { status: 400 });
        }

        // @ts-ignore - session id check
        const userId = parseInt(session.user.id);

        // @ts-ignore - dynamic prisma call
        const submission = await (prisma as any).researchSubmission.create({
            data: {
                userId,
                projectId: projectId ? parseInt(projectId) : null,
                category,
                title: title || "",
                courseName: courseName || "",
                department: department || "",
                supervisor: supervisor || "",
                researchType: researchType || "",
                abstract: abstract || "",
                keywords: keywords || "",
                status: status || "draft",
                files: {
                    create: files?.map((f: any) => ({
                        fileName: f.fileName,
                        fileType: f.fileType,
                        fileUrl: f.fileUrl,
                        fileSize: f.fileSize
                    })) || []
                }
            },
            include: {
                files: true
            }
        });

        // Trigger AI analysis if submitted and linked to a project
        if (submission.status === "submitted" && submission.projectId) {
            await autoUpdateProjectWithResearch(submission.id).catch(console.error);
        }

        return NextResponse.json(submission, { status: 201 });

    } catch (error) {
        console.error("Error creating research submission:", error);
        return NextResponse.json({ error: "Failed to create submission" }, { status: 500 });
    }
}
