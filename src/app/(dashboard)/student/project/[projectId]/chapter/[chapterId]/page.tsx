
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ChapterEditor from "@/components/ChapterEditor";

export default function StudentChapterPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.projectId;
    const chapterId = params.chapterId;

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
            const res = await fetch(`/api/chapters/${chapterId}`);
            if (res.ok) {
                const data = await res.json();
                setChapter(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [chapterId]);

    useEffect(() => {
        fetchChapter();
    }, [fetchChapter]);

    if (loading || !user) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-indigo-600" /></div>;
    }

    if (!chapter) {
        return <div className="text-center py-12">Chapter not found</div>;
    }

    return (
        <div className="h-[calc(100vh-theme(spacing.24))] flex flex-col px-1">
            <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full">
                    <Link href={`/student/project/${projectId}`}>
                        <ArrowLeft className="h-5 w-5 text-gray-500" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">{chapter.title}</h1>
                    <p className="text-xs text-gray-500">Project Chapter Editor</p>
                </div>
            </div>

            <div className="flex-1 min-h-0">
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
