"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Moon, Sun, Type, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [activeFont, setActiveFont] = useState("Inter");

    useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) return null;

    const fonts = [
        { name: "Times New Roman", value: "font-serif" },
        { name: "Arial", value: "font-sans" },
        { name: "Georgia", value: "font-serif" },
        { name: "Calibri", value: "font-sans" },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Display Settings</h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Personalize your writing environment for maximum productivity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visual Theme */}
                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            {theme === "dark" ? <Moon /> : <Sun />}
                        </div>
                        <div>
                            <p className="text-lg font-black text-gray-900 dark:text-white">Appearance</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Visual Mode</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                        <span className="font-bold text-gray-700 dark:text-gray-300">Dark Mode</span>
                        <Switch
                            checked={theme === "dark"}
                            onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                        />
                    </div>
                </div>

                {/* Typography */}
                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Type />
                        </div>
                        <div>
                            <p className="text-lg font-black text-gray-900 dark:text-white">Typography</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Reading Experience</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {fonts.map((font) => (
                            <button
                                key={font.name}
                                onClick={() => setActiveFont(font.name)}
                                className={`p-4 rounded-2xl text-sm font-bold border-2 transition-all ${activeFont === font.name
                                    ? "border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40"
                                    : "border-gray-100 dark:border-gray-800 text-gray-500 hover:border-gray-200"
                                    }`}
                            >
                                {font.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 px-8 font-black flex gap-2">
                    <Save className="w-5 h-5" />
                    Save All Changes
                </Button>
            </div>
        </div>
    );
}
