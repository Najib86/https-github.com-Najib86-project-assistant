"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";

interface CustomUser {
    id?: string | number;
    name?: string | null;
    email?: string | null;
    role?: string;
}

function SessionSync() {
    const { data: session } = useSession();

    useEffect(() => {
        if (typeof window !== "undefined" && session?.user) {
            const user = session.user as CustomUser;
            localStorage.setItem("user", JSON.stringify({
                ...user,
                // Ensure ID is a number if it comes as a string from session
                id: user.id ? Number(user.id) : null
            }));
        }
    }, [session]);

    return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <SessionSync />
            {children}
        </SessionProvider>
    );
}
