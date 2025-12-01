// src/components/doctor/DoctorSidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const items = [
  { label: "Dashboard", to: "/doctor" },
  // you can add more later:
  // { label: "My Patients", to: "/doctor/patients" },
  // { label: "Availability", to: "/doctor/availability" },
];

export default function DoctorSidebar() {
  return (
    <aside className="aside">
      <div className="brand">
        <div className="logo">HE</div>
        <div className="brand-n">
          Health
          <br />
          Ease
        </div>
      </div>

      <nav className="nav">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <span className="icon" /> {it.label}
            {it.badge ? <span className="badge">{it.badge}</span> : null}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
