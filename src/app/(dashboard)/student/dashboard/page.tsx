
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
            if (formData.templateId) {
                data.append("templateId", formData.templateId);
            }

            // Construct Academic Metadata JSON
            const academicMetadata = {
                student: {
                    fullName: formData.fullName,
                    studentIdNo: formData.studentIdNo,
                    email: formData.email,
                    phone: formData.phone
                },
                institution: {
                    name: formData.institutionName,
                    faculty: formData.faculty,
                    department: formData.department,
                    programme: formData.programme,
                    graduationYear: formData.graduationYear
                },
                supervisor: {
                    title: formData.supervisorTitle,
                    name: formData.supervisorName,
                    email: formData.supervisorEmail
                },
                research: {
                    area: formData.researchArea,
                    keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k)
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

            if (!res.ok) throw new Error("Failed to create project");

            const newProject = await res.json();
            setProjects([newProject, ...projects]);
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

    // Navigation handlers
    const nextStep = () => {
        if (currentStep === 1) {
            if (!formData.title || !formData.level || !formData.type) {
                alert("Please fill in all project basics.");
                return;
            }
        }
        if (currentStep === 2) {
            if (!formData.fullName || !formData.studentIdNo || !formData.email) {
                alert("Please fill in required student information.");
                return;
            }
        }
        if (currentStep === 3) {
            if (!formData.institutionName || !formData.faculty || !formData.department || !formData.programme) {
                alert("Please fill in required institution details.");
                return;
            }
        }
        setCurrentStep(prev => Math.min(prev + 1, 4));
    };

    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

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
                <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto shadow-sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Project
                </Button>
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

                                            <div className="space-y-1.5 pt-1">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Structural Template</label>
                                                <select
                                                    className="w-full border border-gray-200 bg-gray-50/50 p-3.5 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none bg-white font-medium cursor-pointer"
                                                    value={formData.templateId}
                                                    onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                                                >
                                                    <option value="">Standard (Default) Structure</option>
                                                    {templates.map(t => {
                                                        let displayName = t.name;
                                                        if (t.name.includes("1500VA") || t.name.includes("Inverter") || t.name.includes("UNIJOS")) {
                                                            displayName = "Science";
                                                        } else if (t.name.toLowerCase().includes("social science")) {
                                                            displayName = "Social Science";
                                                        }
                                                        return (
                                                            <option key={t.id} value={t.id}>{displayName}</option>
                                                        );
                                                    })}
                                                </select>
                                                <p className="text-[10px] text-gray-400 ml-1 italic">
                                                    Choosing a template pre-configures your project's chapters (e.g. for specific engineering or social science guidelines).
                                                </p>
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

                                    {currentStep === 2 && (
                                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                                            <h3 className="text-lg font-bold text-gray-800">Student Information</h3>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Full Name</label>
                                                <input
                                                    className="w-full border border-gray-200 bg-gray-50/50 p-3.5 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium placeholder:text-gray-300"
                                                    value={formData.fullName}
                                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                    placeholder="Your full legal name"
                                                    required
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Student ID / Matric No</label>
                                                    <input
                                                        className="w-full border border-gray-200 bg-gray-50/50 p-3.5 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium placeholder:text-gray-300"
                                                        value={formData.studentIdNo}
                                                        onChange={(e) => setFormData({ ...formData, studentIdNo: e.target.value })}
                                                        placeholder="e.g. ENG/2023/001"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Phone Number</label>
                                                    <input
                                                        className="w-full border border-gray-200 bg-gray-50/50 p-3.5 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium placeholder:text-gray-300"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        placeholder="+234..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Email Address</label>
                                                <input
                                                    type="email"
                                                    className="w-full border border-gray-200 bg-gray-50/50 p-3.5 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium placeholder:text-gray-300"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    placeholder="student@university.edu"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 3 && (
                                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                                            <h3 className="text-lg font-bold text-gray-800">Institution Details</h3>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Institution Name</label>
                                                <input
                                                    list="institutions-list"
                                                    className="w-full border border-gray-200 bg-gray-50/50 p-3.5 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium placeholder:text-gray-300"
                                                    value={formData.institutionName}
                                                    onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                                                    placeholder="e.g. University of Lagos"
                                                    required
                                                />
                                                <datalist id="institutions-list">
                                                    {universitiesList.map((u, i) => <option key={i} value={u.name} />)}
                                                </datalist>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Faculty / School</label>
                                                    <input
                                                        list="faculties-list"
                                                        className="w-full border border-gray-200 bg-gray-50/50 p-3.5 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium placeholder:text-gray-300"
                                                        value={formData.faculty}
                                                        onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                                                        placeholder="e.g. Faculty of Engineering"
                                                        required
                                                    />
                                                    <datalist id="faculties-list">
                                                        {facultiesList.map((f, i) => <option key={i} value={f.name} />)}
                                                    </datalist>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Department</label>
                                                    <input
                                                        list="departments-list"
                                                        className="w-full border border-gray-200 bg-gray-50/50 p-3.5 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium placeholder:text-gray-300"
                                                        value={formData.department}
                                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                                        placeholder="e.g. Computer Engineering"
                                                        required
                                                    />
                                                    <datalist id="departments-list">
                                                        {departmentsList.map((d, i) => <option key={i} value={d.name} />)}
                                                    </datalist>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Programme / Degree</label>
                                                    <input
                                                        list="courses-list"
                                                        className="w-full border border-gray-200 bg-gray-50/50 p-3.5 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium placeholder:text-gray-300"
                                                        value={formData.programme}
                                                        onChange={(e) => setFormData({ ...formData, programme: e.target.value })}
                                                        placeholder="e.g. B.Sc. Computer Science"
                                                        required
                                                    />
                                                    <datalist id="courses-list">
                                                        {coursesList.map((c, i) => <option key={i} value={c} />)}
                                                    </datalist>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Graduation Year</label>
                                                    <input
                                                        className="w-full border border-gray-200 bg-gray-50/50 p-3.5 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium placeholder:text-gray-300"
                                                        value={formData.graduationYear}
                                                        onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                                                        placeholder="202X"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 4 && (
                                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                                            <h3 className="text-lg font-bold text-gray-800">Supervisor & Research Info</h3>

                                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-2">
                                                <h4 className="text-sm font-bold text-blue-800 mb-2">Primary Supervisor</h4>
                                                <div className="grid grid-cols-3 gap-3 mb-3">
                                                    <div className="col-span-1 space-y-1.5">
                                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Title</label>
                                                        <select
                                                            className="w-full border border-blue-200 bg-white p-2.5 rounded-lg text-sm font-medium outline-none"
                                                            value={formData.supervisorTitle}
                                                            onChange={(e) => setFormData({ ...formData, supervisorTitle: e.target.value })}
                                                        >
                                                            <option value="">Select...</option>
                                                            <option value="Mr.">Mr.</option>
                                                            <option value="Mrs.">Mrs.</option>
                                                            <option value="Dr.">Dr.</option>
                                                            <option value="Prof.">Prof.</option>
                                                            <option value="Engr.">Engr.</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-span-2 space-y-1.5">
                                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Name</label>
                                                        <input
                                                            className="w-full border border-blue-200 bg-white p-2.5 rounded-lg text-sm font-medium outline-none"
                                                            value={formData.supervisorName}
                                                            onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                                                            placeholder="e.g. John Doe"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Supervisor Email (Optional)</label>
                                                    <input
                                                        type="email"
                                                        className="w-full border border-blue-200 bg-white p-2.5 rounded-lg text-sm font-medium outline-none"
                                                        value={formData.supervisorEmail}
                                                        onChange={(e) => setFormData({ ...formData, supervisorEmail: e.target.value })}
                                                        placeholder="supervisor@university.edu"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Research Area</label>
                                                <input
                                                    className="w-full border border-gray-200 bg-gray-50/50 p-3.5 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium placeholder:text-gray-300"
                                                    value={formData.researchArea}
                                                    onChange={(e) => setFormData({ ...formData, researchArea: e.target.value })}
                                                    placeholder="e.g. Machine Learning in Healthcare"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Keywords</label>
                                                <input
                                                    className="w-full border border-gray-200 bg-gray-50/50 p-3.5 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium placeholder:text-gray-300"
                                                    value={formData.keywords}
                                                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                                                    placeholder="Comma separated e.g. AI, Diagnostics, Automation"
                                                />
                                            </div>

                                            <div className="space-y-1.5 pt-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Project Access Code (If applicable)</label>
                                                <input
                                                    className="w-full border border-gray-200 bg-gray-50/50 p-3.5 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium placeholder:text-gray-300 uppercase tracking-widest"
                                                    placeholder="e.g. A1B2C3"
                                                    value={formData.inviteCode || ""}
                                                    onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value })}
                                                />
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
                                        {currentStep > 1 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={prevStep}
                                                disabled={loading}
                                                className="rounded-xl font-bold border-gray-200 bg-white"
                                            >
                                                <ChevronLeft className="mr-1 h-4 w-4" /> Back
                                            </Button>
                                        )}

                                        <div className="flex-1" />

                                        <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)} disabled={loading} className="rounded-xl font-bold">
                                            Cancel
                                        </Button>

                                        {currentStep < 4 ? (
                                            <Button type="button" onClick={nextStep} className="rounded-xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-200 px-6">
                                                Next <ChevronRight className="ml-1 h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button type="submit" disabled={loading} className="rounded-xl h-10 font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-200 px-6">
                                                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                                {loading ? "Generating..." : "Finish & Create"}
                                            </Button>
                                        )}
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
