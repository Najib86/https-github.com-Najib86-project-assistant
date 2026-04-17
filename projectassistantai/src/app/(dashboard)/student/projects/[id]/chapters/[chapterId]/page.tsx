// src/app/(dashboard)/student/projects/[id]/chapters/[chapterId]/page.tsx
"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, Save, Sparkles, Clock, CheckCircle,
  RotateCcw, Send, Loader2, History, MessageSquare,
  AlignLeft
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
  versions: Array<{
    id: string;
    wordCount: number;
    createdAt: string;
    snapshot: string | null;
  }>;
  comments: Array<{
    id: string;
    content: string;
    resolved: boolean;
    author: { name: string; role: string };
    createdAt: string;
  }>;
  project: { title: string; topic: string; level: string; ownerId: string };
}

const STATUS_ACTIONS: Record<string, { label: string; next: string; color: string }> = {
  DRAFT:       { label: "Submit for Review",    next: "SUBMITTED",     color: "bg-[#2ecc8f] text-[#0a0d12]" },
  NOT_STARTED: { label: "Submit for Review",    next: "SUBMITTED",     color: "bg-[#2ecc8f] text-[#0a0d12]" },
  NEEDS_REVISION: { label: "Resubmit",          next: "SUBMITTED",     color: "bg-[#c9a84c] text-[#0a0d12]" },
};

export default function ChapterEditorPage({
  params,
}: {
  params: Promise<{ id: string; chapterId: string }>;
}) {
  const { id: projectId, chapterId } = use(params);
  const router = useRouter();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [activePanel, setActivePanel] = useState<"editor" | "history" | "comments">("editor");

  useEffect(() => {
    fetch(`/api/chapters/${chapterId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { router.back(); return; }
        setChapter(data);
        setContent(data.content ?? "");
        setWordCount((data.content ?? "").split(/\s+/).filter(Boolean).length);
      })
      .finally(() => setLoading(false));
  }, [chapterId, router]);

  const handleContentChange = useCallback((val: string) => {
    setContent(val);
    setDirty(true);
    setWordCount(val.split(/\s+/).filter(Boolean).length);
  }, []);

  // Auto-save after 3 seconds of inactivity
  useEffect(() => {
    if (!dirty) return;
    const timer = setTimeout(() => handleSave(false), 3000);
    return () => clearTimeout(timer);
  }, [content, dirty]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave(showToast = true) {
    if (!dirty || !chapter) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/chapters/${chapterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Save failed");
      setDirty(false);
      if (showToast) toast.success("Chapter saved!");
    } catch {
      if (showToast) toast.error("Failed to save chapter");
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerate() {
    if (!chapter) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/chapters/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          chapterNumber: chapter.number,
          previousContext: content.slice(-3000) || undefined,
          stream: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      const newContent = content
        ? content + "\n\n" + data.content
        : data.content;
      handleContentChange(newContent);
      toast.success(`Generated ${data.wordCount?.toLocaleString()} words!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (!chapter) return;
    try {
      await fetch(`/api/chapters/${chapterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, status: newStatus }),
      });
      setChapter(prev => prev ? { ...prev, status: newStatus } : prev);
      toast.success(`Chapter ${newStatus.toLowerCase()}!`);
    } catch {
      toast.error("Status update failed");
    }
  }

  async function restoreVersion(versionId: string) {
    try {
      const res = await fetch(`/api/chapters/${chapterId}/versions/${versionId}`);
      const data = await res.json();
      handleContentChange(data.content);
      toast.success("Version restored!");
      setActivePanel("editor");
    } catch {
      toast.error("Failed to restore version");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-[#c9a84c] animate-spin" />
      </div>
    );
  }

  if (!chapter) return null;

  const statusAction = STATUS_ACTIONS[chapter.status];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#0d1117] border-b border-[#1e2a3a] flex-wrap">
        <Link
          href={`/student/projects/${projectId}`}
          className="text-[#4a5a72] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            Ch. {chapter.number}: {chapter.title}
          </p>
          <p className="text-xs text-[#4a5a72]">{wordCount.toLocaleString()} words</p>
        </div>

        {/* Panel tabs */}
        <div className="flex gap-1 bg-[#111620] border border-[#1e2a3a] rounded-lg p-1">
          {(["editor", "history", "comments"] as const).map(panel => (
            <button
              key={panel}
              onClick={() => setActivePanel(panel)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                activePanel === panel
                  ? "bg-[#c9a84c] text-[#0a0d12]"
                  : "text-[#4a5a72] hover:text-[#8a9bb5]"
              }`}
            >
              {panel === "history" ? (
                <span className="flex items-center gap-1"><History className="w-3 h-3" />{panel}</span>
              ) : panel === "comments" ? (
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {panel}
                  {chapter.comments.length > 0 && (
                    <span className="ml-1 px-1 py-0 bg-[#e05252] text-white text-[9px] rounded-full leading-none">{chapter.comments.length}</span>
                  )}
                </span>
              ) : (
                <span className="flex items-center gap-1"><AlignLeft className="w-3 h-3" />{panel}</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111620] border border-[rgba(201,168,76,.3)] text-[#c9a84c] text-xs font-semibold rounded-lg hover:bg-[rgba(201,168,76,.08)] transition-all disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {content ? "Continue with AI" : "Generate with AI"}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving || !dirty}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111620] border border-[#1e2a3a] text-[#8a9bb5] text-xs font-semibold rounded-lg hover:text-white hover:border-[#2a3a52] transition-all disabled:opacity-40"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            {saving ? "Saving..." : dirty ? "Save*" : "Saved"}
          </button>
          {statusAction && (
            <button
              onClick={() => handleStatusChange(statusAction.next)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${statusAction.color}`}
            >
              <Send className="w-3 h-3" />
              {statusAction.label}
            </button>
          )}
          {chapter.status === "APPROVED" && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2ecc8f]">
              <CheckCircle className="w-3.5 h-3.5" />
              Approved
            </span>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {activePanel === "editor" && (
          <div className="h-full flex flex-col">
            <textarea
              value={content}
              onChange={e => handleContentChange(e.target.value)}
              placeholder={`Start writing Chapter ${chapter.number}: ${chapter.title}\n\nOr click "Generate with AI" above to generate this chapter automatically using your project's research parameters...`}
              className="flex-1 w-full p-8 bg-[#0a0d12] text-[#e8edf5] text-sm leading-8 resize-none focus:outline-none font-serif placeholder:text-[#1e2a3a]"
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: "14px",
                lineHeight: "2",
                maxWidth: "800px",
                margin: "0 auto",
                width: "100%",
              }}
            />
            {/* Word count footer */}
            <div className="px-8 py-2 border-t border-[#0d1117] flex items-center justify-between text-xs text-[#2a3a52]">
              <span>{wordCount.toLocaleString()} words</span>
              <span>
                {dirty ? (
                  <span className="flex items-center gap-1 text-[#c9a84c]">
                    <Clock className="w-3 h-3" /> Unsaved changes
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[#2ecc8f]">
                    <CheckCircle className="w-3 h-3" /> Auto-saved
                  </span>
                )}
              </span>
            </div>
          </div>
        )}

        {activePanel === "history" && (
          <div className="p-6 overflow-y-auto h-full">
            <h3 className="font-bold text-white mb-4">Version History</h3>
            {chapter.versions.length === 0 ? (
              <div className="text-center py-12 text-[#4a5a72]">
                <History className="w-10 h-10 mx-auto mb-3 text-[#1e2a3a]" />
                <p className="text-sm">No versions saved yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {chapter.versions.map((version, i) => (
                  <div key={version.id}
                    className="flex items-center gap-4 p-4 bg-[#111620] border border-[#1e2a3a] rounded-xl hover:border-[#2a3a52] transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[rgba(201,168,76,.1)] flex items-center justify-center text-xs font-bold text-[#c9a84c]">
                      v{chapter.versions.length - i}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {version.wordCount.toLocaleString()} words
                      </p>
                      <p className="text-xs text-[#4a5a72]">
                        {new Date(version.createdAt).toLocaleString("en-NG")}
                      </p>
                    </div>
                    <button
                      onClick={() => restoreVersion(version.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#1e2a3a] text-[#8a9bb5] hover:text-[#c9a84c] hover:border-[#8a6f32] rounded-lg transition-all"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activePanel === "comments" && (
          <div className="p-6 overflow-y-auto h-full">
            <h3 className="font-bold text-white mb-4">
              Supervisor Comments
              {chapter.comments.length > 0 && (
                <span className="ml-2 text-xs px-2 py-0.5 bg-[rgba(224,82,82,.12)] text-[#e05252] border border-[rgba(224,82,82,.2)] rounded-full">
                  {chapter.comments.length} unresolved
                </span>
              )}
            </h3>
            {chapter.comments.length === 0 ? (
              <div className="text-center py-12 text-[#4a5a72]">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 text-[#1e2a3a]" />
                <p className="text-sm">No comments yet</p>
                <p className="text-xs mt-1 text-[#2a3a52]">Supervisor feedback will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {chapter.comments.map(comment => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-[#111620] border border-[rgba(224,82,82,.2)] rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[#e05252]">
                        {comment.author.name} · {comment.author.role}
                      </span>
                      <span className="text-xs text-[#2a3a52]">
                        {new Date(comment.createdAt).toLocaleDateString("en-NG")}
                      </span>
                    </div>
                    <p className="text-sm text-[#8a9bb5] leading-relaxed">{comment.content}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
