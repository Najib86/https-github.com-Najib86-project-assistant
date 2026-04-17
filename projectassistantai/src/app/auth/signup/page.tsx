// src/app/auth/signup/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, GraduationCap, AlertCircle, CheckCircle } from "lucide-react";

type Role = "STUDENT" | "SUPERVISOR";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    role: "STUDENT" as Role, department: "", faculty: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const upd = (field: string, value: string) =>
    setForm(p => ({ ...p, [field]: value }));

  // Password strength
  const strength = [
    { label: "8+ characters",   ok: form.password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(form.password) },
    { label: "Number",           ok: /[0-9]/.test(form.password) },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!strength.every(s => s.ok)) {
      setError("Password does not meet requirements.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email.toLowerCase(),
          password: form.password,
          role: form.role,
          department: form.department || undefined,
          faculty: form.faculty || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Registration failed");

      setSuccess(data.message ?? "Account created! Check your email to verify.");
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0d12] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#111620] border border-[rgba(46,204,143,.3)] rounded-2xl p-10 text-center max-w-md w-full"
        >
          <div className="w-16 h-16 rounded-full bg-[rgba(46,204,143,.12)] flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-[#2ecc8f]" />
          </div>
          <h2 className="text-xl font-bold text-white font-display mb-2">Check your email</h2>
          <p className="text-sm text-[#8a9bb5]">{success}</p>
          <p className="text-xs text-[#4a5a72] mt-4">Redirecting to login...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0d12] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-40 pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-[rgba(201,168,76,.03)] rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#8a6f32] shadow-glow-gold mb-3">
            <GraduationCap className="w-6 h-6 text-[#0a0d12]" />
          </div>
          <h1 className="text-2xl font-bold text-white font-display">Create your account</h1>
          <p className="text-sm text-[#4a5a72] mt-1">Join Nigeria&apos;s Premier Academic AI Platform</p>
        </div>

        <div className="bg-[#111620] border border-[#1e2a3a] rounded-2xl p-7 shadow-card">
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-2.5 bg-[rgba(224,82,82,.08)] border border-[rgba(224,82,82,.2)] rounded-xl p-3.5 mb-5"
            >
              <AlertCircle className="w-4 h-4 text-[#e05252] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#e05252]">{error}</p>
            </motion.div>
          )}

          {/* Google */}
          <button
            onClick={() => { setGoogleLoading(true); signIn("google", { callbackUrl: "/dashboard" }); }}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 bg-[#0d1117] border border-[#1e2a3a] rounded-xl text-sm font-medium text-[#8a9bb5] hover:border-[#2a3a52] hover:text-white transition-all mb-5 disabled:opacity-60"
          >
            {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#1e2a3a]" />
            <span className="text-xs text-[#2a3a52]">or</span>
            <div className="flex-1 h-px bg-[#1e2a3a]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div>
              <label className="text-xs font-semibold text-[#8a9bb5] uppercase tracking-wider mb-2 block">I am a</label>
              <div className="grid grid-cols-2 gap-2">
                {(["STUDENT", "SUPERVISOR"] as Role[]).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => upd("role", r)}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                      form.role === r
                        ? "border-[#8a6f32] bg-[rgba(201,168,76,.08)] text-[#c9a84c]"
                        : "border-[#1e2a3a] text-[#4a5a72] hover:border-[#2a3a52] hover:text-[#8a9bb5]"
                    }`}
                  >
                    {r === "STUDENT" ? "🎓 Student" : "👨‍🏫 Supervisor"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#8a9bb5] uppercase tracking-wider mb-1.5 block">Full Name</label>
              <input
                value={form.name}
                onChange={e => upd("name", e.target.value)}
                placeholder="Surname, Firstname Middlename"
                required
                className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-[#1e2a3a] rounded-xl text-sm text-white placeholder:text-[#2a3a52] focus:outline-none focus:border-[#8a6f32] transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#8a9bb5] uppercase tracking-wider mb-1.5 block">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => upd("email", e.target.value)}
                placeholder="you@university.edu.ng"
                required
                className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-[#1e2a3a] rounded-xl text-sm text-white placeholder:text-[#2a3a52] focus:outline-none focus:border-[#8a6f32] transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#8a9bb5] uppercase tracking-wider mb-1.5 block">Department</label>
                <input
                  value={form.department}
                  onChange={e => upd("department", e.target.value)}
                  placeholder="Mass Communication"
                  className="w-full px-3 py-2.5 bg-[#0d1117] border border-[#1e2a3a] rounded-xl text-sm text-white placeholder:text-[#2a3a52] focus:outline-none focus:border-[#8a6f32] transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8a9bb5] uppercase tracking-wider mb-1.5 block">Faculty</label>
                <input
                  value={form.faculty}
                  onChange={e => upd("faculty", e.target.value)}
                  placeholder="Social Sciences"
                  className="w-full px-3 py-2.5 bg-[#0d1117] border border-[#1e2a3a] rounded-xl text-sm text-white placeholder:text-[#2a3a52] focus:outline-none focus:border-[#8a6f32] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#8a9bb5] uppercase tracking-wider mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={e => upd("password", e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 pr-10 bg-[#0d1117] border border-[#1e2a3a] rounded-xl text-sm text-white placeholder:text-[#2a3a52] focus:outline-none focus:border-[#8a6f32] transition-all"
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a5a72] hover:text-[#8a9bb5]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="flex gap-3 mt-2">
                  {strength.map(s => (
                    <span key={s.label} className={`text-[10px] font-medium ${s.ok ? "text-[#2ecc8f]" : "text-[#2a3a52]"}`}>
                      {s.ok ? "✓" : "○"} {s.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-[#8a9bb5] uppercase tracking-wider mb-1.5 block">Confirm Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={e => upd("confirmPassword", e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-[#1e2a3a] rounded-xl text-sm text-white placeholder:text-[#2a3a52] focus:outline-none focus:border-[#8a6f32] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#c9a84c] to-[#8a6f32] text-[#0a0d12] font-bold text-sm rounded-xl hover:shadow-[0_8px_30px_rgba(201,168,76,.35)] hover:-translate-y-0.5 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-[#4a5a72] mt-5">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#c9a84c] hover:text-[#e8c76a] font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
