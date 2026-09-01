import { useState } from "react";
import { loginRider } from "../services/auth.service.js";

export const useAuth = () => {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const login = async () => {
    try {
      setLoading(true);
      setMessage("");

      const accessToken = await loginRider();

      setToken(accessToken);
      setMessage("Logged in successfully.");

      return accessToken;
    } catch (error) {
      setMessage(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken("");
    setMessage("");
  };

  return {
    token,
    loading,
    message,
    setMessage,
    login,
    logout,
    isAuthenticated: Boolean(token),
  };
};
