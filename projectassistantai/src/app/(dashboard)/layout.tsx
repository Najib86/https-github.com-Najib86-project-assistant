// src/app/(dashboard)/layout.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FolderOpen, Sparkles, BookOpen,
  Users, Settings, LogOut, Menu, X, ChevronRight,
  GraduationCap, Bell, Search
} from "lucide-react";

const studentNav = [
  { href: "/student/dashboard", label: "Dashboard",   icon: LayoutDashboard },
  { href: "/student/projects",  label: "My Projects", icon: FolderOpen       },
  { href: "/generate",          label: "Generate Prompt", icon: Sparkles     },
  { href: "/student/history",   label: "Prompt History", icon: BookOpen      },
  { href: "/student/settings",  label: "Settings",    icon: Settings         },
];

const supervisorNav = [
  { href: "/supervisor/dashboard", label: "Dashboard",  icon: LayoutDashboard },
  { href: "/supervisor/students",  label: "Students",   icon: Users            },
  { href: "/supervisor/projects",  label: "Projects",   icon: FolderOpen       },
  { href: "/generate",             label: "Generator",  icon: Sparkles         },
  { href: "/supervisor/settings",  label: "Settings",   icon: Settings         },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = session?.user?.role === "SUPERVISOR" ? supervisorNav : studentNav;
  const initials = session?.user?.name
    ?.split(" ")
    .map(n => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "?";

  return (
    <div className="flex h-screen bg-[#0a0d12] overflow-hidden">
      {/* ── Mobile overlay ─────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 bottom-0 w-64 z-50 lg:z-auto lg:translate-x-0 lg:static lg:block"
        style={{ transform: undefined }}
      >
        <div className="h-full flex flex-col bg-[#0d1117] border-r border-[#1e2a3a]">
          {/* Logo */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-[#1e2a3a]">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c9a84c] to-[#8a6f32] flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-4 h-4 text-[#0a0d12]" />
              </div>
              <div>
                <p className="font-bold text-white text-sm leading-none font-display">
                  ProjectAssistant
                </p>
                <p className="text-[10px] text-[#c9a84c] font-semibold leading-none mt-0.5">AI</p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-[#4a5a72] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Role badge */}
          <div className="px-4 py-3 border-b border-[#1e2a3a]">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              session?.user?.role === "SUPERVISOR"
                ? "bg-[rgba(201,168,76,.12)] text-[#c9a84c] border border-[rgba(201,168,76,.2)]"
                : "bg-[rgba(74,143,255,.12)] text-[#4a8fff] border border-[rgba(74,143,255,.2)]"
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {session?.user?.role === "SUPERVISOR" ? "Supervisor" : "Student"}
            </span>
          </div>

          {/* Nav links */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {nav.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                    isActive
                      ? "bg-gradient-to-r from-[rgba(201,168,76,.15)] to-transparent text-[#c9a84c] border border-[rgba(201,168,76,.2)]"
                      : "text-[#4a5a72] hover:text-[#8a9bb5] hover:bg-[#111620]"
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[#c9a84c]" : "group-hover:text-[#8a9bb5]"}`} />
                  {item.label}
                  {isActive && <ChevronRight className="w-3 h-3 ml-auto text-[#c9a84c]" />}
                </Link>
              );
            })}
          </nav>

          {/* User profile */}
          <div className="p-4 border-t border-[#1e2a3a]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1F4E79] to-[#0a0d12] border border-[#2a3a52] flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-[#c9a84c]">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {session?.user?.name ?? "User"}
                </p>
                <p className="text-xs text-[#4a5a72] truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#4a5a72] hover:text-[#e05252] hover:bg-[rgba(224,82,82,.08)] transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </motion.aside>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-[#1e2a3a] bg-[#0d1117] flex items-center gap-4 px-4 lg:px-6 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-[#4a5a72] hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md hidden md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4a5a72]" />
              <input
                type="text"
                placeholder="Search projects, prompts..."
                className="w-full pl-9 pr-4 py-2 bg-[#111620] border border-[#1e2a3a] rounded-lg text-sm text-[#8a9bb5] placeholder:text-[#2a3a52] focus:outline-none focus:border-[#8a6f32] transition-all"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Quick generate button */}
            <Link
              href="/generate"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#c9a84c] to-[#8a6f32] text-[#0a0d12] text-xs font-bold rounded-lg hover:shadow-[0_4px_20px_rgba(201,168,76,.3)] transition-shadow"
            >
              <Sparkles className="w-3 h-3" />
              New Prompt
            </Link>

            {/* Notifications */}
            <button className="relative w-8 h-8 rounded-lg bg-[#111620] border border-[#1e2a3a] flex items-center justify-center text-[#4a5a72] hover:text-[#8a9bb5] transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
            </button>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1F4E79] to-[#0a0d12] border border-[#2a3a52] flex items-center justify-center">
              <span className="text-xs font-bold text-[#c9a84c]">{initials}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
