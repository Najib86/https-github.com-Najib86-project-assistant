// src/hooks/useAuth.ts
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Role = "STUDENT" | "SUPERVISOR" | "ADMIN";

interface UseAuthOptions {
  required?: boolean;
  requiredRole?: Role;
  redirectTo?: string;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { required = false, requiredRole, redirectTo = "/auth/login" } = options;

  useEffect(() => {
    if (status === "loading") return;

    // Redirect unauthenticated users
    if (required && status === "unauthenticated") {
      router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // Redirect wrong role
    if (requiredRole && session?.user?.role !== requiredRole) {
      if (session?.user?.role === "SUPERVISOR") {
        router.push("/supervisor/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    }
  }, [status, session, required, requiredRole, redirectTo, router]);

  return {
    session,
    status,
    user: session?.user,
    isLoading:      status === "loading",
    isAuthenticated:status === "authenticated",
    isStudent:  session?.user?.role === "STUDENT",
    isSupervisor: session?.user?.role === "SUPERVISOR",
    isAdmin:    session?.user?.role === "ADMIN",
  };
}

export default useAuth;
