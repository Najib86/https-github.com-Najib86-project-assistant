// src/app/auth/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, GraduationCap, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const errorParam = searchParams.get("error");

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(errorParam ? "Authentication failed. Please try again." : "");

  const errorMessages: Record<string, string> = {
    OAuthAccountNotLinked: "This email is linked to a different sign-in method.",
    CredentialsSignin: "Invalid email or password.",
    EmailNotVerified: "Please verify your email before logging in.",
    AccountLocked: "Account temporarily locked. Please try again later.",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: form.email.toLowerCase(),
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      setError(errorMessages[result.error] ?? result.error);
      setLoading(false);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl });
  }

  return (
    <div className="min-h-screen bg-[#0a0d12] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[rgba(201,168,76,.04)] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[rgba(46,204,143,.03)] rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c9a84c] to-[#8a6f32] shadow-glow-gold mb-4">
            <GraduationCap className="w-7 h-7 text-[#0a0d12]" />
          </div>
          <h1 className="text-2xl font-bold text-white font-display">Welcome back</h1>
          <p className="text-sm text-[#4a5a72] mt-1">Sign in to ProjectAssistantAI</p>
        </div>

        {/* Card */}
        <div className="bg-[#111620] border border-[#1e2a3a] rounded-2xl p-8 shadow-card" style={{ boxShadow: "0 0 40px rgba(0,0,0,.5), 0 0 80px rgba(201,168,76,.04)" }}>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-start gap-2.5 bg-[rgba(224,82,82,.08)] border border-[rgba(224,82,82,.2)] rounded-xl p-3.5 mb-5"
            >
              <AlertCircle className="w-4 h-4 text-[#e05252] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#e05252]">{error}</p>
            </motion.div>
          )}

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 bg-[#0d1117] border border-[#1e2a3a] rounded-xl text-sm font-medium text-[#8a9bb5] hover:border-[#2a3a52] hover:text-white transition-all mb-5 disabled:opacity-60"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
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
            <span className="text-xs text-[#2a3a52] font-medium">or</span>
            <div className="flex-1 h-px bg-[#1e2a3a]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#8a9bb5] uppercase tracking-wider mb-1.5 block">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@university.edu.ng"
                autoComplete="email"
                className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-[#1e2a3a] rounded-xl text-sm text-white placeholder:text-[#2a3a52] focus:outline-none focus:border-[#8a6f32] focus:ring-1 focus:ring-[rgba(201,168,76,.2)] transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#8a9bb5] uppercase tracking-wider mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-3.5 py-2.5 pr-10 bg-[#0d1117] border border-[#1e2a3a] rounded-xl text-sm text-white placeholder:text-[#2a3a52] focus:outline-none focus:border-[#8a6f32] focus:ring-1 focus:ring-[rgba(201,168,76,.2)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a5a72] hover:text-[#8a9bb5] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <Link href="/auth/forgot-password" className="text-xs text-[#c9a84c] hover:text-[#e8c76a] transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#c9a84c] to-[#8a6f32] text-[#0a0d12] font-bold text-sm rounded-xl hover:shadow-[0_8px_30px_rgba(201,168,76,.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-[#4a5a72] mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-[#c9a84c] hover:text-[#e8c76a] font-medium transition-colors">
              Create account
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-[#2a3a52] mt-4">
          Nigeria&apos;s Premier Academic AI Platform
        </p>
      </motion.div>
    </div>
  );
}
