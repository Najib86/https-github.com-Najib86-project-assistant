
import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/ai-service";
import { redis } from "@/lib/redis";
import { rateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { topic, level, sampleText, userId } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Missing topic" }, { status: 400 });
    }

    // 1. Rate Limiting
    if (userId) {
      await rateLimit(userId.toString());
    }

    // 2. Redis Caching
    const topicHash = crypto.createHash("md5").update(topic).digest("hex");
    const cacheKey = `chapter:full:${topicHash}`;

    const cachedResult = await redis.get(cacheKey);
    if (cachedResult) {
      console.log("Serving full project from cache:", cacheKey);
      return NextResponse.json({ result: cachedResult });
    }

    const prompt = `
You are an expert university academic research assistant. 
Your task is to automatically generate **full university-standard project content** for Chapters 1–5, including outlines, detailed drafts, project status tracking, plagiarism awareness notes, and full report preparation. Follow formal academic writing standards.

Inputs:
- Project Topic: ${topic}
- Academic Level: ${level}
- Optional Sample Project Text: ${sampleText || "None provided"}

Requirements:

1. Chapters to generate:
   - Chapter 1: Introduction (Background, Statement of Problem, Research Questions, Aim & Objectives, Significance, Scope, Operational Definitions)
   - Chapter 2: Literature Review (Conceptual, Theoretical, Empirical)
   - Chapter 3: Methodology (Design, Population, Sampling, Instruments, Validity, Data Analysis)
   - Chapter 4: Data Presentation & Analysis (Demographics, Research Questions Analysis, Hypothesis Testing, Discussion)
   - Chapter 5: Summary, Conclusion, Recommendations, Suggestions for Further Study

2. Output must include:
   - **Structured outlines and full drafts** per chapter
   - Formal university academic style
   - Suggested **citations placeholders** (APA/MLA/IEEE)
   - **Project Status Section**: Track completion of each chapter (Draft / Submitted / Reviewed / Approved). Default all to "Draft".
   - **Plagiarism Awareness Section**: Highlight sections requiring originality check or paraphrasing suggestions for each chapter.
   - **Full Report Section**: Compile all chapters into a single cohesive document ready for DOCX/PDF export.
   - **Questionnaire or Survey Items** placeholders if relevant.

3. Instructions:
   - If sample text is provided, mimic formatting and style while ensuring originality.
   - Provide **plagiarism awareness notes** for students to check before submission.
   - Generate **complete full report** in a single section for export.
   - Ensure output is **supervisor-ready** but editable for students.
   - Return output in strict **JSON format** as below.

JSON Output Format:

{
  "status": {
    "chapter1": "Draft",
    "chapter2": "Draft",
    "chapter3": "Draft",
    "chapter4": "Draft",
    "chapter5": "Draft",
    "full_report": "Draft"
  },
  "plagiarism_notes": {
    "chapter1": "Sections to check for originality...",
    "chapter2": "...",
    "chapter3": "...",
    "chapter4": "...",
    "chapter5": "..."
  },
  "outline": {
    "chapter1": "Outline points...",
    "chapter2": "Outline points...",
    "chapter3": "Outline points...",
    "chapter4": "Outline points...",
    "chapter5": "Outline points..."
  },
  "draft": {
    "chapter1": "Full academic draft text...",
    "chapter2": "Full academic draft text...",
    "chapter3": "Full academic draft text...",
    "chapter4": "Full academic draft text...",
    "chapter5": "Full academic draft text..."
  },
  "full_report": "All chapters compiled into a single cohesive report text with headings, subheadings, and citation placeholders. This should be a very long string containing the entire project."
}
`;

    const responseText = await generateAIResponse(prompt, "json");

    // Clean up potential markdown code blocks (```json ... ```)
    const jsonString = responseText.replace(/```json|```/g, "").trim();

    let parsedData;
    try {
      parsedData = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", responseText);
      return NextResponse.json(
        { error: "Failed to generate structured content", raw: responseText },
        { status: 500 }
      );
    }

    // Cache the result
    await redis.set(cacheKey, parsedData, { ex: 3600 });

    return NextResponse.json({ result: parsedData });

  } catch (error: any) {
    console.error("Error generating chapter content:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}

