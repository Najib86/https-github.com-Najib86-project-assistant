"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Critical System Error:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-12 text-center border border-red-100">
                <div className="w-20 h-20 bg-red-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 text-red-600">
                    <AlertTriangle className="w-10 h-10" />
                </div>

                <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Oops! Something went wrong</h1>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    We encountered an unexpected error. Our engineers have been notified.
                </p>

                <div className="flex flex-col gap-4">
                    <Button
                        onClick={() => reset()}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.25rem] h-14 font-black flex gap-2 items-center justify-center"
                    >
                        <RefreshCcw className="w-5 h-5" />
                        Try Again
                    </Button>

                    <Link href="/">
                        <Button variant="outline" className="w-full rounded-[1.25rem] h-14 font-black flex gap-2 items-center justify-center border-2">
                            <Home className="w-5 h-5" />
                            Return Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
