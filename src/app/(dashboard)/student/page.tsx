
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PenLine, FileText, PlusCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
    const router = useRouter();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        level: "UG", // Undergraduate default
        type: "System-Based" // Default
    });

    // Mock student ID for now (demo purpose)
    const STUDENT_ID = 1;

    // Fetch existing project
    useEffect(() => {
        // In a real app, fetch based on logged-in user session
        // For now, we'll try to fetch the first project associated with student ID 1
        // Since we don't have a direct 'get project by student' API yet, we might need one.
        // Or we can simulate no project found initially.
        setLoading(false);
    }, []);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/projects/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, studentId: STUDENT_ID }),
            });

            if (!res.ok) throw new Error("Failed to create project");

            const newProject = await res.json();
            setProject(newProject);
            setShowCreateModal(false);
            // Reload or update state
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;
    }

    if (!project && !showCreateModal) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">No Active Project</h2>
                <p className="text-gray-500">You haven't started a Final Year Project yet.</p>
                <Button onClick={() => setShowCreateModal(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Start New Project
                </Button>
            </div>
        );
    }

    if (showCreateModal) {
        return (
            <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md border">
                <h2 className="text-xl font-bold mb-4">Create New Project</h2>
                <form onSubmit={handleCreateProject} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Project Title</label>
                        <input className="w-full border p-2 rounded"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Level</label>
                        <select className="w-full border p-2 rounded"
                            value={formData.level}
                            onChange={(e) => setFormData({ ...formData, level: e.target.value })}>
                            <option value="UG">Undergraduate (B.Sc.)</option>
                            <option value="PG">Postgraduate (M.Sc./PhD)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <select className="w-full border p-2 rounded"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                            <option value="System-Based">System Development</option>
                            <option value="Survey">Research Survey</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>
                    </div>
                    <div className="flex gap-2 justify-end mt-6">
                        <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                        <Button type="submit">Create Project</Button>
                    </div>
                </form>
            </div>
        )
    }

    // Default chapters if none exist
    const chapters = project?.chapters?.length > 0 ? project.chapters : [
        { id: 1, title: "Introduction", status: "Draft", progress: 0 },
        { id: 2, title: "Literature Review", status: "Draft", progress: 0 },
        { id: 3, title: "Methodology", status: "Draft", progress: 0 },
        { id: 4, title: "Data Analysis", status: "Draft", progress: 0 },
        { id: 5, title: "Conclusion", status: "Draft", progress: 0 },
    ];

    const overallProgress = 0; // consistent for new projects

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{project?.title || "Final Year Project"}</h1>
                    <p className="text-gray-500 mt-2">{project?.level} - {project?.type}</p>
                </div>
                <Button asChild>
                    <Link href={`/student/chapter-writer?projectId=${project?.project_id}`}>
                        <PenLine className="mr-2 h-4 w-4" />
                        Continue Writing
                    </Link>
                </Button>
            </div>

            {/* Overview Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-700">Project Progress</h2>
                    <span className="text-indigo-600 font-bold">{overallProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{ width: `${overallProgress}%` }}
                    ></div>
                </div>
            </div>

            {/* Chapters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chapters.map((chapter: any) => (
                    <div key={chapter.id} className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-indigo-50 p-2 rounded-md">
                                <FileText className="h-6 w-6 text-indigo-600" />
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-500`}>
                                {chapter.status}
                            </span>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Chapter {chapter.id}: {chapter.title}</h3>
                        <div className="flex items-center justify-between mt-4">
                            <Button size="sm" variant="outline" asChild>
                                <Link href={`/student/chapter-writer?projectId=${project?.project_id}&chapter=${chapter.id}`}>
                                    Write Chapter
                                </Link>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
