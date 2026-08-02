import { Server } from "socket.io";

let io = null;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: [process.env.CLIENT_URL, "http://localhost:5173", "http://localhost:5174", "https://pollify-xi.vercel.app"],
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    socket.on("joinPoll", (pollId) => {
      if (typeof pollId === "string" && pollId) socket.join(`poll:${pollId}`);
    });
    socket.on("leavePoll", (pollId) => {
      if (typeof pollId === "string") socket.leave(`poll:${pollId}`);
    });
  });

  return io;
}

export function getIO() {
  return io;
}
