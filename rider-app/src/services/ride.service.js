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
// COMMON RIDE REQUEST
// =========================

const rideRequest = async (token, rideId, action) => {
  return apiRequest(`/riders/rides/${rideId}/${action}`, {
    method: "PATCH",
    token,
  });
};

// =========================
// ACCEPT RIDE
// =========================

export const acceptRide = (token, rideId) =>
  rideRequest(token, rideId, "accept");

// =========================
// START RIDE
// =========================

export const startRide = (token, rideId) =>
  rideRequest(token, rideId, "start");

// =========================
// COMPLETE RIDE
// =========================

export const completeRide = (token, rideId) =>
  rideRequest(token, rideId, "complete");

// =========================
// CANCEL RIDE
// =========================

export const cancelRide = (token, rideId) =>
  rideRequest(token, rideId, "cancel");