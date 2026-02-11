
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash, Save, ArrowLeft, Loader2, Wand2 } from "lucide-react";
import Link from "next/link";

export default function ProjectQuestionnaire() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const projectId = searchParams.get("projectId");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form fields
    const [problemStatement, setProblemStatement] = useState("");
    const [objectives, setObjectives] = useState<string[]>([""]);
    const [methodology, setMethodology] = useState("");

    useEffect(() => {
        if (!projectId) return;

        const fetchProject = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}`);
                if (res.ok) {
                    const data = await res.json();
                    setProblemStatement(data.problemStatement || "");
                    setObjectives(data.objectives ? JSON.parse(data.objectives) : [""]);
                    setMethodology(data.methodology || "");
                }
            } catch (error) {
                console.error("Failed to fetch project details", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [projectId]);

    const handleAddObjective = () => {
        setObjectives([...objectives, ""]);
    };

    const handleObjectiveChange = (index: number, value: string) => {
        const newObjectives = [...objectives];
        newObjectives[index] = value;
        setObjectives(newObjectives);
    };

    const handleRemoveObjective = (index: number) => {
        const newObjectives = objectives.filter((_, i) => i !== index);
        setObjectives(newObjectives);
    };

    const handleSave = async () => {
        if (!projectId) return;
        setSaving(true);

        try {
            const res = await fetch(`/api/projects/${projectId}/update-context`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    problemStatement,
                    objectives: JSON.stringify(objectives.filter(o => o.trim() !== "")),
                    methodology
                }),
            });

            if (!res.ok) throw new Error("Failed to save");

            // Navigate back or show success
            alert("Project context saved successfully! You can now generate chapters.");
            router.push(`/student/project/${projectId}`);
        } catch (error) {
            console.error(error);
            alert("Failed to save project context.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline mr-2" /> Loading...</div>;

    // Redirect if no project ID for Interview Bot
    useEffect(() => {
        if (!projectId) {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    fetch(`/api/projects?studentId=${user.id}`)
                        .then(res => res.json())
                        .then(projects => {
                            if (projects && projects.length > 0) {
                                // Redirect to the most recent project (first in list usually)
                                const latestId = projects[0].project_id;
                                router.replace(`/student/questionnaire?projectId=${latestId}`);
                            } else {
                                router.push('/student'); // No projects, go to dashboard
                            }
                        })
                        .catch(() => router.push('/student'));
                } catch {
                    router.push('/login');
                }
            } else {
                router.push('/login');
            }
        }
    }, [projectId, router]);

    if (!projectId) return <div className="p-10 text-center flex items-center justify-center h-screen"><Loader2 className="animate-spin text-indigo-600 mr-2" /> Loading Project Context...</div>;


    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/student/project/${projectId}`}>
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Project Context Questionnaire</h1>
                    <p className="text-gray-500">Answer these key questions to help AI write better chapters for you.</p>
                </div>
            </div>

            {/* Problem Statement */}
            <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
                <div className="flex justify-between items-start">
                    <h2 className="text-lg font-semibold text-gray-800">1. Problem Statement</h2>
                    <Wand2 className="h-5 w-5 text-indigo-400" />
                </div>
                <p className="text-sm text-gray-500">Describe the core issue your project aims to solve. Be specific.</p>
                <textarea
                    className="w-full h-32 p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="E.g. Traditional manual attendance systems are prone to errors and time-consuming..."
                    value={problemStatement}
                    onChange={(e) => setProblemStatement(e.target.value)}
                />
            </div>

            {/* Research Objectives */}
            <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">2. Research Objectives</h2>
                <p className="text-sm text-gray-500">List the specific goals of your project.</p>

                <div className="space-y-3">
                    {objectives.map((obj, index) => (
                        <div key={index} className="flex gap-2">
                            <span className="py-2 text-gray-400 font-medium">{index + 1}.</span>
                            <input
                                className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                                placeholder={`Objective ${index + 1}`}
                                value={obj}
                                onChange={(e) => handleObjectiveChange(index, e.target.value)}
                            />
                            {objectives.length > 1 && (
                                <Button size="icon" variant="ghost" onClick={() => handleRemoveObjective(index)} className="text-red-400 hover:text-red-600">
                                    <Trash className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={handleAddObjective} className="mt-2 text-indigo-600">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Objective
                    </Button>
                </div>
            </div>

            {/* Methodology */}
            <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">3. Methodology (Brief)</h2>
                <p className="text-sm text-gray-500">What approach or tools will you use? (e.g. Agile, Waterfall, Python/Django, Survey Research)</p>
                <textarea
                    className="w-full h-32 p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="E.g. We will use the Agile development methodology. The backend will be built with Node.js..."
                    value={methodology}
                    onChange={(e) => setMethodology(e.target.value)}
                />
            </div>

            {/* Save Action */}
            <div className="flex justify-end pt-4">
                <Button size="lg" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Project Context
                </Button>
            </div>
        </div>
    )
}
