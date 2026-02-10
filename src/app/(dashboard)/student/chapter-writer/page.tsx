
"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Save, Wand2, Loader2, UploadCloud, RefreshCcw, ArrowLeft, CheckCircle, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const CHAPTERS_LIST = [
    { id: 1, title: "Abstract", hint: "Summary of the entire project, including problem, method, results, and conclusion." },
    { id: 2, title: "Introduction", hint: "Background, Problem Statement, Objectives, Scope, and Significance." },
    { id: 3, title: "Literature Review", hint: "Review of related works, theoretical framework, and research gaps." },
    { id: 4, title: "Methodology", hint: "Research design, population, sampling, data collection, or system analysis." },
    { id: 5, title: "Implementation", hint: "System design, architecture, algorithms, or field work details." },
    { id: 6, title: "Results", hint: "Presentation of data, screenshots of system, or analysis findings." },
    { id: 7, title: "Discussion", hint: "Interpretation of results in context of literature and objectives." },
    { id: 8, title: "Conclusion", hint: "Summary of findings, conclusion, limitations, and recommendations." },
    { id: 9, title: "References", hint: "List of all citations in APA/MLA format." }
];

export default function ChapterWriter() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <ChapterWriterContent />
        </Suspense>
    );
}

function ChapterWriterContent() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get('projectId');
    const chapterIdParam = searchParams.get('chapter');

    const [activeChapterId, setActiveChapterId] = useState<number>(chapterIdParam ? parseInt(chapterIdParam) : 1);
    const [content, setContent] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // AI Context
    const [topic, setTopic] = useState("");
    const [sampleText, setSampleText] = useState("");
    const [showAiPanel, setShowAiPanel] = useState(true);

    // Fetch existing content when chapter changes
    useEffect(() => {
        if (!projectId) return;

        const fetchChapter = async () => {
            setContent(""); // Clear previous
            setTopic("");

            try {
                // We need an endpoint to get specific chapter status/content
                // For now, let's assume we can fetch via the project endpoint or a new one
                // I'll use a new specific endpoint for cleaner separation later, but for now reuse logic?
                // Actually, let's just fetch the project and find the chapter
                const res = await fetch(`/api/projects/${projectId}`);
                if (res.ok) {
                    const project = await res.json();
                    const chapter = project.chapters.find((c: { chapterNumber: number; content: string; updatedAt: string }) => c.chapterNumber === activeChapterId);
                    if (chapter) {
                        setContent(chapter.content || "");
                        setLastSaved(new Date(chapter.updatedAt));
                    }
                }
            } catch (error) {
                console.error("Failed to load chapter", error);
            }
        };
        fetchChapter();
    }, [projectId, activeChapterId]);

    const handleGenerate = async () => {
        if (!projectId) return;
        setIsGenerating(true);

        const currentChapterTitle = CHAPTERS_LIST.find(c => c.id === activeChapterId)?.title;

        try {
            const res = await fetch("/api/chapters/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId,
                    chapterNumber: activeChapterId,
                    chapterTitle: currentChapterTitle, // Pass title for context
                    topic, // User guidance
                    sampleText: sampleText.substring(0, 5000) // Limit sample size
                }),
            });

            if (!res.ok) throw new Error("Generation failed");

            const data = await res.json();
            setContent(prev => prev + "\n\n" + data.content); // Append or replace? Append is safer for "Regenerate" to not lose work
            // Only update saved time if we actually save it, which the API does.
            setLastSaved(new Date());
        } catch (error) {
            console.error(error);
            alert("Failed to generate content. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!projectId) return;
        setIsSaving(true);
        const currentChapterTitle = CHAPTERS_LIST.find(c => c.id === activeChapterId)?.title;

        try {
            const res = await fetch("/api/chapters/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId,
                    chapterNumber: activeChapterId,
                    title: currentChapterTitle,
                    content
                }),
            });

            if (!res.ok) throw new Error("Save failed");
            setLastSaved(new Date());
        } catch (error) {
            console.error(error);
            alert("Failed to save.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if (file.type === "text/plain") {
                const text = await file.text();
                setSampleText(text);
                alert("Sample text loaded for AI context!");
            } else {
                // Use backend for PDF/DOCX
                const formData = new FormData();
                formData.append("file", file);

                try {
                    const res = await fetch("/api/upload", {
                        method: "POST",
                        body: formData
                    });

                    if (!res.ok) throw new Error("Upload failed");

                    const data = await res.json();
                    if (data.text) {
                        setSampleText(data.text);
                        alert("Document processed! AI context updated.");
                    }
                } catch (error) {
                    console.error(error);
                    alert("Failed to process file. Please ensure it's a valid PDF or DOCX.");
                }
            }
        }
    };

    if (!projectId) return <div className="p-10">Invalid Project ID</div>;

    const activeChapter = CHAPTERS_LIST.find(c => c.id === activeChapterId) || CHAPTERS_LIST[0];

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-0rem)] bg-white overflow-hidden relative">
            {/* Toolbar */}
            <header className="bg-white border-b px-4 md:px-6 py-3 flex justify-between items-center shadow-sm z-30 sticky top-0">
                <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
                    <Button variant="ghost" size="icon" asChild className="shrink-0 rounded-full hover:bg-indigo-50">
                        <Link href={`/student/project/${projectId}`}>
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </Link>
                    </Button>
                    <div className="min-w-0 pr-2">
                        <h1 className="font-black text-gray-900 flex items-center gap-2 text-sm md:text-base truncate">
                            {activeChapter.title}
                            <span className="hidden sm:inline-block text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                Ch. {activeChapter.id}
                            </span>
                        </h1>
                        <p className="text-[10px] md:text-xs text-gray-400 font-medium truncate">
                            {lastSaved ? `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Draft unsaved"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAiPanel(!showAiPanel)}
                        className={cn(
                            "rounded-xl font-bold text-xs h-9 transition-all",
                            showAiPanel ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:text-indigo-600"
                        )}
                    >
                        <Wand2 className={cn("h-4 w-4 sm:mr-2 transition-transform", showAiPanel && "rotate-12")} />
                        <span className="hidden sm:inline font-black tracking-tight uppercase">Copilot</span>
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        size="sm"
                        className="rounded-xl shadow-md shadow-indigo-100 font-black text-xs uppercase tracking-tight h-9 px-4 hidden sm:flex"
                    >
                        {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                        Save
                    </Button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Chapter Navigation Sidebar - Hidden on mobile, sticky on desktop */}
                <aside className="w-64 bg-gray-50/50 border-r overflow-y-auto hidden lg:block shrink-0">
                    <div className="p-6">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Structure</h3>
                        <nav className="space-y-1">
                            {CHAPTERS_LIST.map((chap) => (
                                <button
                                    key={chap.id}
                                    onClick={() => setActiveChapterId(chap.id)}
                                    className={cn(
                                        "w-full text-left px-4 py-3 text-sm rounded-xl transition-all duration-200 flex items-center gap-3",
                                        activeChapterId === chap.id
                                            ? "bg-white text-indigo-700 shadow-sm border border-gray-100 font-black translate-x-1"
                                            : "text-gray-500 hover:bg-white/80 hover:text-gray-900 font-medium"
                                    )}
                                >
                                    <span className={cn(
                                        "h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black",
                                        activeChapterId === chap.id ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-400"
                                    )}>
                                        {chap.id}
                                    </span>
                                    <span className="truncate">{chap.title}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main Editor */}
                <main className="flex-1 flex flex-col relative bg-white z-10 overflow-hidden">
                    {/* Visual Editor */}
                    <div className="flex-1 overflow-y-auto outline-none">
                        <div className="max-w-3xl mx-auto w-full px-6 py-8 md:py-16">
                            <h2 className="text-gray-300 font-black text-3xl md:text-5xl mb-8 select-none tracking-tighter">
                                {activeChapter.title}
                            </h2>
                            <textarea
                                className="w-full min-h-[70vh] resize-none outline-none text-base md:text-xl leading-relaxed text-gray-800 font-serif placeholder:text-gray-200 bg-transparent selection:bg-indigo-100"
                                placeholder={`Start drafting your ${activeChapter.title.toLowerCase()} here...`}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Mobile Navigation Bar - Toggle for switching chapters on mobile */}
                    <div className="lg:hidden bg-white border-t px-4 py-3 flex items-center justify-between gap-2 overflow-x-auto whitespace-nowrap no-scrollbar pb-20 sm:pb-3">
                        {CHAPTERS_LIST.map((chap) => (
                            <button
                                key={chap.id}
                                onClick={() => setActiveChapterId(chap.id)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0",
                                    activeChapterId === chap.id
                                        ? "bg-indigo-600 text-white shadow-md scale-105"
                                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                )}
                            >
                                {chap.title}
                            </button>
                        ))}
                    </div>

                    {/* Mobile Floating Action Buttons */}
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-50 sm:hidden">
                        {!showAiPanel && (
                            <Button
                                onClick={() => setShowAiPanel(true)}
                                className="rounded-full bg-indigo-600 text-white p-4 h-14 w-14 shadow-2xl shadow-indigo-300 animate-in zoom-in"
                            >
                                <Wand2 className="h-6 w-6" />
                            </Button>
                        )}
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="rounded-full bg-black text-white px-6 h-14 shadow-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2"
                        >
                            {isSaving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                            Save Draft
                        </Button>
                    </div>
                </main>

                {/* AI Assistant Panel - Full height on desktop, Bottom/Top drawer on mobile */}
                {showAiPanel && (
                    <aside className={cn(
                        "bg-white flex flex-col z-40 transition-all duration-300 ease-in-out border-l shadow-2xl",
                        "static w-full lg:w-96 fixed inset-0 lg:inset-auto lg:h-full lg:right-0",
                        "animate-in slide-in-from-right-full lg:slide-in-from-right"
                    )}>
                        <div className="p-5 border-b bg-indigo-600 flex justify-between items-center lg:rounded-none">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                                    <Wand2 className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-black text-white text-sm uppercase tracking-widest">AI Copilot</h3>
                                    <p className="text-[10px] text-indigo-100 font-medium">Drafting Assistant</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowAiPanel(false)} className="text-white hover:bg-white/10 rounded-full">
                                <X className="h-6 w-6" />
                            </Button>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto space-y-6">
                            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                                <p className="text-xs text-indigo-700 font-bold leading-relaxed italic">
                                    &quot;{activeChapter.hint}&quot;
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    User Guidance
                                </label>
                                <textarea
                                    className="w-full text-sm p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none min-h-[140px] font-medium transition-all placeholder:text-gray-300"
                                    placeholder="Tell the AI what to focus on... (e.g., Explain the core architecture)"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                />
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest uppercase">Style Guide</label>
                                </div>
                                <div className="group relative">
                                    <input
                                        type="file"
                                        id="style-upload"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        accept=".txt,.md,.pdf,.docx"
                                    />
                                    <label
                                        htmlFor="style-upload"
                                        className={cn(
                                            "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300",
                                            sampleText ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-100 hover:border-indigo-300 hover:bg-gray-100"
                                        )}
                                    >
                                        <UploadCloud className={cn("h-8 w-8 mb-2 transition-colors", sampleText ? "text-green-600" : "text-gray-300 group-hover:text-indigo-400")} />
                                        <p className={cn("text-xs font-black uppercase tracking-tight", sampleText ? "text-green-700" : "text-gray-500")}>
                                            {sampleText ? "Style Loaded" : "Upload Reference"}
                                        </p>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 space-y-3">
                                <Button
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 h-14 rounded-2xl shadow-xl shadow-indigo-200 font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95"
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !topic}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="animate-spin mr-2 h-5 w-5" />
                                            Writing Section...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="mr-2 h-5 w-5" />
                                            Generate Content
                                        </>
                                    )}
                                </Button>
                                <p className="text-[10px] text-center text-gray-400 font-medium">AI generated content may require human verification.</p>
                            </div>

                            <div className="pt-8 border-t border-gray-100 space-y-4">
                                <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Editing Tools</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" size="sm" className="rounded-xl border-gray-100 font-bold text-[10px] uppercase h-10 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                                        <RefreshCcw className="mr-2 h-3 w-3" />
                                        Rephrase
                                    </Button>
                                    <Button variant="outline" size="sm" className="rounded-xl border-gray-100 font-bold text-[10px] uppercase h-10 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                                        <CheckCircle className="mr-2 h-3 w-3" />
                                        Grammar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    )
}
