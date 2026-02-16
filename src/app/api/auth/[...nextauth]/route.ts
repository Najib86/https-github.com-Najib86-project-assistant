import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit, getRateLimitKey } from "@/lib/auth/rateLimit";
import { isAccountLocked, incrementFailedLogin, resetFailedLogin } from "@/lib/auth/lockout";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                // Rate limiting by email
                const rateLimitKey = getRateLimitKey("login", credentials.email);
                const rateLimit = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000); // 5 attempts per 15 min

                if (!rateLimit.allowed) {
                    throw new Error("Too many login attempts. Please try again later.");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user || !user.password) return null;

                // Check if account is locked
                if (await isAccountLocked(user)) {
                    throw new Error("Account temporarily locked due to too many failed attempts. Try again in 30 minutes.");
                }

                // Compare hashed password
                const isValidPassword = await bcrypt.compare(credentials.password, user.password);

                if (!isValidPassword) {
                    // Increment failed attempts
                    await incrementFailedLogin(user.id);
                    return null;
                }

                // Reset failed login attempts on successful login
                await resetFailedLogin(user.id);

                return {
                    id: user.id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    emailVerified: user.email_verified,
                };
            }
        })
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                try {
                    // Check if user exists
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email! }
                    });

                    if (existingUser) {
                        // Update existing user
                        await prisma.user.update({
                            where: { email: user.email! },
                            data: {
                                email_verified: true,
                                provider: "google"
                            }
                        });
                    } else {
                        // Create new user from Google OAuth
                        await prisma.user.create({
                            data: {
                                name: user.name || "",
                                email: user.email!,
                                email_verified: true,
                                provider: "google",
                                role: "student" // Default role
                            }
                        });
                    }
                } catch (error) {
                    console.error("Error handling Google user:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;

                // Fetch latest user data for Google login to get role
                if (account?.provider === "google") {
                    const dbUser = await prisma.user.findUnique({
                        where: { email: user.email! }
                    });
                    if (dbUser) {
                        token.id = dbUser.id.toString();
                        // @ts-ignore
                        token.role = dbUser.role;
                        // @ts-ignore
                        token.emailVerified = dbUser.email_verified;
                    }
                } else {
                    // Credentials login already has these fields
                    // @ts-ignore
                    token.role = user.role;
                    // @ts-ignore
                    token.emailVerified = user.emailVerified;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                // @ts-ignore
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                // @ts-ignore
                session.user.role = token.role as string;
                // @ts-ignore
                session.user.emailVerified = token.emailVerified as boolean;
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/auth/login",
        error: "/auth/login",
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
