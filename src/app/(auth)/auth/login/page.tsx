
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Suspense } from "react";

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>}>
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

    const callbackUrl = searchParams.get("callbackUrl");

    useEffect(() => {
        const checkSession = async () => {
            const res = await fetch("/api/auth/session");
            const session = await res.json();
            if (session?.user) {
                const role = session.user.role;
                if (role === "supervisor") {
                    router.push("/supervisor/dashboard");
                } else {
                    router.push("/student/dashboard");
                }
            }
        };

        const errorType = searchParams.get("error");
        if (errorType === "unauthorized") {
            setError("You do not have permission to view that page. Please log in with the correct account.");
        }
        checkSession();
    }, [searchParams, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
                return;
            }

            // Fetch session to get role
            const sessionRes = await fetch("/api/auth/session");
            const session = await sessionRes.json();

            if (session?.user) {
                // Set user in localStorage for client-side checks
                localStorage.setItem("user", JSON.stringify(session.user));

                const role = session.user.role;

                if (role === "supervisor") {
                    router.push("/supervisor/dashboard");
                } else {
                    router.push(callbackUrl || "/student/dashboard");
                }
                router.refresh();
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        signIn("google", { callbackUrl: callbackUrl || window.location.origin + "/auth/login?googleCallback=true" });
    };

    return (
        <div className="w-full max-w-lg mx-auto my-16 bg-white p-8 md:p-12 rounded-3xl shadow-2xl shadow-indigo-100 flex flex-col items-center space-y-6 border border-indigo-50">
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
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Welcome back</h1>
                <p className="text-sm text-muted-foreground">
                    Enter your email to sign in to your dashboard
                </p>
            </div>
            <form onSubmit={handleSubmit} className="w-full space-y-4">
                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
                        {error}
                    </div>
                )}
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
                        autoCorrect="off"
                        disabled={isLoading}
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
                        autoComplete="current-password"
                        disabled={isLoading}
                    />
                </div>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing In...
                        </>
                    ) : (
                        "Sign In with Email"
                    )}
                </Button>
            </form>

            <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>

            <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                type="button"
            >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                    />
                    <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                    />
                </svg>
                Google
            </Button>

            <p className="px-8 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/auth/student/signup" className="underline underline-offset-4 hover:text-indigo-600">
                    Sign up
                </Link>
            </p>
        </div>
    )
}
