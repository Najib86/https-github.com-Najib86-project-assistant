
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation";
import { Loader2, Plus, Users, ChevronRight, FileText, CheckCircle, AlertCircle, Edit, X } from "lucide-react"
import { cn } from "@/lib/utils";

interface Chapter {
    chapter_id: number;
    title: string;
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
    members?: Member[];
    supervisor?: User;
}

export default function StudentProjectDetails() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.projectId;
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState<Member[]>([]);
    const [citations, setCitations] = useState<Citation[]>([]);
    const [showAddCitation, setShowAddCitation] = useState(false);
    const [newCitation, setNewCitation] = useState({ title: "", author: "", year: "", url: "", source: "" });
    const [showAddMember, setShowAddMember] = useState(false);
    const [newMemberEmail, setNewMemberEmail] = useState("");
    const [addingMember, setAddingMember] = useState(false);
    const [currentUser, setCurrentUser] = useState<User & { role: string } | null>(null);

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

    const fetchMembers = useCallback(async () => {
        if (!projectId) return;
        try {
            const res = await fetch(`/api/projects/${projectId}/members`);
            if (res.ok) {
                const data = await res.json();
                setMembers(data);
            }
        } catch (error) {
            console.error(error);
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
        fetchMembers();
        fetchCitations();
    }, [fetchProject, fetchMembers, fetchCitations]);

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

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddingMember(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/members`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: newMemberEmail })
            });
            const data = await res.json();
            if (res.ok) {
                setMembers([...members, data]);
                setNewMemberEmail("");
                setShowAddMember(false);
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to add member");
        } finally {
            setAddingMember(false);
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

    const handleDeleteMember = async (id: number) => {
        if (!confirm("Remove this member from the project?")) return;
        try {
            const res = await fetch(`/api/projects/${projectId}/members/${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setMembers(members.filter(m => m.member_id !== id));
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-indigo-600" /></div>;
    }

    if (!project) {
        return <div className="text-center py-12">Project not found</div>;
    }

    const isOwner = currentUser?.id === project.studentId;

    return (
        <div className="space-y-8 px-1">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/student/dashboard" className="text-sm font-medium text-gray-400 hover:text-indigo-600 transition-colors">
                            Projects
                        </Link>
                        <ChevronRight className="h-4 w-4 text-gray-300" />
                        <span className="text-sm font-bold text-gray-900 line-clamp-1">{project.title}</span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 leading-tight">{project.title}</h1>
                    <div className="flex items-center gap-3 mt-3">
                        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 uppercase tracking-wider">
                            {project.type}
                        </span>
                        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-600 uppercase tracking-wider">
                            {project.level}
                        </span>
                        {project.supervisor ? (
                            <span className="text-sm text-gray-500 font-medium">
                                Supervisor: <span className="text-gray-900">{project.supervisor.name}</span>
                            </span>
                        ) : (
                            <span className="text-sm text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-md">
                                No Supervisor Linked
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" asChild className="w-full md:w-auto rounded-xl shadow-sm border-gray-200 font-bold h-11 text-sm">
                        <Link href={`/api/export/docx?projectId=${project.project_id}`}>
                            <FileText className="h-4 w-4 mr-2 text-indigo-600" />
                            Export Report
                        </Link>
                    </Button>
                </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Chapters */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Chapters</h2>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            {project.chapters.filter(c => c.status === 'Completed').length} / {project.chapters.length} Completed
                        </span>
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

                {/* Sidebar - Team */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Project Team</h2>
                            {isOwner && (
                                <Button variant="ghost" size="sm" onClick={() => setShowAddMember(!showAddMember)} className="h-8 w-8 p-0 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        {showAddMember && (
                            <form onSubmit={handleAddMember} className="mb-4 animate-in slide-in-from-top-2">
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        placeholder="Student Email"
                                        className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                                        value={newMemberEmail}
                                        onChange={(e) => setNewMemberEmail(e.target.value)}
                                        required
                                    />
                                    <Button type="submit" size="sm" disabled={addingMember} className="bg-indigo-600 text-white rounded-lg">
                                        {addingMember ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </form>
                        )}

                        <div className="space-y-3">
                            {/* Owner */}
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs ring-2 ring-white shadow-sm">
                                    Me
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">Project Lead</p>
                                    <p className="text-xs text-gray-400 truncate">Owner</p>
                                </div>
                            </div>

                            {/* Members */}
                            {members.map(member => (
                                <div key={member.member_id} className="group relative flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs ring-2 ring-white shadow-sm">
                                        {member.student.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">{member.student.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{member.student.email}</p>
                                    </div>
                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                                        {member.role}
                                    </span>
                                    {isOwner && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteMember(member.member_id)}
                                            className="absolute right-2 opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Citations Section */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
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
        </div >
    );
}
