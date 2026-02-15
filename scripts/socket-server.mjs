
import { Server } from "socket.io";
import { createServer } from "http";

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const onlineUsers = new Map(); // userId -> socketId

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-project", ({ userId, projectId }) => {
        const room = `project-${projectId}`;
        socket.join(room);
        console.log(`User ${userId} joined ${room}`);

        // Track online user
        if (userId) {
            onlineUsers.set(userId, socket.id);
            io.to(room).emit("user:online", { userId });
        }

        // Send list of online users in this room? 
        // Simplified: just broadcast presence
    });

    socket.on("leave-project", ({ userId, projectId }) => {
        const room = `project-${projectId}`;
        socket.leave(room);
        if (userId) {
            io.to(room).emit("user:offline", { userId });
        }
    });

    socket.on("user:typing", ({ userId, projectId }) => {
        socket.to(`project-${projectId}`).emit("user:typing", { userId });
    });

    socket.on("user:stop_typing", ({ userId, projectId }) => {
        socket.to(`project-${projectId}`).emit("user:stop_typing", { userId });
    });

    socket.on("send-message", (message) => {
        // Expect message to have projectId
        console.log("Broadcasting message:", message);
        if (message.projectId) {
            socket.to(`project-${message.projectId}`).emit("receive-message", message);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        // Find user by socketId and emit offline?
        // This is expensive with simple Map search, but valid for MVP.
        for (const [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                // We don't know the project here easily without tracking it too.
                // But usually the client handles explicit leave.
                // For now, simple disconnect might just mean they lost connection.
                break;
            }
        }
    });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
    console.log(`Socket.io server running on port ${PORT}`);
});
