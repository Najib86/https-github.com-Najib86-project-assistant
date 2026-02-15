"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X, Users, Loader2, UserPlus, Mail, Trash2, Crown, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
    id: number;
    name: string;
    email: string;
}

interface Member {
    member_id: number;
    role: string;
    student: User;
}

interface PendingInvite {
    invite_id: number;
    email: string;
    createdAt: string;
    expiresAt: string;
    token: string;
}

interface Props {
    projectId: number;
    ownerId: number;
    ownerName?: string;
    ownerEmail?: string;
    currentUser: User | null;
}

export default function StudentProjectTeam({ projectId, ownerId, ownerName, ownerEmail, currentUser }: Props) {
    const [members, setMembers] = useState<Member[]>([]);
    const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddMember, setShowAddMember] = useState(false);
    const [newMemberEmail, setNewMemberEmail] = useState("");
    const [addingMember, setAddingMember] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const isOwner = currentUser?.id === ownerId;
    console.log('[DEBUG] Team Permissions:', {
        currentUserId: currentUser?.id,
        ownerId,
        isOwner,
        currentUser
    });

    const fetchMembers = useCallback(async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/members`);
            if (res.ok) {
                const data = await res.json();
                setMembers(data.members || data); // Handle both old and new response format
                setPendingInvites(data.pendingInvites || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        if (!newMemberEmail.trim()) return;

        setAddingMember(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/members`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: newMemberEmail, invitedBy: currentUser?.id })
            });
            const data = await res.json();

            if (res.ok) {
                if (data.type === "member_added") {
                    // User exists and was added immediately
                    setMembers([...members, data.member]);
                    setSuccessMessage(`${data.member.student.name} added to the team!`);
                } else if (data.type === "invite_sent") {
                    // Invitation sent to non-existing user
                    setPendingInvites([...pendingInvites, {
                        invite_id: Date.now(), // Temporary ID
                        email: data.invite.email,
                        createdAt: new Date().toISOString(),
                        expiresAt: data.invite.expiresAt,
                        token: data.invite.token
                    }]);
                    setSuccessMessage(`Invitation sent to ${data.invite.email}!`);
                }
                setNewMemberEmail("");
                setShowAddMember(false);

                // Clear success message after 3 seconds
                setTimeout(() => setSuccessMessage(null), 3000);
            } else {
                setError(data.error || "Failed to add member");
            }
        } catch (error) {
            console.error(error);
            setError("Failed to connect to server");
        } finally {
            setAddingMember(false);
        }
    };

    const handleDeleteMember = async (id: number) => {
        if (!confirm("Remove this member from the project?")) return;
        try {
            const res = await fetch(`/api/projects/${projectId}/members/${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setMembers(members.filter(m => m.member_id !== id));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleCancelInvite = async (token: string) => {
        if (!confirm("Cancel this invitation?")) return;
        try {
            const res = await fetch(`/api/member-invite/${token}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setPendingInvites(pendingInvites.filter(i => i.token !== token));
                setSuccessMessage("Invitation cancelled");
                setTimeout(() => setSuccessMessage(null), 3000);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to cancel invite");
            }
        } catch (error) {
            console.error(error);
            setError("Failed to connect to server");
        }
    };

    if (loading) return <div className="p-6 text-center"><Loader2 className="h-6 w-6 animate-spin text-gray-300 mx-auto" /></div>;

    return (
        <div id="project-team" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-gray-900 leading-none">Project Team</h2>
                        {/* Debug Info */}
                        <p className="text-[9px] text-red-500 font-mono mt-1">
                            Debug: You are ID {currentUser?.id || 'null'}, Owner is {ownerId}
                        </p>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1.5">{members.length + pendingInvites.length + 1} {members.length + pendingInvites.length + 1 === 1 ? 'Member' : 'Members'}</p>
                    </div>
                </div>

                {/* Debug: Force visible */ true && (
                    <Button
                        size="sm"
                        onClick={() => setShowAddMember(!showAddMember)}
                        className={cn(
                            "rounded-xl font-bold text-[10px] uppercase tracking-wider h-8 transition-all",
                            showAddMember ? "bg-gray-100 text-gray-600" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                        )}
                    >
                        {showAddMember ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4 mr-1.5" />}
                        {showAddMember ? "Cancel" : "Add Member"}
                    </Button>
                )}
            </div>

            <div className="p-6 space-y-6">
                {successMessage && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 animate-in slide-in-from-top-2 duration-300">
                        <p className="text-sm font-bold text-green-700 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            {successMessage}
                        </p>
                    </div>
                )}

                {showAddMember && (
                    <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 animate-in slide-in-from-top-2 duration-300">
                        <h3 className="text-xs font-black text-indigo-900 uppercase tracking-wider mb-3">Invite Team Member</h3>
                        <form onSubmit={handleAddMember} className="flex flex-col md:flex-row gap-2 relative">
                            <div className="relative flex-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="email"
                                    placeholder="Enter student email"
                                    className="w-full text-sm border-0 bg-white rounded-xl pl-9 pr-4 py-3 outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:scale-[1.01] transition-all font-medium text-gray-700 placeholder:text-gray-400"
                                    value={newMemberEmail}
                                    onChange={(e) => setNewMemberEmail(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={addingMember || !newMemberEmail}
                                className="bg-indigo-600 text-white rounded-xl h-auto px-6 font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {addingMember ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                                Add
                            </Button>
                        </form>
                        {error && (
                            <p className="text-xs font-bold text-red-500 mt-2 px-1 flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                {error}
                            </p>
                        )}
                    </div>
                )}

                <div className="space-y-3">
                    {/* Owner Card */}
                    <div className="flex items-center gap-4 p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100/50 shadow-sm relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-2 opacity-50">
                            <Crown className="w-12 h-12 text-indigo-100 -rotate-12" />
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md ring-4 ring-indigo-50 z-10">
                            {ownerName ? ownerName.charAt(0).toUpperCase() : (isOwner && currentUser ? currentUser.name.charAt(0).toUpperCase() : 'PL')}
                        </div>
                        <div className="flex-1 min-w-0 z-10">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-black text-gray-900 truncate">
                                    {ownerName || (isOwner && currentUser ? currentUser.name : 'Project Lead')}
                                    {isOwner && ' (You)'}
                                </p>
                                <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[9px] font-black uppercase tracking-wider">Owner</span>
                            </div>
                            <p className="text-xs font-medium text-indigo-600/60 truncate">
                                {ownerEmail || (isOwner && currentUser ? currentUser.email : 'Manages the project')}
                            </p>
                        </div>
                    </div>

                    {/* Members List */}
                    {members.map(member => (
                        <div key={member.member_id} className="group relative flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                            <div className="h-10 w-10 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 font-black text-sm shadow-sm group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                                {member.student.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-gray-900 truncate">{member.student.name}</p>
                                    <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[9px] font-bold uppercase tracking-wider">
                                        {member.role}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 truncate font-medium">{member.student.email}</p>
                            </div>

                            {true /* Debug: Force visible */ && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteMember(member.member_id)}
                                    className="opacity-0 group-hover:opacity-100 h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}

                    {/* Pending Invites */}
                    {pendingInvites.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">Pending Invitations</p>
                            {pendingInvites.map(invite => (
                                <div key={invite.invite_id} className="flex items-center gap-4 p-3 rounded-2xl bg-yellow-50 border border-yellow-100">
                                    <div className="h-10 w-10 rounded-2xl bg-yellow-100 border border-yellow-200 flex items-center justify-center text-yellow-600 font-black text-sm">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">{invite.email}</p>
                                        <p className="text-xs text-gray-500 font-medium">Invitation sent • Expires {new Date(invite.expiresAt).toLocaleDateString()}</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleCancelInvite(invite.token)}
                                        className="h-8 w-8 text-yellow-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                        title="Cancel Invite"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {members.length === 0 && !loading && (
                        <div className="text-center py-6 px-4 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
                            <p className="text-xs font-medium text-gray-400 mb-1">Working alone?</p>
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">Invite team members to collaborate</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
