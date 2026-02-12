
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

import { Loader2, Save, MessageSquare, History, Check, X, Send, ChevronRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Comment {
    comment_id: number;
    content: string;
    isResolved: boolean;
    user: {
        id: number;
        name: string;
        role: string;
    };
    createdAt: string;
}

interface Version {
    version_id: number;
    versionNumber: number;
    contentSnapshot: string;
    createdAt: string;
}

interface Props {
    chapterId: number;
    initialContent: string;
    initialStatus: string;
    role: 'student' | 'supervisor' | 'member';
    userId: number;
    onStatusChange?: (status: string) => void;
}

export default function ChapterEditor({ chapterId, initialContent, initialStatus, role, userId, onStatusChange }: Props) {
    const [content, setContent] = useState(initialContent);
    const [status, setStatus] = useState(initialStatus);
    const [saving, setSaving] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loadingComments, setLoadingComments] = useState(true);
    const [versions, setVersions] = useState<Version[]>([]);
    const [showVersions, setShowVersions] = useState(false);
    const [plagiarismScore, setPlagiarismScore] = useState<number | null>(null);
    const [checkingPlagiarism, setCheckingPlagiarism] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Fetch comments
    const fetchComments = useCallback(async () => {
        try {
            const res = await fetch(`/api/chapters/${chapterId}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } finally {
            setLoadingComments(false);
        }
    }, [chapterId]);

    // Fetch versions
    const fetchVersions = useCallback(async () => {
        try {
            const res = await fetch(`/api/chapters/${chapterId}/versions`);
            if (res.ok) {
                const data = await res.json();
                setVersions(data);
            }
        } catch (error) {
            console.error(error);
        }
    }, [chapterId]);

    // Fetch existing plagiarism score
    useEffect(() => {
        fetch(`/api/chapters/${chapterId}/plagiarism`)
            .then(res => res.json())
            .then(data => { if (data && data.score !== undefined) setPlagiarismScore(data.score) })
            .catch(console.error);
    }, [chapterId]);

    const handleCheckPlagiarism = async () => {
        setCheckingPlagiarism(true);
        try {
            const res = await fetch(`/api/chapters/${chapterId}/plagiarism`, { method: "POST" });
            const data = await res.json();
            if (res.ok) setPlagiarismScore(data.score);
        } catch (error) {
            console.error(error);
        } finally {
            setCheckingPlagiarism(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleSave = async (newStatus?: string) => {
        setSaving(true);
        try {
            const body = {
                content,
                status: newStatus || status,
                createVersion: true // Always create version on explicit save for now
            };
            const res = await fetch(`/api/chapters/${chapterId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                if (newStatus) {
                    setStatus(newStatus);
                    onStatusChange?.(newStatus);
                }
                // Refresh versions
                fetchVersions();
            }
        } catch (error) {
            console.error("Failed to save", error);
        } finally {
            setSaving(false);
        }
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const res = await fetch(`/api/chapters/${chapterId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    content: newComment,
                    // anchorText/position logic omitted for MVP
                })
            });
            if (res.ok) {
                const comment = await res.json();
                setComments([comment, ...comments]);
                setNewComment("");
            }
        } catch (error) {
            console.error("Failed to post comment", error);
        }
    };



    const handleResolveComment = async (commentId: number) => {
        try {
            const res = await fetch(`/api/comments/${commentId}/resolve`, { method: "POST" });
            if (res.ok) {
                setComments(comments.map(c => c.comment_id === commentId ? { ...c, isResolved: true } : c));
            }
        } catch (error) {
            console.error("Failed to resolve", error);
        }
    };

    const handleRestoreVersion = (versionContent: string) => {
        if (confirm("Restore this version? current changes will be lost unless saved.")) {
            setContent(versionContent);
            setShowVersions(false);
        }
    };

    return (
        <div className="flex h-full gap-6">
            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider",
                            status === 'Approved' ? "bg-green-100 text-green-700" :
                                status === 'Submitted' ? "bg-orange-100 text-orange-700" :
                                    "bg-gray-100 text-gray-600"
                        )}>
                            {status}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setShowVersions(!showVersions); fetchVersions(); }}>
                            <History className="h-4 w-4 mr-2" />
                            Versions
                        </Button>

                        {plagiarismScore !== null ? (
                            <span className={cn("text-xs font-bold px-2 py-1 rounded-full border",
                                plagiarismScore > 20 ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200"
                            )}>
                                Plagiarism: {plagiarismScore}%
                            </span>
                        ) : (
                            <Button variant="ghost" size="sm" onClick={handleCheckPlagiarism} disabled={checkingPlagiarism}>
                                {checkingPlagiarism ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <AlertCircle className="h-4 w-4 mr-2" />}
                                Scan
                            </Button>
                        )}

                        {role !== 'supervisor' && (
                            <>
                                <Button variant="outline" size="sm" onClick={() => handleSave()} disabled={saving}>
                                    {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4 mr-2" />}
                                    Save Draft
                                </Button>
                                <Button size="sm" onClick={() => handleSave('Submitted')} disabled={saving || status === 'Submitted'} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                    Submit for Review
                                </Button>
                            </>
                        )}
                        {role === 'supervisor' && (
                            <>
                                <Button variant="outline" size="sm" onClick={() => handleSave('In Progress')} className="text-orange-600 hover:text-orange-700 border-orange-200 hover:bg-orange-50">
                                    Request Changes
                                </Button>
                                <Button size="sm" onClick={() => handleSave('Approved')} className="bg-green-600 hover:bg-green-700 text-white">
                                    Approve Chapter
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Editor or Content */}
                <div className="flex-1 overflow-auto relative p-6">
                    {showVersions ? (
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-900">Version History</h3>
                            {versions.length === 0 ? <p className="text-gray-500">No versions saved yet.</p> : (
                                versions.map(v => (
                                    <div key={v.version_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div>
                                            <p className="font-bold text-sm">Version {v.versionNumber}</p>
                                            <p className="text-xs text-gray-500">{new Date(v.createdAt).toLocaleString()}</p>
                                        </div>
                                        <Button size="sm" variant="ghost" onClick={() => handleRestoreVersion(v.contentSnapshot)}>Restore</Button>
                                    </div>
                                ))
                            )}
                            <Button variant="link" onClick={() => setShowVersions(false)}>Back to Editor</Button>
                        </div>
                    ) : (
                        role === 'supervisor' ? (
                            <div className="prose max-w-none whitespace-pre-wrap font-serif text-lg leading-relaxed text-gray-800">
                                {content}
                            </div>
                        ) : (
                            <textarea
                                ref={textareaRef}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full h-full resize-none outline-none font-serif text-lg leading-relaxed text-gray-800 placeholder:text-gray-300 bg-transparent"
                                placeholder="Start writing your chapter here..."
                                spellCheck={false}
                            />
                        )
                    )}
                </div>
            </div>

            {/* Comments Sidebar */}
            <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Comments
                    </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loadingComments ? (
                        <div className="flex justify-center py-4"><Loader2 className="animate-spin h-5 w-5 text-gray-400" /></div>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">No comments yet.</div>
                    ) : (
                        comments.map(comment => (
                            <div key={comment.comment_id} className={cn("rounded-lg p-3 border", comment.isResolved ? "bg-green-50 border-green-100 opacity-60" : "bg-gray-50 border-gray-100")}>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-xs text-gray-900">{comment.user.name}</span>
                                        {comment.isResolved && <Check className="h-3 w-3 text-green-600" />}
                                    </div>
                                    <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-gray-700">{comment.content}</p>
                                {!comment.isResolved && role === 'supervisor' && (
                                    <Button variant="ghost" size="sm" onClick={() => handleResolveComment(comment.comment_id)} className="mt-2 h-6 text-xs w-full justify-start px-2 text-green-600 hover:text-green-700 hover:bg-green-50">
                                        <Check className="h-3 w-3 mr-1" />
                                        Mark as Resolved
                                    </Button>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="p-3 border-t border-gray-100 bg-gray-50/30">
                    <form onSubmit={handlePostComment} className="relative">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full text-sm border border-gray-200 rounded-lg p-3 pr-10 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none resize-none bg-white min-h-[80px]"
                            placeholder="Add a comment..."
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!newComment.trim()}
                            className="absolute bottom-2 right-2 h-7 w-7 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                        >
                            <Send className="h-3 w-3" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
