
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { ChapterEditorWrapper } from "./editor-wrapper";

interface PageProps {
    params: Promise<{
        projectId: string;
        chapterId: string;
    }>;
}

export default async function ChapterPage(props: PageProps) {
    const params = await props.params;

    // Validate params
    const projectId = parseInt(params.projectId);
    const chapterId = parseInt(params.chapterId);

    if (isNaN(projectId) || isNaN(chapterId)) {
        notFound();
    }

    try {
        const chapter = await prisma.chapter.findUnique({
            where: { chapter_id: chapterId },
        });

        if (!chapter) {
            notFound();
        }

        // Optional: Validate project ID (though technically we can navigate to any chapter if ID belongs to it)
        if (chapter.projectId !== projectId) {
            // Mismatch project ID in URL vs Chapter data.
            // This is usually a 404 or redirect.
            notFound();
        }

        return (
            <div className="flex flex-col h-[calc(100vh-theme(spacing.24))]">
                <div className="flex items-center gap-4 mb-4 px-1">
                    <Button variant="ghost" size="icon" asChild className="rounded-full">
                        <Link href={`/student/project/${projectId}`}>
                            <ArrowLeft className="h-5 w-5 text-gray-500" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 leading-tight">{chapter.title}</h1>
                        <p className="text-xs text-gray-500 hidden md:block">Chapter Editor</p>
                    </div>
                </div>

                <div className="flex-1 min-h-0 relative">
                    <ChapterEditorWrapper
                        chapter={chapter}
                        projectId={projectId}
                    />
                </div>
            </div>
        );
    } catch (error) {
        console.error("Error loading chapter page:", error);
        return (
            <div className="p-8 text-center text-red-500">
                Failed to load chapter. Please try again later.
            </div>
        );
    }
}
// rebuild server
