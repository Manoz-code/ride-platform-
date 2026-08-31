import { Server } from "socket.io";
import { verifyAccessToken } from "../utils/tokens.js";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
        : true,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication required."));
      }

      const payload = await verifyAccessToken(token);

      socket.user = {
        id: payload.sub,
        role: payload.role,
        status: payload.status,
      };

      next();
    } catch (error) {
      next(new Error("Invalid or expired access token."));
    }
  });

  io.on("connection", (socket) => {
    const { id, role } = socket.user;

    socket.join(`user:${id}`);

    console.log(`Socket room joined: user:${id}`);
    if (role === "customer") {
      socket.join("customers");
    }

    if (role === "rider") {
      socket.join("riders");
    }

    console.log(
      `Socket connected: ${id} (${role})`
    );

    socket.on("disconnect", (reason) => {
      console.log(
        `Socket disconnected: ${id} (${reason})`
      );
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized.");
  }

  return io;
};

export const emitToUser = (userId, event, payload) => {
  getIO().to(`user:${userId}`).emit(event, payload);
};

export const emitToRiders = (event, payload) => {
  getIO().to("riders").emit(event, payload);
};
