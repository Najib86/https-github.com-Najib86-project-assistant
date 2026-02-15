"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    Loader2, Save, MessageSquare, History, Check, X, Send,
    AlertCircle, ShieldCheck, Zap, Bold, Italic, Underline as UnderlineIcon,
    AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, List
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompletion } from "@ai-sdk/react";
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { TextAlign } from '@tiptap/extension-text-align';

interface PlagiarismResult {
    similarityScore: number;
    matches: unknown[];
}

interface Comment {
    comment_id: number;
    content: string;
    isResolved: boolean;
    user: { id: number; name: string; role: string; };
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
    projectId: number;
    initialContent: string;
    initialStatus: string;
    role: 'student' | 'supervisor' | 'member';
    userId: number;
    onStatusChange?: (status: string) => void;
}

export default function ChapterEditor({ chapterId, projectId, initialContent, initialStatus, role, userId, onStatusChange }: Props) {
    const [status, setStatus] = useState(initialStatus);
    const [saving, setSaving] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loadingComments, setLoadingComments] = useState(true);
    const [versions, setVersions] = useState<Version[]>([]);
    const [showVersions, setShowVersions] = useState(false);
    const [plagiarismResult, setPlagiarismResult] = useState<PlagiarismResult | null>(null);
    const [checkingPlagiarism, setCheckingPlagiarism] = useState(false);
    const [isCommentsOpen, setIsCommentsOpen] = useState(true);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextStyle,
            FontFamily,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: initialContent || '<p></p>',
        editorProps: {
            attributes: {
                class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px] font-serif',
            },
        },
        immediatelyRender: false,
    });

    const { complete, isLoading: isAIWriting } = useCompletion({
        api: "/api/chapters/generate",
        body: {
            projectId,
            chapterNumber: chapterId,
            topic: "Continue the content below...",
        },
        onFinish: (result) => {
            if (editor) {
                editor.commands.insertContent(result);
            }
        }
    });

    // Update editor content when initialContent changes substantially (e.g. version restore)
    // But be careful not to overwrite typing
    const restoreVersion = (content: string) => {
        if (editor) {
            editor.commands.setContent(content);
        }
        setShowVersions(false);
    };

    const fetchComments = useCallback(async () => {
        try {
            const res = await fetch(`/api/chapters/${chapterId}/comments`);
            if (res.ok) setComments(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingComments(false);
        }
    }, [chapterId]);

    const fetchVersions = useCallback(async () => {
        try {
            const res = await fetch(`/api/chapters/${chapterId}/versions`);
            if (res.ok) setVersions(await res.json());
        } catch (e) {
            console.error(e);
        }
    }, [chapterId]);

    const handleCheckPlagiarism = async () => {
        if (!editor) return;
        setCheckingPlagiarism(true);
        try {
            const text = editor.getText();
            const res = await fetch(`/api/plagiarism/check`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, projectId })
            });
            const data = await res.json();
            if (res.ok) setPlagiarismResult(data);
        } finally {
            setCheckingPlagiarism(false);
        }
    };

    const handleAIAssist = async () => {
        if (!editor) return;
        // Get last 500 characters for context, or selection
        const context = editor.getText().slice(-1000);
        await complete(context);
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const res = await fetch(`/api/chapters/${chapterId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, content: newComment })
            });
            if (res.ok) {
                const comment = await res.json();
                setComments([comment, ...comments]);
                setNewComment("");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleResolveComment = async (commentId: number) => {
        try {
            const res = await fetch(`/api/comments/${commentId}/resolve`, { method: "POST" });
            if (res.ok) {
                setComments(comments.map(c => c.comment_id === commentId ? { ...c, isResolved: true } : c));
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleSave = async (newStatus?: string) => {
        if (!editor) return;
        setSaving(true);
        try {
            const content = editor.getHTML();
            const body = { content, status: newStatus || status, createVersion: true, userId };
            const res = await fetch(`/api/chapters/${chapterId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            if (res.ok && newStatus) {
                setStatus(newStatus);
                onStatusChange?.(newStatus);
            }
        } finally {
            setSaving(false);
        }
    };

    // Formatting helper
    const toggleFormat = (format: string) => {
        if (!editor) return;
        switch (format) {
            case 'bold': editor.chain().focus().toggleBold().run(); break;
            case 'italic': editor.chain().focus().toggleItalic().run(); break;
            case 'underline': editor.chain().focus().toggleUnderline().run(); break;
            case 'h1': editor.chain().focus().toggleHeading({ level: 1 }).run(); break;
            case 'h2': editor.chain().focus().toggleHeading({ level: 2 }).run(); break;
            case 'bullet': editor.chain().focus().toggleBulletList().run(); break;
            case 'left': editor.chain().focus().setTextAlign('left').run(); break;
            case 'center': editor.chain().focus().setTextAlign('center').run(); break;
            case 'right': editor.chain().focus().setTextAlign('right').run(); break;
        }
    };

    if (!editor) return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-indigo-600" /></div>;

    return (
        <div className="flex h-full gap-6 relative overflow-hidden bg-gray-50/20 dark:bg-gray-950">
            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-indigo-50/50 border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300">
                {/* Formatting Toolbar */}
                <div className="flex flex-col border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/50">
                    <div className="flex items-center justify-between p-2 px-4 gap-2 overflow-x-auto">
                        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700 shadow-sm">
                            <select
                                onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
                                className="h-8 text-[11px] font-bold uppercase tracking-wider bg-transparent outline-none px-2 w-32 cursor-pointer"
                            >
                                <option value="Inter">Default</option>
                                <option value="Times New Roman">Times New Roman</option>
                                <option value="Arial">Arial</option>
                                <option value="Calibri">Calibri</option>
                            </select>
                        </div>

                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

                        <div className="flex items-center gap-0.5">
                            <Button variant="ghost" size="icon" onClick={() => toggleFormat('bold')} className={cn("h-8 w-8 rounded-lg", editor.isActive('bold') && "bg-indigo-100 text-indigo-700")}>
                                <Bold className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => toggleFormat('italic')} className={cn("h-8 w-8 rounded-lg", editor.isActive('italic') && "bg-indigo-100 text-indigo-700")}>
                                <Italic className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => toggleFormat('underline')} className={cn("h-8 w-8 rounded-lg", editor.isActive('underline') && "bg-indigo-100 text-indigo-700")}>
                                <UnderlineIcon className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

                        <div className="flex items-center gap-0.5">
                            <Button variant="ghost" size="icon" onClick={() => toggleFormat('left')} className={cn("h-8 w-8 rounded-lg", editor.isActive({ textAlign: 'left' }) && "bg-indigo-100 text-indigo-700")}>
                                <AlignLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => toggleFormat('center')} className={cn("h-8 w-8 rounded-lg", editor.isActive({ textAlign: 'center' }) && "bg-indigo-100 text-indigo-700")}>
                                <AlignCenter className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => toggleFormat('right')} className={cn("h-8 w-8 rounded-lg", editor.isActive({ textAlign: 'right' }) && "bg-indigo-100 text-indigo-700")}>
                                <AlignRight className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

                        <div className="flex items-center gap-0.5">
                            <Button variant="ghost" size="icon" onClick={() => toggleFormat('h1')} className={cn("h-8 w-8 rounded-lg", editor.isActive('heading', { level: 1 }) && "bg-indigo-100 text-indigo-700")}>
                                <Heading1 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => toggleFormat('h2')} className={cn("h-8 w-8 rounded-lg", editor.isActive('heading', { level: 2 }) && "bg-indigo-100 text-indigo-700")}>
                                <Heading2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => toggleFormat('bullet')} className={cn("h-8 w-8 rounded-lg", editor.isActive('bulletList') && "bg-indigo-100 text-indigo-700")}>
                                <List className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex-1" />

                        {/* Status & Save */}
                        <div className="flex items-center gap-2">
                            {isAIWriting && (
                                <div className="flex items-center gap-2 mr-2">
                                    <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />
                                    <span className="text-[10px] font-black text-indigo-600 uppercase animate-pulse">Writing...</span>
                                </div>
                            )}
                            <Button size="sm" onClick={() => handleSave()} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none h-8">
                                {saving ? <Loader2 className="animate-spin h-3.5 w-3.5 mr-2" /> : <Save className="h-3.5 w-3.5 mr-2" />}
                                Save
                            </Button>
                        </div>
                    </div>

                    {/* Secondary Actions Bar */}
                    <div className="flex items-center justify-between p-2 px-4 border-t border-gray-100 dark:border-gray-800 bg-white/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <span className={cn(
                                "px-2 py-0.5 text-[10px] font-black rounded-full uppercase tracking-[0.15em]",
                                status === 'Approved' ? "bg-emerald-100 text-emerald-700" :
                                    status === 'Submitted' ? "bg-amber-100 text-amber-700" :
                                        "bg-gray-100 text-gray-500"
                            )}>
                                {status}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleAIAssist}
                                disabled={isAIWriting}
                                className="text-indigo-600 font-bold text-[10px] uppercase h-7"
                            >
                                <Zap className="h-3 w-3 mr-1.5" />
                                AI Continue
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setShowVersions(!showVersions); fetchVersions(); }}
                                className="text-gray-500 font-bold text-[10px] uppercase h-7"
                            >
                                <History className="h-3 w-3 mr-1.5" />
                                History
                            </Button>
                            <button
                                onClick={handleCheckPlagiarism}
                                disabled={checkingPlagiarism}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all h-7",
                                    plagiarismResult
                                        ? plagiarismResult.similarityScore > 20 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                                        : "bg-gray-50 text-gray-400 hover:text-indigo-600"
                                )}
                            >
                                {checkingPlagiarism ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                                {plagiarismResult ? `${plagiarismResult.similarityScore}%` : "Scan"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto relative p-8 lg:p-12 scroll-smooth">
                    {showVersions ? (
                        <div className="max-w-2xl mx-auto space-y-6">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8">Version History</h3>
                            {versions.map(v => (
                                <div key={v.version_id} className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                    <div>
                                        <p className="font-black text-gray-900 dark:text-white uppercase text-[10px] tracking-widest mb-1">Version {v.versionNumber}</p>
                                        <p className="text-sm text-gray-500 font-medium">{new Date(v.createdAt).toLocaleString()}</p>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => restoreVersion(v.contentSnapshot)} className="rounded-xl border-gray-200 font-bold px-5">Restore</Button>
                                </div>
                            ))}
                            <Button variant="ghost" onClick={() => setShowVersions(false)} className="text-indigo-600 font-bold">Back to Editor</Button>
                        </div>
                    ) : (
                        <EditorContent editor={editor} className="min-h-full" />
                    )}
                </div>
            </div>

            {/* Premium Comments Sidebar */}
            <div className={cn(
                "fixed lg:relative inset-y-0 right-0 z-40 w-80 bg-white dark:bg-gray-900 rounded-l-3xl lg:rounded-3xl shadow-2xl lg:shadow-xl shadow-indigo-50/50 border border-gray-100 dark:border-gray-800 flex flex-col h-full transform transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
                isCommentsOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0 lg:w-20"
            )}>
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h3 className={cn("font-black text-gray-900 dark:text-white flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] transition-opacity duration-300", !isCommentsOpen && "lg:opacity-0")}>
                        <MessageSquare className="h-4 w-4 text-indigo-600" />
                        Feedback
                    </h3>
                    <Button variant="ghost" size="icon" onClick={() => setIsCommentsOpen(!isCommentsOpen)} className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                        {isCommentsOpen ? <X className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                    </Button>
                </div>

                {isCommentsOpen ? (
                    <>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {loadingComments ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4">
                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-200" />
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Loading Feed...</p>
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-3xl flex items-center justify-center mb-4">
                                        <MessageSquare className="h-6 w-6 text-gray-300" />
                                    </div>
                                    <p className="text-gray-400 text-sm font-medium">No feedback yet. Collaborative work starts here.</p>
                                </div>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment.comment_id} className={cn(
                                        "bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 transition-all",
                                        comment.isResolved && "opacity-40 grayscale"
                                    )}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-[10px] text-white font-black">
                                                    {comment.user.name[0]}
                                                </div>
                                                <span className="text-xs font-black text-gray-900 dark:text-white truncate max-w-[120px]">{comment.user.name}</span>
                                            </div>
                                            {comment.isResolved && <Check className="h-3 w-3 text-emerald-600" />}
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{comment.content}</p>
                                        {!comment.isResolved && role === "supervisor" && (
                                            <button onClick={() => handleResolveComment(comment.comment_id)} className="mt-4 w-full py-2 rounded-xl text-[10px] font-black uppercase text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all border border-emerald-100 dark:border-emerald-900/50">
                                                Resolve
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-950/20">
                            <form onSubmit={handlePostComment} className="relative">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="w-full text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-2xl p-4 pr-12 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none resize-none bg-white dark:bg-gray-800 min-h-[100px] transition-all"
                                    placeholder="Share your thoughts..."
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!newComment.trim()}
                                    className="absolute bottom-3 right-3 h-8 w-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center pt-8 gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                            <AlertCircle className="h-5 w-5 text-indigo-400" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
