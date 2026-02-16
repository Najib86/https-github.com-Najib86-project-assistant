"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2, ArrowLeft, Lock, CheckCircle, Eye, EyeOff } from "lucide-react"
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            setError("Invalid or missing reset token.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    password: formData.password
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Something went wrong");
            } else {
                setSuccess(true);
                // Optional: Redirect after a few seconds
                setTimeout(() => {
                    router.push("/login");
                }, 3000);
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Invalid Link</h2>
                    <p className="text-gray-600">This password reset link is invalid or has expired.</p>
                    <Link href="/forgot-password">
                        <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl">
                            Request New Link
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white relative overflow-x-hidden">
            {/* Left Section - Branding & Info */}
            <div className="w-full lg:w-[45%] xl:w-[40%] bg-[#F8F9FC] relative order-2 lg:order-1 flex flex-col items-center lg:items-start justify-center p-8 lg:p-16 xl:p-24 overflow-hidden border-t lg:border-t-0 lg:border-r border-gray-100 hidden lg:flex">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-blue-50/30 mix-blend-multiply" />
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-50/50 via-white/0 to-blue-50/20" />
                </div>

                <div className="relative z-10 w-full max-w-lg">
                    <div className="space-y-6 lg:space-y-8">
                        <div className="flex items-center gap-3 mb-8 lg:mb-12">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100">
                                <Image
                                    src="/logo.png"
                                    alt="Logo"
                                    width={32}
                                    height={32}
                                    className="rounded-lg"
                                />
                            </div>
                            <span className="text-xl font-black text-gray-900 tracking-tighter uppercase">ProjectAssistantAI</span>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-gray-900 leading-[1.1]">
                                Reset Your <br />
                                <span className="text-indigo-600">Password</span>
                            </h1>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Create a strong password to secure your account.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section - Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 xl:p-20 order-1 lg:order-2 bg-white min-h-screen lg:min-h-0 overflow-y-auto">
                <div className="w-full max-w-[480px] py-12 lg:py-0">
                    <div className="bg-white rounded-[2.5rem] lg:shadow-2xl lg:shadow-indigo-100/50 lg:border border-gray-100 p-8 lg:p-12 relative">
                        {success ? (
                            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-4">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900">Password Reset!</h2>
                                <p className="text-gray-600">Your password has been successfully updated. Redirecting to login...</p>
                                <Link href="/login">
                                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl h-12">
                                        Back to Login
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="mb-8">
                                    <div className="flex flex-col items-center md:items-start gap-2">
                                        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-2 text-indigo-600">
                                            <Lock className="w-8 h-8" />
                                        </div>
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">New Password</h2>
                                        <p className="text-sm font-medium text-gray-500">Please enter your new password below.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {error && (
                                        <div className="p-4 text-sm text-red-600 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                                            {error}
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1" htmlFor="password">
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    className="flex h-12 w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-5 py-3 pr-12 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all text-gray-900"
                                                    id="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="At least 8 characters"
                                                    type={showPassword ? "text" : "password"}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1" htmlFor="confirmPassword">
                                                Confirm Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    className="flex h-12 w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-5 py-3 pr-12 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all text-gray-900"
                                                    id="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Re-enter password"
                                                    type="password"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.25rem] h-14 font-black text-base shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-[0.98] group relative overflow-hidden mt-2"
                                        type="submit"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Resetting...
                                            </>
                                        ) : (
                                            "Reset Password"
                                        )}
                                    </Button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
