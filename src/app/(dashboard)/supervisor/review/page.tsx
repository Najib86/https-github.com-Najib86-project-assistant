
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2, CheckSquare, Clock, ArrowRight, User } from "lucide-react"

interface Chapter {
    chapter_id: number;
    title: string | null;
    chapterNumber: number;
    status: string;
    updatedAt: string;
}

interface Project {
    project_id: number;
    title: string;
    student: {
        name: string;
        email: string;
    };
    chapters: Chapter[];
}

export default function ReviewTasksPage() {
    const [pendingChapters, setPendingChapters] = useState<{ project: Project, chapter: Chapter }[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingReviews = useCallback(async () => {
        try {
            const res = await fetch("/api/supervisor/projects");
            if (res.ok) {
                const projects: Project[] = await res.json();
                const pending: { project: Project, chapter: Chapter }[] = [];

                projects.forEach(project => {
                    project.chapters.forEach(chapter => {
                        if (chapter.status === "Submitted") {
                            pending.push({ project, chapter });
                        }
                    });
                });

                // Sort by most recent submission
                pending.sort((a, b) => new Date(b.chapter.updatedAt).getTime() - new Date(a.chapter.updatedAt).getTime());

                setPendingChapters(pending);
            }
        } catch (error) {
            console.error("Failed to fetch pending reviews", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingReviews();
    }, [fetchPendingReviews]);

    if (loading) {
        return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="animate-spin text-indigo-600 h-10 w-10" /></div>;
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Review Tasks</h1>
                <p className="text-gray-500 font-medium">Manage and provide feedback on student submissions.</p>
            </div>

            {pendingChapters.length === 0 ? (
                <div className="bg-white rounded-[2rem] border border-dashed border-gray-200 p-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto">
                        <CheckSquare className="h-8 w-8 text-gray-300" />
                    </div>
                    <div className="space-y-1">
                        <p className="font-bold text-gray-900">All caught up!</p>
                        <p className="text-sm text-gray-500">No chapters are currently awaiting your review.</p>
                    </div>
                    <Button asChild variant="outline" className="rounded-xl font-bold border-gray-200">
                        <Link href="/supervisor/dashboard">Back to Student Panel</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {pendingChapters.map(({ project, chapter }) => (
                        <div key={`${project.project_id}-${chapter.chapter_id}`} className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xl hover:shadow-gray-100 transition-all group">
                            <div className="flex items-center gap-5 w-full md:w-auto">
                                <div className="w-14 h-14 rounded-2xl bg-orange-50 flex flex-col items-center justify-center border border-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-0.5">CH</span>
                                    <span className="text-xl font-black">{chapter.chapterNumber}</span>
                                </div>
                                <div className="space-y-1 min-w-0 flex-1">
                                    <h3 className="font-black text-gray-900 truncate pr-4 text-lg leading-tight">
                                        {chapter.title || `Chapter ${chapter.chapterNumber}`}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                                            <User className="h-3.5 w-3.5" />
                                            {project.student.name}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                            <Clock className="h-3.5 w-3.5" />
                                            Submitted {new Date(chapter.updatedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <p className="text-xs text-indigo-600 font-bold truncate max-w-md italic mt-1">{project.title}</p>
                                </div>
                            </div>

                            <Button asChild className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 px-8 font-black text-sm shadow-lg shadow-indigo-100 group/btn transition-all active:scale-95">
                                <Link href={`/supervisor/project/${project.project_id}/chapter/${chapter.chapter_id}`}>
                                    Start Review
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                </Link>
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
