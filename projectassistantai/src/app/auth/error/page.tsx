// src/app/auth/error/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  Configuration:      { title: "Server Configuration Error", description: "There is a problem with the server configuration. Please contact support." },
  AccessDenied:       { title: "Access Denied",              description: "You do not have permission to sign in." },
  Verification:       { title: "Verification Error",         description: "The verification link is invalid or has expired. Please request a new one." },
  OAuthSignin:        { title: "OAuth Sign-In Error",        description: "Could not connect to the OAuth provider. Please try again." },
  OAuthCallback:      { title: "OAuth Callback Error",       description: "Error in handling the OAuth callback." },
  OAuthCreateAccount: { title: "Account Creation Error",     description: "Could not create an account using OAuth." },
  EmailCreateAccount: { title: "Email Account Error",        description: "Could not create an email account." },
  Callback:           { title: "Callback Error",             description: "Error in the sign-in callback." },
  SessionRequired:    { title: "Sign In Required",           description: "Please sign in to access this page." },
  Default:            { title: "Authentication Error",       description: "An unexpected error occurred during sign in." },
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") ?? "Default";
  const errorInfo = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default;

  return (
    <div className="min-h-screen bg-[#0a0d12] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-[#111620] border border-[rgba(224,82,82,.25)] rounded-2xl p-8 text-center shadow-[0_0_40px_rgba(0,0,0,.5)]">
          <div className="w-14 h-14 rounded-full bg-[rgba(224,82,82,.12)] flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-[#e05252]" />
          </div>
          <h2 className="text-xl font-bold text-white font-display mb-2">{errorInfo.title}</h2>
          <p className="text-sm text-[#8a9bb5] mb-6 leading-relaxed">{errorInfo.description}</p>
          <code className="block text-xs text-[#4a5a72] font-mono mb-6 px-3 py-2 bg-[#0d1117] border border-[#1e2a3a] rounded-lg">
            Error: {error}
          </code>
          <div className="flex gap-3 justify-center">
            <Link href="/auth/login"
              className="flex items-center gap-2 px-4 py-2.5 border border-[#1e2a3a] text-[#8a9bb5] hover:text-white hover:border-[#2a3a52] rounded-xl text-sm font-medium transition-all">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Login
            </Link>
            <Link href="/"
              className="px-4 py-2.5 bg-gradient-to-r from-[#c9a84c] to-[#8a6f32] text-[#0a0d12] font-bold text-sm rounded-xl transition-all hover:shadow-[0_8px_25px_rgba(201,168,76,.3)]">
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
