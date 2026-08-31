import express from "express";
import cors from "cors";
import helmet from "helmet";

import { checkDatabaseConnection } from "./config/database.js";

import authRoutes from "./modules/auth/auth.routes.js";
import customerRoutes from "./modules/customers/customer.routes.js";
import riderRoutes from "./modules/riders/rider.routes.js";
import rideRoutes from "./modules/rides/ride.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";


const app = express();

app.use(
  helmet()
);

app.use(
  cors({
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
      : true,
    credentials: true,
  })
);

app.use(express.json());

app.get("/api/v1/health", async (req, res) => {
  try {
    const database = await checkDatabaseConnection();

    res.status(200).json({
      success: true,
      api: "ok",
      database: database ? "ok" : "unavailable",
      time: database.now,
    });
  } catch (error) {
    console.error(error);

    res.status(503).json({
      success: false,
      api: "ok",
      database: "unavailable",
    });
  }
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/riders", riderRoutes);
app.use("/api/v1/rides", rideRoutes);
app.use("/api/v1/admin", adminRoutes);

app.use((error, req, res, next) => {
  console.error(error);

  // If the response has already been sent,
  // let Express handle the error.
  if (res.headersSent) {
    return next(error);
  }

  if (error.code === "23505") {
    if (
      error.constraint ===
      "fare_rules_one_active_per_market_service_idx"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "An active fare rule already exists for this market and service type.",
      });
    }

    return res.status(409).json({
      success: false,
      message: "A record with this information already exists.",
    });
  }

  if (error.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Invalid request data.",
      errors: error.issues,
    });
  }

  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

export default app;