"use client";

import { useState, useEffect } from "react";
import { Type, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
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
                <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Display Settings</h1>
                <p className="text-gray-500 font-medium">Personalize your writing environment for maximum productivity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Typography */}
                <div className="col-span-2 bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                            <Type />
                        </div>
                        <div>
                            <p className="text-lg font-black text-gray-900">Typography</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Reading Experience</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {fonts.map((font) => (
                            <button
                                key={font.name}
                                onClick={() => setActiveFont(font.name)}
                                className={`p-4 rounded-2xl text-sm font-bold border-2 transition-all ${activeFont === font.name
                                    ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                                    : "border-gray-100 text-gray-500 hover:border-gray-200"
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
