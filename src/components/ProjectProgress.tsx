
"use client";

import { cn } from "@/lib/utils";

interface Props {
    chapters: { status: string }[];
}

export default function ProjectProgress({ chapters }: Props) {
    if (!chapters || chapters.length === 0) return null;

    const completed = chapters.filter(c => c.status === 'Completed' || c.status === 'Approved').length;
    const total = chapters.length;
    const percentage = Math.round((completed / total) * 100);

    return (
        <div className="w-full bg-gray-100 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
            <div
                className={cn("bg-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-out",
                    percentage === 100 ? "bg-green-500" : ""
                )}
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
}
