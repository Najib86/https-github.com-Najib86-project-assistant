
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } from "docx";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

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

        // Create Document
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    // Title Page
                    new Paragraph({
                        text: project.title.toUpperCase(),
                        heading: HeadingLevel.TITLE,
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 }
                    }),
                    new Paragraph({
                        text: "A Final Year Project Report",
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 }
                    }),
                    new Paragraph({
                        text: `Submitted by: ${project.student.name}`,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 100 }
                    }),
                    new Paragraph({
                        text: `Department of ${project.student.department || "N/A"}`,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 800 }
                    }),
                    new Paragraph({
                        text: `Date: ${new Date().toLocaleDateString()}`,
                        alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({
                        children: [new PageBreak()]
                    }),

                    // Table of Contents (Placeholder - Word updates it usually)
                    new Paragraph({
                        text: "Table of Contents",
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 200 }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "(Right-click and update field to generate TOC)",
                                italics: true,
                            }),
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 }
                    }),
                    new Paragraph({
                        children: [new PageBreak()]
                    }),

                    // Chapters
                    ...project.chapters.map(chapter => [
                        new Paragraph({
                            text: `Chapter ${chapter.chapterNumber}: ${chapter.title}`,
                            heading: HeadingLevel.HEADING_1,
                            pageBreakBefore: true,
                            spacing: { after: 200 }
                        }),
                        // Simple content splitting by newline for basic paragraphs
                        ...(chapter.content || "").split('\n').map(line =>
                            new Paragraph({
                                children: [new TextRun(line)],
                                spacing: { after: 120 }
                            })
                        )
                    ]).flat()
                ]
            }]
        });

        const buffer = await Packer.toBuffer(doc);

        return new NextResponse(new Uint8Array(buffer), {
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
