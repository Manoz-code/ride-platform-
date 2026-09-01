import { apiRequest } from "../api/client.js";

// =========================
// GET ACTIVE RIDE
// =========================

export const getActiveRide = (token) =>
  apiRequest("/riders/rides/active", {
    method: "GET",
    token,
  });

// =========================
// GET AVAILABLE RIDES
// =========================

export const getAvailableRides = (token) =>
  apiRequest("/riders/rides", {
    method: "GET",
    token,
  });

// =========================
// UPDATE RIDER AVAILABILITY
// =========================

export const updateAvailability = (token, availabilityStatus) =>
  apiRequest("/riders/availability", {
    method: "PATCH",
    token,
    body: {
      availabilityStatus,
    },
  });