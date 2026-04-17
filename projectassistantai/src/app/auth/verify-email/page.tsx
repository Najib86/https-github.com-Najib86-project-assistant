// src/app/auth/verify-email/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, GraduationCap } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found. Please check your email link.");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStatus("success");
          setMessage(data.message ?? "Email verified successfully!");
          setTimeout(() => router.push("/auth/login"), 3000);
        } else {
          setStatus("error");
          setMessage(data.error ?? "Verification failed");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Network error. Please try again.");
      });
  }, [token, router]);

  return (
    <div className="min-h-screen bg-[#0a0d12] flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none opacity-40"
        style={{ backgroundImage: "linear-gradient(rgba(201,168,76,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.03) 1px,transparent 1px)", backgroundSize: "50px 50px" }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c9a84c] to-[#8a6f32] mb-4">
            <GraduationCap className="w-7 h-7 text-[#0a0d12]" />
          </div>
          <p className="text-sm text-[#4a5a72]">ProjectAssistantAI</p>
        </div>

        <div className="bg-[#111620] border border-[#1e2a3a] rounded-2xl p-8 text-center shadow-[0_0_40px_rgba(0,0,0,.5)]">
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 text-[#c9a84c] animate-spin mx-auto mb-4" />
              <h2 className="text-lg font-bold text-white font-display mb-2">Verifying your email</h2>
              <p className="text-sm text-[#4a5a72]">Please wait a moment...</p>
            </>
          )}

          {status === "success" && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-[rgba(46,204,143,.12)] flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-8 h-8 text-[#2ecc8f]" />
              </motion.div>
              <h2 className="text-lg font-bold text-white font-display mb-2">Email verified!</h2>
              <p className="text-sm text-[#8a9bb5] mb-6">{message}</p>
              <p className="text-xs text-[#4a5a72]">Redirecting to login...</p>
              <div className="mt-4 h-1 bg-[#1e2a3a] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#c9a84c] to-[#2ecc8f]"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3 }}
                />
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-[rgba(224,82,82,.12)] flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-[#e05252]" />
              </div>
              <h2 className="text-lg font-bold text-white font-display mb-2">Verification failed</h2>
              <p className="text-sm text-[#8a9bb5] mb-6">{message}</p>
              <div className="flex gap-3 justify-center">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 border border-[#1e2a3a] text-[#8a9bb5] hover:text-white rounded-xl text-sm font-medium transition-all"
                >
                  Back to Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 bg-gradient-to-r from-[#c9a84c] to-[#8a6f32] text-[#0a0d12] font-bold rounded-xl text-sm transition-all"
                >
                  Sign Up Again
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
