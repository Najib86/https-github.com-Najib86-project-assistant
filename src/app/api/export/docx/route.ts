
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    AlignmentType,
    PageBreak,
    SectionType,
    HeadingLevel,
    NumberFormat,
    TableOfContents
} from "docx";

// Helper: Extract valid text from HTML and convert to docx Paragraphs
// For a truly high-fidelity conversion, we'd use a more complex parser.
// But we'll try to produce clean docx objects for the structure.
const htmlToDocxElements = (html: string) => {
    if (!html) return [new Paragraph({ text: "" })];

    // Very basic HTML to Paragraphs conversion
    // In a real app, you'd use a dedicated library that returns Paragraphs
    // Since docx 9.x doesn't handle HTML strings natively, we'll do a simple split and tag handling
    // For the CONTENT sections, we will use a custom simple parser to create Paragraphs.
    // This ensures "preservation of formatting" like fonts and spacing controlled by 'docx'.

    const cleanHtml = html
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n\n")
        .replace(/<\/h[1-6]>/gi, "\n\n")
        .replace(/<[^>]*>/g, ""); // Strip other tags for raw text

    return cleanHtml.split("\n").filter(line => line.trim()).map(line =>
        new Paragraph({
            children: [new TextRun({ text: line.trim(), size: 24, font: "Times New Roman" })],
            spacing: { line: 480, before: 120, after: 120 }, // Double spacing (240 * 2 = 480)
            alignment: AlignmentType.JUSTIFIED,
        })
    );
};

// Helper to convert numbers to words for Chapter headings
const numberToWords = (num: number): string => {
    const words = ["ZERO", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN"];
    return words[num] || num.toString();
};

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
                student: true,
                citations: true
            }
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const meta = (project.academicMetadata as Record<string, any>) || {};
        const studentInfo = meta.student || {};
        const institutionInfo = meta.institution || {};
        const supervisorInfo = meta.supervisor || {};

        const studentName = (studentInfo.fullName || project.student?.name || "Student Name").toUpperCase();
        const matricNo = studentInfo.studentIdNo || "STUDENT ID";
        const department = (institutionInfo.department || project.student?.department || "Department Name").toUpperCase();
        const institutionName = (institutionInfo.name || "National Open University of Nigeria").toUpperCase();
        const faculty = (institutionInfo.faculty || "Faculty of Social Sciences").toUpperCase();
        const programme = (institutionInfo.programme || "Bachelor of Science").toUpperCase();
        const gradDate = `${institutionInfo.graduationMonth || "March"} ${institutionInfo.graduationYear || new Date().getFullYear()}`;
        const supervisorName = supervisorInfo.name ? `${supervisorInfo.title || ""} ${supervisorInfo.name}`.trim() : "Supervisor Name";

        const chaptersMap = new Map();
        project.chapters.forEach(c => chaptersMap.set(c.chapterNumber, c));

        // Define Prelim Sections
        const prelimSections = [];

        // 1. Cover Page
        prelimSections.push(
            new Paragraph({
                children: [new TextRun({ text: project.title.toUpperCase(), bold: true, size: 32, font: "Times New Roman" })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 2000, after: 1000 },
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "BY", size: 24, font: "Times New Roman" }),
                    new TextRun({ break: 2 }),
                    new TextRun({ text: studentName, bold: true, size: 28, font: "Times New Roman" }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 1000, after: 3000 },
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: institutionName, bold: true, size: 24, font: "Times New Roman" }),
                    new TextRun({ break: 1 }),
                    new TextRun({ text: gradDate, size: 24, font: "Times New Roman" }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 2000 },
            })
        );

        // 2. Inside Cover
        prelimSections.push(
            new Paragraph({ children: [new PageBreak()] }),
            new Paragraph({
                children: [new TextRun({ text: project.title.toUpperCase(), bold: true, size: 28, font: "Times New Roman" })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 1000, after: 1000 },
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "BY", size: 24, font: "Times New Roman" }),
                    new TextRun({ break: 1 }),
                    new TextRun({ text: studentName, bold: true, size: 24, font: "Times New Roman" }),
                    new TextRun({ break: 1 }),
                    new TextRun({ text: matricNo, size: 24, font: "Times New Roman" }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 1000, after: 1500 },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: `A project submitted to the Department of ${department} of the National Open University of Nigeria in partial fulfillment of the requirements for the award of the degree of ${programme}`,
                        size: 24,
                        font: "Times New Roman"
                    }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 1000, line: 480 },
            }),
            new Paragraph({
                children: [new TextRun({ text: gradDate, size: 24, font: "Times New Roman" })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 2000 },
            })
        );

        // 3. Declaration
        prelimSections.push(
            new Paragraph({ children: [new PageBreak()] }),
            new Paragraph({
                children: [new TextRun({ text: "DECLARATION", bold: true, size: 28, font: "Times New Roman" })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 500 },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: `I, ${studentName} declare that this work is as a result of my research effort and that to the best of my knowledge, it has not been presented by any other person for the award of any degree except where due acknowledgements have been made.`,
                        size: 24,
                        font: "Times New Roman"
                    }),
                ],
                alignment: AlignmentType.JUSTIFIED,
                spacing: { line: 480, before: 500, after: 1000 },
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "__________________________", size: 24 }),
                    new TextRun({ break: 1, text: "Signature", size: 20 }),
                    new TextRun({ break: 1, text: studentName, bold: true, size: 24 }),
                    new TextRun({ break: 1, text: "Name", size: 20 }),
                    new TextRun({ break: 1, text: "Date: ____________________", size: 24 }),
                ],
                spacing: { before: 1000 },
            })
        );

        // 4. Certification
        prelimSections.push(
            new Paragraph({ children: [new PageBreak()] }),
            new Paragraph({
                children: [new TextRun({ text: "CERTIFICATION", bold: true, size: 28, font: "Times New Roman" })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 500 },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: `This is to certify that this research project titled '${project.title}' was written by ${studentName} with the matriculation number ${matricNo} under my supervision.`,
                        size: 24,
                        font: "Times New Roman"
                    }),
                ],
                alignment: AlignmentType.JUSTIFIED,
                spacing: { line: 480, before: 500, after: 1000 },
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "__________________________", size: 24 }),
                    new TextRun({ break: 1, text: supervisorName, bold: true, size: 24 }),
                    new TextRun({ break: 1, text: "Supervisor Name, signature and date", size: 20 }),
                ],
                spacing: { before: 1000 },
            })
        );

        // 5. Dedication, Acknowledgement, Abstract
        const addSection = (title: string, content: string) => {
            prelimSections.push(
                new Paragraph({ children: [new PageBreak()] }),
                new Paragraph({
                    children: [new TextRun({ text: title, bold: true, size: 28, font: "Times New Roman" })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 500 },
                }),
                ...htmlToDocxElements(content)
            );
        };

        const dedication = project.chapters.find(c => c.title?.toLowerCase().includes("dedication"));
        if (dedication) addSection("DEDICATION", dedication.content || "");

        const ack = project.chapters.find(c => c.title?.toLowerCase().includes("acknowledgement"));
        if (ack) addSection("ACKNOWLEDGEMENT", ack.content || "");

        const abstract = project.chapters.find(c => c.title?.toLowerCase().includes("abstract"));
        if (abstract) {
            prelimSections.push(
                new Paragraph({ children: [new PageBreak()] }),
                new Paragraph({
                    children: [new TextRun({ text: "ABSTRACT", bold: true, size: 28, font: "Times New Roman" })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 500 },
                }),
                ...htmlToDocxElements(abstract.content || "")
            );
        }

        // 6. Table of Contents
        prelimSections.push(
            new Paragraph({ children: [new PageBreak()] }),
            new Paragraph({
                children: [new TextRun({ text: "TABLE OF CONTENTS", bold: true, size: 28, font: "Times New Roman" })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 500 },
            }),
            new TableOfContents("Table of Contents", {
                hyperlink: true,
                headingStyleRange: "1-3",
            })
        );

        // --- MAIN BODY SECTION ---
        const bodySections = [];
        for (let i = 1; i <= 5; i++) {
            const chap = chaptersMap.get(i);
            if (chap) {
                bodySections.push(
                    new Paragraph({
                        children: [new TextRun({ text: `CHAPTER ${numberToWords(i)}`, bold: true, size: 32, font: "Times New Roman" })],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 500, after: 200 },
                        heading: HeadingLevel.HEADING_1,
                        pageBreakBefore: true,
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: (chap.title || "").toUpperCase(), bold: true, size: 28, font: "Times New Roman" })],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 1000 },
                        heading: HeadingLevel.HEADING_1,
                    }),
                    ...htmlToDocxElements(chap.content || "")
                );
            }
        }

        // 7. References
        bodySections.push(
            new Paragraph({
                children: [new TextRun({ text: "BIBLIOGRAPHY", bold: true, size: 32, font: "Times New Roman" })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 500, after: 1000 },
                pageBreakBefore: true,
                heading: HeadingLevel.HEADING_1,
            })
        );
        if (project.citations && project.citations.length > 0) {
            project.citations.forEach(cit => {
                bodySections.push(
                    new Paragraph({
                        children: [new TextRun({ text: cit.formatted, size: 24, font: "Times New Roman" })],
                        spacing: { line: 480, after: 200 },
                    })
                );
            });
        }

        // Final Document Construction
        const doc = new Document({
            styles: {
                default: {
                    document: {
                        run: {
                            font: "Times New Roman",
                            size: 24,
                        },
                    },
                },
            },
            sections: [
                {
                    properties: {
                        page: {
                            pageNumbers: {
                                start: 1,
                                formatType: NumberFormat.LOWER_ROMAN,
                            },
                        },
                    },
                    children: prelimSections,
                },
                {
                    properties: {
                        type: SectionType.NEXT_PAGE,
                        page: {
                            pageNumbers: {
                                start: 1,
                                formatType: NumberFormat.DECIMAL,
                            },
                        },
                    },
                    children: bodySections,
                }
            ],
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
