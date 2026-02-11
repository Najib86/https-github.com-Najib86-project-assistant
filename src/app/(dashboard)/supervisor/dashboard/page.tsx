
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2, Users, FileText, CheckCircle, Clock } from "lucide-react"
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Chapter {
    chapter_id: number;
    title: string;
    chapterNumber: number;
    status: string;
}

interface Project {
    project_id: number;
    title: string;
    level: string;
    type: string;
    status: string;
    updatedAt: string;
    chapters: Chapter[];
    student: {
        name: string;
        email: string;
    };
}

export default function SupervisorDashboard() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [supervisorId, setSupervisorId] = useState<number | null>(null);
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [generatingCode, setGeneratingCode] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.role !== 'supervisor') {
                    router.push("/student/dashboard");
                    return;
                }
                setSupervisorId(user.id);
            } catch (e) {
                console.error("Failed to parse user", e);
                router.push("/auth/login");
            }
        } else {
            router.push("/auth/login");
        }
    }, [router]);

    const fetchProjects = useCallback(async () => {
        if (!supervisorId) return;
        try {
            setLoading(true);
            const res = await fetch(`/api/projects?supervisorId=${supervisorId}`);
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [supervisorId]);

    useEffect(() => {
        if (supervisorId) {
            fetchProjects();
        }
    }, [supervisorId, fetchProjects]);

    const generateInviteCode = async () => {
        if (!supervisorId) return;
        setGeneratingCode(true);
        try {
            const res = await fetch("/api/supervisor/invite/create", {
                method: "POST",
                body: JSON.stringify({ supervisorId }),
            });
            const data = await res.json();
            if (res.ok) {
                setInviteCode(data.code);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setGeneratingCode(false);
        }
    };

    if (loading && projects.length === 0) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-indigo-600" /></div>;
    }

    return (
        <div className="space-y-8 px-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Supervisor Dashboard</h1>
                    <p className="text-gray-500 mt-1">Monitor student progress and review chapters.</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={generateInviteCode} disabled={generatingCode} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md rounded-xl">
                        {generatingCode ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <FileText className="mr-2 h-4 w-4" />}
                        Generate Invite Code
                    </Button>
                </div>
            </div>

            {/* Invite Code Display */}
            {inviteCode && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                            <Users className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-indigo-900">Invite Code Generated</p>
                            <p className="text-xs text-indigo-600">Share this code with your students to link them to your supervision.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <code className="bg-white px-4 py-2 rounded-lg text-lg font-mono font-bold text-indigo-700 tracking-widest border border-indigo-100 shadow-sm w-full sm:w-auto text-center">
                            {inviteCode}
                        </code>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(inviteCode)}
                            className="bg-white hover:bg-indigo-100 text-indigo-600 hover:text-indigo-800"
                        >
                            Copy
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setInviteCode(null)}
                            className="text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-full"
                        >
                            <span className="sr-only">Dismiss</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-4 w-4"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </Button>
                    </div>
                </div>
            )}

            {/* Stats Overview (Mock data for now) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-xl">
                        <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Active Students</p>
                        <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-orange-50 p-3 rounded-xl">
                        <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {projects.reduce((acc, p) => acc + p.chapters.filter(c => c.status === 'Submitted').length, 0)}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-green-50 p-3 rounded-xl">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Completed Projects</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {projects.filter(p => p.status === 'Completed').length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Student Projects</h2>

                {projects.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-500">No projects assigned yet.</p>
                        <div className="mt-4">
                            <Button variant="link" onClick={generateInviteCode} className="text-indigo-600 font-bold hover:underline">
                                Generate Invite Code
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {projects.map((project) => (
                            <div key={project.project_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{project.title}</h3>
                                        {project.student && (
                                            <p className="text-sm text-gray-500">Student: <span className="font-medium text-gray-700">{project.student.name}</span></p>
                                        )}
                                    </div>
                                    <span className={cn(
                                        "px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider",
                                        project.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-100' :
                                            project.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                                'bg-gray-50 text-gray-600 border border-gray-200'
                                    )}>
                                        {project.status}
                                    </span>
                                </div>

                                <div className="space-y-3 mb-6">
                                    {/* Chapter Progress Indicators */}
                                    <div className="grid grid-cols-5 gap-2">
                                        {[1, 2, 3, 4, 5].map((num) => {
                                            const chapter = project.chapters.find(c => c.chapterNumber === num);
                                            const status = chapter?.status || 'Not Started';
                                            return (
                                                <div key={num} className="flex flex-col gap-1 items-center">
                                                    <div className={cn(
                                                        "w-full h-1.5 rounded-full transition-colors",
                                                        status === 'Approved' ? "bg-green-500" :
                                                            status === 'Submitted' ? "bg-orange-400" :
                                                                status === 'Draft' ? "bg-blue-200" :
                                                                    "bg-gray-100"
                                                    )} />
                                                    <span className="text-[10px] text-gray-400 font-medium">Ch {num}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="text-xs text-gray-400">
                                        Last active: {new Date(project.updatedAt).toLocaleDateString()}
                                    </div>
                                    <Button size="sm" asChild className="rounded-lg font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 shadow-none">
                                        <Link href={`/supervisor/project/${project.project_id}`}>
                                            Review Project
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
