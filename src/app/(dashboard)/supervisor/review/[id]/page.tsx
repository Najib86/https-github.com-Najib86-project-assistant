
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, MessageSquare, FileText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function SupervisorReviewPage() {
    const params = useParams();
    const projectId = params.id; // Correct param name depends on folder structure

    // Fallback if the folder structure is actually [projectId] not [id]
    // The previous code created api/supervisor/projects/[projectId]
    // So the page path is likely /supervisor/review/[id] 

    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeChapter, setActiveChapter] = useState<any>(null);

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


    const [comments, setComments] = useState<any[]>([]);
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
        <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b mb-6">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Link href="/supervisor" className="hover:text-indigo-600 flex items-center gap-1">
                            <ArrowLeft className="h-3 w-3" /> Back to Dashboard
                        </Link>
                        <span>/</span>
                        <span>{project.student.name}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Request Revisions</Button>
                    <Button className="bg-green-600 hover:bg-green-700">Approve Chapter</Button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Chapter List Sidebar */}
                <div className="w-64 bg-white border rounded-lg overflow-y-auto">
                    <div className="p-4 bg-gray-50 border-b font-medium text-gray-700">Chapters</div>
                    <div className="divide-y">
                        {project.chapters.length === 0 ? (
                            <div className="p-4 text-sm text-gray-500">No chapters started.</div>
                        ) : (
                            project.chapters.map((chap: any) => (
                                <button
                                    key={chap.chapter_id}
                                    onClick={() => setActiveChapter(chap)}
                                    className={`w-full text-left p-4 text-sm hover:bg-gray-50 transition-colors flex justify-between items-center ${activeChapter?.chapter_id === chap.chapter_id ? "bg-indigo-50 border-l-4 border-indigo-600" : ""}`}
                                >
                                    <span className="font-medium">Chapter {chap.chapterNumber}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${chap.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                        {chap.status}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Content Reader */}
                <div className="flex-1 bg-white border rounded-lg shadow-sm flex flex-col">
                    {activeChapter ? (
                        <>
                            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-indigo-600" />
                                    {activeChapter.title || `Chapter ${activeChapter.chapterNumber}`}
                                </h2>
                                <span className="text-xs text-gray-500">Last updated: {new Date(activeChapter.updatedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex-1 p-8 overflow-y-auto prose max-w-none">
                                <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-gray-800">
                                    {activeChapter.content || <span className="text-gray-400 italic">No content written yet.</span>}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            Select a chapter to review
                        </div>
                    )}
                </div>

                {/* Comments Panel (Right) */}
                <div className="w-80 bg-white border rounded-lg flex flex-col">
                    <div className="p-4 border-b font-medium text-gray-700 flex items-center gap-2 bg-gray-50 rounded-t-lg">
                        <MessageSquare className="h-4 w-4" />
                        Comments & Feedback
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {comments.length === 0 ? (
                            <div className="bg-gray-50 p-3 rounded-lg text-sm">
                                <p className="text-gray-600 italic text-center">No comments yet.</p>
                            </div>
                        ) : (
                            comments.map((comment: any) => (
                                <div key={comment.comment_id} className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                                    <div className="flex justify-between items-start">
                                        <span className="font-semibold text-gray-900">{comment.user.name}</span>
                                        <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-gray-700">{comment.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-4 border-t">
                        <textarea
                            className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-2"
                            placeholder="Add a comment..."
                            rows={3}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        ></textarea>
                        <Button size="sm" className="w-full" onClick={handlePostComment} disabled={postingComment}>
                            {postingComment ? <Loader2 className="animate-spin h-4 w-4" /> : "Post Comment"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
