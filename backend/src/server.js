import "dotenv/config";
import app from "./app.js";

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Ride Platform API running on port ${PORT}`);
});

const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down...`);

  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
