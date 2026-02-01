import type { Server as HttpServer } from "http";
import { Server } from "socket.io";

export type RealtimeChannels = "appointments" | "dashboard";

export const initSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN || "*",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    socket.on("join", (channel: RealtimeChannels) => {
      socket.join(channel);
    });

    socket.on("leave", (channel: RealtimeChannels) => {
      socket.leave(channel);
    });
  });

  return io;
};
