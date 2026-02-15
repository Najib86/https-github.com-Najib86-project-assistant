"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

interface ActivityItem {
    activity_id: number;
    action: string;
    details: string;
    createdAt: string;
    user: {
        name: string;
    };
}

export default function ProjectActivityFeed({ projectId }: { projectId: number }) {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/activity`);
                if (res.ok) {
                    setActivities(await res.json());
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();

        // Poll every 30 seconds
        const interval = setInterval(fetchActivity, 30000);
        return () => clearInterval(interval);
    }, [projectId]);

    if (loading) {
        return <div className="text-center py-4 text-xs text-gray-400">Loading activity...</div>;
    }

    if (activities.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-xs text-gray-400">No recent activity</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-gray-400" />
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Recent Activity</h3>
            </div>
            <div className="relative border-l border-gray-200 ml-3 space-y-6">
                {activities.map((item) => (
                    <div key={item.activity_id} className="ml-6 relative">
                        <span className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full bg-gray-200 border-2 border-white ring-1 ring-gray-100" />

                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-900">
                                {item.user?.name || "Unknown User"}
                            </span>
                            <span className="text-xs text-gray-500 mb-1">
                                {formatAction(item.action)}
                            </span>
                            {item.details && (
                                <p className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100 italic">
                                    &quot;{item.details}&quot;
                                </p>
                            )}
                            <span className="text-[10px] text-gray-300 mt-1">
                                {new Date(item.createdAt).toLocaleString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function formatAction(action: string) {
    switch (action) {
        case "edited_chapter": return "updated a chapter";
        case "added_member": return "added a team member";
        case "joined_project": return "joined the project";
        case "posted_comment": return "posted a comment";
        default: return action.replace(/_/g, " ");
    }
}
