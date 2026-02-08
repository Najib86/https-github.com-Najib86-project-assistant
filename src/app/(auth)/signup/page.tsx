
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation";
export default function SignupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
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
            router.push("/login");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-6">
            <div className="flex flex-col items-center gap-2 text-center">
                <div className="shadow-sm rounded-lg p-2 bg-indigo-50">
                    <BookOpen className="h-6 w-6 text-indigo-600" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create an account</h1>
                <p className="text-sm text-muted-foreground">
                    Enter your email below to create your account
                </p>
            </div>
            <form onSubmit={handleSubmit} className="w-full space-y-4">
                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
                        {error}
                    </div>
                )}
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="name">
                        Full Name
                    </label>
                    <input
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-gray-900 bg-white"
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
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-gray-900 bg-white"
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
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-gray-900 bg-white"
                        id="password"
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                        type="password"
                        autoComplete="new-password"
                    />
                </div>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Account...
                        </>
                    ) : (
                        "Sign Up with Email"
                    )}
                </Button>
            </form>
            <p className="px-8 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="underline underline-offset-4 hover:text-indigo-600">
                    Log in
                </Link>
            </p>
        </div>
    )
}

