"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleResend = async () => {
        setIsLoading(true);
        setStatus(null);
        try {
            const res = await fetch("/api/auth/resend-verification", {
                method: "POST",
            });

            const data = await res.json();

            if (res.ok) {
                setStatus({ type: 'success', message: "Verification email sent! Please check your inbox and spam folder." });
            } else {
                setStatus({ type: 'error', message: data.error || "Failed to resend email." });
            }
        } catch {
            setStatus({ type: 'error', message: "Something went wrong. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] p-6 mobile-nav-pad">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-gray-100 p-8 lg:p-12 text-center animate-in fade-in zoom-in-95">
                <div className="w-24 h-24 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-100 border border-gray-100 relative">
                    <div className="absolute inset-0 bg-indigo-50/50 rounded-[1.5rem] animate-pulse" />
                    <Mail className="w-10 h-10 text-indigo-600 relative z-10" />
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Verify Your Email</h1>
                    <p className="text-gray-500 leading-relaxed font-medium">
                        We&apos;ve sent a verification link to your email address. Please click the link to activate your account.
                    </p>
                </div>

                {status && (
                    <div className={`mb-8 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 text-left ${status.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-100'
                        : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                        {status.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                        {status.message}
                    </div>
                )}

                <div className="space-y-4">
                    <Button
                        onClick={handleResend}
                        disabled={isLoading}
                        variant="outline"
                        className="w-full border-2 border-indigo-100 hover:border-indigo-200 hover:bg-indigo-50 text-indigo-600 rounded-[1.25rem] h-14 font-black shadow-sm transition-all text-base"
                    >
                        {isLoading ? (
                            <>
                                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            "Resend Verification Email"
                        )}
                    </Button>

                    <Button
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.25rem] h-14 font-black shadow-lg shadow-indigo-100 text-base"
                        onClick={() => router.push("/login")}
                    >
                        Return to Login
                    </Button>

                    <div className="pt-4">
                        <Link href="/" className="inline-flex items-center gap-2 text-sm font-black text-gray-400 hover:text-gray-600 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Homepage
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
