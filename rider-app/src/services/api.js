const API_URL = "http://localhost:5000/api/v1";

const request = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
};

export const loginRider = (phone, password) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      phone,
      password,
    }),
  });

export const getAvailableRides = (token) =>
  request("/riders/rides", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const updateAvailability = (token, availabilityStatus) =>
  request("/riders/availability", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      availabilityStatus,
    }),
  });

export const acceptRide = (token, rideId) =>
  request(`/riders/rides/${rideId}/accept`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const startRide = (token, rideId) =>
  request(`/riders/rides/${rideId}/start`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const completeRide = (token, rideId) =>
  request(`/riders/rides/${rideId}/complete`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const cancelRide = (token, rideId) =>
  request(`/riders/rides/${rideId}/cancel`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
