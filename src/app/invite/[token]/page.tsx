
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle, UserCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface InviteData {
    invite_id: number;
    token: string;
    project: {
        title: string;
        student: {
            name: string;
            email: string;
        };
    };
    expiresAt: string;
}

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const router = useRouter();
    const [invite, setInvite] = useState<InviteData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [accepting, setAccepting] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        // Check authentication
        const userStr = localStorage.getItem("user");
        if (userStr) {
            setCurrentUser(JSON.parse(userStr));
        }

        // Fetch invite details
        const fetchInvite = async () => {
            try {
                const res = await fetch(`/api/invite/${token}`);
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Invalid invite");
                }
                const data = await res.json();
                setInvite(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchInvite();
    }, [token]);

    const handleAccept = async () => {
        if (!currentUser) {
            router.push("/auth/login?redirect=/invite/" + token);
            return;
        }

        if (currentUser.role !== "supervisor") {
            setError("Only supervisors can accept this invitation. Please sign up as a supervisor.");
            return;
        }

        setAccepting(true);
        try {
            const res = await fetch(`/api/invite/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUser.id }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to accept invite");
            }

            // Success - redirect to the project
            router.push(`/supervisor/project/${data.projectId}`);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to join project. Please try again.");
            setAccepting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Verifying invitation...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100">
                    <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Invitation Error</h1>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <Button asChild className="w-full rounded-xl font-bold">
                        <Link href="/">Go Home</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-indigo-100/50 max-w-md w-full text-center border border-indigo-50">
                <div className="h-20 w-20 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200 rotate-3">
                    <UserCheck className="h-10 w-10" />
                </div>

                <h1 className="text-2xl font-black text-gray-900 mb-2">Project Supervision Invite</h1>
                <p className="text-gray-500 mb-8">
                    You have been invited to supervise a research project.
                </p>

                <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left border border-gray-100">
                    <div className="mb-4">
                        <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Student</p>
                        <p className="font-bold text-gray-900 text-lg">{invite?.project.student.name}</p>
                        <p className="text-sm text-gray-500">{invite?.project.student.email}</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Project Title</p>
                        <p className="font-medium text-gray-900 leading-snug">{invite?.project.title}</p>
                    </div>
                </div>

                {!currentUser ? (
                    <div className="space-y-3">
                        <Button onClick={handleAccept} size="lg" className="w-full rounded-xl font-bold h-12 shadow-lg shadow-indigo-200">
                            Log in to Accept
                        </Button>
                        <p className="text-xs text-gray-400">You need an account to join.</p>
                    </div>
                ) : (
                    <Button
                        onClick={handleAccept}
                        disabled={accepting}
                        size="lg"
                        className="w-full rounded-xl font-bold h-12 shadow-lg shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700"
                    >
                        {accepting ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                        {accepting ? "Joining Project..." : "Accept Supervision Request"}
                    </Button>
                )}

                <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                        By accepting, you will gain access to the student's project workspace, chapters, and review tools.
                    </p>
                </div>
            </div>
        </div>
    );
}
