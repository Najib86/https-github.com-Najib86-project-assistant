"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] p-6">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-gray-100 p-8 lg:p-12 text-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 text-indigo-600">
                    <Mail className="w-10 h-10" />
                </div>

                <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Verify Your Email</h1>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    Please check your email for a verification link or OTP to unlock your student dashboard.
                    (This is a placeholder for the verification flow).
                </p>

                <div className="space-y-4">
                    <Button
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.25rem] h-14 font-black shadow-lg shadow-indigo-100"
                        onClick={() => router.push("/login")}
                    >
                        Return to Login
                    </Button>

                    <div>
                        <Link href="/" className="inline-flex items-center gap-2 text-sm font-black text-indigo-600 hover:text-indigo-800 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Homepage
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
