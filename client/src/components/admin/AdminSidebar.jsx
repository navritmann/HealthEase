import React from "react";
import { NavLink } from "react-router-dom";

const items = [
  { label: "Dashboard", to: "/admin/dashboard" },
  { label: "Appointments", to: "/admin/appointments" },
  { label: "Patients", to: "/admin/patients" },
  { label: "Doctors", to: "/admin/doctors" },
  { label: "Clinics", to: "/admin/clinics" },
  { label: "Doctors' Schedule", to: "/admin/schedule" },
  { label: "Payments", to: "/admin/payments" },
  { label: "Services", to: "/admin/services" },
];

export default function AdminSidebar() {
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
