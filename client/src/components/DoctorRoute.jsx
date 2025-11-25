// src/components/DoctorRoute.jsx
import { Navigate, useLocation } from "react-router-dom";

export default function DoctorRoute({ children }) {
  const location = useLocation();
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("admintoken") ||
    localStorage.getItem("adminToken");

  if (!token) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  // we rely on a stored user object with role
  const rawUser = localStorage.getItem("user");
  let role = null;
  try {
    role = rawUser ? JSON.parse(rawUser).role : null;
  } catch {
    role = null;
  }

  if (role !== "doctor") {
    // logged in but not a doctor → send to normal dashboard or home
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
