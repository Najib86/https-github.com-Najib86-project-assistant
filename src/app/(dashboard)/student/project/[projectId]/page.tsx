
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useParams } from "next/navigation";
import { Loader2, Plus, Users, ChevronRight, FileText, X } from "lucide-react"
import { cn } from "@/lib/utils";
import ChatInterface from "@/components/ChatInterface";
import LiteratureDiscovery from "@/components/LiteratureDiscovery";
import ProjectActivityFeed from "@/components/ProjectActivityFeed";
import ProjectProgress from "@/components/ProjectProgress";
import StudentProjectTeam from "@/components/StudentProjectTeam";

interface Chapter {
    chapter_id: number;
    title: string | null;
    chapterNumber: number;
    status: string;
}

interface Citation {
    citation_id: number;
    title?: string;
    sourceText: string;
    formatted: string;
    // other fields if needed
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Member {
    member_id: number;
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
    studentId: number;
    student?: User;
    members?: Member[];
    supervisor?: User;
}

export default function StudentProjectDetails() {
    const params = useParams();
    // Router unused, removed to fix lint
    const projectId = params.projectId;
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    const [citations, setCitations] = useState<Citation[]>([]);
    const [showAddCitation, setShowAddCitation] = useState(false);
    const [newCitation, setNewCitation] = useState({ title: "", author: "", year: "", url: "", source: "" });

    const [currentUser, setCurrentUser] = useState<User & { role: string } | null>(null);

    // Invite System
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteLink, setInviteLink] = useState("");
    const [creatingInvite, setCreatingInvite] = useState(false);

    const handleCreateInvite = async () => {
        setCreatingInvite(true);
        try {
            const res = await fetch("/api/supervisor/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId }),
            });
            const data = await res.json();
            if (res.ok) {
                const url = `${window.location.origin}/invite/${data.token}`;
                setInviteLink(url);
                setShowInviteModal(true);
            } else {
                alert("Failed to create invite");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to create invite link");
        } finally {
            setCreatingInvite(false);
        }
    };

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            setCurrentUser(JSON.parse(userStr));
        }
    }, []);

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



    const fetchCitations = useCallback(async () => {
        if (!projectId) return;
        try {
            const res = await fetch(`/api/projects/${projectId}/citations`);
            if (res.ok) {
                const data = await res.json();
                setCitations(data);
            }
        } catch (error) {
            console.error(error);
        }
    }, [projectId]);

    useEffect(() => {
        fetchProject();
        fetchCitations();
    }, [fetchProject, fetchCitations]);

    const handleAddCitation = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/projects/${projectId}/citations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCitation)
            });
            if (res.ok) {
                const data = await res.json();
                setCitations([data, ...citations]);
                setNewCitation({ title: "", author: "", year: "", url: "", source: "" });
                setShowAddCitation(false);
            }
        } catch (error) {
            console.error(error);
        }
    };



    const handleDeleteCitation = async (id: number) => {
        if (!confirm("Are you sure you want to delete this citation?")) return;
        try {
            const res = await fetch(`/api/projects/${projectId}/citations/${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setCitations(citations.filter(c => c.citation_id !== id));
            }
        } catch (error) {
            console.error(error);
        }
    };



    const handleAddCitationFromLiterature = (paper: { title: string; source: string; author: string; year: string; url: string }) => {
        // Adapt paper object to citation format if needed
        const citation = {
            title: paper.title,
            sourceText: paper.source || "Semantic Scholar",
            formatted: `${paper.author} (${paper.year}). ${paper.title}. Retrieved from ${paper.url}`,
            style: "APA" // Default
        };

        // Optimistically add to list or save to DB
        // Let's save to DB
        fetch(`/api/projects/${projectId}/citations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(citation)
        }).then(res => {
            if (res.ok) res.json().then(data => setCitations([data, ...citations]));
        });
    };

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
                <div className="w-full md:w-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/student/dashboard" className="text-sm font-medium text-gray-400 hover:text-indigo-600 transition-colors">
                            Projects
                        </Link>
                        <ChevronRight className="h-4 w-4 text-gray-300" />
                        <span className="text-sm font-bold text-gray-900 line-clamp-1">{project.title}</span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 leading-tight mb-4">{project.title}</h1>

                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 uppercase tracking-wider">
                                {project.type}
                            </span>
                            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-600 uppercase tracking-wider">
                                {project.level}
                            </span>
                        </div>

                        {project.supervisor ? (
                            <span className="text-sm text-gray-500 font-medium border-l pl-4 border-gray-200">
                                Supervisor: <span className="text-gray-900">{project.supervisor.name}</span>
                            </span>
                        ) : (
                            <span className="text-sm text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-md">
                                No Supervisor Linked
                            </span>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="max-w-md w-full flex items-center gap-3">
                        <span className="text-xs font-bold text-indigo-600 w-16">Progress</span>
                        <ProjectProgress chapters={project.chapters} />
                        <span className="text-xs font-bold text-gray-400">
                            {Math.round((project.chapters.filter(c => c.status === 'Completed' || c.status === 'Approved').length / project.chapters.length) * 100)}%
                        </span>
                    </div>

                </div>

                <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <Button variant="outline" className="hidden md:flex flex-1 md:flex-none w-full md:w-auto rounded-xl shadow-sm border-gray-200 font-bold h-11 text-sm bg-white" asChild>
                        <a href="#project-team">
                            <Users className="h-4 w-4 mr-2 text-indigo-600" />
                            Team
                        </a>
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleCreateInvite}
                        disabled={creatingInvite}
                        className="flex-1 md:flex-none w-full md:w-auto rounded-xl shadow-sm border-gray-200 font-bold h-11 text-sm text-indigo-600 hover:bg-indigo-50"
                    >
                        {creatingInvite ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Users className="h-4 w-4 mr-2" />}
                        Invite Supervisor
                    </Button>
                    <Button variant="outline" asChild className="flex-1 md:flex-none w-full md:w-auto rounded-xl shadow-sm border-gray-200 font-bold h-11 text-sm">
                        <Link href={`/api/export/docx?projectId=${project.project_id}`}>
                            <FileText className="h-4 w-4 mr-2 text-indigo-600" />
                            Export Report
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Invite Modal (same as before) */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in scale-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Invite Supervisor</h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowInviteModal(false)} className="rounded-full">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            Share this link with your supervisor. They can join your project instantly without filling out paperwork.
                        </p>
                        <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200 mb-6">
                            <input
                                className="flex-1 bg-transparent text-sm font-medium text-gray-600 outline-none truncate"
                                readOnly
                                value={inviteLink}
                            />
                            <Button
                                size="sm"
                                onClick={() => {
                                    navigator.clipboard.writeText(inviteLink);
                                    alert("Copied to clipboard!");
                                }}
                                className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg"
                            >
                                Copy
                            </Button>
                        </div>
                        <Button onClick={() => setShowInviteModal(false)} className="w-full font-bold rounded-xl h-11">
                            Done
                        </Button>
                    </div>
                </div>
            )}


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Chapters & Literature */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Chapters Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Chapters</h2>
                            {/* Removed text summary, replaced by progress bar in header */}
                        </div>

                        <div className="grid gap-4">
                            {project.chapters.sort((a, b) => a.chapterNumber - b.chapterNumber).map((chapter) => (
                                <div key={chapter.chapter_id} className="group bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-all duration-300 flex items-center justify-between">
                                    <Link href={`/student/project/${project.project_id}/chapter/${chapter.chapter_id}`} className="flex-1 flex items-center gap-4">
                                        <div className={cn(
                                            "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors",
                                            chapter.status === 'Completed' || chapter.status === 'Approved' ? "bg-green-50 border-green-200 text-green-700" :
                                                chapter.status === 'In Progress' ? "bg-indigo-50 border-indigo-200 text-indigo-700" :
                                                    "bg-gray-50 border-gray-200 text-gray-400"
                                        )}>
                                            {chapter.chapterNumber}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{chapter.title}</h3>
                                            <p className={cn(
                                                "text-xs font-medium mt-0.5",
                                                chapter.status === 'Approved' ? "text-green-600" :
                                                    chapter.status === 'Submitted' ? "text-orange-500" :
                                                        "text-gray-400"
                                            )}>
                                                {chapter.status}
                                            </p>
                                        </div>
                                    </Link>
                                    <Button variant="ghost" size="icon" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link href={`/student/project/${project.project_id}/chapter/${chapter.chapter_id}`}>
                                            <ChevronRight className="h-5 w-5 text-gray-400" />
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Literature Discovery Section */}
                    <LiteratureDiscovery
                        projectId={project.project_id}
                        initialQuery={project.title}
                        onAddCitation={handleAddCitationFromLiterature}
                    />
                </div>

                {/* Sidebar - Chat, Team, Activity */}
                <div className="space-y-6">
                    {/* Chat Interface */}
                    {currentUser && (
                        <ChatInterface
                            projectId={project.project_id}
                            userId={currentUser.id}
                            userName={currentUser.name}
                            userRole={currentUser.role}
                        />
                    )}

                    {/* Activity Feed (New) */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <ProjectActivityFeed projectId={project.project_id} />
                    </div>

                    {/* Team Section */}
                    {project && (
                        <StudentProjectTeam
                            projectId={project.project_id}
                            ownerId={project.studentId}
                            ownerName={project.student?.name}
                            ownerEmail={project.student?.email}
                            currentUser={currentUser}
                        />
                    )}

                    {/* Citations Section */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        {/* ... (Citations content same as before) ... */}
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">References</h2>
                            <Button variant="ghost" size="sm" onClick={() => setShowAddCitation(!showAddCitation)} className="h-8 w-8 p-0 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        {showAddCitation && (
                            <form onSubmit={handleAddCitation} className="mb-4 space-y-2 animate-in slide-in-from-top-2 p-3 bg-gray-50 rounded-lg">
                                <input className="w-full text-sm p-2 border rounded" placeholder="Title" value={newCitation.title} onChange={e => setNewCitation({ ...newCitation, title: e.target.value })} required />
                                <input className="w-full text-sm p-2 border rounded" placeholder="Author" value={newCitation.author} onChange={e => setNewCitation({ ...newCitation, author: e.target.value })} />
                                <div className="flex gap-2">
                                    <input className="w-1/3 text-sm p-2 border rounded" placeholder="Year" value={newCitation.year} onChange={e => setNewCitation({ ...newCitation, year: e.target.value })} />
                                    <input className="flex-1 text-sm p-2 border rounded" placeholder="URL (Optional)" value={newCitation.url} onChange={e => setNewCitation({ ...newCitation, url: e.target.value })} />
                                </div>
                                <Button type="submit" size="sm" className="w-full bg-indigo-600 text-white">Add Reference</Button>
                            </form>
                        )}

                        <div className="space-y-3">
                            {citations.length === 0 && <p className="text-sm text-gray-400 italic">No citations added.</p>}
                            {citations.map(cit => (
                                <div key={cit.citation_id} className="group relative p-2 hover:bg-gray-50 rounded-lg text-sm text-gray-700 break-words border-l-2 border-transparent hover:border-indigo-600 pl-3 transition-all">
                                    {cit.formatted || cit.sourceText}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteCitation(cit.citation_id)}
                                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
