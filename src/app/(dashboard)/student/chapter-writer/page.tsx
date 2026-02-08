
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Save, Wand2, Loader2, UploadCloud, FileText } from "lucide-react";

export default function ChapterWriter() {
    const [topic, setTopic] = useState("");
    const [sampleFile, setSampleFile] = useState<File | null>(null);
    const [sampleText, setSampleText] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [chapterContent, setChapterContent] = useState("");
    const [activeSection, setActiveSection] = useState("1.1 Background");

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSampleFile(file);

            // Simple text file reading
            const text = await file.text();
            setSampleText(text);
        }
    };

    const handleGenerate = async () => {
        if (!topic) return;

        setIsGenerating(true);
        try {
            const response = await fetch("/api/generate-chapter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic,
                    level: "Undergraduate", // Defaulting for now
                    sampleText: sampleText.substring(0, 2000) // Limit sample text size
                }),
            });

            const data = await response.json();

            if (data.result && data.result.draft) {
                // Determine which chapter part to show based on activeSection (simple mapping)
                // In a real app, we'd parse this more granularly
                setChapterContent(JSON.stringify(data.result.draft, null, 2));
            }
        } catch (error) {
            console.error("Generation failed:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6">
            {/* Chapter Navigation */}
            <div className="w-64 bg-white border-r flex flex-col hidden md:flex rounded-l-lg">
                <div className="p-4 border-b font-semibold text-gray-700 bg-gray-50 rounded-tl-lg">Chapter Content</div>
                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    {["1.1 Background", "1.2 Problem Statement", "1.3 Objectives", "1.4 Scope", "1.5 Significance"].map((section) => (
                        <button
                            key={section}
                            onClick={() => setActiveSection(section)}
                            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${activeSection === section
                                ? "bg-indigo-50 text-indigo-700 font-medium"
                                : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            {section}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Toolbar */}
                <div className="h-14 border-b flex items-center justify-between px-4 bg-gray-50">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">{activeSection}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="h-8">
                            <Save className="h-4 w-4 mr-2" />
                            Save Draft
                        </Button>
                        <Button size="sm" variant="outline" className="h-8">
                            <UploadCloud className="h-4 w-4 mr-2" />
                            Export Project
                        </Button>
                        <Button size="sm" className="h-8" disabled={isGenerating}>
                            {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
                            AI Refine
                        </Button>
                    </div>
                </div>

                {/* Content Input Area (AI Generation Setup) */}
                {!chapterContent && (
                    <div className="p-6 border-b bg-indigo-50/30">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Wand2 className="h-4 w-4 text-indigo-600" />
                            AI Generation Setup
                        </h3>
                        <div className="grid gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Project Topic</label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g., Impact of AI on Healthcare Systems in Nigeria"
                                    className="w-full text-sm p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900 bg-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Sample Project (Optional)</label>
                                <div className="flex items-center gap-2">
                                    <label className="flex items-center gap-2 px-3 py-2 bg-white border rounded-md text-sm cursor-pointer hover:bg-gray-50 transition-colors text-gray-600">
                                        <UploadCloud className="h-4 w-4" />
                                        <span>{sampleFile ? sampleFile.name : "Upload .txt file"}</span>
                                        <input type="file" accept=".txt" onChange={handleFileChange} className="hidden" />
                                    </label>
                                    {sampleFile && (
                                        <span className="text-xs text-green-600 flex items-center gap-1">
                                            <FileText className="h-3 w-3" />
                                            Loaded
                                        </span>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">Upload a sample project to guide the AI on tone and structure.</p>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    size="sm"
                                    onClick={handleGenerate}
                                    disabled={!topic || isGenerating}
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Generating Draft...
                                        </>
                                    ) : (
                                        <>Generate Chapter Draft</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Text Editor */}
                <textarea
                    className="flex-1 w-full p-6 resize-none focus:outline-none text-gray-800 leading-relaxed overflow-y-auto font-serif text-lg"
                    placeholder="Start writing your chapter content here..."
                    value={chapterContent}
                    onChange={(e) => setChapterContent(e.target.value)}
                ></textarea>

                {/* Footer info */}
                <div className="h-8 border-t flex items-center justify-between px-4 text-xs text-gray-400 bg-gray-50">
                    <span>Last saved: {chapterContent ? "Just now" : "Never"}</span>
                    <span>{chapterContent.split(/\s+/).filter(Boolean).length} words</span>
                </div>
            </div>

            {/* AI Assistant Panel (Right Sidebar) */}
            <div className="w-72 bg-white border-l flex flex-col rounded-r-lg hidden lg:flex">
                <div className="p-4 border-b font-semibold text-gray-700 flex items-center gap-2 bg-gray-50 rounded-tr-lg">
                    <MessageSquare className="h-4 w-4 text-indigo-600" />
                    Assistant
                </div>
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800 border border-blue-100">
                        <strong>Tip:</strong> Establish the context of your research in 1.1. Start broad and narrow down to your specific problem.
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Actions</label>
                        <Button variant="outline" size="sm" className="w-full justify-start text-gray-600">
                            Suggest References
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start text-gray-600">
                            Check Academic Tone
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start text-gray-600">
                            Format Citations (APA 7)
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
