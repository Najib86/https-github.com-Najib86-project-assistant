"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    BookOpen, CheckCircle, Clock, ChevronRight,
    Download, Loader2
} from "lucide-react";

interface Project {
    project_id: number;
    title: string;
    level: string;
    type: string;
    department?: string;
    chapters: { chapter_id: number; chapterNumber: number; title: string; status: string }[];
}

export default function ProjectDashboard({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    const projectId = id;

    const chaptersList = [
        { id: 1, title: "Abstract" },
        { id: 2, title: "Introduction" },
        { id: 3, title: "Literature Review" },
        { id: 4, title: "Methodology" },
        { id: 5, title: "Implementation" },
        { id: 6, title: "Results" },
        { id: 7, title: "Discussion" },
        { id: 8, title: "Conclusion" },
        { id: 9, title: "References" }
    ];

    useEffect(() => {
        if (!projectId) return;

        const fetchProject = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}`);
                if (res.ok) {
                    const data = await res.json();
                    setProject(data);
                } else {
                    console.error("Project not found or error", res.status);
                    // router.push("/student");
                }
            } catch (error) {
                console.error("Error fetching project:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [projectId]);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
                <p className="text-gray-500 mb-6">We couldn&apos;t find the project you&apos;re looking for.</p>
                <Button asChild>
                    <Link href="/student">Back to Dashboard</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto px-1">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-gray-100">
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-400">
                        <Link href="/student" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-gray-900">Project Overview</span>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight">{project.title}</h1>
                    <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-500 font-medium">
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">{project.level}</span>
                        <span className="h-1 w-1 rounded-full bg-gray-300" />
                        <span>{project.type}</span>
                        {project.department && (
                            <>
                                <span className="h-1 w-1 rounded-full bg-gray-300" />
                                <span className="text-gray-400 italic">Dept: {project.department}</span>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" asChild className="w-full md:w-auto rounded-xl shadow-sm border-gray-200 font-bold h-11">
                        <Link href={`/api/export/docx?projectId=${project.project_id}`}>
                            <Download className="h-4 w-4 mr-2 text-indigo-600" />
                            Export Report
                        </Link>
                    </Button>
                </div>
            </header>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8">
                    <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-gray-900">
                        <div className="bg-indigo-100 p-2 rounded-xl">
                            <BookOpen className="h-5 w-5 text-indigo-600" />
                        </div>
                        Project Chapters
                    </h2>
                    <div className="grid gap-3 md:gap-4">
                        {chaptersList.map((chapter) => {
                            const existingChapter = project.chapters?.find((c) => c.chapterNumber === chapter.id);
                            return (
                                <div key={chapter.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 border border-gray-100 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/20 transition-all gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "h-12 w-12 shrink-0 rounded-xl flex items-center justify-center text-sm font-black transition-colors shadow-sm",
                                            existingChapter ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-400 border border-gray-100'
                                        )}>
                                            {chapter.id}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-gray-900 text-base md:text-lg truncate group-hover:text-indigo-600 transition-colors">
                                                {chapter.title}
                                            </h3>
                                            <div className="mt-0.5">
                                                {existingChapter ? (
                                                    <span className="text-[10px] md:text-xs text-green-600 flex items-center gap-1 font-bold uppercase tracking-wider">
                                                        <CheckCircle className="h-3 w-3" />
                                                        Ready
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] md:text-xs text-gray-400 flex items-center gap-1 font-bold uppercase tracking-wider">
                                                        <Clock className="h-3 w-3" />
                                                        Pending
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" asChild className="rounded-xl shadow-sm border-gray-200 font-bold hover:bg-white hover:border-indigo-400 hover:text-indigo-600 w-full sm:w-auto h-10 px-6">
                                        <Link href={`/student/chapter-writer?projectId=${projectId}&chapter=${chapter.id}`}>
                                            {existingChapter ? "Edit" : "Write"}
                                            <ChevronRight className="h-4 w-4 ml-1 opacity-50" />
                                        </Link>
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
