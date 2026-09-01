import { apiRequest } from "../api/client.js";

export const loginRider = async () => {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: {
      phone: "+9779800000098",
      password: "TestRider123",
    },
  });

  return data.accessToken;
};
