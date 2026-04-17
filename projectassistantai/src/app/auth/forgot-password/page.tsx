// src/app/auth/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, ArrowLeft, Send, Loader2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-2xl font-bold text-white font-display">Reset Password</h1>
          <p className="text-sm text-[#4a5a72] mt-1">We'll send you a reset link</p>
        </div>

        <div className="bg-[#111620] border border-[#1e2a3a] rounded-2xl p-8 shadow-[0_0_40px_rgba(0,0,0,.5)]">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-full bg-[rgba(46,204,143,.12)] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-[#2ecc8f]" />
                </div>
                <h3 className="font-bold text-white mb-2">Check your email</h3>
                <p className="text-sm text-[#8a9bb5] mb-6">
                  If <span className="text-[#c9a84c]">{email}</span> is registered, 
                  a password reset link has been sent. Check your spam folder too.
                </p>
                <Link href="/auth/login"
                  className="flex items-center justify-center gap-2 w-full py-2.5 border border-[#1e2a3a] text-[#8a9bb5] hover:text-white hover:border-[#2a3a52] rounded-xl text-sm font-medium transition-all">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-semibold text-[#8a9bb5] uppercase tracking-wider mb-1.5 block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@university.edu.ng"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-[#1e2a3a] rounded-xl text-sm text-white placeholder:text-[#2a3a52] focus:outline-none focus:border-[#8a6f32] transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#c9a84c] to-[#8a6f32] text-[#0a0d12] font-bold text-sm rounded-xl hover:shadow-[0_8px_25px_rgba(201,168,76,.3)] hover:-translate-y-0.5 transition-all disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center gap-2 w-full py-2 text-sm text-[#4a5a72] hover:text-[#8a9bb5] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Login
                </Link>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
