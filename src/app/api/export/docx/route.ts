
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
// @ts-expect-error - html-to-docx has partial types
import HTMLtoDOCX from "html-to-docx";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
        return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    try {
        const project = await prisma.project.findUnique({
            where: { project_id: parseInt(projectId) },
            include: {
                chapters: {
                    orderBy: { chapterNumber: 'asc' }
                },
                student: true
            }
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Construct HTML content
        let htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>${project.title}</title>
                <style>
                    body { font-family: 'Times New Roman', serif; }
                    h1 { text-align: center; text-transform: uppercase; page-break-before: always; }
                    .title-page { text-align: center; margin-top: 100px; page-break-after: always; }
                    .center { text-align: center; }
                    p { font-size: 12pt; line-height: 1.5; }
                </style>
            </head>
            <body>
                <div class="title-page">
                    <h1>${project.title}</h1>
                    <p class="center"><br/><br/>A Final Year Project Report</p>
                    <p class="center"><br/>Submitted by:<br/><strong>${project.student.name}</strong></p>
                    <p class="center"><br/>Department of ${project.student.department || "Computer Science"}</p>
                    <p class="center"><br/><br/>${new Date().toLocaleDateString()}</p>
                </div>
        `;

        project.chapters.forEach(chapter => {
            htmlContent += `
                <h1>Chapter ${chapter.chapterNumber}: ${chapter.title}</h1>
                ${chapter.content || "<p>No content.</p>"}
            `;
        });

        htmlContent += `</body></html>`;

        const fileBuffer = await HTMLtoDOCX(htmlContent, null, {
            table: { row: { cantSplit: true } },
            footer: true,
            pageNumber: true,
        });

        return new NextResponse(new Uint8Array(fileBuffer), {
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "Content-Disposition": `attachment; filename="${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx"`,
            }
        });

    } catch (error) {
        console.error("Export error:", error);
        return NextResponse.json({ error: "Failed to generate document" }, { status: 500 });
    }
}
