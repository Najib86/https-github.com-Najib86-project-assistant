// src/app/api/chapters/generate/route.ts
// POST — AI chapter generation with streaming support

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { generateText, streamText } from "@/lib/ai/ai.orchestrator";
import { CHAPTER_PROMPTS, NOUN_GUIDELINES } from "@/lib/guidelines";
import { z } from "zod";

const GenerateSchema = z.object({
  projectId: z.string(),
  chapterNumber: z.number().int().min(1).max(5),
  previousContext: z.string().optional(),
  stream: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Rate limiting ─────────────────────────────────────────────
    const rateCheck = await checkRateLimit("ai", session.user.id);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "AI generation rate limit exceeded. Please wait." },
        { status: 429 }
      );
    }

    // ── Validate ──────────────────────────────────────────────────
    const body = await req.json();
    const parsed = GenerateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { projectId, chapterNumber, previousContext, stream } = parsed.data;

    // ── Fetch project ─────────────────────────────────────────────
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: session.user.id },
          { members: { some: { userId: session.user.id } } },
        ],
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // ── Build chapter-specific prompt ─────────────────────────────
    const chapterPromptFn = CHAPTER_PROMPTS[chapterNumber as keyof typeof CHAPTER_PROMPTS];
    let chapterPrompt: string;

    switch (chapterNumber) {
      case 1:
        chapterPrompt = CHAPTER_PROMPTS[1](
          project.topic,
          project.studyLocation ?? project.department ?? "Nigeria",
          `${project.theory1 ?? "Peace Communication Theory"} + ${project.theory2 ?? "Social Identity Theory"}`
        );
        break;
      case 2:
        chapterPrompt = CHAPTER_PROMPTS[2](
          project.topic,
          `${project.theory1 ?? "Peace Communication Theory"} + ${project.theory2 ?? "Social Identity Theory"}`
        );
        break;
      case 3:
        chapterPrompt = CHAPTER_PROMPTS[3](
          project.topic,
          project.researchDesign ?? "Mixed Methods",
          project.description ?? "Adult residents in study communities",
          project.sampleSize ?? "385 (Yamane formula)",
          "Structured Questionnaire + In-Depth Interviews + FGDs"
        );
        break;
      case 4:
        chapterPrompt = CHAPTER_PROMPTS[4](project.topic);
        break;
      case 5:
        chapterPrompt = CHAPTER_PROMPTS[5](project.topic);
        break;
      default:
        return NextResponse.json({ error: "Invalid chapter number" }, { status: 400 });
    }

    // Add previous context if provided (AI Copilot "Continue Writing" mode)
    const fullPrompt = previousContext
      ? `${chapterPrompt}\n\nCONTINUATION CONTEXT (last 3000 chars of what was already written):\n${previousContext.slice(-3000)}\n\nContinue from where the above text leaves off, maintaining the same academic voice and style:`
      : chapterPrompt;

    // ── Streaming response ────────────────────────────────────────
    if (stream) {
      const encoder = new TextEncoder();
      let fullText = "";

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            const { provider } = await streamText(
              {
                prompt: fullPrompt,
                systemPrompt: NOUN_GUIDELINES,
                maxTokens: 8192,
                temperature: 0.7,
              },
              (chunk) => {
                fullText += chunk;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`)
                );
              }
            );

            // Save to DB after streaming completes
            await saveChapterContent(projectId, chapterNumber, fullText, provider);

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ done: true, provider, wordCount: fullText.split(/\s+/).length })}\n\n`
              )
            );
            controller.close();
          } catch (error) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: (error as Error).message })}\n\n`
              )
            );
            controller.close();
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // ── Non-streaming response ────────────────────────────────────
    const result = await generateText({
      prompt: fullPrompt,
      systemPrompt: NOUN_GUIDELINES,
      maxTokens: 8192,
      temperature: 0.7,
    });

    await saveChapterContent(projectId, chapterNumber, result.text, result.provider);

    return NextResponse.json({
      success: true,
      content: result.text,
      provider: result.provider,
      wordCount: result.text.split(/\s+/).length,
    });
  } catch (error) {
    console.error("[API /chapters/generate]", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}

async function saveChapterContent(
  projectId: string,
  chapterNumber: number,
  content: string,
  provider: string
) {
  const wordCount = content.split(/\s+/).length;

  // Upsert chapter
  const chapter = await prisma.chapter.upsert({
    where: { projectId_number: { projectId, number: chapterNumber } },
    create: {
      projectId,
      number: chapterNumber,
      title: getChapterTitle(chapterNumber),
      content,
      wordCount,
      aiGenerated: true,
      lastAiAt: new Date(),
      status: "DRAFT",
    },
    update: {
      content,
      wordCount,
      aiGenerated: true,
      lastAiAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Save version history
  await prisma.chapterVersion.create({
    data: {
      chapterId: chapter.id,
      content,
      wordCount,
      snapshot: JSON.stringify({ provider, generatedAt: new Date() }),
    },
  });

  return chapter;
}

function getChapterTitle(num: number): string {
  const titles: Record<number, string> = {
    1: "Introduction",
    2: "Literature Review",
    3: "Research Methodology",
    4: "Data Presentation and Analysis",
    5: "Summary, Conclusion and Recommendations",
  };
  return titles[num] ?? `Chapter ${num}`;
}
