import { apiRequest } from "../api/client.js";

export const requestRide = (
  token,
  {
    pickupAddress,
    pickupLatitude,
    pickupLongitude,
    dropoffAddress,
    dropoffLatitude,
    dropoffLongitude,
  }
) => {
  return apiRequest("/rides", {
    method: "POST",
    token,
    body: {
      pickupAddress,
      pickupLatitude,
      pickupLongitude,
      dropoffAddress,
      dropoffLatitude,
      dropoffLongitude,
    },
  });
};

export const getMyRides = (token) => {
  return apiRequest("/rides", {
    method: "GET",
    token,
  });
};

export const getRideById = (token, rideId) => {
  return apiRequest(`/rides/${rideId}`, {
    method: "GET",
    token,
  });
};

export const cancelRide = (token, rideId) => {
  return apiRequest(`/rides/${rideId}/cancel`, {
    method: "PATCH",
    token,
  });
};
