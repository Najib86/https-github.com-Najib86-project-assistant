// src/app/(dashboard)/supervisor/students/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users, Search, ChevronRight, CheckCircle,
  Clock, AlertCircle, BookOpen, Hash
} from "lucide-react";

interface StudentProject {
  id: string;
  title: string;
  level: string;
  status: string;
  progress: number;
  updatedAt: string;
  totalWords: number;
  chapters: Array<{ status: string }>;
  owner: { id: string; name: string; email: string; department: string | null };
  _count: { comments: number };
}

const PROJECT_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  DRAFT:        { color: "#4a8fff", label: "Draft"        },
  IN_PROGRESS:  { color: "#c9a84c", label: "In Progress"  },
  SUBMITTED:    { color: "#2ecc8f", label: "Submitted"    },
  UNDER_REVIEW: { color: "#e8c76a", label: "Under Review" },
  APPROVED:     { color: "#2ecc8f", label: "Approved"     },
  REJECTED:     { color: "#e05252", label: "Needs Work"   },
};

export default function SupervisorStudentsPage() {
  const [projects, setProjects] = useState<StudentProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/projects?limit=50")
      .then(r => r.json())
      .then(data => {
        setProjects(data.projects ?? []);
        setTotal(data.pagination?.total ?? 0);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? projects.filter(p =>
        p.owner.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.title.toLowerCase().includes(search.toLowerCase())
      )
    : projects;

  const stats = {
    total: projects.length,
    approved: projects.filter(p => p.status === "APPROVED").length,
    awaitingReview: projects.filter(p => p.status === "SUBMITTED" || p.status === "UNDER_REVIEW").length,
    withComments: projects.filter(p => p._count.comments > 0).length,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Supervised Students</h1>
          <p className="text-sm text-[#4a5a72] mt-0.5">{total} student{total !== 1 ? "s" : ""} supervised</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total",          val: stats.total,          icon: Users,        color: "#c9a84c" },
          { label: "Approved",       val: stats.approved,       icon: CheckCircle,  color: "#2ecc8f" },
          { label: "Needs Review",   val: stats.awaitingReview, icon: Clock,        color: "#e8c76a" },
          { label: "Has Comments",   val: stats.withComments,   icon: AlertCircle,  color: "#e05252" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-[#111620] border border-[#1e2a3a] rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${s.color}20`, border: `1px solid ${s.color}30` }}>
                <Icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-lg font-bold text-white font-display leading-none">{s.val}</p>
                <p className="text-xs text-[#4a5a72]">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a5a72]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search students or project titles..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#111620] border border-[#1e2a3a] rounded-xl text-sm text-white placeholder:text-[#2a3a52] focus:outline-none focus:border-[#8a6f32] transition-all"
        />
      </div>

      {/* Students list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-[#111620] border border-[#1e2a3a] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#111620] border border-[#1e2a3a] border-dashed rounded-xl">
          <Users className="w-12 h-12 text-[#1e2a3a] mx-auto mb-4" />
          <p className="text-[#4a5a72]">{search ? "No students match your search" : "No supervised students yet"}</p>
          {!search && (
            <p className="text-xs text-[#2a3a52] mt-2">
              Students will appear here when they invite you via their project settings
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((project, i) => {
            const st = PROJECT_STATUS_CONFIG[project.status] ?? PROJECT_STATUS_CONFIG.DRAFT;
            const approvedChapters = project.chapters.filter(c => c.status === "APPROVED").length;
            const submittedChapters = project.chapters.filter(c =>
              c.status === "SUBMITTED" || c.status === "UNDER_REVIEW"
            ).length;

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-[#111620] border border-[#1e2a3a] rounded-xl overflow-hidden hover:border-[#2a3a52] transition-all group"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1F4E79] to-[#0d1117] border border-[#2a3a52] flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-[#c9a84c]">
                        {project.owner.name?.charAt(0).toUpperCase() ?? "?"}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Student info */}
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-white">{project.owner.name}</span>
                        {project.owner.department && (
                          <span className="text-xs text-[#4a5a72]">· {project.owner.department}</span>
                        )}
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ color: st.color, background: `${st.color}15` }}
                        >
                          {st.label}
                        </span>
                        {project._count.comments > 0 && (
                          <span className="flex items-center gap-1 text-xs text-[#e05252]">
                            <AlertCircle className="w-3 h-3" />
                            {project._count.comments} comment{project._count.comments !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>

                      {/* Project title */}
                      <p className="text-sm text-[#8a9bb5] line-clamp-1 mb-3 group-hover:text-[#c9a84c] transition-colors">
                        {project.title}
                      </p>

                      {/* Chapter progress */}
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex gap-1 flex-1 min-w-32">
                          {project.chapters.sort((a, b) =>
                            ["NOT_STARTED","DRAFT","SUBMITTED","UNDER_REVIEW","APPROVED","NEEDS_REVISION"].indexOf(a.status) -
                            ["NOT_STARTED","DRAFT","SUBMITTED","UNDER_REVIEW","APPROVED","NEEDS_REVISION"].indexOf(b.status)
                          ).map((ch, ci) => (
                            <div key={ci} className="flex-1">
                              <div className={`h-1.5 rounded-sm ${
                                ch.status === "APPROVED"     ? "bg-[#2ecc8f]" :
                                ch.status === "SUBMITTED" || ch.status === "UNDER_REVIEW" ? "bg-[#c9a84c]" :
                                ch.status === "DRAFT"        ? "bg-[#4a8fff]" :
                                ch.status === "NEEDS_REVISION" ? "bg-[#e05252]" :
                                "bg-[#1e2a3a]"
                              }`} />
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-[#4a5a72] flex-wrap">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-[#2ecc8f]" />
                            {approvedChapters}/5 approved
                          </span>
                          {submittedChapters > 0 && (
                            <span className="flex items-center gap-1 text-[#c9a84c]">
                              <Clock className="w-3 h-3" />
                              {submittedChapters} awaiting review
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            {(project.totalWords ?? 0).toLocaleString()} words
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* View button */}
                    <Link
                      href={`/supervisor/projects/${project.id}`}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 border border-[#1e2a3a] text-[#8a9bb5] hover:text-[#c9a84c] hover:border-[#8a6f32] rounded-xl text-xs font-medium transition-all"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Review
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
