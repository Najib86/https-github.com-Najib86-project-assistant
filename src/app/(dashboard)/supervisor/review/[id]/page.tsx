
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, MessageSquare, FileText, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface User {
    id: number;
    name: string;
}

interface Chapter {
    chapter_id: number;
    chapterNumber: number;
    title: string | null;
    content: string | null;
    status: string;
    updatedAt: string;
}

interface Comment {
    comment_id: number;
    user: User;
    content: string;
    createdAt: string;
}

interface Project {
    project_id: number;
    title: string;
    student: User;
    chapters: Chapter[];
    comments: Comment[];
}

export default function SupervisorReviewPage() {
    const params = useParams();
    const projectId = params.id; // Correct param name depends on folder structure

    // Fallback if the folder structure is actually [projectId] not [id]
    // The previous code created api/supervisor/projects/[projectId]
    // So the page path is likely /supervisor/review/[id] 

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);

    useEffect(() => {
        const fetchProject = async () => {
            if (!projectId) return;
            try {
                // Adjust fetch URL to match the API route created
                const res = await fetch(`/api/supervisor/projects/${projectId}`);
                if (res.ok) {
                    const data = await res.json();
                    setProject(data);
                    if (data.chapters && data.chapters.length > 0) {
                        setActiveChapter(data.chapters[0]);
                    }
                } else {
                    console.error("Failed to fetch");
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [projectId]);


    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [postingComment, setPostingComment] = useState(false);

    // Mock Supervisor ID (In real app, get from session)
    const SUPERVISOR_ID = 2; // Ensure this user exists in your DB with role="supervisor"

    useEffect(() => {
        if (project && project.comments) {
            setComments(project.comments);
        }
    }, [project]);

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        setPostingComment(true);

        try {
            const res = await fetch("/api/comments/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId: project.project_id,
                    userId: SUPERVISOR_ID,
                    content: newComment
                }),
            });

            if (res.ok) {
                const comment = await res.json();
                setComments([comment, ...comments]);
                setNewComment("");
            }
        } catch (error) {
            console.error("Failed to post comment", error);
        } finally {
            setPostingComment(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

    if (!project) return <div className="p-10">Project not found.</div>;

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] lg:h-[calc(100vh-0rem)] flex flex-col bg-white lg:bg-transparent px-1 md:px-0">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100 mb-6 px-4 md:px-0">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                        <Link href="/supervisor" className="hover:text-indigo-600 transition-colors">Supervisor Dashboard</Link>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-gray-900">{project.student.name}</span>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight tracking-tighter">
                        {project.title}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="flex-1 md:flex-none rounded-xl font-bold h-11 border-gray-200">Revisions</Button>
                    <Button className="flex-1 md:flex-none rounded-xl font-black h-11 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100">Approve</Button>
                </div>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden pb-4">
                {/* Chapter List - Horizontal on mobile, vertical sidebar on desktop */}
                <div className="lg:w-72 shrink-0 flex flex-col">
                    <div className="flex items-center justify-between px-4 lg:px-0 mb-3 lg:mb-4">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chapters</h3>
                        <span className="lg:hidden text-[10px] font-bold text-gray-400">Swipe to navigate</span>
                    </div>

                    <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:bg-white lg:border lg:rounded-3xl lg:p-3 no-scrollbar pb-2 lg:pb-0 px-4 lg:px-3">
                        {project.chapters.length === 0 ? (
                            <div className="p-6 text-sm text-gray-400 font-medium italic">No chapters yet.</div>
                        ) : (
                            project.chapters.map((chap) => (
                                <button
                                    key={chap.chapter_id}
                                    onClick={() => setActiveChapter(chap)}
                                    className={cn(
                                        "flex-none lg:w-full text-left px-5 py-3 rounded-2xl transition-all border flex items-center justify-between gap-4",
                                        activeChapter?.chapter_id === chap.chapter_id
                                            ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02] lg:scale-100"
                                            : "bg-white border-gray-100 text-gray-500 hover:border-indigo-200 hover:text-gray-900"
                                    )}
                                >
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Ch. {chap.chapterNumber}</span>
                                        <span className="font-bold text-sm lg:text-base truncate max-w-[120px] lg:max-w-none">
                                            {chap.title || `Chapter ${chap.chapterNumber}`}
                                        </span>
                                    </div>
                                    <div className={cn(
                                        "h-2 w-2 rounded-full",
                                        chap.status === 'Ready' ? 'bg-green-400' : 'bg-yellow-400'
                                    )} />
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Content Reader */}
                <div className="flex-1 bg-white lg:border lg:rounded-[2.5rem] shadow-2xl shadow-gray-200/50 flex flex-col overflow-hidden mx-4 lg:mx-0 rounded-3xl border">
                    {activeChapter ? (
                        <>
                            <div className="px-6 py-5 md:px-10 md:py-8 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-white">
                                <h2 className="font-black text-gray-900 flex items-center gap-3 text-lg md:text-xl">
                                    <div className="bg-indigo-100 p-2 rounded-xl">
                                        <FileText className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    {activeChapter.title || `Chapter ${activeChapter.chapterNumber}`}
                                </h2>
                                <div className="hidden sm:flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <Clock className="h-3 w-3" />
                                    Updated {new Date(activeChapter.updatedAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="flex-1 p-6 md:p-12 overflow-y-auto">
                                <div className="whitespace-pre-wrap font-serif text-base md:text-xl leading-relaxed text-gray-800 selection:bg-indigo-100">
                                    {activeChapter.content || (
                                        <div className="flex flex-col items-center justify-center h-64 text-gray-300 gap-4">
                                            <FileText className="h-12 w-12 opacity-20" />
                                            <span className="font-medium italic">Empty chapter draft</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-4 bg-gray-50/30">
                            <div className="bg-white p-6 rounded-full shadow-lg">
                                <ArrowLeft className="h-10 w-10 text-indigo-100" />
                            </div>
                            <p className="font-black uppercase tracking-[0.2em] text-xs">Pick a section to review</p>
                        </div>
                    )}
                </div>

                {/* Comments Panel */}
                <div className="lg:w-80 shrink-0 flex flex-col lg:bg-white lg:border lg:rounded-[2.5rem] shadow-2xl shadow-gray-200/50 overflow-hidden mx-4 lg:mx-0 mt-6 lg:mt-0 rounded-3xl border border-gray-100 relative">
                    <div className="px-6 py-5 border-b border-gray-50 font-black text-gray-900 flex items-center gap-3 bg-gray-50/50">
                        <MessageSquare className="h-5 w-5 text-indigo-600" />
                        <span className="text-xs uppercase tracking-widest">Review Feed</span>
                    </div>

                    <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[400px] lg:max-h-none">
                        {comments.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                                <div className="bg-gray-50 p-4 rounded-full">
                                    <MessageSquare className="h-8 w-8 text-gray-200" />
                                </div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-tight leading-relaxed">No feedback history yet for this project.</p>
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.comment_id} className="bg-white border border-gray-50 p-4 rounded-2xl shadow-sm space-y-2 hover:border-indigo-100 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <span className="font-black text-gray-900 text-[10px] uppercase tracking-wider">{comment.user.name}</span>
                                        <span className="text-[10px] font-bold text-gray-300">
                                            {new Date(comment.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium leading-relaxed">{comment.content}</p>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-5 border-t border-gray-50 bg-gray-50/50">
                        <textarea
                            className="w-full border-gray-100 rounded-2xl p-4 text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all mb-3 bg-white font-medium placeholder:text-gray-300 resize-none"
                            placeholder="Type your feedback..."
                            rows={3}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        ></textarea>
                        <Button className="w-full rounded-xl h-12 font-black text-xs uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95 transition-all" onClick={handlePostComment} disabled={postingComment}>
                            {postingComment ? <Loader2 className="animate-spin h-5 w-5" /> : "Post Feedback"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
