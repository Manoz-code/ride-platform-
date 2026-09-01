import { apiRequest } from "../api/client.js";

export const login = (phone, password) => {
  return apiRequest("/auth/login", {
    method: "POST",
    body: {
      phone,
      password,
    },
  });
};

export const register = ({
  phone,
  password,
  fullName,
}) => {
  return apiRequest("/auth/register", {
    method: "POST",
    body: {
      phone,
      password,
      fullName,
      role: "customer",
    },
  });
};

export const getMe = (token) => {
  return apiRequest("/auth/me", {
    method: "GET",
    token,
  });
};
