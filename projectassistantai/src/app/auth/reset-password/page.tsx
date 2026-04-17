// src/app/auth/reset-password/page.tsx
"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, Eye, EyeOff, Loader2, Lock, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const strength = [
    { label: "8+ chars",      ok: form.password.length >= 8 },
    { label: "Uppercase",     ok: /[A-Z]/.test(form.password) },
    { label: "Number",        ok: /[0-9]/.test(form.password) },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Passwords don't match"); return; }
    if (!strength.every(s => s.ok)) { toast.error("Password too weak"); return; }
    if (!token) { toast.error("Invalid reset link"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Reset failed");
      setDone(true);
      setTimeout(() => router.push("/auth/login"), 2500);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0a0d12] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-[#e05252] mb-4">Invalid reset link</p>
          <Link href="/auth/forgot-password" className="text-[#c9a84c] hover:text-[#e8c76a]">
            Request a new one →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0d12] flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none opacity-40"
        style={{ backgroundImage: "linear-gradient(rgba(201,168,76,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.03) 1px,transparent 1px)", backgroundSize: "50px 50px" }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#8a6f32] mb-3">
            <GraduationCap className="w-6 h-6 text-[#0a0d12]" />
          </div>
          <h1 className="text-2xl font-bold text-white font-display">New Password</h1>
        </div>

        <div className="bg-[#111620] border border-[#1e2a3a] rounded-2xl p-8 shadow-[0_0_40px_rgba(0,0,0,.5)]">
          {done ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[rgba(46,204,143,.12)] flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-[#2ecc8f]" />
              </div>
              <h3 className="font-bold text-white mb-2">Password updated!</h3>
              <p className="text-sm text-[#8a9bb5]">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#8a9bb5] uppercase tracking-wider mb-1.5 block">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 py-2.5 pr-10 bg-[#0d1117] border border-[#1e2a3a] rounded-xl text-sm text-white placeholder:text-[#2a3a52] focus:outline-none focus:border-[#8a6f32] transition-all"
                  />
                  <button type="button" onClick={() => setShow(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a5a72] hover:text-[#8a9bb5]">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.password && (
                  <div className="flex gap-3 mt-2">
                    {strength.map(s => (
                      <span key={s.label}
                        className={`text-[10px] font-medium ${s.ok ? "text-[#2ecc8f]" : "text-[#2a3a52]"}`}>
                        {s.ok ? "✓" : "○"} {s.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8a9bb5] uppercase tracking-wider mb-1.5 block">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={form.confirm}
                  onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-[#1e2a3a] rounded-xl text-sm text-white placeholder:text-[#2a3a52] focus:outline-none focus:border-[#8a6f32] transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#c9a84c] to-[#8a6f32] text-[#0a0d12] font-bold text-sm rounded-xl hover:shadow-[0_8px_25px_rgba(201,168,76,.3)] transition-all disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
