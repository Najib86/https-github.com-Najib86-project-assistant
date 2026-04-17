// src/app/(dashboard)/student/history/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Clock, Copy, Download, Eye, Sparkles, ChevronRight, Hash } from "lucide-react";
import toast from "react-hot-toast";

interface PromptRecord {
  id: string;
  title: string;
  wordCount: number;
  useCount: number;
  tags: string[];
  createdAt: string;
}

export default function HistoryPage() {
  const [prompts, setPrompts] = useState<PromptRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/prompts/generate?limit=20")
      .then(r => r.json())
      .then(data => {
        setPrompts(data.prompts ?? []);
        setTotal(data.pagination?.total ?? 0);
      })
      .finally(() => setLoading(false));
  }, []);

  async function copyPrompt(id: string) {
    try {
      const res = await fetch(`/api/prompts/${id}`);
      const data = await res.json();
      await navigator.clipboard.writeText(data.promptText);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy prompt");
    }
  }

  async function downloadPrompt(id: string, title: string) {
    try {
      const res = await fetch(`/api/prompts/${id}`);
      const data = await res.json();
      const blob = new Blob([data.promptText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.slice(0, 40).replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download prompt");
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Prompt History</h1>
          <p className="text-sm text-[#4a5a72] mt-0.5">{total} prompt{total !== 1 ? "s" : ""} generated</p>
        </div>
        <Link
          href="/generate"
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#c9a84c] to-[#8a6f32] text-[#0a0d12] font-bold text-sm rounded-xl hover:shadow-[0_8px_30px_rgba(201,168,76,.3)] hover:-translate-y-0.5 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          New Prompt
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-[#111620] border border-[#1e2a3a] rounded-xl p-5 animate-pulse">
              <div className="h-4 w-2/3 bg-[#1e2a3a] rounded mb-3" />
              <div className="flex gap-4">
                <div className="h-3 w-20 bg-[#1e2a3a] rounded" />
                <div className="h-3 w-16 bg-[#1e2a3a] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : prompts.length === 0 ? (
        <div className="text-center py-16 bg-[#111620] border border-[#1e2a3a] border-dashed rounded-xl">
          <BookOpen className="w-12 h-12 text-[#1e2a3a] mx-auto mb-4" />
          <p className="text-[#4a5a72] mb-4">No prompts generated yet</p>
          <Link href="/generate" className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#c9a84c] to-[#8a6f32] text-[#0a0d12] font-bold text-sm rounded-xl">
            <Sparkles className="w-4 h-4" />
            Generate Your First Prompt
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {prompts.map((prompt, i) => (
            <motion.div
              key={prompt.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-[#111620] border border-[#1e2a3a] rounded-xl p-5 hover:border-[#2a3a52] transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[rgba(201,168,76,.08)] border border-[rgba(201,168,76,.15)] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-[#c9a84c]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm line-clamp-2 mb-2 group-hover:text-[#c9a84c] transition-colors">
                    {prompt.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#4a5a72]">
                    <span className="flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      {prompt.wordCount.toLocaleString()} words
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(prompt.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </span>
                    {prompt.useCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        Used {prompt.useCount}×
                      </span>
                    )}
                  </div>
                  {prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {prompt.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-[#0d1117] border border-[#1e2a3a] text-[#4a5a72] text-[10px] rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => copyPrompt(prompt.id)}
                    className="p-1.5 rounded-lg text-[#4a5a72] hover:text-[#c9a84c] hover:bg-[rgba(201,168,76,.08)] transition-all"
                    title="Copy prompt"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => downloadPrompt(prompt.id, prompt.title)}
                    className="p-1.5 rounded-lg text-[#4a5a72] hover:text-[#2ecc8f] hover:bg-[rgba(46,204,143,.08)] transition-all"
                    title="Download .txt"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
