
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle, Loader2, X, ChevronRight, ChevronLeft, CheckCircle2, Upload, FileCode, ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { LoadingLogo } from "@/components/ui/LoadingLogo";
import universityData from "../../../../../json.json";

interface Project {
    project_id: number;
    title: string;
    level: string;
    type: string;
    status: string;
    updatedAt: string;
    chapters: { chapter_id: number; title: string | null; chapterNumber: number; status: string; content?: string }[];
}

interface Template {
    id: number;
    name: string;
    description: string | null;
}


export default function StudentDashboard() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [researchSubmissions, setResearchSubmissions] = useState<any[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Multi-step form state
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        // Step 1: Project Basics
        title: "",
        level: "BSc",
        type: "System-Based",

        // Step 2: Student Personal Info
        fullName: "",
        studentIdNo: "",
        email: "",
        phone: "",

        // Step 3: Institutional Details
        institutionName: "",
        faculty: "",
        department: "",
        programme: "",
        graduationYear: new Date().getFullYear().toString(),

        // Step 4: Supervisor & Research Metadata
        supervisorTitle: "",
        supervisorName: "",
        supervisorEmail: "",
        researchArea: "",
        keywords: "", // Comma separated
        inviteCode: "",
        templateId: ""
    });

    const [templates, setTemplates] = useState<Template[]>([]);

    const [file, setFile] = useState<File | null>(null);
    const [generatingStatus, setGeneratingStatus] = useState("");
    const [studentId, setStudentId] = useState<number | null>(null);
    const [regeneratingId, setRegeneratingId] = useState<number | null>(null);
    const [regeneratingAll, setRegeneratingAll] = useState(false);
    const [failedChaptersCount, setFailedChaptersCount] = useState(0);

    const universitiesList = universityData.universities || [];
    const selectedUniversity = universitiesList.find(u => u.name === formData.institutionName);
    const facultiesList = selectedUniversity?.academic_offerings?.faculties || [];
    const selectedFaculty = facultiesList.find(f => f.name === formData.faculty);
    const departmentsList = selectedFaculty?.departments || [];
    const selectedDepartment = departmentsList.find(d => d.name === formData.department);
    const coursesList = selectedDepartment?.courses || [];

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setStudentId(user.id);
                // Pre-fill user data
                setFormData(prev => ({
                    ...prev,
                    fullName: user.name || "",
                    email: user.email || ""
                }));
            } catch (e) {
                console.error("Failed to parse user", e);
                router.push("/auth/login");
            }
        } else {
            router.push("/auth/login");
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
                
                // Count failed chapters
                const failedCount = data.reduce((total: number, project: Project) => {
                    return total + project.chapters.filter((ch: any) => ch.status === "Pending Regeneration").length;
                }, 0);
                setFailedChaptersCount(failedCount);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [studentId]);

    const fetchResearch = useCallback(async () => {
        if (!studentId) return;
        try {
            const res = await fetch('/api/research/user');
            if (res.ok) {
                const data = await res.json();
                setResearchSubmissions(data);
            }
        } catch (error) {
            console.error(error);
        }
    }, [studentId]);

    useEffect(() => {
        if (studentId) {
            fetchProjects();
            fetchResearch();
        }
    }, [studentId, fetchProjects, fetchResearch]);

    useEffect(() => {
        fetch("/api/templates")
            .then(res => res.json())
            .then(data => setTemplates(data))
            .catch(err => console.error("Failed to fetch templates", err));
    }, []);

    const handleDeleteResearch = async (id: number) => {
        if (!confirm("Are you sure you want to delete this research submission?")) return;
        try {
            const res = await fetch(`/api/research/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchResearch();
            } else {
                alert("Failed to delete research submission");
            }
        } catch (error) {
            console.error(error);
        }
    };

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

            // Auto-select template based on academic metadata
            let autoTemplateId = "";
            const facultyLower = formData.faculty.toLowerCase();
            const deptLower = formData.department.toLowerCase();

            if (facultyLower.includes("science") || facultyLower.includes("engineering") || deptLower.includes("computer")) {
                const scienceTemplate = templates.find(t => t.name.includes("1500VA") || t.name.includes("Inverter") || t.name.includes("UNIJOS"));
                if (scienceTemplate) autoTemplateId = scienceTemplate.id.toString();
            } else if (facultyLower.includes("social") || facultyLower.includes("art") || facultyLower.includes("management")) {
                const socialTemplate = templates.find(t => t.name.toLowerCase().includes("social science"));
                if (socialTemplate) autoTemplateId = socialTemplate.id.toString();
            }

            if (autoTemplateId) {
                data.append("templateId", autoTemplateId);
            }

            // Construct Academic Metadata JSON with intelligent defaults
            const academicMetadata = {
                student: {
                    fullName: formData.fullName || "Student Draft",
                    studentIdNo: "N/A",
                    email: formData.email,
                    phone: "N/A"
                },
                institution: {
                    name: "TBD",
                    faculty: "TBD",
                    department: "TBD",
                    programme: "TBD",
                    graduationYear: new Date().getFullYear().toString()
                },
                supervisor: {
                    title: "",
                    name: "Pending",
                    email: "N/A"
                },
                research: {
                    area: formData.title,
                    keywords: []
                }
            };

            data.append("academicMetadata", JSON.stringify(academicMetadata));

            if (formData.inviteCode) {
                data.append("inviteCode", formData.inviteCode);
            }
            if (file) {
                data.append("file", file);
                setGeneratingStatus("Analyzing uploaded file and generating full project chapters...");
            } else {
                setGeneratingStatus("AI is generating all project chapters based on your topic...");
            }

            const res = await fetch("/api/projects", {
                method: "POST",
                body: data,
            });

            if (res.status === 401) {
                alert("Session expired. Please log in again.");
                localStorage.removeItem("user");
                router.push("/auth/login");
                setGeneratingStatus("");
                return;
            }

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || errorData.error || "Failed to create project");
            }

            const newProject = await res.json();
            setProjects([{ ...newProject, chapters: newProject.chapters || [] }, ...projects]);
            setShowCreateModal(false);
            setFile(null);
            setFormData(prev => ({ ...prev, title: "", inviteCode: "" })); // Reset basics
            setGeneratingStatus("");
            setCurrentStep(1);

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

    const handleRegenerate = async (projectId: number) => {
        try {
            setRegeneratingId(projectId);
            const res = await fetch(`/api/projects/${projectId}/regenerate`, { method: "POST" });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed");
            }

            const data = await res.json();
            alert(data.message || "Regeneration complete.");
            fetchProjects(); // Refresh list to see updates
        } catch (error) {
            console.error(error);
            alert("Failed to regenerate chapters.");
        } finally {
            setRegeneratingId(null);
        }
    };

    const handleRegenerateAllFailed = async () => {
        if (!confirm(`This will regenerate ${failedChaptersCount} failed chapters across all your projects. This may take several minutes. Continue?`)) {
            return;
        }

        try {
            setRegeneratingAll(true);
            const res = await fetch("/api/chapters/regenerate-failed", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({})
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed");
            }

            const data = await res.json();
            alert(`✅ ${data.message}\n\nThe system will now regenerate these chapters automatically. Check back in a few minutes.`);
            fetchProjects(); // Refresh list
        } catch (error) {
            console.error(error);
            alert("Failed to trigger regeneration. Please try again.");
        } finally {
            setRegeneratingAll(false);
        }
    };

    const handleDeleteProject = async (projectId: number) => {
        if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;

        try {
            const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");

            fetchProjects();
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Could not delete project");
        }
    };



    if (loading && projects.length === 0) {
        return <div className="flex justify-center items-center h-[80vh] bg-gray-50/50 backdrop-blur-sm"><LoadingLogo size={120} /></div>;
    }

    return (
        <div className="space-y-6 md:space-y-8 px-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Projects</h1>
                    <p className="text-sm md:text-base text-gray-500 mt-1">Manage your research projects and drafts.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    {failedChaptersCount > 0 && (
                        <Button 
                            onClick={handleRegenerateAllFailed} 
                            disabled={regeneratingAll}
                            variant="outline"
                            className="w-full sm:w-auto shadow-sm border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-700"
                        >
                            {regeneratingAll ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Regenerating...
                                </>
                            ) : (
                                <>
                                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Fix {failedChaptersCount} Failed Chapters
                                </>
                            )}
                        </Button>
                    )}
                    <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto shadow-sm">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Project
                    </Button>
                </div>
            </div>

            {/* Empty State */}
            {projects.length === 0 && !showCreateModal ? (
                <div className="flex flex-col items-center justify-center p-8 md:p-12 border-2 border-dashed rounded-[2rem] bg-gray-50/50 border-gray-100">
                    <div className="bg-white p-6 rounded-[1.5rem] mb-6 shadow-xl shadow-indigo-100/50 border border-gray-100">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={64}
                            height={64}
                            className=""
                        />
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
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-50 -mr-2"
                                        onClick={() => handleDeleteProject(project.project_id)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
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


                                {project.chapters.some(ch => ch.content?.includes("[MOCK GENERATED CONTENT]")) && (
                                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                        <div className="flex items-start gap-2">
                                            <div className="text-amber-600 mt-0.5">
                                                <Loader2 className={cn("h-4 w-4", regeneratingId === project.project_id ? "animate-spin" : "")} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-amber-800 mb-1">
                                                    Generation Interrupted
                                                </p>
                                                <p className="text-[10px] text-amber-600 mb-2">
                                                    Network instability prevented full content generation. Please retry.
                                                </p>
                                                <Button
                                                    onClick={() => handleRegenerate(project.project_id)}
                                                    disabled={regeneratingId === project.project_id}
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full h-7 text-xs border-amber-300 bg-white hover:bg-amber-100 text-amber-700"
                                                >
                                                    {regeneratingId === project.project_id ? "Regenerating..." : "Retry Generation"}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
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
                    ))
                    }
                </div>
            )}

            {/* Research Submissions Section */}
            {researchSubmissions.length > 0 && (
                <div className="space-y-6 md:space-y-8 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Research Uploads</h2>
                            <p className="text-sm text-gray-500 mt-1">Materials and datasets you&apos;ve submitted.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {researchSubmissions.map((sub) => (
                            <div key={sub.id} className="bg-white rounded-[2rem] border border-gray-100 p-6 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-indigo-100/50 transition-colors" />

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <span className={cn(
                                        "px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest border",
                                        sub.category === 'science' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            sub.category === 'engineering' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                'bg-purple-50 text-purple-600 border-purple-100'
                                    )}>
                                        {sub.category}
                                    </span>
                                    <span className={cn(
                                        "px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest border",
                                        sub.status === 'submitted' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                                    )}>
                                        {sub.status}
                                    </span>
                                </div>

                                <h3 className="text-lg font-black text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                                    {sub.title || sub.project?.title || "Research Submission"}
                                </h3>

                                <div className="space-y-2 mb-6">
                                    {sub.courseName && <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{sub.courseName}</p>}
                                    {sub.project && (
                                        <div className="flex items-center gap-1.5 bg-indigo-50/50 w-fit px-2 py-0.5 rounded-lg border border-indigo-100/50">
                                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                            <p className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter truncate max-w-[150px]">
                                                Linked: {sub.project.title}
                                            </p>
                                        </div>
                                    )}
                                    <p className="text-[11px] text-gray-500 line-clamp-2 italic font-medium">
                                        {sub.abstract || "No description provided."}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto relative z-10">
                                    <div className="flex items-center gap-1.5 text-gray-400">
                                        <Upload className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{sub.files.length} Files</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {sub.files.map((file: any, i: number) => (
                                            <a
                                                key={i}
                                                href={file.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="h-8 w-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm hover:shadow-indigo-100 group/file"
                                                title={file.fileName}
                                            >
                                                {file.fileType.startsWith('image/') ? <ImageIcon className="h-4 w-4" /> : <FileCode className="h-4 w-4" />}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover/file:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                                    {file.fileName}
                                                </div>
                                            </a>
                                        ))}
                                        <button
                                            onClick={() => handleDeleteResearch(sub.id)}
                                            className="h-8 w-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-red-100 ml-2"
                                            title="Delete Submission"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Create Project Modal Overlay */}
            {
                showCreateModal && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-t-[2.5rem] sm:rounded-2xl shadow-2xl w-full max-w-2xl mb-0 sm:mb-8 overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
                            <div className="p-6 md:p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-2xl font-black tracking-tight text-gray-900">New Project Setup</h2>
                                        <p className="text-sm text-gray-500">Step {currentStep} of 4</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)} className="rounded-full h-8 w-8 -mr-2">
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-gray-100 h-1.5 rounded-full mb-8 overflow-hidden">
                                    <div
                                        className="bg-indigo-600 h-full transition-all duration-300 ease-out"
                                        style={{ width: `${(currentStep / 4) * 100}%` }}
                                    />
                                </div>

                                <form onSubmit={handleCreateProject} className="space-y-6">

                                    {currentStep === 1 && (
                                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                                            <h3 className="text-lg font-bold text-gray-800">Project Basics</h3>
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
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Academic Level</label>
                                                    <select
                                                        className="w-full border border-gray-200 bg-gray-50/50 p-3.5 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none bg-white font-medium cursor-pointer"
                                                        value={formData.level}
                                                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                                    >
                                                        <option value="Diploma">Diploma / OND</option>
                                                        <option value="HND">HND</option>
                                                        <option value="BSc">BSc / BEng / BA</option>
                                                        <option value="MSc">MSc / MEng / MA</option>
                                                        <option value="PhD">PhD / Doctorate</option>
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
                                                                    <CheckCircle2 className="h-5 w-5" />
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
                                        </div>
                                    )}

                                    {generatingStatus && (
                                        <div className="bg-indigo-600 p-4 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                                            <Loader2 className="h-5 w-5 text-white animate-spin" />
                                            <p className="text-xs text-white font-bold leading-tight">{generatingStatus}</p>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 mt-6">
                                        <div className="flex-1" />

                                        <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)} disabled={loading} className="rounded-xl font-bold">
                                            Cancel
                                        </Button>

                                        <Button type="submit" disabled={loading} className="rounded-xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-200 px-6">
                                            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                                            {loading ? "Generating..." : "Next"} <ChevronRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
