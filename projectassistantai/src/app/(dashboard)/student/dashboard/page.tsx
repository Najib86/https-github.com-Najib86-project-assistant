// src/app/(dashboard)/student/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FolderOpen, Sparkles, BookOpen, TrendingUp, Clock,
  ChevronRight, Plus, FileText, CheckCircle, AlertCircle, Circle
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  level: string;
  status: string;
  progress: number;
  updatedAt: string;
  chapters: Array<{ number: number; status: string; wordCount: number }>;
}

interface DashboardStats {
  totalProjects: number;
  totalPrompts: number;
  totalChapters: number;
  totalWords: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:       { label: "Draft",        color: "#4a8fff", bg: "rgba(74,143,255,.12)" },
  IN_PROGRESS: { label: "In Progress",  color: "#c9a84c", bg: "rgba(201,168,76,.12)" },
  SUBMITTED:   { label: "Submitted",    color: "#2ecc8f", bg: "rgba(46,204,143,.12)" },
  APPROVED:    { label: "Approved",     color: "#2ecc8f", bg: "rgba(46,204,143,.15)" },
  UNDER_REVIEW:{ label: "Under Review", color: "#e8c76a", bg: "rgba(232,199,106,.12)" },
};

const CHAPTER_STATUS_ICON: Record<string, React.ElementType> = {
  NOT_STARTED: Circle,
  DRAFT:       FileText,
  SUBMITTED:   Clock,
  APPROVED:    CheckCircle,
  NEEDS_REVISION: AlertCircle,
};

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0, totalPrompts: 0, totalChapters: 0, totalWords: 0,
  });
  const [loading, setLoading] = useState(true);
  const firstName = session?.user?.name?.split(" ")[0] ?? "Student";

  useEffect(() => {
    async function load() {
      try {
        const [projectsRes, promptsRes] = await Promise.all([
          fetch("/api/projects?limit=5"),
          fetch("/api/prompts/generate?limit=1"),
        ]);
        const projectsData = await projectsRes.json();
        const promptsData = await promptsRes.json();

        if (projectsData.projects) {
          setProjects(projectsData.projects);
          const totalWords = projectsData.projects.reduce((acc: number, p: Project) =>
            acc + p.chapters.reduce((a: number, c: { wordCount: number }) => a + c.wordCount, 0), 0);
          const totalChapters = projectsData.projects.reduce((acc: number, p: Project) =>
            acc + p.chapters.filter((c: { status: string }) => c.status !== "NOT_STARTED").length, 0);
          setStats({
            totalProjects: projectsData.pagination?.total ?? 0,
            totalPrompts: promptsData.pagination?.total ?? 0,
            totalChapters,
            totalWords,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards = [
    { label: "Total Projects",   value: stats.totalProjects, icon: FolderOpen,  color: "#c9a84c" },
    { label: "Prompts Generated",value: stats.totalPrompts,  icon: Sparkles,    color: "#2ecc8f" },
    { label: "Chapters Written", value: stats.totalChapters, icon: BookOpen,    color: "#4a8fff" },
    { label: "Words Generated",  value: stats.totalWords > 999
        ? `${(stats.totalWords / 1000).toFixed(1)}k` : stats.totalWords,
      icon: TrendingUp, color: "#e8c76a" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white font-display mb-1">
          Welcome back, <span className="text-[#c9a84c]">{firstName}</span> 👋
        </h1>
        <p className="text-sm text-[#8a9bb5]">
          Continue working on your research projects or generate a new prompt.
        </p>
      </motion.div>

      {/* Quick action */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-8 p-5 bg-gradient-to-r from-[rgba(201,168,76,.1)] via-[rgba(201,168,76,.05)] to-transparent border border-[rgba(201,168,76,.2)] rounded-xl flex items-center justify-between gap-4 flex-wrap"
      >
        <div>
          <p className="font-bold text-white mb-0.5">Generate your complete research project</p>
          <p className="text-sm text-[#8a9bb5]">Produce a 90–120 page NOUN-compliant project with AI — chapters, tables, charts, and references.</p>
        </div>
        <Link
          href="/generate"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#c9a84c] to-[#8a6f32] text-[#0a0d12] font-bold text-sm rounded-lg hover:shadow-[0_8px_30px_rgba(201,168,76,.35)] hover:-translate-y-0.5 transition-all whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4" />
          Generate Prompt
        </Link>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-[#111620] border border-[#1e2a3a] rounded-xl p-4 hover:border-[#2a3a52] transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${card.color}20`, border: `1px solid ${card.color}30` }}
                >
                  <Icon className="w-4 h-4" style={{ color: card.color }} />
                </div>
              </div>
              {loading ? (
                <div className="h-7 w-16 bg-[#1e2a3a] rounded animate-pulse mb-1" />
              ) : (
                <p className="text-2xl font-bold text-white font-display">{card.value}</p>
              )}
              <p className="text-xs text-[#4a5a72] mt-0.5">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Projects + New Project */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">Recent Projects</h2>
            <Link href="/student/projects" className="text-xs text-[#c9a84c] hover:text-[#e8c76a] flex items-center gap-1 transition-colors">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="bg-[#111620] border border-[#1e2a3a] rounded-xl p-4 animate-pulse">
                  <div className="h-4 w-3/4 bg-[#1e2a3a] rounded mb-3" />
                  <div className="h-2 w-full bg-[#1e2a3a] rounded" />
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-[#111620] border border-[#1e2a3a] border-dashed rounded-xl p-8 text-center">
              <FolderOpen className="w-10 h-10 text-[#2a3a52] mx-auto mb-3" />
              <p className="text-sm text-[#4a5a72] mb-4">No projects yet. Create your first research project.</p>
              <Link
                href="/student/projects/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2a3a] text-[#8a9bb5] hover:text-[#c9a84c] hover:bg-[rgba(201,168,76,.08)] rounded-lg text-sm font-medium transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                New Project
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map(project => {
                const st = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.DRAFT;
                return (
                  <Link
                    key={project.id}
                    href={`/student/projects/${project.id}`}
                    className="block bg-[#111620] border border-[#1e2a3a] rounded-xl p-4 hover:border-[#2a3a52] hover:-translate-y-0.5 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm truncate group-hover:text-[#c9a84c] transition-colors">
                          {project.title}
                        </p>
                        <p className="text-xs text-[#4a5a72] mt-0.5">{project.level} · Updated {new Date(project.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <span
                        className="flex-shrink-0 text-xs font-semibold px-2 py-1 rounded-full"
                        style={{ color: st.color, background: st.bg }}
                      >
                        {st.label}
                      </span>
                    </div>

                    {/* Chapter progress dots */}
                    <div className="flex items-center gap-2">
                      {project.chapters.sort((a, b) => a.number - b.number).map(ch => {
                        const Icon = CHAPTER_STATUS_ICON[ch.status] ?? Circle;
                        const isApproved = ch.status === "APPROVED";
                        const isDraft = ch.status === "DRAFT" || ch.status === "SUBMITTED";
                        return (
                          <div key={ch.number} className="flex-1">
                            <div className={`h-1.5 rounded-full transition-all ${
                              isApproved ? "bg-[#2ecc8f]" :
                              isDraft    ? "bg-[#c9a84c]" :
                              "bg-[#1e2a3a]"
                            }`} />
                          </div>
                        );
                      })}
                      <span className="text-xs text-[#4a5a72] whitespace-nowrap ml-1">
                        {project.progress}%
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h2 className="font-bold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { href: "/student/projects/new", icon: Plus,         label: "New Project",          desc: "Start a research project" },
              { href: "/generate",             icon: Sparkles,      label: "Generate Prompt",      desc: "Create a master AI prompt" },
              { href: "/student/history",      icon: BookOpen,      label: "Prompt History",       desc: "View past generations" },
            ].map(action => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 p-3.5 bg-[#111620] border border-[#1e2a3a] rounded-xl hover:border-[#8a6f32] hover:bg-[rgba(201,168,76,.04)] transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-[rgba(201,168,76,.08)] border border-[rgba(201,168,76,.15)] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[#c9a84c]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white group-hover:text-[#c9a84c] transition-colors">{action.label}</p>
                    <p className="text-xs text-[#4a5a72]">{action.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#2a3a52] group-hover:text-[#c9a84c] transition-colors" />
                </Link>
              );
            })}
          </div>

          {/* Platform stats */}
          <div className="mt-6 p-4 bg-[#111620] border border-[#1e2a3a] rounded-xl">
            <p className="text-xs font-bold text-[#4a5a72] uppercase tracking-wider mb-3">Platform Stats</p>
            {[
              { label: "Pages Generated",  val: "109+" },
              { label: "Charts & Figures", val: "14"   },
              { label: "Data Tables",      val: "9"    },
              { label: "APA References",   val: "55+"  },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-[#0d1117] last:border-0">
                <span className="text-xs text-[#4a5a72]">{s.label}</span>
                <span className="text-xs font-bold text-[#c9a84c]">{s.val}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
