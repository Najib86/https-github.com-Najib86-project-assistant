"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardRedirect() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;

        if (status === "authenticated") {
            const role = (session?.user as any)?.role;
            if (role === "supervisor") {
                router.push("/supervisor/dashboard");
            } else {
                router.push("/student/dashboard");
            }
        } else if (status === "unauthenticated") {
            router.push("/auth/login");
        }
    }, [session, status, router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="font-black text-xs uppercase tracking-widest text-gray-400">Navigating to Dashboard...</p>
        </div>
    );
}
