import axios from "axios";

const raw =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  process.env.REACT_APP_API_BASE_URL ||
  process.env.API_BASE_URL || // optional extra
  "http://localhost:5000"; // sane default

const root = String(raw).replace(/\/+$/, ""); // strip trailing slash
const baseURL = root.endsWith("/api") ? root : root + "/api"; // ensure /api

const api = axios.create({ baseURL });

// attach token on every request
api.interceptors.request.use((config) => {
  // ✅ prefer adminToken, but also support older keys just in case
  const token =
    localStorage.getItem("adminToken") ||
    localStorage.getItem("admintoken") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token");

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// keep your response interceptor as-is
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error;
    const code = response?.data?.code;
    if (
      response?.status === 401 &&
      code === "TOKEN_EXPIRED" &&
      !config._retry
    ) {
      // ... your refresh logic (optional) ...
    }
    return Promise.reject(error);
  }
);

export default api;
