import { apiRequest } from "../api/client.js";

export const getMyProfile = (token) => {
  return apiRequest("/customers/me", {
    method: "GET",
    token,
  });
};

export const updateMyProfile = (token, fullName) => {
  return apiRequest("/customers/me", {
    method: "PATCH",
    token,
    body: {
      fullName,
    },
  });
};
