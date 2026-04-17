// src/app/not-found.tsx
import Link from "next/link";
import { GraduationCap, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0d12] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c9a84c] to-[#8a6f32] mb-6">
          <GraduationCap className="w-8 h-8 text-[#0a0d12]" />
        </div>
        <h1 className="text-6xl font-bold text-[#1e2a3a] font-display mb-4">404</h1>
        <h2 className="text-xl font-bold text-white font-display mb-2">Page not found</h2>
        <p className="text-sm text-[#4a5a72] mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/"
            className="flex items-center gap-2 px-5 py-2.5 border border-[#1e2a3a] text-[#8a9bb5] hover:text-white hover:border-[#2a3a52] rounded-xl text-sm font-medium transition-all">
            <ArrowLeft className="w-4 h-4" />
            Go Home
          </Link>
          <Link href="/student/dashboard"
            className="px-5 py-2.5 bg-gradient-to-r from-[#c9a84c] to-[#8a6f32] text-[#0a0d12] font-bold text-sm rounded-xl hover:shadow-[0_8px_25px_rgba(201,168,76,.3)] transition-all">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
