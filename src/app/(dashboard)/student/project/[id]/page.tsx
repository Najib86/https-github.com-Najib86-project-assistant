"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
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
        <div className="max-w-5xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Link href="/student" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="font-medium text-gray-900">Project Overview</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                    <p className="text-gray-500 mt-1">{project.level} • {project.type} • Dept: {project.department}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" asChild>
                        <Link href={`/api/export/docx?projectId=${project.project_id}`}>
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                        </Link>
                    </Button>
                </div>
            </header>

            {/* Dashboard and Chapters UI logic here... */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-indigo-500" />
                    Project Chapters
                </h2>
                <div className="grid gap-4">
                    {chaptersList.map((chapter) => {
                        const existingChapter = project.chapters?.find((c) => c.chapterNumber === chapter.id);
                        return (
                            <div key={chapter.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${existingChapter ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                                        {chapter.id}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{chapter.title}</h3>
                                        {existingChapter ? (
                                            <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
                                                <CheckCircle className="h-3 w-3" />
                                                Available
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                Pending Generation
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/student/chapter-writer?projectId=${projectId}&chapter=${chapter.id}`}>
                                        {existingChapter ? "Edit Chapter" : "Open Editor"}
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Link>
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
