"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle, Users } from "lucide-react";
import Link from "next/link";

interface InviteData {
    invite_id: number;
    token: string;
    email: string;
    project: {
        project_id: number;
        title: string;
        level: string;
        type: string;
        student: {
            name: string;
            email: string;
        };
    };
    inviter: {
        name: string;
    };
    expiresAt: string;
}

export default function MemberInvitePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const router = useRouter();
    const [invite, setInvite] = useState<InviteData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [accepting, setAccepting] = useState(false);
    const [currentUser, setCurrentUser] = useState<{ email?: string | null; id?: string } | null>(null);

    useEffect(() => {
        // Check authentication via NextAuth session
        const fetchSession = async () => {
            try {
                const res = await fetch("/api/auth/session");
                const session = await res.json();
                if (session?.user) {
                    setCurrentUser(session.user);
                }
            } catch (error) {
                console.error("Failed to fetch session", error);
            }
        };
        fetchSession();

        // Fetch invite details
        const fetchInvite = async () => {
            try {
                const res = await fetch(`/api/member-invite/${token}`);
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Invalid invite");
                }
                const data = await res.json();
                setInvite(data);
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to load invitation";
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchInvite();
    }, [token]);

    const handleAccept = async () => {
        if (!currentUser) {
            // Redirect to sign in, preserving the flow
            router.push(`/api/auth/signin?callbackUrl=/member-invite/${token}`);
            return;
        }

        // Check if email matches (case insensitive)
        if (currentUser.email?.toLowerCase() !== invite?.email.toLowerCase()) {
            setError(`This invitation was sent to ${invite?.email}. Please log in with that email.`);
            return;
        }

        setAccepting(true);
        try {
            const res = await fetch(`/api/member-invite/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    router.push(`/api/auth/signin?callbackUrl=/member-invite/${token}`);
                    return;
                }
                throw new Error(data.error || "Failed to accept invite");
            }

            // Success - redirect to the project
            router.push(`/student/project/${data.projectId}`);
        } catch (err) {
            console.error(err);
            const message = err instanceof Error ? err.message : "Failed to join project. Please try again.";
            setError(message);
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
                    <Users className="h-10 w-10" />
                </div>

                <h1 className="text-2xl font-black text-gray-900 mb-2">Team Invitation</h1>
                <p className="text-gray-500 mb-8">
                    You&apos;ve been invited to join a project team!
                </p>

                <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left border border-gray-100">
                    <div className="mb-4">
                        <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Project</p>
                        <p className="font-bold text-gray-900 text-lg leading-snug">{invite?.project.title}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mt-1">
                            <span>{invite?.project.level}</span>
                            <span className="h-1 w-1 rounded-full bg-gray-300" />
                            <span>{invite?.project.type}</span>
                        </div>
                    </div>
                    <div className="mb-4">
                        <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Project Owner</p>
                        <p className="font-bold text-gray-900">{invite?.project.student.name}</p>
                        <p className="text-sm text-gray-500">{invite?.project.student.email}</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Invited By</p>
                        <p className="font-medium text-gray-900">{invite?.inviter.name}</p>
                    </div>
                </div>

                {!currentUser ? (
                    <div className="space-y-3">
                        <Button onClick={handleAccept} size="lg" className="w-full rounded-xl font-bold h-12 shadow-lg shadow-indigo-200">
                            Sign Up to Join
                        </Button>
                        <p className="text-xs text-gray-400">
                            Already have an account? <Link href={`/auth/login?redirect=/member-invite/${token}`} className="text-indigo-600 font-bold">Log in</Link>
                        </p>
                    </div>
                ) : currentUser.email !== invite?.email ? (
                    <div className="space-y-3">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                            <p className="text-sm text-yellow-800">
                                This invitation was sent to <span className="font-bold">{invite?.email}</span>
                            </p>
                            <p className="text-xs text-yellow-700 mt-1">
                                You&apos;re logged in as {currentUser.email}
                            </p>
                        </div>
                        <Button onClick={() => {
                            localStorage.removeItem("user");
                            router.push(`/auth/login?redirect=/member-invite/${token}`);
                        }} size="lg" variant="outline" className="w-full rounded-xl font-bold h-12">
                            Log in with {invite?.email}
                        </Button>
                    </div>
                ) : (
                    <Button
                        onClick={handleAccept}
                        disabled={accepting}
                        size="lg"
                        className="w-full rounded-xl font-bold h-12 shadow-lg shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700"
                    >
                        {accepting ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                        {accepting ? "Joining Project..." : "Accept & Join Team"}
                    </Button>
                )}

                <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                        By accepting, you&apos;ll gain access to the project workspace, chapters, and team collaboration tools.
                    </p>
                </div>
            </div>
        </div>
    );
}
