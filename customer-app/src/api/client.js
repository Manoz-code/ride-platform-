const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1";

export const apiRequest = async (path, options = {}) => {
  const {
    method = "GET",
    token,
    body,
    headers = {},
  } = options;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(body
        ? { "Content-Type": "application/json" }
        : {}),
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...headers,
    },
    ...(body
      ? { body: JSON.stringify(body) }
      : {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.message || "Something went wrong."
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};

export { API_URL };
