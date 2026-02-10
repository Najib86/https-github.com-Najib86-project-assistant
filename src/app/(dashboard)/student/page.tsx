
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle, Loader2, BookOpen } from "lucide-react"
import { useRouter } from "next/navigation";

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
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
                    <p className="text-gray-500 mt-2">Manage your research projects and drafts.</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Project
                </Button>
            </div>

            {/* Empty State */}
            {projects.length === 0 && !showCreateModal ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-gray-50">
                    <div className="bg-indigo-100 p-4 rounded-full mb-4">
                        <BookOpen className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No Projects Yet</h2>
                    <p className="text-gray-500 mb-6 text-center max-w-sm">
                        Start your academic journey by creating a new project. We&apos;ll guide you through every chapter.
                    </p>
                    <Button onClick={() => setShowCreateModal(true)}>
                        Create Your First Project
                    </Button>
                </div>
            ) : (
                /* Projects Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div key={project.project_id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow flex flex-col justify-between h-64">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                        project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                        {project.status.replace("_", " ") || "Draft"}
                                    </span>
                                    {/* <button className="text-gray-400 hover:text-gray-600">
                                        <MoreVertical className="h-5 w-5" />
                                    </button> */}
                                </div>
                                <Link href={`/student/project/${project.project_id}`} className="block group">
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 line-clamp-2 mb-2">
                                        {project.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        {project.level} • {project.type}
                                    </p>
                                </Link>
                            </div>

                            <div className="mt-auto pt-4 border-t flex justify-between items-center">
                                <span className="text-xs text-gray-400">
                                    Updated {new Date(project.updatedAt).toLocaleDateString()}
                                </span>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/student/project/${project.project_id}`}>
                                        Open Dashboard
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Project Modal Overlay */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900">Start New Project</h2>
                        <form onSubmit={handleCreateProject} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Project Title</label>
                                <input
                                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                    placeholder="e.g. Impact of AI on Healthcare..."
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Department</label>
                                <input
                                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                    placeholder="e.g. Computer Science"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Academic Level</label>
                                    <select
                                        className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                    >
                                        <option value="UG">Undergraduate (B.Sc.)</option>
                                        <option value="PG">Postgraduate (M.Sc./PhD)</option>
                                        <option value="Diploma">Diploma/HND</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Project Type</label>
                                    <select
                                        className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="System-Based">System Implementation</option>
                                        <option value="Survey">Research Survey</option>
                                        <option value="Case-Study">Case Study</option>
                                        <option value="Theoretical">Theoretical Review</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Reference Material (Optional PDF/DOCX)</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-400 transition-colors bg-gray-50/50">
                                    <div className="space-y-1 text-center">
                                        <PlusCircle className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 p-1">
                                                <span>{file ? file.name : "Upload a file"}</span>
                                                <input
                                                    type="file"
                                                    className="sr-only"
                                                    accept=".pdf,.docx,.txt"
                                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                                />
                                            </label>
                                            {!file && <p className="pl-1 pt-1">or drag and drop</p>}
                                        </div>
                                        <p className="text-xs text-gray-500">PDF, DOCX, TXT up to 10MB</p>
                                    </div>
                                </div>
                            </div>

                            {generatingStatus && (
                                <div className="bg-indigo-50 p-4 rounded-lg flex items-start gap-3 animate-pulse">
                                    <Loader2 className="h-5 w-5 text-indigo-600 animate-spin mt-0.5" />
                                    <p className="text-sm text-indigo-700 font-medium">{generatingStatus}</p>
                                </div>
                            )}

                            <div className="flex gap-3 justify-end mt-8">
                                <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)} disabled={loading}>Cancel</Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                                    {loading ? "Generating Project..." : "Create Project"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
