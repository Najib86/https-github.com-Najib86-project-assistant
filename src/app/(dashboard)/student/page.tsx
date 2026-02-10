
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle, Loader2, BookOpen, X } from "lucide-react"
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Project {
    project_id: number;
    title: string;
    level: string;
    type: string;
    status: string;
    updatedAt: string;
    chapters: { id: number; title: string; chapterNumber: number; status: string }[];
}

export default function StudentDashboard() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        level: "UG", // Undergraduate default
        type: "System-Based", // Default
        department: "Computer Science"
    });
    const [file, setFile] = useState<File | null>(null);
    const [generatingStatus, setGeneratingStatus] = useState("");



    const [studentId, setStudentId] = useState<number | null>(null);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setStudentId(user.id);
            } catch (e) {
                console.error("Failed to parse user", e);
                router.push("/login");
            }
        } else {
            router.push("/login");
        }
    }, [router]);

    // Fetch existing projects
    const fetchProjects = useCallback(async () => {
        if (!studentId) return;
        try {
            setLoading(true);
            const res = await fetch(`/api/projects?studentId=${studentId}`);
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [studentId]);

    useEffect(() => {
        if (studentId) {
            fetchProjects();
        }
    }, [studentId, fetchProjects]);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentId) return;

        setLoading(true);
        setGeneratingStatus("Creating project and preparing AI for document generation...");

        try {
            const data = new FormData();
            data.append("studentId", studentId.toString());
            data.append("title", formData.title);
            data.append("level", formData.level);
            data.append("type", formData.type);
            data.append("department", formData.department);
            if (file) {
                data.append("file", file);
                setGeneratingStatus("Analyzing uploaded file and generating full project chapters...");
            } else {
                setGeneratingStatus("AI is generating all project chapters based on your topic...");
            }

            const res = await fetch("/api/projects/create", {
                method: "POST",
                body: data,
            });

            if (!res.ok) throw new Error("Failed to create project");

            const newProject = await res.json();
            setProjects([newProject, ...projects]);
            setShowCreateModal(false);
            setFile(null);
            setGeneratingStatus("");

            // navigate to project details
            router.push(`/student/project/${newProject.project_id}`);
        } catch (error) {
            console.error(error);
            alert("Failed to create project. Please try again.");
            setGeneratingStatus("");
        } finally {
            setLoading(false);
        }
    };

    if (loading && projects.length === 0) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-indigo-600" /></div>;
    }

    return (
        <div className="space-y-6 md:space-y-8 px-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Projects</h1>
                    <p className="text-sm md:text-base text-gray-500 mt-1">Manage your research projects and drafts.</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto shadow-sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Project
                </Button>
            </div>

            {/* Empty State */}
            {projects.length === 0 && !showCreateModal ? (
                <div className="flex flex-col items-center justify-center p-8 md:p-12 border-2 border-dashed rounded-2xl bg-gray-50/50">
                    <div className="bg-indigo-100/80 p-5 rounded-full mb-4">
                        <BookOpen className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No Projects Yet</h2>
                    <p className="text-sm md:text-base text-gray-500 mb-6 text-center max-w-sm px-4">
                        Start your academic journey by creating a new project. We&apos;ll guide you through every chapter.
                    </p>
                    <Button onClick={() => setShowCreateModal(true)} size="lg" className="rounded-xl px-8 shadow-md">
                        Create Your First Project
                    </Button>
                </div>
            ) : (
                /* Projects Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                    {projects.map((project) => (
                        <div key={project.project_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 hover:shadow-lg transition-all duration-300 flex flex-col group h-full min-h-[220px]">
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={cn(
                                        "px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider",
                                        project.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-100' :
                                            project.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                                'bg-gray-50 text-gray-600 border border-gray-200'
                                    )}>
                                        {project.status?.replace("_", " ") || "Draft"}
                                    </span>
                                </div>
                                <Link href={`/student/project/${project.project_id}`} className="block">
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2 leading-tight">
                                        {project.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium lowercase">
                                        <span>{project.level}</span>
                                        <span className="h-1 w-1 rounded-full bg-gray-300" />
                                        <span>{project.type}</span>
                                    </div>
                                </Link>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-50 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                                <span className="text-[10px] md:text-xs text-gray-400 font-medium">
                                    Last updated {new Date(project.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <Button variant="outline" size="sm" asChild className="rounded-lg shadow-sm hover:bg-indigo-50 border-gray-200 text-indigo-600 font-semibold w-full sm:w-auto">
                                    <Link href={`/student/project/${project.project_id}`}>
                                        Dashboard
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Project Modal Overlay */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-t-[2.5rem] sm:rounded-2xl shadow-2xl w-full max-w-lg mb-0 sm:mb-8 overflow-hidden animate-in slide-in-from-bottom duration-300">
                        <div className="p-6 md:p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black tracking-tight text-gray-900">New Project</h2>
                                <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)} className="rounded-full h-8 w-8 -mr-2">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                            <form onSubmit={handleCreateProject} className="space-y-4 md:space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Project Title</label>
                                    <input
                                        className="w-full border border-gray-200 bg-gray-50/50 p-3.5 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium placeholder:text-gray-300"
                                        placeholder="e.g. Impact of AI on Healthcare..."
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Department</label>
                                    <input
                                        className="w-full border border-gray-200 bg-gray-50/50 p-3.5 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium placeholder:text-gray-300"
                                        placeholder="e.g. Computer Science"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Academic Level</label>
                                        <select
                                            className="w-full border border-gray-200 bg-gray-50/50 p-3.5 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none bg-white font-medium cursor-pointer"
                                            value={formData.level}
                                            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                        >
                                            <option value="UG">Undergraduate (B.Sc.)</option>
                                            <option value="PG">Postgraduate (M.Sc./PhD)</option>
                                            <option value="Diploma">Diploma/HND</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Project Type</label>
                                        <select
                                            className="w-full border border-gray-200 bg-gray-50/50 p-3.5 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none bg-white font-medium cursor-pointer"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="System-Based">Technical / Implementation</option>
                                            <option value="Survey">Research / Survey</option>
                                            <option value="Case-Study">Analytical Case Study</option>
                                            <option value="Theoretical">Theoretical Review</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Reference Material (Optional)</label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            id="project-file"
                                            className="hidden"
                                            accept=".pdf,.docx,.txt"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        />
                                        <label
                                            htmlFor="project-file"
                                            className={cn(
                                                "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300",
                                                file ? "bg-indigo-50 border-indigo-300" : "bg-gray-50/50 border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                                            )}
                                        >
                                            {file ? (
                                                <div className="flex items-center gap-3 text-indigo-700">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                        <PlusCircle className="h-5 w-5 rotate-45" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 text-left">
                                                        <p className="text-sm font-bold truncate max-w-[200px]">{file.name}</p>
                                                        <p className="text-[10px] opacity-70">Click to change file</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <PlusCircle className="h-8 w-8 text-gray-300 mb-2 group-hover:text-indigo-400 transition-colors" />
                                                    <p className="text-sm font-bold text-gray-500">Attach context file</p>
                                                    <p className="text-[10px] text-gray-400">PDF, DOCX, TXT up to 10MB</p>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                {generatingStatus && (
                                    <div className="bg-indigo-600 p-4 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                                        <p className="text-xs text-white font-bold leading-tight">{generatingStatus}</p>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row gap-3 pt-4 pb-2 sm:pb-0">
                                    <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)} disabled={loading} className="w-full sm:w-auto rounded-xl font-bold order-2 sm:order-1">
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={loading} className="w-full flex-1 rounded-xl h-12 shadow-lg shadow-indigo-200 font-bold order-1 sm:order-2">
                                        {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                                        {loading ? "Generating..." : "Create Full Project"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
