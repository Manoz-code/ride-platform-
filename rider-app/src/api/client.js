const API_URL = "http://localhost:5000/api/v1";

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
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
};

export { API_URL };
