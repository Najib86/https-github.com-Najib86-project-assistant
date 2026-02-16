
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, FileText, Clock, Loader2 } from "lucide-react"

interface Student {
    name: string;
}

interface Project {
    project_id: number;
    title: string;
    student: Student;
    progress: number;
    createdAt: string;
}

export default function SupervisorDashboard() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch("/api/supervisor/projects");
                if (res.ok) {
                    const data = await res.json();
                    setProjects(data);
                }
            } catch (error) {
                console.error("Failed to fetch projects", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-6 md:space-y-10 max-w-7xl mx-auto px-1">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter">Supervisor Panel</h1>
                    <p className="text-sm md:text-base text-gray-500 font-medium tracking-tight italic">Guiding student research and excellence.</p>
                </div>
                <div className="bg-indigo-50 px-4 py-3 rounded-2xl flex items-center gap-2 w-full sm:w-auto">
                    <Users className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm font-black text-indigo-700">{projects.length} Active Projects</span>
                </div>
            </header>

            {/* List Section */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                <div className="px-6 md:px-10 py-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-gray-50/50 to-white">
                    <h2 className="font-black text-gray-900 text-lg uppercase tracking-widest flex items-center gap-3">
                        <FileText className="h-5 w-5 text-indigo-500" />
                        Submissions
                    </h2>
                    <div className="relative w-full md:w-80 group">
                        <Input
                            placeholder="Search students or projects..."
                            className="w-full pl-10 h-12 rounded-2xl border-gray-100 bg-white shadow-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all font-medium text-base"
                        />
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                            <Clock className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {/* Desktop Table View */}
                    <table className="w-full hidden md:table text-left border-collapse">
                        <thead className="bg-gray-50/50 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                            <tr>
                                <th className="px-10 py-5">Student / Project</th>
                                <th className="px-6 py-5">Status & Progress</th>
                                <th className="px-6 py-5">Initiated</th>
                                <th className="px-10 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {projects.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-20 text-gray-400 font-medium italic">No active projects to display.</td>
                                </tr>
                            ) : (
                                projects.map((project) => (
                                    <tr key={project.project_id} className="group hover:bg-indigo-50/30 transition-all">
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-gray-900 text-base group-hover:text-indigo-600 transition-colors leading-tight">
                                                    {project.student?.name || "Private Entity"}
                                                </span>
                                                <span className="text-xs text-gray-400 font-bold mt-1 line-clamp-1 max-w-xs">{project.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="space-y-2 max-w-[140px]">
                                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter">
                                                    <span className="text-indigo-600">{project.progress}%</span>
                                                    <span className="text-gray-300">Target 100%</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="bg-indigo-500 h-full rounded-full transition-all duration-1000 group-hover:bg-indigo-600"
                                                        style={{ width: `${project.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 font-bold text-xs text-gray-400 uppercase">
                                            {new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <Button size="sm" variant="outline" asChild className="rounded-xl font-black text-[10px] uppercase h-10 px-6 border-gray-200 hover:border-indigo-400 hover:bg-white hover:text-indigo-600 shadow-sm transition-all group-hover:scale-105">
                                                <Link href={`/supervisor/review/${project.project_id}`}>Review Log</Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-gray-100">
                        {projects.length === 0 ? (
                            <div className="p-10 text-center text-gray-400 font-medium italic">No projects found.</div>
                        ) : (
                            projects.map((project) => (
                                <div key={project.project_id} className="p-6 space-y-5 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-2 min-w-0 flex-1">
                                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">Student Submission</p>
                                            <h3 className="font-black text-gray-900 truncate pr-2 text-xl leading-snug">{project.student?.name}</h3>
                                            <p className="text-sm text-gray-500 font-medium line-clamp-2 leading-relaxed">{project.title}</p>
                                        </div>
                                        <div className="shrink-0 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 flex flex-col items-center justify-center min-w-[50px]">
                                            <span className="text-sm font-black text-gray-900">{project.progress}%</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-indigo-500 h-full rounded-full"
                                                style={{ width: `${project.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                                {new Date(project.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <Button size="sm" variant="outline" asChild className="rounded-xl font-bold text-xs h-10 px-6 border-gray-200">
                                            <Link href={`/supervisor/review/${project.project_id}`}>Review</Link>
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-gray-900 bg-white ${className}`}
            {...props}
        />
    )
}
