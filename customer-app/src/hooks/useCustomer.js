import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getMyProfile,
  updateMyProfile,
} from "../services/customer.service.js";

export const useCustomer = (token) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadCustomer = useCallback(async () => {
    if (!token) {
      setCustomer(null);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getMyProfile(token);

      setCustomer(data.customer);

      return data.customer;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const updateProfile = async (fullName) => {
    try {
      setLoading(true);
      setError("");

      const data = await updateMyProfile(
        token,
        fullName
      );

      setCustomer(data.customer);

      return data.customer;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomer().catch(() => {});
  }, [loadCustomer]);

  return {
    customer,
    loading,
    error,
    loadCustomer,
    updateProfile,
  };
};
