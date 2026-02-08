
"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Save, Wand2, Loader2, UploadCloud, FileText, CheckCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

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
    const chapterId = searchParams.get('chapter'); // Optional: for editing existing

    const [topic, setTopic] = useState("");
    const [sampleFile, setSampleFile] = useState<File | null>(null);
    const [sampleText, setSampleText] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [chapterContent, setChapterContent] = useState("");
    const [activeChapter, setActiveChapter] = useState(1);
    const [projectLevel, setProjectLevel] = useState("Undergraduate");

    const chaptersList = [
        { id: 1, title: "Introduction" },
        { id: 2, title: "Literature Review" },
        { id: 3, title: "Methodology" },
        { id: 4, title: "Data Analysis" },
        { id: 5, title: "Conclusion" }
    ];

    useEffect(() => {
        if (chapterId) setActiveChapter(parseInt(chapterId));
    }, [chapterId]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSampleFile(file);
            const text = await file.text();
            setSampleText(text);
        }
    };

    const handleGenerate = async () => {
        if (!topic || !projectId) return;

        setIsGenerating(true);
        try {
            const response = await fetch("/api/chapters/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId,
                    chapterNumber: activeChapter,
                    topic,
                    level: projectLevel,
                    sampleText: sampleText.substring(0, 3000)
                }),
            });

            if (!response.ok) throw new Error("API Error");

            const data = await response.json();
            // The API now returns the Prisma Chapter object
            setChapterContent(data.content || "");
        } catch (error) {
            console.error("Generation failed:", error);
            alert("Failed to generate chapter. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };


    const handleSave = async () => {
        if (!projectId) return;

        try {
            const response = await fetch("/api/chapters/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId,
                    chapterNumber: activeChapter,
                    content: chapterContent,
                    title: `Chapter ${activeChapter}` // Can be enhanced to allow custom titles
                }),
            });

            if (!response.ok) throw new Error("Save failed");

            // Optional: Show success feedback (toast or icon change)
            alert("Chapter saved successfully!");
        } catch (error) {
            console.error("Save error:", error);
            alert("Failed to save chapter.");
        }
    };

    if (!projectId) {
        return <div className="p-10 text-center">Please select a project from the dashboard first.</div>;
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6">
            {/* Chapter Navigation */}
            <div className="w-64 bg-white border-r flex flex-col hidden md:flex rounded-l-lg">
                <div className="p-4 border-b font-semibold text-gray-700 bg-gray-50 rounded-tl-lg">Chapters</div>
                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    {chaptersList.map((chap) => (
                        <button
                            key={chap.id}
                            onClick={() => setActiveChapter(chap.id)}
                            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${activeChapter === chap.id
                                ? "bg-indigo-50 text-indigo-700 font-medium"
                                : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            Chapter {chap.id}: {chap.title}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Toolbar */}
                <div className="h-14 border-b flex items-center justify-between px-4 bg-gray-50">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Chapter {activeChapter}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="h-8" onClick={handleSave}>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                        </Button>
                        <Button size="sm" variant="outline" className="h-8">
                            <UploadCloud className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* AI Generation Inputs */}
                {!chapterContent && (
                    <div className="p-6 border-b bg-indigo-50/30">
                        <div className="grid gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Project Topic / Chapter Focus</label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder={`Describe what Chapter ${activeChapter} should cover...`}
                                    className="w-full text-sm p-2 border rounded-md"
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Sample Text</label>
                                    <label className="flex items-center gap-2 px-3 py-2 bg-white border rounded-md text-sm cursor-pointer hover:bg-gray-50 transition-colors text-gray-600">
                                        <UploadCloud className="h-4 w-4" />
                                        <span>{sampleFile ? sampleFile.name : "Upload Style Sample (.txt)"}</span>
                                        <input type="file" accept=".txt" onChange={handleFileChange} className="hidden" />
                                    </label>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={handleGenerate}
                                    disabled={!topic || isGenerating}
                                    className="mt-5 bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                    Generate Draft
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Text Editor */}
                <textarea
                    className="flex-1 w-full p-6 resize-none focus:outline-none text-gray-800 leading-relaxed overflow-y-auto font-serif text-lg"
                    placeholder="Chapter content will appear here..."
                    value={chapterContent}
                    onChange={(e) => setChapterContent(e.target.value)}
                ></textarea>
            </div>
        </div>
    )
}
