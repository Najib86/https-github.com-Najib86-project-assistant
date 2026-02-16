
"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Save, Wand2, Loader2, UploadCloud, RefreshCcw, ArrowLeft, CheckCircle, X, List } from "lucide-react";
import ChapterEditor from "@/components/ChapterEditor";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
    const router = useRouter();
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
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

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


    // Redirect if no project ID
    useEffect(() => {
        if (!projectId) {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    fetch(`/api/projects?studentId=${user.id}`)
                        .then(res => res.json())
                        .then(projects => {
                            if (projects && projects.length > 0) {
                                // Redirect to the most recent project (first in list usually)
                                const latestId = projects[0].project_id;
                                router.replace(`/student/chapter-writer?projectId=${latestId}`);
                            } else {
                                router.push('/student'); // No projects, go to dashboard
                            }
                        })
                        .catch(() => router.push('/student'));
                } catch {
                    router.push('/login');
                }
            } else {
                router.push('/login');
            }
        }
    }, [projectId, router]);


    if (!projectId) return <div className="flex bg-gray-50 h-screen items-center justify-center"><Loader2 className="animate-spin text-indigo-600 mr-2" /> Loading Project Context...</div>;


    const activeChapter = CHAPTERS_LIST.find(c => c.id === activeChapterId) || CHAPTERS_LIST[0];

    return (
        <div className="flex flex-col h-[100dvh] lg:h-[calc(100vh-theme(spacing.0))] bg-white overflow-hidden relative">
            {/* Toolbar */}
            <header className="bg-white border-b px-4 py-3 flex justify-between items-center shadow-sm z-30 shrink-0">
                <div className="flex items-center gap-2 md:gap-4 overflow-hidden flex-1">
                    <Button variant="ghost" size="icon" asChild className="shrink-0 rounded-full h-10 w-10 hover:bg-indigo-50 -ml-2">
                        <Link href={`/student/project/${projectId}`}>
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </Link>
                    </Button>

                    {/* Mobile Chapter Select Trigger */}
                    <div className="lg:hidden flex-1 min-w-0" onClick={() => setShowMobileSidebar(true)}>
                        <div className="flex flex-col">
                            <h1 className="font-black text-gray-900 text-sm truncate flex items-center gap-2">
                                {activeChapter.title}
                                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md">Ch.{activeChapter.id}</span>
                            </h1>
                            <p className="text-[10px] text-gray-400 font-medium truncate flex items-center gap-1">
                                Tap to change chapter <List className="h-3 w-3" />
                            </p>
                        </div>
                    </div>

                    {/* Desktop Title */}
                    <div className="hidden lg:block min-w-0 pr-2">
                        <h1 className="font-black text-gray-900 flex items-center gap-2 text-base truncate">
                            {activeChapter.title}
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                Ch. {activeChapter.id}
                            </span>
                        </h1>
                        <p className="text-xs text-gray-400 font-medium truncate">
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
                            "rounded-xl font-bold text-xs h-10 px-3 transition-all",
                            showAiPanel ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:text-indigo-600"
                        )}
                    >
                        <Wand2 className={cn("h-5 w-5 sm:mr-2 transition-transform", showAiPanel && "rotate-12")} />
                        <span className="hidden sm:inline font-black tracking-tight uppercase">Copilot</span>
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        size="sm"
                        className="rounded-xl shadow-md shadow-indigo-100 font-black text-xs uppercase tracking-tight h-10 px-4 flex"
                    >
                        {isSaving ? <Loader2 className="animate-spin md:mr-2 h-4 w-4" /> : <Save className="md:mr-2 h-4 w-4" />}
                        <span className="hidden md:inline">Save</span>
                    </Button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Desktop Chapter Sidebar */}
                <aside className="w-64 bg-gray-50/50 border-r overflow-y-auto hidden lg:block shrink-0 h-full">
                    <div className="p-6">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Structure</h3>
                        <nav className="space-y-1">
                            {CHAPTERS_LIST.map((chap) => (
                                <button
                                    key={chap.id}
                                    onClick={() => setActiveChapterId(chap.id)}
                                    className={cn(
                                        "w-full text-left px-3 py-3 text-sm rounded-xl transition-all duration-200 flex items-center gap-3",
                                        activeChapterId === chap.id
                                            ? "bg-white text-indigo-700 shadow-sm border border-gray-100 font-black translate-x-1"
                                            : "text-gray-500 hover:bg-white/80 hover:text-gray-900 font-medium"
                                    )}
                                >
                                    <span className={cn(
                                        "h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0",
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

                {/* Mobile Chapter Sidebar Overlay */}
                {showMobileSidebar && (
                    <div className="fixed inset-0 z-50 lg:hidden flex">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileSidebar(false)} />
                        <aside className="relative w-[80%] max-w-sm bg-white h-full shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
                            <div className="p-4 border-b flex items-center justify-between bg-indigo-50/50">
                                <h2 className="font-bold text-gray-900">Select Chapter</h2>
                                <Button variant="ghost" size="icon" onClick={() => setShowMobileSidebar(false)} className="h-8 w-8 rounded-full">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {CHAPTERS_LIST.map((chap) => (
                                    <button
                                        key={chap.id}
                                        onClick={() => {
                                            setActiveChapterId(chap.id);
                                            setShowMobileSidebar(false);
                                        }}
                                        className={cn(
                                            "w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center gap-4 border",
                                            activeChapterId === chap.id
                                                ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm font-bold"
                                                : "bg-white text-gray-600 border-gray-100 hover:bg-gray-50"
                                        )}
                                    >
                                        <span className={cn(
                                            "h-8 w-8 rounded-full flex items-center justify-center text-xs font-black shrink-0",
                                            activeChapterId === chap.id ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"
                                        )}>
                                            {chap.id}
                                        </span>
                                        <div>
                                            <div className="font-bold text-base leading-tight">{chap.title}</div>
                                            <div className="text-[10px] text-gray-400 mt-1 line-clamp-1">{chap.hint}</div>
                                        </div>
                                        {activeChapterId === chap.id && <CheckCircle className="h-5 w-5 text-indigo-600 ml-auto" />}
                                    </button>
                                ))}
                            </div>
                        </aside>
                    </div>
                )}

                {/* Main Editor Area */}
                <main className="flex-1 flex flex-col relative bg-white z-10 overflow-hidden h-full">
                    <ChapterEditor
                        chapterId={activeChapterId}
                        projectId={parseInt(projectId)}
                        initialContent={content}
                        initialStatus="Draft"
                        role="student"
                        userId={1} // TODO: Get from session
                        onStatusChange={() => setLastSaved(new Date())}
                    />
                </main>

                {/* AI Assistant Panel - Mobile Overlay / Desktop Sidebar */}
                {showAiPanel && (
                    <aside className={cn(
                        "bg-white flex flex-col z-40 transition-all duration-300 ease-in-out border-l shadow-2xl",
                        "fixed inset-0 lg:static lg:h-full lg:w-96 lg:border-l lg:border-gray-200",
                        "animate-in slide-in-from-right duration-300"
                    )}>
                        <div className="p-4 md:p-5 border-b bg-indigo-600 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="bg-white rounded-xl p-1.5 shadow-sm">
                                    <Image
                                        src="/logo.png"
                                        alt="Logo"
                                        width={24}
                                        height={24}
                                        className="rounded-md"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-black text-white text-sm uppercase tracking-widest">AI Copilot</h3>
                                    <p className="text-[10px] text-indigo-100 font-medium">ProjectAssistantAI</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowAiPanel(false)} className="text-white hover:bg-white/10 rounded-full h-8 w-8">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="p-4 md:p-6 flex-1 overflow-y-auto space-y-4 md:space-y-6">
                            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 shadow-sm">
                                <p className="text-xs text-indigo-700 font-bold leading-relaxed italic">
                                    &quot;{activeChapter.hint}&quot;
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    User Guidance
                                </label>
                                <textarea
                                    className="w-full text-base md:text-sm p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none min-h-[140px] font-medium transition-all placeholder:text-gray-300 resize-none"
                                    placeholder="Tell the AI what to focus on... (e.g., Explain the core architecture)"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2 pt-2">
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
                                            sampleText ? "bg-green-50 border-green-200" : "bg-white border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                                        )}
                                    >
                                        <UploadCloud className={cn("h-8 w-8 mb-2 transition-colors", sampleText ? "text-green-600" : "text-gray-300 group-hover:text-indigo-400")} />
                                        <p className={cn("text-xs font-black uppercase tracking-tight", sampleText ? "text-green-700" : "text-gray-500")}>
                                            {sampleText ? "Style Loaded" : "Upload Reference"}
                                        </p>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-2 space-y-3">
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
                                <p className="text-[10px] text-center text-gray-400 font-medium">AI generated content may require verification.</p>
                            </div>

                            <div className="pt-6 border-t border-gray-100 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <Button variant="outline" size="sm" className="rounded-xl border-gray-200 font-bold text-[10px] uppercase h-11 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                                        <RefreshCcw className="mr-2 h-4 w-4" />
                                        Rephrase
                                    </Button>
                                    <Button variant="outline" size="sm" className="rounded-xl border-gray-200 font-bold text-[10px] uppercase h-11 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                                        <CheckCircle className="mr-2 h-4 w-4" />
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
