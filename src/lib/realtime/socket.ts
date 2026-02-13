// @ts-expect-error - Turbopack/TS issue with socket.io-client exports
import { io, Socket } from "socket.io-client";

// @ts-expect-error - Socket type issue
let socket: Socket | null = null;

// @ts-expect-error - Socket return type issue
export const getSocket = (): Socket => {
    if (!socket) {
        const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
        socket = io(SOCKET_URL, {
            autoConnect: false,
            transports: ["websocket"],
        });
    }
    return socket;
};

export const connectSocket = (userId: string, projectId: string) => {
    const s = getSocket();
    if (!s.connected) {
        s.connect();
        s.emit("join-project", { userId, projectId });
    }
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
