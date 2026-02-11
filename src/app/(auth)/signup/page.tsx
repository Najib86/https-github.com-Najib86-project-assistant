
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2, GraduationCap, UserCheck } from "lucide-react"
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

    return (
        <div className="flex flex-col items-center space-y-6">
            <div className="flex flex-col items-center gap-4 text-center">
                <Link href="/" className="transition-transform hover:scale-110">
                    <Image
                        src="/logo.png"
                        alt="Logo"
                        width={64}
                        height={64}
                        className="rounded-2xl shadow-xl shadow-indigo-100"
                    />
                </Link>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create an account</h1>
                <p className="text-sm text-muted-foreground">
                    Join as a student or supervisor to get started
                </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200 animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                {/* Role Selection */}
                <div className="grid grid-cols-2 gap-3 mb-2">
                    <button
                        type="button"
                        onClick={() => setRole("student")}
                        className={cn(
                            "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-200",
                            formData.role === "student"
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-md scale-[1.02]"
                                : "bg-white border-gray-200 text-gray-500 hover:border-indigo-200 hover:bg-indigo-50"
                        )}
                    >
                        <GraduationCap className={cn("h-6 w-6", formData.role === "student" ? "text-white" : "text-gray-400")} />
                        <span className="text-sm font-bold">Student</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole("supervisor")}
                        className={cn(
                            "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-200",
                            formData.role === "supervisor"
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-md scale-[1.02]"
                                : "bg-white border-gray-200 text-gray-500 hover:border-indigo-200 hover:bg-indigo-50"
                        )}
                    >
                        <UserCheck className={cn("h-6 w-6", formData.role === "supervisor" ? "text-white" : "text-gray-400")} />
                        <span className="text-sm font-bold">Supervisor</span>
                    </button>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="name">
                        Full Name
                    </label>
                    <input
                        className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                        id="name"
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                        type="text"
                        autoComplete="name"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                        id="email"
                        onChange={handleChange}
                        required
                        placeholder="m@example.com"
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="password">
                        Password
                    </label>
                    <input
                        className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                        id="password"
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                        type="password"
                        autoComplete="new-password"
                    />
                </div>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 font-bold shadow-lg shadow-indigo-200" type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating {formData.role === 'student' ? 'Student' : 'Supervisor'} Account...
                        </>
                    ) : (
                        "Sign Up"
                    )}
                </Button>
            </form>
            <p className="px-8 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="underline underline-offset-4 hover:text-indigo-600 font-medium">
                    Log in
                </Link>
            </p>
        </div>
    )
}

