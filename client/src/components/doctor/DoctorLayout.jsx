// src/components/doctor/DoctorLayout.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import DoctorSidebar from "./DoctorSidebar";

export default function DoctorLayout({ children }) {
  const navigate = useNavigate();

  // get doctor name from localStorage
  const rawUser = localStorage.getItem("user");
  let doctorName = "Doctor";
  try {
    const u = rawUser ? JSON.parse(rawUser) : null;
    if (u?.name) doctorName = u.name;
  } catch {
    // ignore
  }

  const handleLogout = () => {
    // clear only auth-related stuff so admin side still works separately
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("admintoken");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="layout">
      <DoctorSidebar />

      <div className="main">
        <header className="topbar">
          <div className="l">
            <div className="top-title">Doctor Panel</div>
          </div>
          <div className="r">
            <div className="user">
              <span className="color-dot" />
              <span className="name">Dr. {doctorName}</span>
            </div>
            <button className="btn ghost sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <main className="main-inner">{children}</main>
      </div>
    </div>
  );
}
