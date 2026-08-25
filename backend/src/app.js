import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./modules/auth/auth.routes.js";

import { checkDatabaseConnection } from "./config/database.js";

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGINS
      ?.split(",")
      .map((origin) => origin.trim()),
    credentials: true,
  })
);

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "50kb" }));
app.use("/api/v1/auth", authRoutes);

app.get("/api/v1/health", async (req, res) => {
  try {
    const database = await checkDatabaseConnection();

    res.status(200).json({
      success: true,
      api: "ok",
      database: "ok",
      time: database.now,
    });
  } catch (error) {
    console.error("Health check failed:", error);

    res.status(503).json({
      success: false,
      api: "ok",
      database: "unavailable",
    });
  }
});

app.use((error, req, res, next) => {
  console.error(error);

  if (error.code === "23505") {
    return res.status(409).json({
      success: false,
      message: "An account with this information already exists.",
    });
  }

  if (error.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Invalid request data.",
      errors: error.issues,
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

export default app;