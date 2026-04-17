// src/app/(dashboard)/supervisor/accept-invite/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Loader2, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

interface AcceptedProject {
  id: string;
  title: string;
  level: string;
  owner: { name: string; email: string };
}

export default function AcceptInvitePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState<AcceptedProject | null>(null);
  const [error, setError] = useState("");

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to accept invitation");
      setAccepted(data.project);
      toast.success("You are now supervising this project!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept invitation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#8a6f32] flex items-center justify-center mb-4">
          <Users className="w-6 h-6 text-[#0a0d12]" />
        </div>
        <h1 className="text-2xl font-bold text-white font-display mb-1">Accept Invitation</h1>
        <p className="text-sm text-[#4a5a72]">
          Enter the supervisor code shared by a student to start supervising their project.
        </p>
      </div>

      {accepted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#111620] border border-[rgba(46,204,143,.3)] rounded-2xl p-8 text-center"
        >
          <div className="w-14 h-14 rounded-full bg-[rgba(46,204,143,.12)] flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-[#2ecc8f]" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Invitation Accepted!</h2>
          <p className="text-sm text-[#8a9bb5] mb-4">
            You are now supervising <span className="text-[#c9a84c] font-semibold">{accepted.owner.name}</span>'s project
          </p>
          <div className="bg-[#0d1117] border border-[#1e2a3a] rounded-xl p-4 mb-6 text-left">
            <p className="font-semibold text-white text-sm mb-1 line-clamp-2">{accepted.title}</p>
            <p className="text-xs text-[#4a5a72]">{accepted.level} · {accepted.owner.email}</p>
          </div>
          <button
            onClick={() => router.push(`/supervisor/projects/${accepted.id}`)}
            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-[#c9a84c] to-[#8a6f32] text-[#0a0d12] font-bold text-sm rounded-xl transition-all hover:shadow-[0_8px_25px_rgba(201,168,76,.3)]"
          >
            Review Project <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      ) : (
        <div className="bg-[#111620] border border-[#1e2a3a] rounded-2xl p-8">
          {error && (
            <div className="flex items-start gap-2.5 bg-[rgba(224,82,82,.08)] border border-[rgba(224,82,82,.2)] rounded-xl p-3.5 mb-5">
              <AlertCircle className="w-4 h-4 text-[#e05252] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#e05252]">{error}</p>
            </div>
          )}
          <form onSubmit={handleAccept} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-[#8a9bb5] uppercase tracking-wider mb-1.5 block">
                Supervisor Invitation Code
              </label>
              <input
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. DEMO-CODE-01"
                maxLength={20}
                className="w-full px-4 py-3 bg-[#0d1117] border border-[#1e2a3a] rounded-xl text-base text-white placeholder:text-[#2a3a52] focus:outline-none focus:border-[#8a6f32] font-mono tracking-widest text-center transition-all"
              />
              <p className="text-xs text-[#4a5a72] mt-2 text-center">
                Ask your student to share their invitation code from their project settings
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#c9a84c] to-[#8a6f32] text-[#0a0d12] font-bold text-sm rounded-xl hover:shadow-[0_8px_25px_rgba(201,168,76,.3)] transition-all disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
              {loading ? "Verifying..." : "Accept Invitation"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
