// src/middleware.ts
// Route protection, RBAC, and security headers

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = (req as NextRequest & { nextauth?: { token?: { role?: string } } }).nextauth?.token;
    const role = token?.role as string | undefined;

    // ── RBAC route guards ───────────────────────────────────────────
    // Supervisor-only routes
    if (pathname.startsWith("/supervisor") && role !== "SUPERVISOR" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/student/dashboard", req.url));
    }

    // Student-only routes
    if (pathname.startsWith("/student") && role === "SUPERVISOR") {
      return NextResponse.redirect(new URL("/supervisor/dashboard", req.url));
    }

    // Admin-only routes
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // ── Smart dashboard redirect ────────────────────────────────────
    if (pathname === "/dashboard") {
      if (role === "SUPERVISOR") {
        return NextResponse.redirect(new URL("/supervisor/dashboard", req.url));
      }
      return NextResponse.redirect(new URL("/student/dashboard", req.url));
    }

    // ── Security headers ────────────────────────────────────────────
    const response = NextResponse.next();
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );
    response.headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://api.anthropic.com https://generativelanguage.googleapis.com",
      ].join("; ")
    );

    return response;
  },
  {
    callbacks: {
      authorized({ token }) {
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard",
    "/student/:path*",
    "/supervisor/:path*",
    "/admin/:path*",
    "/generate/:path*",
    "/(dashboard)/:path*",
    "/api/projects/:path*",
    "/api/chapters/:path*",
    "/api/prompts/:path*",
    "/api/invite/:path*",
  ],
};
