"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ChapterEditor from "@/components/ChapterEditor";

export default function StudentChapterPage() {
    const params = useParams();
    // Ensure params are treated as strings
    const projectId = Array.isArray(params.projectId) ? params.projectId[0] : params.projectId;
    const chapterId = Array.isArray(params.chapterId) ? params.chapterId[0] : params.chapterId;

    // Define proper interface for fetched data
    interface ChapterData {
        chapter_id: number;
        title: string;
        content: string;
        status: string;
    }

    const [chapter, setChapter] = useState<ChapterData | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ id: number; name: string; role: string } | null>(null);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) setUser(JSON.parse(userStr));
    }, []);

    const fetchChapter = useCallback(async () => {
        if (!chapterId) return;
        try {
            console.log(`Fetching chapter: ${chapterId}`);
            const res = await fetch(`/api/chapters/${chapterId}`);
            if (res.ok) {
                const data = await res.json();
                setChapter(data);
            } else {
                console.error("Failed to fetch chapter:", res.status);
                // Don't set null immediately if we want to show a specific error, but here 404 is expected if not found
                if (res.status === 404) setChapter(null);
            }
        } catch (error) {
            console.error("Error fetching chapter:", error);
        } finally {
            setLoading(false);
        }
    }, [chapterId]);

    useEffect(() => {
        if (chapterId && projectId) {
            fetchChapter();
        }
    }, [chapterId, projectId, fetchChapter]);

    if (loading || !user) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-indigo-600" /></div>;
    }

    if (!chapter) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
                <h2 className="text-xl font-bold text-gray-900">Chapter not found</h2>
                <p className="text-gray-500">The chapter you are looking for does not exist or you don&apos;t have access.</p>
                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link href={`/student/project/${projectId}`}>Return to Project</Link>
                    </Button>
                    <Button variant="ghost" onClick={() => window.location.reload()}>Retry</Button>
                </div>
                <div className="mt-8 text-xs text-gray-300">
                    Debug: {projectId} / {chapterId}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col px-0 md:px-1 h-[100dvh] md:h-[calc(100vh-theme(spacing.24))] overflow-hidden">
            <div className="flex items-center gap-4 mb-4 shrink-0 px-4 md:px-0 pt-2 md:pt-0">
                <Button variant="ghost" size="icon" asChild className="rounded-full">
                    <Link href={`/student/project/${projectId}`}>
                        <ArrowLeft className="h-5 w-5 text-gray-500" />
                    </Link>
                </Button>
                <div className="min-w-0">
                    <h1 className="text-lg md:text-2xl font-bold text-gray-900 leading-tight truncate">{chapter.title}</h1>
                    <p className="text-xs text-gray-500 hidden md:block">Project Chapter Editor</p>
                </div>
            </div>

            <div className="flex-1 min-h-0 relative">
                <ChapterEditor
                    chapterId={chapter.chapter_id}
                    projectId={Number(projectId)}
                    initialContent={chapter.content || ""}
                    initialStatus={chapter.status}
                    role="student"
                    userId={user.id}
                    onStatusChange={(status) => setChapter(prev => prev ? ({ ...prev, status }) : null)}
                />
            </div>
        </div>
    );
}
