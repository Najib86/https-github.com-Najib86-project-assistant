// src/app/(dashboard)/supervisor/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users, FolderOpen, MessageSquare, CheckCircle,
  Clock, ChevronRight, AlertCircle, TrendingUp
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  project: {
    id: string;
    title: string;
    status: string;
    progress: number;
    updatedAt: string;
    _count: { comments: number };
  } | null;
}

export default function SupervisorDashboard() {
  const { data: session } = useSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, needsReview: 0 });
  const [loading, setLoading] = useState(true);
  const firstName = session?.user?.name?.split(" ")[0] ?? "Supervisor";

  useEffect(() => {
    fetch("/api/projects?limit=20")
      .then(r => r.json())
      .then(data => {
        const projects = data.projects ?? [];
        setStats({
          total: data.pagination?.total ?? 0,
          approved:    projects.filter((p: { status: string }) => p.status === "APPROVED").length,
          pending:     projects.filter((p: { status: string }) => p.status === "SUBMITTED").length,
          needsReview: projects.filter((p: { status: string }) => p.status === "UNDER_REVIEW").length,
        });

        // Map projects to student view
        setStudents(
          projects.slice(0, 8).map((p: {
            id: string; title: string; status: string; progress: number;
            updatedAt: string; _count: { comments: number };
            owner: { id: string; name: string; email: string };
          }) => ({
            id: p.owner.id,
            name: p.owner.name,
            email: p.owner.email,
            project: {
              id: p.id, title: p.title, status: p.status,
              progress: p.progress, updatedAt: p.updatedAt, _count: p._count,
            },
          }))
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Total Students", value: stats.total,      icon: Users,        color: "#c9a84c" },
    { label: "Approved",       value: stats.approved,   icon: CheckCircle,  color: "#2ecc8f" },
    { label: "Awaiting Review",value: stats.pending,    icon: Clock,        color: "#e8c76a" },
    { label: "Under Review",   value: stats.needsReview,icon: TrendingUp,   color: "#4a8fff" },
  ];

  const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    DRAFT:        { label: "Draft",        color: "#4a8fff" },
    IN_PROGRESS:  { label: "In Progress",  color: "#c9a84c" },
    SUBMITTED:    { label: "Submitted",    color: "#2ecc8f" },
    UNDER_REVIEW: { label: "Under Review", color: "#e8c76a" },
    APPROVED:     { label: "Approved",     color: "#2ecc8f" },
    REJECTED:     { label: "Needs Work",   color: "#e05252" },
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="mb-7">
        <h1 className="text-2xl font-bold text-white font-display">
          Good day, <span className="text-[#c9a84c]">{firstName}</span>
        </h1>
        <p className="text-sm text-[#8a9bb5] mt-0.5">Review and manage your students&apos; research projects</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}
              transition={{ delay: 0.1+i*0.05 }}
              className="bg-[#111620] border border-[#1e2a3a] rounded-xl p-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ background:`${card.color}20`, border:`1px solid ${card.color}30` }}>
                <Icon className="w-4 h-4" style={{ color:card.color }} />
              </div>
              {loading ? <div className="h-7 w-12 bg-[#1e2a3a] rounded animate-pulse mb-1" /> :
                <p className="text-2xl font-bold text-white font-display">{card.value}</p>}
              <p className="text-xs text-[#4a5a72]">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Students list */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white">Supervised Students</h2>
          <Link href="/supervisor/students" className="text-xs text-[#c9a84c] hover:text-[#e8c76a] flex items-center gap-1">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-[#111620] border border-[#1e2a3a] rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1e2a3a]" />
                  <div className="flex-1">
                    <div className="h-4 w-1/3 bg-[#1e2a3a] rounded mb-2" />
                    <div className="h-3 w-2/3 bg-[#1e2a3a] rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12 bg-[#111620] border border-[#1e2a3a] border-dashed rounded-xl">
            <Users className="w-10 h-10 text-[#1e2a3a] mx-auto mb-3" />
            <p className="text-sm text-[#4a5a72]">No students supervised yet</p>
            <p className="text-xs text-[#2a3a52] mt-1">Students can invite you via their project settings</p>
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((student, i) => {
              const st = student.project
                ? STATUS_CONFIG[student.project.status] ?? STATUS_CONFIG.DRAFT
                : null;
              return (
                <motion.div key={student.id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay: i*0.04 }}
                  className="bg-[#111620] border border-[#1e2a3a] rounded-xl p-4 hover:border-[#2a3a52] transition-all"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1F4E79] to-[#0d1117] border border-[#2a3a52] flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-[#c9a84c]">
                        {student.name?.charAt(0).toUpperCase() ?? "?"}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-semibold text-white text-sm">{student.name}</span>
                        {st && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#0d1117]"
                            style={{ color: st.color }}>
                            {st.label}
                          </span>
                        )}
                        {student.project && student.project._count.comments > 0 && (
                          <span className="flex items-center gap-1 text-xs text-[#e05252]">
                            <AlertCircle className="w-3 h-3" />
                            {student.project._count.comments} unresolved
                          </span>
                        )}
                      </div>
                      {student.project && (
                        <p className="text-xs text-[#4a5a72] truncate">{student.project.title}</p>
                      )}
                    </div>

                    {student.project && (
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-bold text-[#c9a84c]">{student.project.progress}%</p>
                          <p className="text-xs text-[#2a3a52]">complete</p>
                        </div>
                        <Link
                          href={`/supervisor/projects/${student.project.id}`}
                          className="p-2 rounded-lg border border-[#1e2a3a] text-[#4a5a72] hover:text-[#c9a84c] hover:border-[#8a6f32] transition-all"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
