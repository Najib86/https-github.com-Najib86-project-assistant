"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-100/50 bg-white/80 backdrop-blur-xl">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
                    <Image
                        src="/logo.png"
                        alt="Logo"
                        width={32}
                        height={32}
                        className="rounded-lg transition-transform group-hover:scale-110"
                    />
                    <span className="font-black text-lg md:text-xl tracking-tighter text-gray-900">
                        ProjectAssistantAI
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link
                        href="/login"
                        className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        Sign In
                    </Link>
                    <Button asChild className="h-10 rounded-xl px-6 font-bold shadow-lg shadow-indigo-100 transition-transform hover:scale-105 active:scale-95">
                        <Link href="/signup">Get Started</Link>
                    </Button>
                </nav>

                {/* Mobile Hamburger */}
                <button
                    className="md:hidden p-2 -mr-2 text-gray-600 hover:text-gray-900 active:scale-95 transition-transform"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                    aria-expanded={isOpen}
                >
                    {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="absolute top-16 left-0 w-full bg-white border-b border-gray-100 p-4 shadow-xl md:hidden flex flex-col gap-4 animate-in slide-in-from-top-5 fade-in duration-200">
                    <Link
                        href="/login"
                        className="block w-full py-4 px-4 text-center font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl active:bg-gray-100 transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        Sign In
                    </Link>
                    <Button asChild className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-indigo-100 active:scale-[0.98] transition-transform">
                        <Link href="/signup" onClick={() => setIsOpen(false)}>Get Started</Link>
                    </Button>
                </div>
            )}
        </header>
    );
}
