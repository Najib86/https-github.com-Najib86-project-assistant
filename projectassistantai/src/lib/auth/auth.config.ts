// src/lib/auth/auth.config.ts
// NextAuth v4 configuration with RBAC, Google OAuth, and Neon DB

import { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: Role;
      department?: string;
      faculty?: string;
    };
  }
  interface User {
    role: Role;
    department?: string;
    faculty?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    department?: string;
    faculty?: string;
  }
}

export const authOptions: NextAuthOptions = {
  // @ts-expect-error - PrismaAdapter type mismatch between auth/prisma-adapter versions
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
    verifyRequest: "/auth/verify-email",
    newUser: "/auth/onboarding",
  },

  providers: [
    // ── Google OAuth ──────────────────────────────────────────────
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true, // Link if email matches
    }),

    // ── Email/Password ─────────────────────────────────────────────
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user || !user.password) {
          throw new Error("No account found with this email");
        }

        // Check account lockout
        if (user.lockUntil && user.lockUntil > new Date()) {
          const minutesLeft = Math.ceil(
            (user.lockUntil.getTime() - Date.now()) / 60000
          );
          throw new Error(
            `Account locked. Try again in ${minutesLeft} minutes`
          );
        }

        // Verify password
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          const attempts = user.failedLoginAttempts + 1;
          const updates: Parameters<typeof prisma.user.update>[0]["data"] = {
            failedLoginAttempts: attempts,
          };

          // Lock after 5 failed attempts for 30 minutes
          if (attempts >= 5) {
            updates.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
          }

          await prisma.user.update({
            where: { id: user.id },
            data: updates,
          });

          throw new Error("Invalid password");
        }

        // Check email verification
        if (!user.emailVerified) {
          throw new Error("Please verify your email before logging in");
        }

        // Reset failed attempts on success
        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: 0, lockUntil: null },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? "",
          role: user.role,
          department: user.department ?? undefined,
          faculty: user.faculty ?? undefined,
          image: user.image ?? undefined,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // Initial sign-in
      if (user) {
        token.role = user.role;
        token.department = user.department;
        token.faculty = user.faculty;
      }

      // Google OAuth — fetch role from DB (defaults to STUDENT)
      if (account?.provider === "google") {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.department = dbUser.department ?? undefined;
          token.faculty = dbUser.faculty ?? undefined;
        }
      }

      // Handle session update trigger
      if (trigger === "update" && session) {
        token.name = session.user.name;
        token.department = session.user.department;
        token.faculty = session.user.faculty;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.sub!;
      session.user.role = token.role;
      session.user.department = token.department;
      session.user.faculty = token.faculty;
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Absolute URL on same origin
      if (url.startsWith(baseUrl)) return url;
      // Relative URL
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },

  events: {
    async signIn({ user }) {
      // Log sign-in activity
      await prisma.activityLog.create({
        data: {
          userId: user.id!,
          action: "USER_LOGIN",
          metadata: JSON.stringify({ timestamp: new Date() }),
        },
      }).catch(() => {}); // Don't fail login if logging fails
    },

    async createUser({ user }) {
      // Auto-create a verification record and send welcome
      await prisma.activityLog.create({
        data: {
          userId: user.id!,
          action: "USER_REGISTERED",
          metadata: JSON.stringify({ provider: "google", email: user.email }),
        },
      }).catch(() => {});
    },
  },
};
