
import "dotenv/config";
import http from "http";

import app from "./app.js";
import { initSocket } from "./realtime/socket.js";

const PORT = Number(process.env.PORT) || 5000;

const httpServer = http.createServer(app);

initSocket(httpServer);

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Ride Platform API running on port ${PORT}`);
  console.log(`Socket.IO running on port ${PORT}`);
});

const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down...`);

  httpServer.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));