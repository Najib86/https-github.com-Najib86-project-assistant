import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

export async function middleware(req: NextRequest) {
    // ✅ Get NextAuth session token
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const { pathname } = req.nextUrl;

    // Protect student routes
    if (pathname.startsWith("/student")) {
        // ❌ Not logged in
        if (!token?.email) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        // ✅ Check email verification in Neon
        try {
            const user = await db`
        SELECT email_verified FROM users WHERE email=${token.email}
      `;

            if (!user.length || !user[0].email_verified) {
                return NextResponse.redirect(new URL("/verify-email", req.url));
            }
        } catch (error) {
            console.error("Middleware DB error:", error);
            // In case of DB error, we might want to allow access if the token exists,
            // or block it. Blocking is safer.
            return NextResponse.redirect(new URL("/login", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/student/:path*"],
};
