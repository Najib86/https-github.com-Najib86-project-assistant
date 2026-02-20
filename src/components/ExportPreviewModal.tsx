"use client";

import { useState } from "react";
import {
    X, FileText, Download, Loader2,
    Printer, Copy, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Chapter {
    chapter_id: number;
    title: string | null;
    chapterNumber: number;
    content: string | null;
    status: string;
}

interface Project {
    project_id: number;
    title: string;
    chapters: Chapter[];
}

interface Props {
    project: Project;
    isOpen: boolean;
    onClose: () => void;
}

export default function ExportPreviewModal({ project, isOpen, onClose }: Props) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const sortedChapters = [...project.chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);

    const handleDownload = () => {
        setIsDownloading(true);
        // Direct link to the existing API route
        window.location.href = `/api/export/docx?projectId=${project.project_id}`;

        // Reset loading state after a delay (since we can't easily track file download completion)
        setTimeout(() => setIsDownloading(false), 2000);
    };

    const handleCopy = () => {
        const fullContent = sortedChapters.map(c => `Chapter ${c.chapterNumber}: ${c.title || ""}\n\n${c.content || ""}`).join("\n\n---\n\n");
        navigator.clipboard.writeText(fullContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-5xl h-[90vh] bg-white dark:bg-gray-950 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800">
                {/* Header */}
                <div className="p-6 md:px-10 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-950 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center">
                            <FileText className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight">Report Preview</h2>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{project.title}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCopy}
                            className="rounded-xl"
                            title="Copy to Clipboard"
                        >
                            {copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handlePrint}
                            className="rounded-xl hidden md:flex"
                            title="Print Preview"
                        >
                            <Printer className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="rounded-xl"
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 md:p-12 lg:p-20 bg-gray-50/30 dark:bg-gray-900/30">
                    <div className="max-w-[800px] mx-auto bg-white dark:bg-gray-900 shadow-xl shadow-indigo-50/20 dark:shadow-none border border-gray-100 dark:border-gray-800 p-12 md:p-20 rounded-[2rem] min-h-screen printable">
                        {/* Fake Cover Page or Title */}
                        <div className="text-center mb-20 space-y-6">
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight">
                                {project.title}
                            </h1>
                            <div className="h-1 w-20 bg-indigo-600 mx-auto rounded-full" />
                            <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-sm">Draft Research Report</p>
                        </div>

                        {/* Table of Contents Preview */}
                        <div className="mb-20 space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 border-b pb-2">Table of Contents</h3>
                            <div className="space-y-2">
                                {sortedChapters.map(chapter => (
                                    <div key={chapter.chapter_id} className="flex items-center justify-between text-sm">
                                        <p className="font-bold text-gray-700 dark:text-gray-300">
                                            Chapter {chapter.chapterNumber}: {chapter.title || "Untitled Chapter"}
                                        </p>
                                        <div className="flex-1 border-b border-dotted border-gray-200 mx-4 h-3" />
                                        <span className="text-gray-400">...</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Chapters Content */}
                        <div className="space-y-24">
                            {sortedChapters.map(chapter => (
                                <div key={chapter.chapter_id} className="space-y-8">
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight border-b-2 border-gray-100 dark:border-gray-800 pb-4">
                                        Chapter {chapter.chapterNumber}: {chapter.title || "Untitled"}
                                    </h2>

                                    {chapter.content ? (
                                        <div
                                            className="prose prose-indigo dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-gray-600 dark:prose-p:text-gray-400 font-serif text-lg"
                                            dangerouslySetInnerHTML={{ __html: chapter.content }}
                                        />
                                    ) : (
                                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 border border-dashed border-gray-200 dark:border-gray-700 text-center">
                                            <p className="text-sm text-gray-400 font-medium italic">No content available for this chapter.</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-32 pt-8 border-t border-gray-100 dark:border-gray-800 text-center text-xs font-bold text-gray-300 uppercase tracking-widest">
                            End of Document Preview
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 md:px-10 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-950 z-10">
                    <p className="text-xs font-bold text-gray-400 hidden sm:block">
                        Ready to finalize? Download the professional DOCX version.
                    </p>
                    <div className="flex gap-4 w-full sm:w-auto">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1 sm:flex-none rounded-xl font-bold h-12 px-6"
                        >
                            Back to Project
                        </Button>
                        <Button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black h-12 px-8 shadow-xl shadow-indigo-100 dark:shadow-none transition-all active:scale-[0.98]"
                        >
                            {isDownloading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Preparing...
                                </>
                            ) : (
                                <>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download DOCX
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @media print {
                    .fixed, .relative:not(.printable) { display: none !important; }
                    .printable { display: block !important; position: static !important; width: 100% !important; margin: 0 !important; padding: 0 !important; border: none !important; shadow: none !important; }
                }
            `}</style>
        </div>
    );
}
