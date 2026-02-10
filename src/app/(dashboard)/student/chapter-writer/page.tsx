
"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Save, Wand2, Loader2, UploadCloud, RefreshCcw, ArrowLeft, CheckCircle } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

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
    const router = useRouter();
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
                    const chapter = project.chapters.find((c: any) => c.chapterNumber === activeChapterId);
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
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Toolbar */}
            <div className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/student/project/${projectId}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="font-bold text-gray-900 flex items-center gap-2">
                            {activeChapter.title}
                            <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                Chapter {activeChapter.id}
                            </span>
                        </h1>
                        <p className="text-xs text-gray-500">
                            {lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : "Unsaved changes"}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowAiPanel(!showAiPanel)}>
                        <Wand2 className="mr-2 h-4 w-4 text-indigo-600" />
                        {showAiPanel ? "Hide AI" : "AI Assistant"}
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Draft
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Chapter Navigation Sidebar */}
                <aside className="w-64 bg-gray-50 border-r overflow-y-auto hidden md:block">
                    <div className="p-4">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Outline</h3>
                        <nav className="space-y-1">
                            {CHAPTERS_LIST.map((chap) => (
                                <button
                                    key={chap.id}
                                    onClick={() => {
                                        // Auto save current before switching?
                                        setActiveChapterId(chap.id);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between ${activeChapterId === chap.id
                                        ? "bg-white text-indigo-700 shadow-sm border border-gray-200 font-medium"
                                        : "text-gray-600 hover:bg-white hover:text-gray-900"
                                        }`}
                                >
                                    <span>{chap.id}. {chap.title}</span>
                                    {/* Status indicator could go here */}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main Editor */}
                <main className="flex-1 flex flex-col relative bg-white">
                    {/* Visual Editor (Textarea for now, Rich Text later) */}
                    <div className="flex-1 overflow-auto p-8 max-w-4xl mx-auto w-full">
                        <textarea
                            className="w-full h-full resize-none outline-none text-lg leading-relaxed text-gray-800 font-serif placeholder:text-gray-300"
                            placeholder={`Start writing your ${activeChapter.title} here...`}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                </main>

                {/* AI Assistant Panel */}
                {showAiPanel && (
                    <aside className="w-80 bg-white border-l flex flex-col shadow-xl z-20">
                        <div className="p-4 border-b bg-indigo-50/50">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Wand2 className="h-4 w-4 text-indigo-600" />
                                AI Copilot
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                {activeChapter.hint}
                            </p>
                        </div>

                        <div className="p-4 flex-1 overflow-y-auto space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">
                                    What should this section cover?
                                </label>
                                <textarea
                                    className="w-full text-sm p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
                                    placeholder="E.g., Discuss the limitations of the random forest algorithm used..."
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">
                                    Style Reference
                                </label>
                                <div className="border rounded-md p-3 bg-gray-50 text-center">
                                    <input
                                        type="file"
                                        id="style-upload"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        accept=".txt,.md,.pdf,.docx"
                                    />
                                    <label htmlFor="style-upload" className="cursor-pointer flex flex-col items-center gap-2 text-sm text-gray-600 hover:text-indigo-600">
                                        <UploadCloud className="h-5 w-5" />
                                        <span>{sampleText ? "Sample Loaded" : "Upload text sample"}</span>
                                    </label>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">
                                    Upload a standard academic paper to match its tone.
                                </p>
                            </div>

                            <Button
                                className="w-full bg-indigo-600 hover:bg-indigo-700"
                                onClick={handleGenerate}
                                disabled={isGenerating || !topic}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                        Writing...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="mr-2 h-4 w-4" />
                                        Generate Draft
                                    </>
                                )}
                            </Button>

                            <div className="pt-4 mt-4 border-t">
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Actions</h4>
                                <div className="space-y-2">
                                    <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                                        <RefreshCcw className="mr-2 h-3 w-3" />
                                        Rephrase Selection
                                    </Button>
                                    <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                                        <CheckCircle className="mr-2 h-3 w-3" />
                                        Check Grammar
                                    </Button>
                                    {/* Export specific chapter? */}
                                </div>
                            </div>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    )
}
