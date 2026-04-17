// src/app/api/prompts/generate/route.ts
// POST — Generate and store a research project prompt

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getCachedAIResponse, setCachedAIResponse, hashPrompt } from "@/lib/auth/rate-limit";
import { buildMasterPrompt, type PromptConfig } from "@/lib/prompt-builder";
import { z } from "zod";

const PromptConfigSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(300),
  studentName: z.string().default("[STUDENT FULL NAME]"),
  matric: z.string().default("[NOU/XXXXXXX/XX]"),
  university: z.string().default("National Open University of Nigeria"),
  faculty: z.string().min(3),
  degree: z.string().min(3),
  location: z.string().min(3),
  year: z.string().default("2024"),
  theory1: z.string().min(5),
  theory2: z.string().default("Social Identity Theory (Tajfel & Turner, 1979)"),
  researchDesign: z.string().min(5),
  population: z.string().min(10),
  sampleSize: z.string().min(3),
  dataMethod: z.string().min(5),
  objectives: z.string().default(""),
  pageTarget: z.string().default("90-120 pages"),
  fontSpec: z.string().default("Times New Roman 12pt, Double-spaced"),
  citation: z.string().default("APA 7th Edition"),
  refCount: z.string().default("50+ scholarly references"),
  exportFormat: z.string().default("Microsoft Word (.docx)"),
  statsTool: z.string().default("SPSS v26"),
  charts: z.array(z.string()).default([]),
  tables: z.array(z.string()).default([]),
  chapters: z.array(z.string()).default([]),
  projectId: z.string().optional(),
  saveToHistory: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    // ── Auth & Rate limiting ──────────────────────────────────────
    const session = await getServerSession(authOptions);
    const identifier = session?.user?.id ?? req.headers.get("x-forwarded-for") ?? "anonymous";

    const rateCheck = await checkRateLimit("ai", identifier);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: "Too many requests. Please wait before generating another prompt.",
          retryAfter: rateCheck.reset.toISOString(),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": rateCheck.remaining.toString(),
            "Retry-After": Math.ceil(
              (rateCheck.reset.getTime() - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    // ── Validate input ────────────────────────────────────────────
    const body = await req.json();
    const parsed = PromptConfigSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid configuration", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const config = parsed.data as PromptConfig;

    // ── Check cache ───────────────────────────────────────────────
    const cacheKey = hashPrompt(JSON.stringify(config));
    const cached = await getCachedAIResponse(cacheKey);

    let promptText: string;
    let fromCache = false;

    if (cached) {
      promptText = cached;
      fromCache = true;
    } else {
      // ── Build the prompt ────────────────────────────────────────
      promptText = buildMasterPrompt(config);

      // Cache for 1 hour
      await setCachedAIResponse(cacheKey, promptText, 3600);
    }

    // ── Save to Neon DB (if user is authenticated and saveToHistory=true) ──
    let savedPrompt = null;
    if (session?.user?.id && config.saveToHistory) {
      try {
        savedPrompt = await prisma.generatedPrompt.create({
          data: {
            userId: session.user.id,
            projectId: config.projectId ?? null,
            title: config.title.slice(0, 255),
            config: JSON.stringify(config),
            promptText,
            wordCount: promptText.split(/\s+/).length,
            tags: [config.degree, config.faculty, config.location]
              .filter(Boolean)
              .slice(0, 3),
          },
        });

        // Update site stats
        await prisma.siteStats.upsert({
          where: { id: "main" },
          create: { id: "main", totalPrompts: 1 },
          update: { totalPrompts: { increment: 1 } },
        });

        // Log activity
        await prisma.activityLog.create({
          data: {
            userId: session.user.id,
            action: "PROMPT_GENERATED",
            metadata: JSON.stringify({
              promptId: savedPrompt.id,
              title: config.title,
              wordCount: promptText.split(/\s+/).length,
            }),
          },
        });
      } catch (dbError) {
        console.error("[DB] Failed to save prompt:", dbError);
        // Don't fail the request if DB save fails
      }
    }

    return NextResponse.json({
      success: true,
      promptText,
      wordCount: promptText.split(/\s+/).length,
      characterCount: promptText.length,
      fromCache,
      savedId: savedPrompt?.id ?? null,
      rateLimit: {
        remaining: rateCheck.remaining,
        reset: rateCheck.reset.toISOString(),
      },
    });
  } catch (error) {
    console.error("[API /prompts/generate]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ── GET — Fetch user's prompt history ────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 50);
  const skip = (page - 1) * limit;

  const [prompts, total] = await prisma.$transaction([
    prisma.generatedPrompt.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        wordCount: true,
        useCount: true,
        tags: true,
        createdAt: true,
      },
    }),
    prisma.generatedPrompt.count({ where: { userId: session.user.id } }),
  ]);

  return NextResponse.json({
    prompts,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
}
