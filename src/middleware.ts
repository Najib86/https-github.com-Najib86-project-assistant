import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const { pathname } = req.nextUrl;

    // Protect student routes
    if (pathname.startsWith("/student")) {
        if (!token?.email) {
            return NextResponse.redirect(new URL("/auth/login", req.url));
        }

        // Check email verification
        if (!token.emailVerified) {
            return NextResponse.redirect(new URL("/verify-email", req.url));
        }

        // Check if user has student role
        if (token.role !== "student") {
            return NextResponse.redirect(new URL("/auth/login?error=unauthorized", req.url));
        }
    }

    // Protect supervisor routes
    if (pathname.startsWith("/supervisor")) {
        if (!token?.email) {
            return NextResponse.redirect(new URL("/auth/login", req.url));
        }

        // Check email verification
        if (!token.emailVerified) {
            return NextResponse.redirect(new URL("/verify-email", req.url));
        }

        // Check if user has supervisor role
        if (token.role !== "supervisor") {
            return NextResponse.redirect(new URL("/auth/login?error=unauthorized", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/student/:path*", "/supervisor/:path*"],
};
