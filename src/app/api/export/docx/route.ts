
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
// @ts-expect-error - html-to-docx has partial types
import HTMLtoDOCX from "html-to-docx";
import { generateAIResponse } from "@/lib/ai-service";

// Helper to convert numbers to words for Chapter headings
const numberToWords = (num: number): string => {
    const words = ["ZERO", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN"];
    return words[num] || num.toString();
};

// Helper: Extract valid text from HTML
const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, '').trim();

// Helper: Generate Missing Content
const generateMissingContent = async (title: string, context: string, missingType: "Full Chapter" | "Subsections", missingItems: string[] = []) => {
    const itemDesc = missingType === "Full Chapter" ? "the entire chapter" : `the following missing subsections: ${missingItems.join(', ')}`;
    const prompt = `
    You are an academic writing assistant. The user is exporting a thesis but is missing ${itemDesc} for "${title}".
    
    Project Context: ${context}
    
    Task: Write a high-quality academic draft for ${itemDesc}.
    Format: Use HTML tags (<h3> for headings, <p> for paragraphs). Do NOT use Markdown (no # or **).
    Tone: Formal, objective, academic.
    Length: Concise but sufficient for a placeholder draft (approx 300-500 words).
    
    Output ONLY the HTML content.
    `;

    const content = await generateAIResponse(prompt);
    // Sanitize: remove markdown code blocks, bold markers, and weird artifacts
    return content
        .replace(/```html/g, '')
        .replace(/```/g, '')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/### (.*?)(\n|$)/g, '<h3>$1</h3>')
        .replace(/## (.*?)(\n|$)/g, '<h2>$1</h2>')
        .replace(/# (.*?)(\n|$)/g, '<h1>$1</h1>')
        .trim();
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
                citations: true // Include citations for APA references
            }
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // ---------------------------------------------------------
        // 1. DATA PREPARATION & LEVEL DETERMINATION
        // ---------------------------------------------------------

        // Parse Metadata
        const meta = (project.academicMetadata as Record<string, any>) || {};
        const studentInfo = meta.student || {};
        const institutionInfo = meta.institution || {};
        const supervisorInfo = meta.supervisor || {};

        const level = project.level || "BSc"; // Default to Undergraduate
        const isPostGrad = ["MSc", "PhD", "Masters", "Doctorate", "Postgraduate"].some(l => level.includes(l));
        const lineHeight = isPostGrad ? "2.0" : "1.5"; // Academic spacing rules

        const generatedSections: string[] = []; // Track what we auto-fixed to notify user

        // Metadata Variables
        const studentName = studentInfo.fullName || project.student?.name || "Student Name";
        const matricNo = studentInfo.studentIdNo || "STUDENT ID";
        const department = institutionInfo.department || project.student?.department || "Department Name";
        const institutionName = institutionInfo.name || "[UNIVERSITY NAME]";
        const faculty = institutionInfo.faculty || "FACULTY OF SCIENCE";
        const degree = institutionInfo.programme || `${level} in ${department}`;
        const gradYear = institutionInfo.graduationYear || new Date().getFullYear().toString();
        const supervisorName = supervisorInfo.name ? `${supervisorInfo.title || ""} ${supervisorInfo.name}`.trim() : "Supervisor Name";

        // Context for AI
        const projectContext = `Title: ${project.title}. Level: ${level}. Student: ${studentName}. Institution: ${institutionName}`;

        // Identify Chapters
        const chaptersMap = new Map<number | string, { title?: string | null; content?: string | null; chapterNumber?: number | null }>();
        project.chapters.forEach(c => {
            chaptersMap.set(c.chapterNumber, c);
            if (c.title) {
                const normalizedTitle = c.title.trim().toLowerCase();
                chaptersMap.set(normalizedTitle, c);
            }
        });

        // ---------------------------------------------------------
        // 2. ACADEMIC VALIDATION & AUTO-COMPLETION
        // ---------------------------------------------------------

        // 2.1 Abstract Validation
        let abstract = chaptersMap.get('abstract') || project.chapters.find(c => c.title?.toLowerCase().includes("abstract"));
        if (!abstract) {
            const genContent = await generateMissingContent("Abstract", projectContext, "Full Chapter");
            abstract = { title: "Abstract", content: genContent };
            chaptersMap.set('abstract', abstract);
            generatedSections.push("Abstract (Full Section)");
        } else {
            // Content Keywords Check
            const absContent = (abstract.content || "").toLowerCase();
            const missingKeywords = [];
            if (!absContent.includes("background") && !absContent.includes("aim")) missingKeywords.push("Background/Aim");
            if (!absContent.includes("method")) missingKeywords.push("Methodology");
            if (!absContent.includes("result")) missingKeywords.push("Results");
            if (!absContent.includes("conclusion")) missingKeywords.push("Conclusion");

            if (missingKeywords.length > 0) {
                const genContent = await generateMissingContent("Abstract", projectContext, "Subsections", missingKeywords);
                abstract.content += `<br/><hr/><h3>[AI Suggestion: Missing Elements]</h3>${genContent}`;
                generatedSections.push(`Abstract (Missing elements: ${missingKeywords.join(', ')})`);
            }
        }

        // 2.2 Chapter 1: Introduction
        let ch1 = chaptersMap.get(1);
        if (!ch1) {
            const genContent = await generateMissingContent("Chapter One: Introduction", projectContext, "Full Chapter");
            ch1 = { chapterNumber: 1, title: "Introduction", content: genContent };
            chaptersMap.set(1, ch1);
            generatedSections.push("Chapter One: Introduction (Full Chapter)");
        } else {
            const content = (ch1.content || "").toLowerCase();
            const required = ["Background", "Problem", "Aim", "Objectives", "Scope", "Significance", "Research Questions"];
            const missing = required.filter(req => !content.includes(req.toLowerCase()));
            if (missing.length > 0) {
                const genContent = await generateMissingContent("Chapter One", projectContext, "Subsections", missing);
                ch1.content += `<br/><hr/><h3>[AI Suggestion: Missing Content]</h3>${genContent}`;
                generatedSections.push(`Chapter One (Missing: ${missing.join(', ')})`);
            }
        }

        // 2.3 Chapter 2: Literature Review
        let ch2 = chaptersMap.get(2);
        if (!ch2) {
            const genContent = await generateMissingContent("Chapter Two: Literature Review", projectContext, "Full Chapter");
            ch2 = { chapterNumber: 2, title: "Literature Review", content: genContent };
            chaptersMap.set(2, ch2);
            generatedSections.push("Chapter Two: Literature Review (Full Chapter)");
        } else {
            const content = (ch2.content || "").toLowerCase();
            const required = ["Conceptual Framework", "Theoretical Framework", "Empirical Review", "Gap"];
            const missing = required.filter(req => !content.includes(req.toLowerCase().split(' ')[0])); // Loose matching
            if (missing.length > 0) {
                const genContent = await generateMissingContent("Chapter Two", projectContext, "Subsections", missing);
                ch2.content += `<br/><hr/><h3>[AI Suggestion: Missing Content]</h3>${genContent}`;
                generatedSections.push(`Chapter Two (Missing: ${missing.join(', ')})`);
            }
        }

        // 2.4 Chapter 3: Methodology
        let ch3 = chaptersMap.get(3);
        if (!ch3) {
            const genContent = await generateMissingContent("Chapter Three: Methodology", projectContext, "Full Chapter");
            ch3 = { chapterNumber: 3, title: "Methodology", content: genContent };
            chaptersMap.set(3, ch3);
            generatedSections.push("Chapter Three: Methodology (Full Chapter)");
        } else {
            const content = (ch3.content || "").toLowerCase();
            const required = ["Research Design", "Population", "Sample", "Data Collection", "Data Analysis"];
            const missing = required.filter(req => !content.includes(req.toLowerCase().split(' ')[0]));
            if (missing.length > 0) {
                const genContent = await generateMissingContent("Chapter Three", projectContext, "Subsections", missing);
                ch3.content += `<br/><hr/><h3>[AI Suggestion: Missing Content]</h3>${genContent}`;
                generatedSections.push(`Chapter Three (Missing: ${missing.join(', ')})`);
            }
        }

        // 2.5 Chapter 4: Results & Discussion
        let ch4 = chaptersMap.get(4);
        if (!ch4) {
            const genContent = await generateMissingContent("Chapter Four: Results & Discussion", projectContext, "Full Chapter");
            ch4 = { chapterNumber: 4, title: "Results & Discussion", content: genContent };
            chaptersMap.set(4, ch4);
            generatedSections.push("Chapter Four: Results & Discussion (Full Chapter)");
        } else {
            const content = (ch4.content || "").toLowerCase();
            if (!content.includes("discussion")) {
                const genContent = await generateMissingContent("Chapter Four", projectContext, "Subsections", ["Discussion"]);
                ch4.content += `<br/><hr/><h3>[AI Suggestion: Discussion]</h3>${genContent}`;
                generatedSections.push(`Chapter Four (Missing Discussion)`);
            }
        }

        // 2.6 Chapter 5: Conclusion
        let ch5 = chaptersMap.get(5);
        if (!ch5) {
            const genContent = await generateMissingContent("Chapter Five: Conclusion", projectContext, "Full Chapter");
            ch5 = { chapterNumber: 5, title: "Conclusion", content: genContent };
            chaptersMap.set(5, ch5);
            generatedSections.push("Chapter Five: Conclusion (Full Chapter)");
        } else {
            const content = (ch5.content || "").toLowerCase();
            const required = ["Summary", "Conclusion", "Recommendation"];
            const missing = required.filter(req => !content.includes(req.toLowerCase()));
            if (missing.length > 0) {
                const genContent = await generateMissingContent("Chapter Five", projectContext, "Subsections", missing);
                ch5.content += `<br/><hr/><h3>[AI Suggestion: Missing Content]</h3>${genContent}`;
                generatedSections.push(`Chapter Five (Missing: ${missing.join(', ')})`);
            }
        }

        // 2.7 Preliminaries Check
        if (!chaptersMap.get('acknowledgement') && !project.chapters.some(c => c.title?.toLowerCase().includes("acknowledgement"))) {
            const genContent = await generateMissingContent("Acknowledgement", projectContext, "Full Chapter");
            chaptersMap.set('acknowledgement', { title: "Acknowledgement", content: genContent });
            generatedSections.push("Acknowledgement");
        }


        // ---------------------------------------------------------
        // 3. HTML CONSTRUCTION
        // ---------------------------------------------------------

        // Helper to extract headings from HTML content (h2-h4)
        const getHeadings = (html: string) => {
            const headings: string[] = [];
            const regex = /<(h[2-4])[^>]*>(.*?)<\/\1>/gi;
            let match;
            while ((match = regex.exec(html)) !== null) {
                headings.push(stripHtml(match[2]));
            }
            return headings;
        };

        const tocLines: string[] = [];
        const addToToc = (title: string, indent = false) => {
            const style = indent ? "margin-left: 30px; font-size: 11pt; color: #333333;" : "font-weight: bold; margin-top: 10px;";
            tocLines.push(`<p style="${style}">${title}</p>`);
        };

        // --- HTML BODY ---
        let htmlContent = `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>${project.title}</title>
        <style>
            body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: ${lineHeight}; text-align: justify; }
            h1, h2, h3, h4, h5, h6 { font-family: 'Times New Roman', serif; color: #000000; font-weight: bold; page-break-after: avoid; }
            h2, h3, h4 { text-transform: capitalize; }
            .chapter-title { text-align: center; text-transform: uppercase; font-weight: bold; font-size: 14pt; margin-bottom: 24pt; }
            .section-break { page-break-before: always; }
            .ai-notice { background-color: #f0f8ff; padding: 20px; border: 1px solid #007bff; margin-bottom: 40px; }
            p { margin-bottom: 10pt; }
        </style>
    </head>
    <body style="padding: 40pt;">`;

        // --- AI GENERATION NOTICE (New First Page) ---
        if (generatedSections.length > 0) {
            htmlContent += `
            <div class="ai-notice">
                <h1 style="text-align: center; color: #0056b3;">Project Assistant Report</h1>
                <p><strong>Heads up!</strong> Some required academic sections were missing from your project. </p>
                <p>To ensure your document meets structural requirements, our AI has automatically analyzed your project context and generated drafts for the following missing sections:</p>
                <ul>
                    ${generatedSections.map(s => `<li>${s}</li>`).join('')}
                </ul>
                <p><strong>Action Required:</strong> Please review the generated content (marked in the document) and refine it to match your specific research details.</p>
            </div>
            <div class="section-break"></div>
            `;
        }

        // Title Page
        htmlContent += `
        <div style="text-align: center;">
            <br /><br />
            <p style="font-weight: bold; font-size: 14pt; text-transform: uppercase;">${project.title}</p>
            <br /><br /><br />
            <p>BY<br /><br /><span style="font-weight: bold; text-transform: uppercase;">${studentName}</span><br />${matricNo}</p>
            <br /><br />
            <p>A PROJECT REPORT SUBMITTED TO THE<br />${department.toUpperCase()}<br />${faculty.toUpperCase()}<br />${institutionName.toUpperCase()}</p>
            <br /><br />
            <p>IN PARTIAL FULFILLMENT OF THE REQUIREMENTS FOR THE AWARD OF<br />${degree.toUpperCase()}</p>
            <br /><br />
            <p>${gradYear}</p>
        </div>`;

        // Re-construct ToC first since we might have new content

        // Prelim ToC
        addToToc("TITLE PAGE");
        addToToc("CERTIFICATION");
        addToToc("DECLARATION");
        if (chaptersMap.get('dedication') || project.chapters.some(c => c.title?.toLowerCase().includes("dedication"))) addToToc("DEDICATION");
        addToToc("ACKNOWLEDGEMENT"); // Mandatory, now guaranteed
        addToToc("ABSTRACT"); // Mandatory, now guaranteed

        // Chapters ToC
        for (let i = 1; i <= 5; i++) {
            const chap = chaptersMap.get(i);
            if (chap) {
                const title = `CHAPTER ${numberToWords(i)}: ${(chap.title || "").toUpperCase()}`;
                addToToc(title);
                const subheadings = getHeadings(chap.content || "");
                subheadings.forEach(sh => addToToc(sh, true));
            }
        }
        if (isPostGrad) addToToc("CONTRIBUTION TO KNOWLEDGE");
        addToToc("REFERENCES");
        addToToc("APPENDICES");

        // Certification
        htmlContent += `
        <div class="section-break">
            <p class="chapter-title">CERTIFICATION</p>
            <br />
            <p>This is to certify that this research work titled <strong>"${project.title}"</strong> was carried out by <strong>${studentName}</strong> (${matricNo}) under my supervision in the ${department}, ${institutionName}, in partial fulfillment of the requirements for the award of ${degree}.</p>
            <br /><br /><br />
            <p>__________________________<br /><strong>${supervisorName}</strong><br />(Supervisor)</p>
            <br /><br />
            <p>__________________________<br /><strong>Head of Department</strong><br />(H.O.D)</p>
        </div>`;

        // Declaration
        htmlContent += `
        <div class="section-break">
            <p class="chapter-title">DECLARATION</p>
            <br />
            <p>I, <strong>${studentName}</strong>, declare that this research work titled <strong>"${project.title}"</strong> is my original work and has not been submitted for the award of any other degree or diploma in this or any other tertiary institution. All sources of information and literature used have been duly acknowledged.</p>
            <br /><br /><br />
            <p>__________________________<br /><strong>${studentName}</strong><br />(Student)</p>
            <br />
            <p>Date: ____________________</p>
        </div>`;

        // Dedication
        const dedication = chaptersMap.get('dedication') || project.chapters.find(c => c.title?.toLowerCase().includes("dedication"));
        if (dedication) {
            htmlContent += `
            <div class="section-break">
                <p class="chapter-title">DEDICATION</p>
                <br /><br /><br />
                <p style="text-align: center; font-style: italic;">${dedication.content}</p>
            </div>`;
        }

        // Acknowledgement
        const ack = chaptersMap.get('acknowledgement'); // Always set now if missing
        if (ack) {
            htmlContent += `
            <div class="section-break">
                <p class="chapter-title">ACKNOWLEDGEMENT</p>
                <br />
                ${ack.content}
            </div>`;
        }

        // Abstract (Mandatory)
        const abs = abstract; // Always set now
        htmlContent += `
        <div class="section-break">
            <p class="chapter-title">ABSTRACT</p>
            <br />
            ${abs ? abs.content : ""}
        </div>`;

        // Table of Contents
        htmlContent += `
        <div class="section-break">
            <p class="chapter-title">TABLE OF CONTENTS</p>
            <br />
            ${tocLines.join('')}
        </div>`;

        // Chapters 1-5
        for (let i = 1; i <= 5; i++) {
            const chap = chaptersMap.get(i);
            if (chap) {
                const chapterWord = numberToWords(i);
                htmlContent += `
                <div class="section-break">
                    <p class="chapter-title">CHAPTER ${chapterWord}</p>
                    <p class="chapter-title">${(chap.title || "Untitled").toUpperCase()}</p>
                    <br />
                    ${chap.content}
                </div>`;
            }
        }

        // Contribution (MSc/PhD)
        if (isPostGrad) {
            htmlContent += `
            <div class="section-break">
                <p class="chapter-title">CONTRIBUTION TO KNOWLEDGE</p>
                <br />
                <p>This study contributes to the body of knowledge by...</p>
            </div>`;
        }

        // References
        htmlContent += `
        <div class="section-break">
            <p class="chapter-title">REFERENCES</p>
            <br />`;

        if (project.citations && project.citations.length > 0) {
            const sortedCitations = [...project.citations].sort((a, b) => (a.formatted || "").localeCompare(b.formatted || ""));
            sortedCitations.forEach((cit) => {
                htmlContent += `<p style="text-indent: -0.5in; margin-left: 0.5in; margin-bottom: 1em;">${cit.formatted}</p>`;
            });
        } else {
            const refChap = chaptersMap.get('references') || project.chapters.find(c => c.title?.toLowerCase().includes("references"));
            htmlContent += refChap ? refChap.content : `<p>[References]</p>`;
        }
        htmlContent += `</div>`;

        // Appendices
        htmlContent += `
        <div class="section-break">
            <p class="chapter-title">APPENDICES</p>
            <br />
            <p>[Appendices]</p>
        </div>`;

        htmlContent += `</body></html>`;

        // --- FINAL SANITATION FOR DOCX COMPATIBILITY ---
        const sanitizedHtml = htmlContent
            // 1. Expand 3-digit hex colors (#FFF -> #FFFFFF)
            .replace(/#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])(?![0-9a-fA-F])/g, '#$1$1$2$2$3$3')
            // 2. Remove Alpha channel from 8-digit hex (#RRGGBAA -> #RRGGBB)
            .replace(/#([0-9a-fA-F]{6})([0-9a-fA-F]{2})\b/g, '#$1')
            // 3. Convert all common color names to Hex to avoid library parsing gaps
            .replace(/color:\s*indigo/gi, 'color: #4f46e5')
            .replace(/color:\s*white/gi, 'color: #ffffff')
            .replace(/color:\s*black/gi, 'color: #000000')
            // 4. Force strip ALL background-colors from inline elements (Major crash source)
            .replace(/<(span|a|strong|em|i|b)[^>]*style="[^"]*background-color:[^"]*"[^>]*>/gi, (m) => m.replace(/background-color:[^;"]*;?/gi, ''))
            // 5. Remove all RGB/RGBA/Variable/Important/Dynamic CSS
            .replace(/rgba?\([^)]+\)/gi, '#000000')
            .replace(/var\(--[^)]+\)/gi, '#000000')
            .replace(/!important/gi, '')
            .replace(/style="[^"]*(inherit|transparent|initial|none|unset)[^"]*"/gi, '')
            // 6. Convert PX to PT for library normalization
            .replace(/(\d+)px/g, (m, p1) => `${Math.round(parseInt(p1) * 0.75)}pt`)
            // 7. Fix standard tags
            .replace(/<br\s*\/?>/g, '<br />')
            .replace(/<hr\s*\/?>/g, '<div style="border-top: 1pt solid #cccccc; margin: 10pt 0;"></div>')
            .trim();

        const fileBuffer = await HTMLtoDOCX(sanitizedHtml, null, {
            table: { row: { cantSplit: true } },
            footer: true,
            pageNumber: true,
            font: 'Times New Roman',
            fontSize: 24, // 12pt
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
