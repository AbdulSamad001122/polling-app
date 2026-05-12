import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        socket.on("joinPoll", (pollId) => {
            socket.join(pollId);
            console.log(`Socket ${socket.id} joined poll ${pollId}`);
        });

        socket.on("leavePoll", (pollId) => {
            socket.leave(pollId);
            console.log(`Socket ${socket.id} left poll ${pollId}`);
        });

        socket.on("liveToggle", (data) => {
            // data contains: { pollId, questionId, optionId, user, action: "select" | "deselect" }
            socket.to(data.pollId).emit("liveOptionUpdate", data);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
