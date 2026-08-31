const API_BASE_URL = "http://localhost:5000/api/v1";

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem("rider_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
};

export const loginRider = async (phone, password) => {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      phone,
      password,
    }),
  });
};

export const getRiderProfile = async () => {
  return request("/riders/me");
};

export const updateAvailability = async (availabilityStatus) => {
  return request("/riders/availability", {
    method: "PATCH",
    body: JSON.stringify({
      availabilityStatus,
    }),
  });
};

export const getAvailableRides = async () => {
  return request("/riders/rides");
};
