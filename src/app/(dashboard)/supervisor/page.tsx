
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, FileText, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react"

export default function SupervisorDashboard() {
    const [projects, setProjects] = useState<any[]>([]);
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
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Supervisor Dashboard</h1>
                    <p className="text-gray-500 mt-2">Manage student projects and reviews.</p>
                </div>
            </div>

            {/* Student List */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-700">Student Projects & Submissions</h2>
                    <Input placeholder="Search students..." className="w-64" />
                </div>
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-100 text-gray-500 uppercase text-xs font-medium">
                        <tr>
                            <th className="px-6 py-3">Student Name</th>
                            <th className="px-6 py-3">Project Title</th>
                            <th className="px-6 py-3">Progress</th>
                            <th className="px-6 py-3">Date Created</th>
                            <th className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {projects.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-4">No projects found.</td>
                            </tr>
                        ) : (
                            projects.map((project) => (
                                <tr key={project.project_id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{project.student?.name || "Unknown"}</td>
                                    <td className="px-6 py-4">{project.title}</td>
                                    <td className="px-6 py-4">
                                        <div className="w-24 bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className="bg-indigo-600 h-2.5 rounded-full"
                                                style={{ width: `${project.progress}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-gray-500 mt-1 block">{project.progress}% Complete</span>
                                    </td>
                                    <td className="px-6 py-4">{new Date(project.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <Button size="sm" variant="outline" asChild>
                                            <Link href={`/supervisor/review/${project.project_id}`}>Review</Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
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
