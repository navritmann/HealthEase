import axios from "axios";
const api = axios.create({ baseURL: "http://localhost:5000/api" });

// Attach token if present
// src/api/axios.js
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error;
    const code = response?.data?.code;

    // refresh only for TOKEN_EXPIRED
    if (
      response?.status === 401 &&
      code === "TOKEN_EXPIRED" &&
      !config._retry
    ) {
      // ... your refresh logic here ...
    }

    // If NO_TOKEN, let ProtectedRoute handle redirect on protected pages.
    return Promise.reject(error);
  }
);

export default api;
