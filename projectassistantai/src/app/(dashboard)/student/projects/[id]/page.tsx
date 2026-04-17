// src/app/(dashboard)/student/projects/[id]/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, Sparkles, BookOpen, CheckCircle, Clock, Circle,
  AlertCircle, Share2, Copy, ChevronRight, Loader2, MessageSquare,
  FileText, Settings, ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";

interface Chapter {
  id: string;
  number: number;
  title: string;
  content: string | null;
  status: string;
  wordCount: number;
  aiGenerated: boolean;
  lastAiAt: string | null;
}

interface Project {
  id: string;
  title: string;
  topic: string;
  level: string;
  status: string;
  supervisorCode: string;
  theory1: string | null;
  theory2: string | null;
  researchDesign: string | null;
  studyLocation: string | null;
  sampleSize: string | null;
  chapters: Chapter[];
  supervisor: { name: string; email: string } | null;
  _count: { comments: number };
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<string, {
  label: string; color: string; bg: string; border: string; icon: React.ElementType
}> = {
  NOT_STARTED:  { label: "Not Started",  color: "#2a3a52", bg: "transparent",           border: "#1e2a3a", icon: Circle        },
  DRAFT:        { label: "Draft",        color: "#4a8fff", bg: "rgba(74,143,255,.08)",   border: "rgba(74,143,255,.2)",  icon: FileText      },
  SUBMITTED:    { label: "Submitted",    color: "#2ecc8f", bg: "rgba(46,204,143,.08)",   border: "rgba(46,204,143,.2)",  icon: Clock         },
  UNDER_REVIEW: { label: "Under Review", color: "#e8c76a", bg: "rgba(232,199,106,.08)",  border: "rgba(232,199,106,.2)", icon: Clock         },
  APPROVED:     { label: "Approved",     color: "#2ecc8f", bg: "rgba(46,204,143,.12)",   border: "rgba(46,204,143,.3)",  icon: CheckCircle   },
  NEEDS_REVISION:{ label:"Needs Work",   color: "#e05252", bg: "rgba(224,82,82,.08)",    border: "rgba(224,82,82,.2)",   icon: AlertCircle   },
};

const CHAPTER_TITLES: Record<number, string> = {
  1: "Introduction",
  2: "Literature Review",
  3: "Research Methodology",
  4: "Data Presentation & Analysis",
  5: "Summary, Conclusion & Recommendations",
};

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingChapter, setGeneratingChapter] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { router.push("/student/projects"); return; }
        setProject(data);
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  async function generateChapter(chapterNumber: number) {
    setGeneratingChapter(chapterNumber);
    try {
      const res = await fetch("/api/chapters/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: id, chapterNumber, stream: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      toast.success(`Chapter ${chapterNumber} generated! ${data.wordCount?.toLocaleString() ?? 0} words`);

      // Refresh project data
      const updated = await fetch(`/api/projects/${id}`).then(r => r.json());
      setProject(updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGeneratingChapter(null);
    }
  }

  function copySupervisorCode() {
    if (!project?.supervisorCode) return;
    navigator.clipboard.writeText(project.supervisorCode);
    setCopiedCode(true);
    toast.success("Supervisor code copied!");
    setTimeout(() => setCopiedCode(false), 2000);
  }

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="h-8 w-1/3 bg-[#111620] rounded animate-pulse mb-6" />
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 bg-[#111620] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) return null;

  const totalWords = project.chapters.reduce((a, c) => a + c.wordCount, 0);
  const completedChapters = project.chapters.filter(c => c.status === "APPROVED").length;
  const progress = Math.round((completedChapters / 5) * 100);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4 mb-7 flex-wrap">
        <Link href="/student/projects" className="text-[#4a5a72] hover:text-white transition-colors mt-1">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white font-display leading-tight mb-1">
            {project.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#4a5a72]">
            <span>{project.level}</span>
            <span>•</span>
            <span>{totalWords.toLocaleString()} words</span>
            <span>•</span>
            <span>Updated {new Date(project.updatedAt).toLocaleDateString("en-NG")}</span>
            {project.supervisor && (
              <>
                <span>•</span>
                <span className="text-[#8a9bb5]">Supervisor: {project.supervisor.name}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/generate?projectId=${project.id}`}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-[#1e2a3a] text-[#8a9bb5] hover:text-[#c9a84c] hover:border-[#8a6f32] rounded-xl transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate Prompt
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chapters list */}
        <div className="lg:col-span-2">
          {/* Progress bar */}
          <div className="bg-[#111620] border border-[#1e2a3a] rounded-xl p-4 mb-5">
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="font-semibold text-white">Project Progress</span>
              <span className="font-bold text-[#c9a84c]">{progress}%</span>
            </div>
            <div className="h-2 bg-[#0d1117] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#c9a84c] to-[#2ecc8f]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-xs text-[#4a5a72] mt-2">
              <span>{completedChapters}/5 chapters approved</span>
              <span>{totalWords.toLocaleString()} words written</span>
            </div>
          </div>

          {/* Chapter cards */}
          <div className="space-y-3">
            {project.chapters
              .sort((a, b) => a.number - b.number)
              .map((chapter, i) => {
                const st = STATUS_CONFIG[chapter.status] ?? STATUS_CONFIG.NOT_STARTED;
                const StatusIcon = st.icon;
                const isGenerating = generatingChapter === chapter.number;

                return (
                  <motion.div
                    key={chapter.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-[#111620] border border-[#1e2a3a] rounded-xl overflow-hidden hover:border-[#2a3a52] transition-all"
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Chapter number */}
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                          chapter.status === "APPROVED"
                            ? "bg-[rgba(46,204,143,.15)] text-[#2ecc8f]"
                            : chapter.status !== "NOT_STARTED"
                            ? "bg-[rgba(201,168,76,.12)] text-[#c9a84c]"
                            : "bg-[#0d1117] text-[#2a3a52]"
                        }`}>
                          {chapter.number}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-white text-sm">
                              {CHAPTER_TITLES[chapter.number] ?? chapter.title}
                            </h3>
                            <span
                              className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border"
                              style={{ color: st.color, background: st.bg, borderColor: st.border }}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {st.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-[#4a5a72]">
                            {chapter.wordCount > 0 && (
                              <span>{chapter.wordCount.toLocaleString()} words</span>
                            )}
                            {chapter.aiGenerated && chapter.lastAiAt && (
                              <span className="flex items-center gap-1 text-[#c9a84c]">
                                <Sparkles className="w-2.5 h-2.5" />
                                AI-generated {new Date(chapter.lastAiAt).toLocaleDateString("en-NG")}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {chapter.status !== "APPROVED" && (
                            <button
                              onClick={() => generateChapter(chapter.number)}
                              disabled={isGenerating || generatingChapter !== null}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                isGenerating
                                  ? "bg-[rgba(201,168,76,.12)] text-[#c9a84c] border border-[rgba(201,168,76,.2)]"
                                  : "bg-[#0d1117] border border-[#1e2a3a] text-[#8a9bb5] hover:text-[#c9a84c] hover:border-[#8a6f32]"
                              } disabled:opacity-50`}
                            >
                              {isGenerating ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Sparkles className="w-3 h-3" />
                              )}
                              {isGenerating ? "Generating..." : chapter.content ? "Regenerate" : "Generate with AI"}
                            </button>
                          )}
                          {chapter.content && (
                            <Link
                              href={`/student/projects/${id}/chapters/${chapter.id}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#c9a84c] to-[#8a6f32] text-[#0a0d12] hover:shadow-[0_4px_15px_rgba(201,168,76,.25)] transition-all"
                            >
                              <BookOpen className="w-3 h-3" />
                              Edit
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Supervisor invite */}
          {!project.supervisor && (
            <div className="bg-[#111620] border border-[rgba(201,168,76,.2)] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Share2 className="w-4 h-4 text-[#c9a84c]" />
                <span className="font-semibold text-white text-sm">Invite Supervisor</span>
              </div>
              <p className="text-xs text-[#4a5a72] mb-3 leading-relaxed">
                Share this code with your supervisor so they can join and review your project.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-[#0d1117] border border-[#1e2a3a] rounded-lg text-xs font-mono text-[#c9a84c] tracking-widest">
                  {project.supervisorCode}
                </code>
                <button
                  onClick={copySupervisorCode}
                  className={`p-2 rounded-lg border transition-all ${
                    copiedCode
                      ? "border-[#2ecc8f] bg-[rgba(46,204,143,.1)] text-[#2ecc8f]"
                      : "border-[#1e2a3a] text-[#4a5a72] hover:text-[#c9a84c] hover:border-[#8a6f32]"
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Project info */}
          <div className="bg-[#111620] border border-[#1e2a3a] rounded-xl p-4">
            <p className="text-xs font-bold text-[#4a5a72] uppercase tracking-wider mb-3">Project Details</p>
            <div className="space-y-2.5">
              {[
                { label: "Level",       val: project.level },
                { label: "Design",      val: project.researchDesign ?? "Mixed Methods" },
                { label: "Location",    val: project.studyLocation ?? "Nigeria" },
                { label: "Sample",      val: project.sampleSize ?? "385" },
                { label: "Theory 1",    val: project.theory1 ?? "Peace Communication" },
                { label: "Theory 2",    val: project.theory2 ?? "Social Identity" },
              ].map(item => (
                <div key={item.label} className="flex gap-2">
                  <span className="text-xs text-[#2a3a52] w-20 flex-shrink-0">{item.label}</span>
                  <span className="text-xs text-[#8a9bb5] flex-1 line-clamp-2">{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick generate prompt */}
          <div className="bg-gradient-to-br from-[rgba(201,168,76,.08)] to-transparent border border-[rgba(201,168,76,.15)] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#c9a84c]" />
              <span className="font-semibold text-white text-sm">Full Project Prompt</span>
            </div>
            <p className="text-xs text-[#4a5a72] mb-3 leading-relaxed">
              Generate a master prompt to produce the complete 90–120 page project with all charts, tables and references.
            </p>
            <Link
              href={`/generate?projectId=${project.id}`}
              className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-[#c9a84c] to-[#8a6f32] text-[#0a0d12] font-bold text-xs rounded-xl hover:shadow-[0_6px_20px_rgba(201,168,76,.3)] transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate Prompt
            </Link>
          </div>

          {/* Comments */}
          {project._count.comments > 0 && (
            <div className="bg-[rgba(224,82,82,.06)] border border-[rgba(224,82,82,.2)] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-[#e05252]" />
                <span className="font-semibold text-white text-sm">
                  {project._count.comments} Unresolved Comment{project._count.comments !== 1 ? "s" : ""}
                </span>
              </div>
              <p className="text-xs text-[#4a5a72] mb-3">
                Your supervisor has left feedback that needs attention.
              </p>
              <Link
                href={`/student/projects/${id}/comments`}
                className="text-xs font-semibold text-[#e05252] hover:text-[#ff6b6b] flex items-center gap-1 transition-colors"
              >
                View comments <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
