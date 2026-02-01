import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "./config/env";

export type RealtimeChannels = "appointments" | "dashboard";

export const initSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: env.socketCorsOrigin,
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
