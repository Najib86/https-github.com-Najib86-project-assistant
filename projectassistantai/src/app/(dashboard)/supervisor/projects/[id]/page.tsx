// src/app/(dashboard)/supervisor/projects/[id]/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, CheckCircle, XCircle, MessageSquare,
  Send, Loader2, BookOpen, Clock, ChevronRight, FileText
} from "lucide-react";
import toast from "react-hot-toast";

interface Chapter {
  id: string;
  number: number;
  title: string;
  content: string | null;
  status: string;
  wordCount: number;
  comments: { id: string }[];
}

interface Project {
  id: string;
  title: string;
  level: string;
  status: string;
  progress: number;
  totalWords: number;
  chapters: Chapter[];
  owner: { name: string; email: string; department: string | null };
  supervisor: { name: string } | null;
  _count: { comments: number };
}

const STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: "#2a3a52",
  DRAFT: "#4a8fff",
  SUBMITTED: "#c9a84c",
  UNDER_REVIEW: "#e8c76a",
  APPROVED: "#2ecc8f",
  NEEDS_REVISION: "#e05252",
};

export default function SupervisorProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [updatingChapter, setUpdatingChapter] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { router.push("/supervisor/dashboard"); return; }
        setProject(data);
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  async function updateChapterStatus(chapterId: string, chapterContent: string | null, newStatus: string) {
    setUpdatingChapter(chapterId);
    try {
      const res = await fetch(`/api/chapters/${chapterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: chapterContent ?? "", status: newStatus }),
      });
      if (!res.ok) throw new Error("Update failed");

      setProject(prev => prev ? {
        ...prev,
        chapters: prev.chapters.map(c =>
          c.id === chapterId ? { ...c, status: newStatus } : c
        ),
      } : prev);

      toast.success(
        newStatus === "APPROVED" ? "Chapter approved! ✓" : "Revision requested"
      );
    } catch {
      toast.error("Failed to update chapter status");
    } finally {
      setUpdatingChapter(null);
    }
  }

  async function submitComment() {
    if (!comment.trim() || !selectedChapter) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: id,
          chapterId: selectedChapter.id,
          content: comment,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit comment");
      toast.success("Comment added!");
      setComment("");
      setSelectedChapter(null);
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-[#c9a84c] animate-spin" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4 mb-7 flex-wrap">
        <Link href="/supervisor/dashboard" className="text-[#4a5a72] hover:text-white transition-colors mt-1">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white font-display leading-tight mb-1">
            {project.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#4a5a72]">
            <span className="text-[#8a9bb5]">{project.owner.name}</span>
            <span>·</span>
            <span>{project.level}</span>
            <span>·</span>
            <span>{project.totalWords?.toLocaleString() ?? 0} words</span>
            <span>·</span>
            <span>{project.progress}% complete</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chapters review */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="font-bold text-white mb-4">Chapter Review</h2>
          {project.chapters
            .sort((a, b) => a.number - b.number)
            .map((chapter, i) => (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#111620] border border-[#1e2a3a] rounded-xl overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0d1117] flex items-center justify-center text-sm font-bold"
                      style={{ color: STATUS_COLORS[chapter.status] }}>
                      {chapter.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm">{chapter.title}</p>
                      <div className="flex items-center gap-3 text-xs text-[#4a5a72]">
                        <span style={{ color: STATUS_COLORS[chapter.status] }}>{chapter.status.replace("_", " ")}</span>
                        {chapter.wordCount > 0 && <span>{chapter.wordCount.toLocaleString()} words</span>}
                      </div>
                    </div>
                  </div>

                  {chapter.status === "SUBMITTED" || chapter.status === "UNDER_REVIEW" ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => updateChapterStatus(chapter.id, chapter.content, "APPROVED")}
                        disabled={updatingChapter === chapter.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(46,204,143,.12)] border border-[rgba(46,204,143,.25)] text-[#2ecc8f] text-xs font-semibold rounded-lg hover:bg-[rgba(46,204,143,.2)] transition-all disabled:opacity-50"
                      >
                        {updatingChapter === chapter.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                        Approve
                      </button>
                      <button
                        onClick={() => updateChapterStatus(chapter.id, chapter.content, "NEEDS_REVISION")}
                        disabled={updatingChapter === chapter.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(224,82,82,.08)] border border-[rgba(224,82,82,.2)] text-[#e05252] text-xs font-semibold rounded-lg hover:bg-[rgba(224,82,82,.15)] transition-all disabled:opacity-50"
                      >
                        <XCircle className="w-3 h-3" />
                        Request Revision
                      </button>
                      <button
                        onClick={() => setSelectedChapter(chapter)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0d1117] border border-[#1e2a3a] text-[#8a9bb5] text-xs font-semibold rounded-lg hover:text-[#c9a84c] hover:border-[#8a6f32] transition-all"
                      >
                        <MessageSquare className="w-3 h-3" />
                        Add Comment
                      </button>
                      {chapter.content && (
                        <Link
                          href={`/supervisor/projects/${id}/chapters/${chapter.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0d1117] border border-[#1e2a3a] text-[#8a9bb5] text-xs font-semibold rounded-lg hover:text-white transition-all"
                        >
                          <BookOpen className="w-3 h-3" />
                          Read Chapter
                        </Link>
                      )}
                    </div>
                  ) : chapter.status === "APPROVED" ? (
                    <div className="flex items-center gap-2 text-xs text-[#2ecc8f]">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approved
                    </div>
                  ) : (
                    <p className="text-xs text-[#2a3a52]">
                      {chapter.status === "NOT_STARTED"
                        ? "Student has not started this chapter"
                        : chapter.status === "DRAFT"
                        ? "Student is working on this chapter"
                        : `Status: ${chapter.status}`}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Student info */}
          <div className="bg-[#111620] border border-[#1e2a3a] rounded-xl p-4">
            <p className="text-xs font-bold text-[#4a5a72] uppercase tracking-wider mb-3">Student</p>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1F4E79] to-[#0d1117] border border-[#2a3a52] flex items-center justify-center">
                <span className="text-sm font-bold text-[#c9a84c]">
                  {project.owner.name?.charAt(0) ?? "?"}
                </span>
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{project.owner.name}</p>
                <p className="text-xs text-[#4a5a72]">{project.owner.email}</p>
                {project.owner.department && (
                  <p className="text-xs text-[#2a3a52]">{project.owner.department}</p>
                )}
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-[#111620] border border-[#1e2a3a] rounded-xl p-4">
            <p className="text-xs font-bold text-[#4a5a72] uppercase tracking-wider mb-3">Progress</p>
            <div className="h-2 bg-[#0d1117] rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#c9a84c] to-[#2ecc8f]"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <p className="text-sm text-[#c9a84c] font-bold">{project.progress}%</p>
            <div className="mt-3 space-y-1.5">
              {Object.entries({
                "NOT_STARTED": project.chapters.filter(c => c.status === "NOT_STARTED").length,
                "DRAFT": project.chapters.filter(c => c.status === "DRAFT").length,
                "Awaiting Review": project.chapters.filter(c => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW").length,
                "APPROVED": project.chapters.filter(c => c.status === "APPROVED").length,
              }).map(([label, count]) => count > 0 && (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="text-[#4a5a72]">{label}</span>
                  <span className="text-[#8a9bb5] font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comment modal */}
      {selectedChapter && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111620] border border-[#1e2a3a] rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <h3 className="font-bold text-white mb-1">
              Add Comment — Ch. {selectedChapter.number}
            </h3>
            <p className="text-xs text-[#4a5a72] mb-4">{selectedChapter.title}</p>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Write your feedback or instruction for the student..."
              rows={4}
              className="w-full px-4 py-3 bg-[#0d1117] border border-[#1e2a3a] rounded-xl text-sm text-white placeholder:text-[#2a3a52] focus:outline-none focus:border-[#8a6f32] resize-none transition-all mb-4"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setSelectedChapter(null); setComment(""); }}
                className="px-4 py-2 border border-[#1e2a3a] text-[#8a9bb5] rounded-xl text-sm hover:text-white hover:border-[#2a3a52] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitComment}
                disabled={!comment.trim() || submitting}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#c9a84c] to-[#8a6f32] text-[#0a0d12] font-bold text-sm rounded-xl disabled:opacity-50 transition-all"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? "Submitting..." : "Post Comment"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
