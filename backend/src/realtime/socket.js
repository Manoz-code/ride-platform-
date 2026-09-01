import { Server } from "socket.io";
import { query } from "../config/database.js";
import { verifyAccessToken } from "../utils/tokens.js";

let io;

const riderLocationThrottle = new Map();

const LOCATION_MIN_INTERVAL_MS = 1000;

const isValidCoordinate = (latitude, longitude) => {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

const isValidAccuracy = (accuracy) => {
  return (
    accuracy === undefined ||
    accuracy === null ||
    (
      Number.isFinite(accuracy) &&
      accuracy >= 0 &&
      accuracy <= 10000
    )
  );
};

const handleRiderLocationUpdate = async (
  socket,
  payload
) => {
  try {
    if (socket.user.role !== "rider") {
      return;
    }

    const latitude = Number(payload?.latitude);
    const longitude = Number(payload?.longitude);

    const accuracy =
      payload?.accuracy === undefined ||
      payload?.accuracy === null
        ? null
        : Number(payload.accuracy);

    if (
      !isValidCoordinate(
        latitude,
        longitude
      )
    ) {
      socket.emit("rider:location:error", {
        message: "Invalid GPS coordinates.",
      });

      return;
    }

    if (!isValidAccuracy(accuracy)) {
      socket.emit("rider:location:error", {
        message: "Invalid GPS accuracy.",
      });

      return;
    }

    /*
     * Prevent an accidental or malicious client
     * from flooding the database.
     */
    const now = Date.now();
    const lastUpdate =
      riderLocationThrottle.get(socket.user.id) || 0;

    if (
      now - lastUpdate <
      LOCATION_MIN_INTERVAL_MS
    ) {
      return;
    }

    riderLocationThrottle.set(
      socket.user.id,
      now
    );

    /*
     * Find the rider using the authenticated
     * user ID from the JWT.
     */
    const riderResult = await query(
      `
        SELECT
          id,
          user_id,
          verification_status,
          availability_status
        FROM riders
        WHERE user_id = $1
        LIMIT 1
      `,
      [socket.user.id]
    );

    const rider = riderResult.rows[0];

    if (!rider) {
      socket.emit("rider:location:error", {
        message: "Rider profile not found.",
      });

      return;
    }

    /*
     * Store the latest physical position.
     */
    const locationResult = await query(
      `
        UPDATE riders
        SET
          latitude = $1,
          longitude = $2,
          location_accuracy = $3,
          location_updated_at = NOW(),
          updated_at = NOW()
        WHERE id = $4
        RETURNING
          id,
          latitude,
          longitude,
          location_accuracy,
          location_updated_at
      `,
      [
        latitude,
        longitude,
        accuracy,
        rider.id,
      ]
    );

    const location =
      locationResult.rows[0];

    /*
     * Only broadcast rider movement when the
     * rider has an active ride.
     */
    const activeRideResult = await query(
      `
        SELECT
          r.id,
          r.customer_id,
          r.status,
          c.user_id AS customer_user_id
        FROM rides r
        JOIN customers c
          ON c.id = r.customer_id
        WHERE r.rider_id = $1
          AND r.status IN ('accepted', 'in_progress')
        ORDER BY r.accepted_at DESC
        LIMIT 1
      `,
      [rider.id]
    );

    const activeRide =
      activeRideResult.rows[0];

    if (!activeRide) {
      return;
    }

    /*
     * Send the rider's actual position only
     * to the customer of this ride.
     */
    io
      .to(`user:${activeRide.customer_user_id}`)
      .emit("rider:location", {
        rideId: activeRide.id,
        riderId: rider.id,
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        accuracy:
          location.location_accuracy === null
            ? null
            : Number(location.location_accuracy),
        updatedAt:
          location.location_updated_at,
      });

    console.log(
      `Rider location: ${rider.id} -> ` +
      `${latitude}, ${longitude}`
    );
  } catch (error) {
    console.error(
      "Rider location update failed:",
      error
    );

    socket.emit("rider:location:error", {
      message: "Unable to update rider location.",
    });
  }
};

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS
            .split(",")
            .map((origin) => origin.trim())
        : true,
      credentials: true,
    },
  });

  /*
   * Authenticate every Socket.IO connection.
   */
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token;

      if (!token) {
        return next(
          new Error("Authentication required.")
        );
      }

      const payload =
        await verifyAccessToken(token);

      socket.user = {
        id: payload.sub,
        role: payload.role,
        status: payload.status,
      };

      next();
    } catch (error) {
      next(
        new Error(
          "Invalid or expired access token."
        )
      );
    }
  });

  io.on("connection", (socket) => {
    const { id, role } = socket.user;

    /*
     * Private room for this authenticated user.
     */
    socket.join(`user:${id}`);

    console.log(
      `Socket room joined: user:${id}`
    );

    if (role === "customer") {
      socket.join("customers");
    }

    if (role === "rider") {
      socket.join("riders");
    }

    console.log(
      `Socket connected: ${id} (${role})`
    );

    /*
     * REAL RIDER GPS
     */
    socket.on(
      "rider:location:update",
      (payload) => {
        handleRiderLocationUpdate(
          socket,
          payload
        );
      }
    );

    socket.on("disconnect", (reason) => {
      console.log(
        `Socket disconnected: ${id} (${reason})`
      );

      if (role === "rider") {
        riderLocationThrottle.delete(id);
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized."
    );
  }

  return io;
};

export const emitToUser = (
  userId,
  event,
  payload
) => {
  getIO()
    .to(`user:${userId}`)
    .emit(event, payload);
};

export const emitToRiders = (
  event,
  payload
) => {
  getIO()
    .to("riders")
    .emit(event, payload);
};
