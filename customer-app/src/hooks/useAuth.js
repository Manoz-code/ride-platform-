import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getMe,
  login as loginRequest,
} from "../services/auth.service.js";

import {
  clearAuth,
  getAccessToken,
  setAccessToken,
  setRefreshToken,
} from "../utils/storage.js";

export const useAuth = () => {
  const [token, setToken] = useState(
    getAccessToken()
  );

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async (accessToken) => {
    try {
      const data = await getMe(accessToken);

      setUser(data.user);

      return data.user;
    } catch (error) {
      clearAuth();
      setToken(null);
      setUser(null);

      throw error;
    }
  }, []);

  useEffect(() => {
    const existingToken = getAccessToken();

    if (!existingToken) {
      setLoading(false);
      return;
    }

    loadUser(existingToken)
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, [loadUser]);

  const login = async (phone, password) => {
    const data = await loginRequest(
      phone,
      password
    );

    setAccessToken(data.accessToken);

    if (data.refreshToken) {
      setRefreshToken(data.refreshToken);
    }

    setToken(data.accessToken);
    setUser(data.user);

    return data;
  };

  const logout = () => {
    clearAuth();

    setToken(null);
    setUser(null);
  };

  return {
    token,
    user,
    loading,
    isAuthenticated: Boolean(token),
    login,
    logout,
  };
};
