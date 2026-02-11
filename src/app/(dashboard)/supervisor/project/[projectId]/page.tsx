
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation";
import { Loader2, ChevronRight, CheckCircle, AlertCircle, FileText } from "lucide-react"
import { cn } from "@/lib/utils";

interface Chapter {
    chapter_id: number;
    title: string;
    chapterNumber: number;
    status: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Member {
    id: number;
    role: string;
    student: User;
}

interface Project {
    project_id: number;
    title: string;
    level: string;
    type: string;
    status: string;
    updatedAt: string;
    chapters: Chapter[];
    student: User;
    members?: Member[];
}

export default function SupervisorProjectDetails() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.projectId;
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState<Member[]>([]);

    const fetchProject = useCallback(async () => {
        if (!projectId) return;
        try {
            const res = await fetch(`/api/projects/${projectId}`);
            if (res.ok) {
                const data = await res.json();
                setProject(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    const fetchMembers = useCallback(async () => {
        if (!projectId) return;
        try {
            const res = await fetch(`/api/projects/${projectId}/members`);
            if (res.ok) {
                const data = await res.json();
                setMembers(data);
            }
        } catch (error) {
            console.error(error);
        }
    }, [projectId]);

    useEffect(() => {
        fetchProject();
        fetchMembers();
    }, [fetchProject, fetchMembers]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-indigo-600" /></div>;
    }

    if (!project) {
        return <div className="text-center py-12">Project not found</div>;
    }

    return (
        <div className="space-y-8 px-1">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/supervisor/dashboard" className="text-sm font-medium text-gray-400 hover:text-indigo-600 transition-colors">
                            Dashboard
                        </Link>
                        <ChevronRight className="h-4 w-4 text-gray-300" />
                        <span className="text-sm font-bold text-gray-900 line-clamp-1">{project.title}</span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 leading-tight">{project.title}</h1>
                    <div className="flex items-center gap-3 mt-3">
                        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 uppercase tracking-wider">
                            Student: {project.student?.name}
                        </span>
                        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-600 uppercase tracking-wider">
                            {project.level}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Chapters Review */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Chapters Review</h2>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            {project.chapters.filter(c => c.status === 'Submitted').length} Pending Review
                        </span>
                    </div>

                    <div className="grid gap-4">
                        {project.chapters.sort((a, b) => a.chapterNumber - b.chapterNumber).map((chapter) => (
                            <div key={chapter.chapter_id} className="group bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-all duration-300 flex items-center justify-between">
                                <Link href={`/supervisor/project/${project.project_id}/chapter/${chapter.chapter_id}`} className="flex-1 flex items-center gap-4">
                                    <div className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors",
                                        chapter.status === 'Approved' ? "bg-green-50 border-green-200 text-green-700" :
                                            chapter.status === 'Submitted' ? "bg-orange-50 border-orange-200 text-orange-700" :
                                                "bg-gray-50 border-gray-200 text-gray-400"
                                    )}>
                                        {chapter.chapterNumber}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{chapter.title}</h3>
                                        <p className={cn(
                                            "text-xs font-medium mt-0.5",
                                            chapter.status === 'Approved' ? "text-green-600" :
                                                chapter.status === 'Submitted' ? "text-orange-500 font-bold" :
                                                    "text-gray-400"
                                        )}>
                                            {chapter.status}
                                        </p>
                                    </div>
                                </Link>
                                <div className="flex items-center gap-2">
                                    {chapter.status === 'Submitted' && (
                                        <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                                    )}
                                    <Button variant="ghost" size="icon" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link href={`/supervisor/project/${project.project_id}/chapter/${chapter.chapter_id}`}>
                                            <ChevronRight className="h-5 w-5 text-gray-400" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar - Team */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Project Team</h2>
                        </div>

                        <div className="space-y-3">
                            {/* Student Owner */}
                            {project.student && (
                                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs ring-2 ring-white shadow-sm">
                                        {project.student.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">{project.student.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{project.student.email}</p>
                                    </div>
                                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                                        Lead
                                    </span>
                                </div>
                            )}

                            {/* Members */}
                            {members.map(member => (
                                <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs ring-2 ring-white shadow-sm">
                                        {member.student.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">{member.student.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{member.student.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
