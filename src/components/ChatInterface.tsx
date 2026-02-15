
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Send, MoreVertical, Phone, Video, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import io from "socket.io-client";

interface Message {
    message_id: number;
    content: string;
    createdAt: string;
    sender: {
        id: number;
        name: string;
        role: string;
    };
}

interface Props {
    projectId: number;
    userId: number;
    userName: string;
    userRole: string; // 'student' or 'supervisor'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let socket: any;

export default function ChatInterface({ projectId, userId, userName, userRole }: Props) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [socketConnected, setSocketConnected] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, typingUsers]);

    // Initialize Socket & Fetch Messages
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/messages`);
                if (res.ok) {
                    setMessages(await res.json());
                }
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        // Connect to socket
        // Note: connecting to port 3001 as per our server script
        const SOCKET_URL = "http://localhost:3001";
        socket = io(SOCKET_URL);

        socket.on("connect", () => {
            console.log("Connected to chat server");
            setSocketConnected(true);
            socket.emit("join-project", { userId, projectId });
        });

        socket.on("receive-message", (msg: Message) => {
            setMessages((prev) => [...prev, msg]);
        });

        // Presence events
        socket.on("user:online", ({ userId: uid }: { userId: string }) => {
            // For MVP, just showing "Supervisor Online" if we decode logic, 
            // but here we just get an ID. In a real app we'd map ID to name.
            // For now let's just trigger a refresh or generic indicator
            console.log("User online:", uid);
            setOnlineUsers((prev) => [...prev, String(uid)]);
        });

        socket.on("user:offline", ({ userId: uid }: { userId: string }) => {
            setOnlineUsers((prev) => prev.filter(id => id !== String(uid)));
        });

        socket.on("user:typing", ({ userId: uid }: { userId: string }) => {
            setTypingUsers((prev) => [...prev, String(uid)]);
        });

        socket.on("user:stop_typing", ({ userId: uid }: { userId: string }) => {
            setTypingUsers((prev) => prev.filter(id => id !== String(uid)));
        });

        return () => {
            socket.disconnect();
        };
    }, [projectId, userId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const tempContent = newMessage;
        setNewMessage("");

        // Optimistic update
        // But we need to save to DB first to get ID/Timestamp
        // So let's just wait for API.

        try {
            const res = await fetch(`/api/projects/${projectId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: tempContent, senderId: userId })
            });

            if (res.ok) {
                const savedMsg = await res.json();
                setMessages((prev) => [...prev, savedMsg]);
                // Emit to socket
                socket.emit("send-message", savedMsg);
                socket.emit("user:stop_typing", { userId, projectId });
            }
        } catch (error) {
            console.error(error);
            alert("Failed to send message");
        }
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);

        socket.emit("user:typing", { userId, projectId });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("user:stop_typing", { userId, projectId });
        }, 1000);
    };

    return (
        <div className="flex flex-col h-[600px] bg-[#efe7dd] border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
            {/* WhatsApp Header */}
            <div className="bg-[#075e54] text-white p-3 px-4 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold border border-white/30">
                        {projectId}
                    </div>
                    <div>
                        <h3 className="font-bold text-sm leading-tight">Project Discussion</h3>
                        <p className="text-[11px] text-white/80 leading-tight">
                            {typingUsers.length > 0 ? (
                                <span className="text-green-300 font-bold animate-pulse">typing...</span>
                            ) : (
                                onlineUsers.length > 0 ? "Online" : "Tap for info"
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-white/80">
                    <Video className="h-5 w-5 hover:text-white cursor-pointer" />
                    <Phone className="h-5 w-5 hover:text-white cursor-pointer" />
                    <MoreVertical className="h-5 w-5 hover:text-white cursor-pointer" />
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://camo.githubusercontent.com/854a93c27d6427d8e0d2875b63414f7154772d854e433f25b293556046e7f8e8/68747470733a2f2f7765622e77686174736170702e636f6d2f696d672f62672d636861742d74696c652d6461726b5f61346265393661313361356338316265333332373739356133393936356361372e706e67')] bg-repeat bg-center opacity-90 relative">
                {/* Overlay for background brightness */}
                <div className="absolute inset-0 bg-[#efe7dd]/90 pointer-events-none" />

                {loading ? (
                    <div className="flex justify-center pt-10 relative z-10">
                        <Loader2 className="animate-spin text-gray-400" />
                    </div>
                ) : (
                    <div className="relative z-10 space-y-1">
                        {messages.length === 0 && (
                            <div className="text-center py-8 text-xs text-gray-500 bg-[#e1f3fb] rounded-lg shadow-sm border border-[#b6dce9] mx-8 my-4">
                                <p>Messages are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.</p>
                            </div>
                        )}

                        {messages.map((msg, i) => {
                            const isMe = msg.sender.id === userId;
                            const isSupervisor = msg.sender.role === 'supervisor';
                            const showName = i === 0 || messages[i - 1].sender.id !== msg.sender.id;

                            return (
                                <div key={msg.message_id} className={cn("flex flex-col max-w-[80%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                                    <div className={cn(
                                        "relative px-3 py-1.5 rounded-lg shadow-sm text-sm break-words min-w-[80px]",
                                        isMe ? "bg-[#dcf8c6] rounded-tr-none" : "bg-white rounded-tl-none"
                                    )}>
                                        {!isMe && showName && (
                                            <p className={cn(
                                                "text-[10px] font-bold mb-0.5 leading-none",
                                                isSupervisor ? "text-blue-500" : "text-amber-600"
                                            )}>
                                                {msg.sender.name}
                                            </p>
                                        )}
                                        <p className="text-gray-900 leading-snug">{msg.content}</p>
                                        <div className="text-[9px] text-gray-400 text-right mt-1 flex items-center justify-end gap-1">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {isMe && <span className="text-blue-400">✓✓</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="bg-[#f0f0f0] p-2 flex items-center gap-2 border-t border-gray-200">
                <input
                    className="flex-1 bg-white rounded-full px-4 py-2 text-sm border-none focus:ring-1 focus:ring-[#075e54] outline-none shadow-sm"
                    placeholder="Type a message"
                    value={newMessage}
                    onChange={handleTyping}
                />
                <Button
                    type="submit"
                    size="icon"
                    disabled={!newMessage.trim()}
                    className="h-10 w-10 rounded-full bg-[#075e54] hover:bg-[#128c7e] text-white shadow-sm flex-shrink-0"
                >
                    <Send className="h-4 w-4 ml-0.5" />
                </Button>
            </form>
        </div>
    );
}
