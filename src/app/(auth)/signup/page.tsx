
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2, GraduationCap, UserCheck, Bot, FileCheck, Smartphone, ShieldCheck, ArrowRight } from "lucide-react"
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function SignupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "student"
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const setRole = (role: string) => {
        setFormData({ ...formData, role });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Signup failed");
            }

            // In a real app, you'd save the token/session here
            // For now, redirect to login
            router.push("/login?signup=success");
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const features = [
        {
            icon: <Bot className="w-6 h-6 text-indigo-600" />,
            title: "AI Project Generation",
            desc: "Smart topic selection & chapter writing assistance"
        },
        {
            icon: <FileCheck className="w-6 h-6 text-indigo-600" />,
            title: "Plagiarism & Citation",
            desc: "Built-in checks & automated reference formatting"
        },
        {
            icon: <Smartphone className="w-6 h-6 text-indigo-600" />,
            title: "Mobile Dashboard",
            desc: "Manage research & approvals on the go"
        },
        {
            icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />,
            title: "Secure Records",
            desc: "Enterprise-grade student data protection"
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
                            <span className="text-xl font-black text-gray-900 tracking-tighter uppercase">PROJECTASSISTANTAI</span>
                        </div>

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
                                Streamline your academic journey with our intelligent platform designed for both students and supervisors.
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
                                joined by over <span className="text-indigo-600 font-bold">2,000+</span> students and faculty.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section - Signup Form (First on Mobile) */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 xl:p-20 order-1 lg:order-2 bg-white min-h-screen lg:min-h-0 overflow-y-auto">
                <div className="w-full max-w-[480px] py-12 lg:py-0">
                    <div className="bg-white rounded-[2.5rem] lg:shadow-2xl lg:shadow-indigo-100/50 lg:border border-gray-100 p-8 lg:p-12 relative">
                        <div className="flex flex-col items-center gap-3 mb-8">
                            <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center mb-2 shadow-xl shadow-indigo-100/50 border border-gray-100">
                                <Image
                                    src="/logo.png"
                                    alt="Logo"
                                    width={56}
                                    height={56}
                                    className=""
                                />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Create Account</h2>
                            <p className="text-sm font-medium text-gray-500">Join the next generation of researchers</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 text-sm text-red-600 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Role Selection */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setRole("student")}
                                    className={cn(
                                        "relative flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 transition-all duration-300 group overflow-hidden",
                                        formData.role === "student"
                                            ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm"
                                            : "border-gray-50 bg-gray-50/50 text-gray-400 hover:border-indigo-100 hover:bg-white"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                        formData.role === "student" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-white border border-gray-100 text-gray-400 group-hover:text-indigo-600"
                                    )}>
                                        <GraduationCap className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm font-black uppercase tracking-tight">Student</span>
                                    {formData.role === "student" && (
                                        <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full" />
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole("supervisor")}
                                    className={cn(
                                        "relative flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 transition-all duration-300 group overflow-hidden",
                                        formData.role === "supervisor"
                                            ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm"
                                            : "border-gray-50 bg-gray-50/50 text-gray-400 hover:border-indigo-100 hover:bg-white"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                        formData.role === "supervisor" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-white border border-gray-100 text-gray-400 group-hover:text-indigo-600"
                                    )}>
                                        <UserCheck className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm font-black uppercase tracking-tight">Supervisor</span>
                                    {formData.role === "supervisor" && (
                                        <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full" />
                                    )}
                                </button>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1" htmlFor="name">
                                        Full Name
                                    </label>
                                    <input
                                        className="flex h-12 w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-5 py-3 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                                        id="name"
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your legal name"
                                        type="text"
                                        autoComplete="name"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1" htmlFor="email">
                                        Email Address
                                    </label>
                                    <input
                                        className="flex h-12 w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-5 py-3 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
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
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1" htmlFor="password">
                                        Password
                                    </label>
                                    <input
                                        className="flex h-12 w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-5 py-3 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                                        id="password"
                                        onChange={handleChange}
                                        required
                                        placeholder="Create password"
                                        type="password"
                                        autoComplete="new-password"
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
                                        Creating Account...
                                    </>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Get Started as {formData.role === 'student' ? 'Student' : 'Supervisor'}
                                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                    </span>
                                )}
                            </Button>
                        </form>

                        <div className="mt-10 pt-8 border-t border-gray-100 text-center">
                            <p className="text-sm font-medium text-gray-500">
                                Already using PROJECTASSISTANTAI?{" "}
                                <Link href="/login" className="font-black text-indigo-600 hover:text-indigo-800 transition-colors">
                                    Sign in here
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


