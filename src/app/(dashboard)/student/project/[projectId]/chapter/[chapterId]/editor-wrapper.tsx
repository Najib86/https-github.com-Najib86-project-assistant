
"use client";

import { useEffect, useState } from "react";
import ChapterEditor from "@/components/ChapterEditor";
import { Loader2 } from "lucide-react";

interface Chapter {
    chapter_id: number;
    title: string | null;
    content: string | null;
    status: string;
}

export function ChapterEditorWrapper({
    chapter,
    projectId
}: {
    chapter: Chapter;
    projectId: number;
}) {
    const [user, setUser] = useState<{ id: number; name: string; role: string } | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                setUser(JSON.parse(userStr));
            } else {
                fetch("/api/auth/session")
                    .then(res => res.json())
                    .then(session => {
                        if (session?.user) {
                            setUser(session.user);
                            // Update local storage too to keep in sync
                            localStorage.setItem("user", JSON.stringify(session.user));
                        } else {
                            // If no session, redirect to login
                            window.location.href = "/auth/login";
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                        window.location.href = "/auth/login";
                    });
            }
        }
    }, []);

    if (!user) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-10 w-10 text-indigo-600" /></div>;
    }

    return (
        <ChapterEditor
            chapterId={chapter.chapter_id}
            projectId={projectId}
            initialContent={chapter.content || ""}
            initialStatus={chapter.status}
            role="student"
            userId={user.id}
            onStatusChange={(status) => console.log("Status changed:", status)}
        />
    );
}
