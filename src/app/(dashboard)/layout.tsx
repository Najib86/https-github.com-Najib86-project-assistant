
"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    PenTool,
    MessageSquare,
    Settings,
    Menu,
    X,
    LogOut,
    Users,
    CheckSquare,
    LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
    href: string;
    icon: React.ElementType;
    label: string;
}

const studentItems: NavItem[] = [
    { href: "/student/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/student/chapter-writer", icon: PenTool, label: "Drafting Room" },
    { href: "/student/questionnaire", icon: MessageSquare, label: "Interview Bot" },
];

const supervisorItems: NavItem[] = [
    { href: "/supervisor/dashboard", icon: Users, label: "Student Panel" },
    { href: "/supervisor/review", icon: CheckSquare, label: "Review Tasks" },
];

const SidebarContent = ({
    activeItems,
    pathname,
    closeSidebar,
    userName,
    userRole
}: {
    activeItems: NavItem[],
    pathname: string,
    closeSidebar: () => void,
    userName: string,
    userRole: string
}) => (
    <div className="flex flex-col h-full bg-white relative">
        {/* Design Element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />

        <div className="p-8 pb-10 relative">
            <Link href="/" onClick={closeSidebar} className="flex items-center gap-3">
                <Image
                    src="/logo.png"
                    alt="Logo"
                    width={32}
                    height={32}
                    className="rounded-lg shadow-sm"
                />
                <span className="text-xl font-black text-gray-900 tracking-tighter">
                    PROJECTASSISTANTAI
                </span>
            </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
            <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Main Menu</p>
            {activeItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/student" && item.href !== "/supervisor" && pathname.startsWith(item.href));
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeSidebar}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3.5 text-sm font-bold transition-all rounded-2xl group",
                            isActive
                                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 translate-x-1"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                        )}
                    >
                        <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-gray-400")} />
                        {item.label}
                    </Link>
                );
            })}
        </nav>

        <div className="p-6 mt-auto">
            <div className="bg-gray-50 rounded-3xl p-4 mb-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center font-black text-indigo-600 shadow-sm">
                        {userName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-black text-gray-900 truncate">{userName}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{userRole}</p>
                    </div>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex w-full items-center justify-center gap-2 py-2 text-[10px] font-black text-red-500 hover:bg-red-50 rounded-xl transition-all uppercase tracking-widest"
                >
                    <LogOut className="h-3.5 w-3.5" />
                    Log Out
                </button>
            </div>

            <Link
                href="/settings"
                onClick={closeSidebar}
                className={cn(
                    "flex items-center gap-3 px-4 py-3 text-xs font-bold transition-all rounded-xl",
                    pathname === "/settings"
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-400 hover:text-gray-900"
                )}
            >
                <Settings className="h-4 w-4" />
                System Settings
            </Link>
        </div>
    </div>
);

import { useSession, signOut } from "next-auth/react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { data: session, status } = useSession();
    const pathname = usePathname();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="font-black text-[10px] text-indigo-400 uppercase tracking-[0.2em]">Securing Session...</p>
            </div>
        );
    }

    const user = {
        name: session?.user?.name || "User",
        role: (session?.user as { role?: string })?.role || "student"
    };


    const activeItems = user.role === "supervisor" ? supervisorItems : studentItems;

    return (
        <div className="flex min-h-screen bg-[#fafbfc]">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 flex-col bg-white fixed h-full z-40 border-r border-gray-100 transition-all">
                <SidebarContent
                    activeItems={activeItems}
                    pathname={pathname}
                    closeSidebar={closeSidebar}
                    userName={user.name}
                    userRole={user.role}
                />
            </aside>

            {/* Mobile Sidebar Slider */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 w-80 bg-white z-50 lg:hidden transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[0_0_50px_rgba(0,0,0,0.1)]",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="absolute top-6 right-6">
                    <Button variant="ghost" size="icon" onClick={closeSidebar} className="rounded-full hover:bg-gray-100">
                        <X className="h-6 w-6 text-gray-400" />
                    </Button>
                </div>
                <SidebarContent
                    activeItems={activeItems}
                    pathname={pathname}
                    closeSidebar={closeSidebar}
                    userName={user.name}
                    userRole={user.role}
                />
            </aside>

            {/* Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/40 z-40 lg:hidden backdrop-blur-md transition-all duration-500 animate-in fade-in"
                    onClick={closeSidebar}
                />
            )}

            <div className="flex-1 flex flex-col lg:pl-72 relative">
                {/* Mobile Top Navigation */}
                <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-30 transition-all">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="rounded-xl hover:bg-gray-50 -ml-2">
                            <Menu className="h-6 w-6 text-gray-900" />
                        </Button>
                        <span className="font-black text-xl text-gray-900 tracking-tighter">PROJECTASSISTANTAI</span>
                    </div>
                    <div className="h-10 w-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-black text-indigo-700 shadow-sm shadow-indigo-50">
                        {user.name.substring(0, 2).toUpperCase()}
                    </div>
                </header>

                <main className="flex-1 px-4 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10 max-w-[1600px] w-full mx-auto">
                    {children}
                </main>

                <footer className="px-8 py-8 border-t border-gray-100 bg-white/50">
                    <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex flex-col items-center gap-3 mb-8">
                            <p className="text-[10px] font-black text-indigo-900/40 uppercase tracking-[0.2em]">
                                Powered by Synapse Engineering and supplies
                            </p>
                            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <a href="tel:08028110448" className="hover:text-indigo-600 transition-colors">08028110448</a>
                                <span className="opacity-30">•</span>
                                <a href="https://www.synapseengineering.com.ng/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">www.synapseengineering.com.ng</a>
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                            © 2026 PROJECTASSISTANTAI Platform.
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
