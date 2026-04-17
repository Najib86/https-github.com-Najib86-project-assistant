// src/app/(dashboard)/student/projects/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus, FolderOpen, Search, Filter, BookOpen, Clock,
  CheckCircle, AlertCircle, ChevronRight, Sparkles
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  topic: string;
  level: string;
  status: string;
  progress: number;
  updatedAt: string;
  createdAt: string;
  chapters: Array<{ number: number; status: string; wordCount: number }>;
  supervisor: { name: string } | null;
  _count: { comments: number };
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; border: string }> = {
  DRAFT:        { label: "Draft",        color: "#4a8fff", bg: "rgba(74,143,255,.08)",  border: "rgba(74,143,255,.2)"  },
  IN_PROGRESS:  { label: "In Progress",  color: "#c9a84c", bg: "rgba(201,168,76,.08)",  border: "rgba(201,168,76,.2)"  },
  SUBMITTED:    { label: "Submitted",    color: "#2ecc8f", bg: "rgba(46,204,143,.08)",  border: "rgba(46,204,143,.2)"  },
  UNDER_REVIEW: { label: "Under Review", color: "#e8c76a", bg: "rgba(232,199,106,.08)", border: "rgba(232,199,106,.2)" },
  APPROVED:     { label: "Approved",     color: "#2ecc8f", bg: "rgba(46,204,143,.12)",  border: "rgba(46,204,143,.3)"  },
  REJECTED:     { label: "Needs Work",   color: "#e05252", bg: "rgba(224,82,82,.08)",   border: "rgba(224,82,82,.2)"   },
};

const CHAPTER_NAMES = ["Introduction", "Lit Review", "Methodology", "Analysis", "Conclusion"];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch(`/api/projects${filter !== "ALL" ? `?status=${filter}` : ""}`)
      .then(r => r.json())
      .then(data => {
        setProjects(data.projects ?? []);
        setTotal(data.pagination?.total ?? 0);
      })
      .finally(() => setLoading(false));
  }, [filter]);

  const filtered = search
    ? projects.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.topic.toLowerCase().includes(search.toLowerCase())
      )
    : projects;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">My Projects</h1>
          <p className="text-sm text-[#4a5a72] mt-0.5">{total} project{total !== 1 ? "s" : ""} total</p>
        </div>
        <Link
          href="/student/projects/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#c9a84c] to-[#8a6f32] text-[#0a0d12] font-bold text-sm rounded-xl hover:shadow-[0_8px_30px_rgba(201,168,76,.3)] hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a5a72]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#111620] border border-[#1e2a3a] rounded-xl text-sm text-white placeholder:text-[#2a3a52] focus:outline-none focus:border-[#8a6f32] transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["ALL", "DRAFT", "IN_PROGRESS", "SUBMITTED", "APPROVED"].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                filter === s
                  ? "border-[#8a6f32] bg-[rgba(201,168,76,.08)] text-[#c9a84c]"
                  : "border-[#1e2a3a] text-[#4a5a72] hover:border-[#2a3a52] hover:text-[#8a9bb5]"
              }`}
            >
              {s === "ALL" ? "All" : STATUS_MAP[s]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      {/* Projects grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-[#111620] border border-[#1e2a3a] rounded-xl p-5 animate-pulse">
              <div className="h-4 w-3/4 bg-[#1e2a3a] rounded mb-3" />
              <div className="h-3 w-1/2 bg-[#1e2a3a] rounded mb-5" />
              <div className="flex gap-2">
                {[1,2,3,4,5].map(j => <div key={j} className="flex-1 h-1.5 bg-[#1e2a3a] rounded" />)}
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-12 h-12 text-[#1e2a3a] mx-auto mb-4" />
          <p className="text-[#4a5a72] mb-2">
            {search ? "No projects match your search" : "No projects yet"}
          </p>
          {!search && (
            <Link
              href="/student/projects/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2a3a] text-[#8a9bb5] hover:text-[#c9a84c] rounded-xl text-sm font-medium transition-all mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Create your first project
            </Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((project, i) => {
            const st = STATUS_MAP[project.status] ?? STATUS_MAP.DRAFT;
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  href={`/student/projects/${project.id}`}
                  className="block bg-[#111620] border border-[#1e2a3a] rounded-xl p-5 hover:border-[#2a3a52] hover:-translate-y-0.5 transition-all group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-[#c9a84c] transition-colors leading-snug">
                        {project.title}
                      </h3>
                      <p className="text-xs text-[#4a5a72] mt-1">
                        {project.level} · {new Date(project.updatedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <span
                      className="flex-shrink-0 text-xs font-semibold px-2 py-1 rounded-full border whitespace-nowrap"
                      style={{ color: st.color, background: st.bg, borderColor: st.border }}
                    >
                      {st.label}
                    </span>
                  </div>

                  {/* Chapters progress bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-[#4a5a72] mb-1.5">
                      <span>Chapters</span>
                      <span className="text-[#8a9bb5] font-medium">{project.progress}%</span>
                    </div>
                    <div className="flex gap-1.5">
                      {project.chapters.sort((a, b) => a.number - b.number).map(ch => {
                        const isApproved = ch.status === "APPROVED";
                        const isDraft = ch.status === "DRAFT" || ch.status === "SUBMITTED" || ch.status === "UNDER_REVIEW";
                        return (
                          <div key={ch.number} className="flex-1 group/ch relative">
                            <div className={`h-2 rounded-sm transition-all ${
                              isApproved ? "bg-[#2ecc8f]" :
                              isDraft    ? "bg-[#c9a84c]" :
                              "bg-[#1e2a3a]"
                            }`} />
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-1.5 mt-1">
                      {CHAPTER_NAMES.map((name, i) => (
                        <span key={name} className="flex-1 text-[9px] text-[#2a3a52] text-center truncate">{i + 1}</span>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#0d1117]">
                    <div className="flex items-center gap-3 text-xs text-[#4a5a72]">
                      {project.supervisor && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {project.supervisor.name}
                        </span>
                      )}
                      {project._count.comments > 0 && (
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {project._count.comments} comment{project._count.comments !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#2a3a52] group-hover:text-[#c9a84c] transition-colors" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
