
"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2, Bot, FileCheck, ArrowRight } from "lucide-react"
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>}>
            <LoginForm />
        </Suspense>
    );
}

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const signupSuccess = searchParams.get("signup") === "success";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email: formData.email,
                password: formData.password,
            });

            if (result?.error) {
                setError("Invalid email or password");
                return;
            }

            const sessionRes = await fetch("/api/auth/session");
            const session = await sessionRes.json();

            if (session?.user?.role === "supervisor") {
                router.push("/supervisor");
            } else {
                router.push("/student");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        signIn("google", { callbackUrl: "/student" });
    };

    const features = [
        {
            icon: <Bot className="w-6 h-6 text-indigo-600" />,
            title: "AI Guidance",
            desc: "Smart assistance for every step of your project"
        },
        {
            icon: <FileCheck className="w-6 h-6 text-indigo-600" />,
            title: "Review System",
            desc: "Fast-track approvals with collaborative tools"
        }
    ];

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white relative overflow-x-hidden">
            {/* Left Section - Branding & Features (Second on Mobile) */}
            <div className="w-full lg:w-[45%] xl:w-[40%] bg-[#F8F9FC] relative order-2 lg:order-1 flex flex-col items-center lg:items-start justify-center p-8 lg:p-16 xl:p-24 overflow-hidden border-t lg:border-t-0 lg:border-r border-gray-100">
                {/* Background Effects for the Panel */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-blue-50/30 mix-blend-multiply" />
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: `url("https://www.transparenttextures.com/patterns/cubes.png")`,
                            backgroundRepeat: 'repeat'
                        }}
                    />
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-50/50 via-white/0 to-blue-50/20" />
                </div>

                <div className="relative z-10 w-full max-w-lg">
                    <div className="space-y-6 lg:space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-indigo-100 shadow-sm mb-4">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-semibold text-indigo-900 tracking-wide uppercase">New Session Open</span>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight text-gray-900 leading-[1.1]">
                                PROJECTASSISTANTAI <br />
                                <span className="text-indigo-600">Platform</span>
                            </h1>
                            <p className="text-lg lg:text-xl font-medium text-gray-600 leading-relaxed">
                                AI for Final Year Projects and Academic Research
                            </p>
                            <p className="text-sm lg:text-base text-gray-500 leading-relaxed max-w-md">
                                Reconnect with your academic progress and oversee project developments with ease.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:gap-6 w-full pt-4">
                            {features.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white/80 border border-white/50 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm group">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 group-hover:bg-white transition-colors">
                                        {feature.icon}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-gray-900 text-sm leading-tight">{feature.title}</h3>
                                        <p className="text-xs text-gray-500 leading-relaxed">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 lg:pt-12 w-full border-t border-gray-200/60">
                            <div className="flex -space-x-3 overflow-hidden">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-indigo-100 flex items-center justify-center shadow-sm">
                                        <span className="text-xs font-bold text-indigo-600">{i}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-4 text-sm text-gray-500 font-medium">
                                Trusted by <span className="text-indigo-600 font-bold">2,000+</span> academics.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section - Login Form (First on Mobile) */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 xl:p-20 order-1 lg:order-2 bg-white min-h-screen lg:min-h-0 overflow-y-auto">
                <div className="w-full max-w-[480px] py-12 lg:py-0">
                    <div className="bg-white rounded-[2.5rem] lg:shadow-2xl lg:shadow-indigo-100/50 lg:border border-gray-100 p-8 lg:p-12 relative">
                        <div className="flex flex-col items-center gap-3 mb-10">
                            <div className="w-16 h-16 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center mb-2 shadow-xl shadow-indigo-200">
                                <Image
                                    src="/logo.png"
                                    alt="Logo"
                                    width={40}
                                    height={40}
                                    className="brightness-0 invert"
                                />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
                            <p className="text-sm font-medium text-gray-500">Sign in to your account to continue</p>
                        </div>

                        {signupSuccess && (
                            <div className="mb-6 p-4 text-sm text-green-600 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                                Account created successfully! Please log in.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 text-sm text-red-600 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1" htmlFor="email">
                                        Email Address
                                    </label>
                                    <input
                                        className="flex h-12 w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-5 py-3 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all text-gray-900"
                                        id="email"
                                        onChange={handleChange}
                                        required
                                        placeholder="university.edu"
                                        type="email"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]" htmlFor="password">
                                            Password
                                        </label>
                                        <a href="#" className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-wider">
                                            Forgot?
                                        </a>
                                    </div>
                                    <input
                                        className="flex h-12 w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-5 py-3 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all text-gray-900"
                                        id="password"
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter password"
                                        type="password"
                                        autoComplete="current-password"
                                    />
                                </div>
                            </div>

                            <Button
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.25rem] h-14 font-black text-base shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-[0.98] group relative overflow-hidden mt-4"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Sign In to Dashboard
                                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                    </span>
                                )}
                            </Button>
                        </form>

                        <div className="mt-4">
                            <Button
                                onClick={handleGoogleSignIn}
                                variant="outline"
                                className="w-full border-2 border-gray-100 rounded-[1.25rem] h-14 font-black text-base flex items-center justify-center gap-3 hover:bg-gray-50 transition-all active:scale-[0.98]"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Continue with Google
                            </Button>
                        </div>

                        <div className="mt-10 pt-8 border-t border-gray-100 text-center">
                            <p className="text-sm font-medium text-gray-500">
                                New to the platform?{" "}
                                <Link href="/signup" className="font-black text-indigo-600 hover:text-indigo-800 transition-colors">
                                    Create an account
                                </Link>
                            </p>
                            <div className="mt-8 space-y-4">
                                <p className="text-[10px] font-black text-indigo-900/40 uppercase tracking-[0.2em]">
                                    Powered by Synapse Engineering and supplies
                                </p>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        <a href="tel:08028110448" className="hover:text-indigo-600 transition-colors">08028110448</a>
                                        <span className="opacity-30">•</span>
                                        <a href="https://www.synapseengineering.com.ng/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">www.synapseengineering.com.ng</a>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-2">
                                        &copy; 2026 PROJECTASSISTANTAI Platform.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
