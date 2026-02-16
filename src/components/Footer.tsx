"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Footer() {
    const pathname = usePathname();
    const isDashboard = pathname?.startsWith('/student') || pathname?.startsWith('/supervisor');

    return (
        <footer className={cn(
            "w-full bg-[#1e1b4b] text-white py-6 border-t border-indigo-900/50 relative z-30 transition-all duration-300",
            isDashboard ? "lg:pl-72 print:hidden" : ""
        )}>
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 text-sm">

                    {/* Logo & Brand */}
                    <div className="flex items-center gap-3 group transition-opacity hover:opacity-100 opacity-90">
                        <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20 shadow-inner group-hover:bg-indigo-500/20 transition-colors">
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                width={20}
                                height={20}
                                className="w-5 h-5 object-contain"
                            />
                        </div>
                        <span className="font-bold tracking-tight text-indigo-50">ProjectAssistantAI</span>
                    </div>

                    {/* Center Links - Optimized for space */}
                    <div className="flex flex-col md:flex-row justify-center items-center gap-y-4 gap-x-8 text-sm font-medium text-indigo-200/80">
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            Powered by <span className="text-indigo-100 font-bold">Synapse Engineering</span>
                        </span>

                        <a href="tel:08028110448" className="flex items-center gap-2 hover:text-white transition-colors group py-2 md:py-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:bg-indigo-400 transition-colors"></span>
                            08028110448
                        </a>

                        <a
                            href="https://www.synapseengineering.com.ng/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 hover:text-white transition-colors group py-2 md:py-0"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:bg-indigo-400 transition-colors"></span>
                            synapseengineering.com.ng
                        </a>
                    </div>

                    {/* Legal / Copyright */}
                    <div className="flex items-center gap-6 text-sm text-indigo-300/60 font-medium mt-4 md:mt-0">
                        <div className="flex gap-4">
                            <Link href="#" className="hover:text-indigo-100 transition-colors p-2">Terms</Link>
                            <Link href="#" className="hover:text-indigo-100 transition-colors p-2">Privacy</Link>
                        </div>
                        <div className="w-px h-4 bg-indigo-800 hidden md:block"></div>
                        <p>© 2026</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
