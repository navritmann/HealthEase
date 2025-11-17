// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../api/axios"; // 👈 use same axios instance as other admin pages

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <DashboardPage />
      <footer className="footer">
        <span>Copyright © 2025 Health Ease</span>
        <nav>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms and Conditions</a>
          <a href="#">Contact</a>
        </nav>
      </footer>
    </AdminLayout>
  );
}

function DashboardPage() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedPct: 0,
    pendingCount: 0,
    revenueWeek: 0,
    statusCounts: {},
    departmentBreakdown: [],
    deptTotal: 0,
  });
  const [today, setToday] = useState([]);
  const [rev, setRev] = useState({ labels: [], values: [] });
  const [revRange, setRevRange] = useState("week");

  // ---- load stats + today schedule ----
  useEffect(() => {
    (async () => {
      try {
        const sRes = await api.get("/admin/stats");
        if (sRes.data) {
          setStats((prev) => ({ ...prev, ...sRes.data }));
        }
      } catch (e) {
        console.error("admin stats error", e);
      }

      try {
        const tRes = await api.get("/admin/today-schedule");
        setToday(Array.isArray(tRes.data) ? tRes.data : []);
      } catch (e) {
        console.error("today schedule error", e);
        setToday([]);
      }
    })();
  }, []);

  // ---- load revenue for range ----
  useEffect(() => {
    (async () => {
      try {
        const rRes = await api.get("/admin/revenue", {
          params: { range: revRange },
        });
        if (rRes.data) setRev(rRes.data);
      } catch (e) {
        console.error("revenue error", e);
        setRev({ labels: [], values: [] });
      }
    })();
  }, [revRange]);

  const kpis = [
    {
      label: "Total Appointments",
      value: stats.totalAppointments?.toLocaleString?.() || 0,
    },
    { label: "Completed", value: `${stats.completedPct || 0}%` },
    { label: "Pending", value: stats.pendingCount || 0 },
    {
      label: "Revenue (This Week)",
      value: `$${Number(stats.revenueWeek || 0).toLocaleString()}`,
    },
  ];

  // ---- stage overview (Confirmed / Held / Cancelled / Rescheduled) ----
  const stageCounts = stats.statusCounts || {};
  const stageData = [
    {
      key: "confirmed",
      label: "Confirmed",
      color: "linear-gradient(180deg,#3bd7b2,#1fbf8f)",
    },
    {
      key: "held",
      label: "Held",
      color: "linear-gradient(180deg,#2f6fed,#6487ff)",
    },
    {
      key: "cancelled",
      label: "Cancelled",
      color: "linear-gradient(180deg,#f97373,#f43f5e)",
    },
    {
      key: "rescheduled",
      label: "Rescheduled",
      color: "linear-gradient(180deg,#f4a534,#facc15)",
    },
  ].map((s) => ({
    ...s,
    value: stageCounts[s.key] || 0,
  }));
  const maxStage = Math.max(
    1,
    ...stageData.map((s) => (typeof s.value === "number" ? s.value : 0))
  );

  // ---- departments from backend ----
  const deptColors = ["#1fbf8f", "#2f6fed", "#f4a534", "#c8d3ea"];
  const departments = Array.isArray(stats.departmentBreakdown)
    ? stats.departmentBreakdown
    : [];
  const deptTotal =
    stats.deptTotal || departments.reduce((s, d) => s + (d.count || 0), 0);

  const quickLinks = [
    { label: "Appointments", path: "/admin/appointments" },
    { label: "Doctors", path: "/admin/doctors" },
    { label: "Patients", path: "/admin/patients" },
  ];

  return (
    <div className="page">
      {/* KPI row */}
      <div
        className="row kpis"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 12,
          marginBottom: 12,
        }}
      >
        {kpis.map((k, idx) => (
          <div className="card kpi" key={idx} style={{ padding: 16 }}>
            <div
              className="kpi-label"
              style={{ color: "#7a8aa0", fontSize: 12 }}
            >
              {k.label}
            </div>
            <div
              className="kpi-value"
              style={{ fontSize: 22, fontWeight: 800, color: "#11233d" }}
            >
              {k.value}
            </div>
          </div>
        ))}
      </div>

      {/* Middle grid */}
      <div
        className="row"
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 2fr 1fr",
          gap: 12,
          marginBottom: 12,
        }}
      >
        {/* Patient Overview by Stage */}
        <div className="card" style={{ padding: 16 }}>
          <div className="card-h" style={{ fontWeight: 800, marginBottom: 8 }}>
            Patient Overview{" "}
            <span className="sub" style={{ color: "#7a8aa0", fontWeight: 400 }}>
              by Stage
            </span>
          </div>
          <div
            className="mini-bars"
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-end",
              height: 160,
            }}
          >
            {stageData.map((s) => (
              <div key={s.key} style={{ textAlign: "center", flex: 1 }}>
                <div
                  className="bar"
                  style={{
                    width: 22,
                    margin: "0 auto 6px",
                    background: "#eef2f7",
                    borderRadius: 8,
                    overflow: "hidden",
                    height: 120,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      width: "100%",
                      background: s.color,
                      height: `${15 + (s.value / (maxStage || 1)) * 90}px`,
                      transition: "height 0.3s ease",
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#7a8aa0",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#11233d",
                  }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue */}
        <div className="card" style={{ padding: 16 }}>
          <div
            className="card-h"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontWeight: 800,
            }}
          >
            Revenue
            <div className="seg right" style={{ display: "flex", gap: 6 }}>
              {["week", "month", "year"].map((rng) => (
                <button
                  key={rng}
                  className={`chip ${revRange === rng ? "" : "ghost"}`}
                  onClick={() => setRevRange(rng)}
                  style={{
                    border: "1px solid #d7def0",
                    background: revRange === rng ? "#e6fff6" : "#fff",
                    borderRadius: 999,
                    padding: "6px 10px",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  {rng[0].toUpperCase() + rng.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div
            className="mini-line"
            style={{
              display: "flex",
              gap: 6,
              alignItems: "flex-end",
              height: 140,
            }}
          >
            {rev.values.length
              ? rev.values.map((v, i) => (
                  <span
                    key={i}
                    title={`${rev.labels[i] || ""}: $${v}`}
                    style={{
                      display: "block",
                      width: 8,
                      background: "#2f6fed",
                      borderRadius: 4,
                      height: `${
                        18 + (v / Math.max(...(rev.values || [1]))) * 60
                      }px`,
                    }}
                  />
                ))
              : Array.from({ length: 22 }).map((_, i) => (
                  <span
                    key={i}
                    style={{
                      display: "block",
                      width: 8,
                      background: "#dfe7ff",
                      borderRadius: 4,
                      height: `${18 + (i % 7) * 8}px`,
                    }}
                  />
                ))}
          </div>
        </div>

        {/* Today */}
        <div className="card" style={{ padding: 16 }}>
          <div className="card-h" style={{ fontWeight: 800, marginBottom: 8 }}>
            Today
          </div>
          <ul
            className="list"
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gap: 10,
            }}
          >
            {today.slice(0, 6).map((x, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  className="list-main"
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <div
                    className="avatar"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "#5b8cff",
                      display: "grid",
                      placeItems: "center",
                      color: "#0b1020",
                      fontWeight: 800,
                    }}
                  >
                    {(x.doctor || "-")
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <div className="l1" style={{ fontWeight: 700 }}>
                      {x.patient || "-"}
                    </div>
                    <div
                      className="l2"
                      style={{ color: "#7a8aa0", fontSize: 12 }}
                    >
                      {new Date(x.time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      • {x.type} • {x.doctor || "-"}
                    </div>
                  </div>
                </div>
                <span
                  className={`pill ghost ${
                    x.status === "confirmed" ? "pill-ok" : ""
                  }`}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: "1px solid #d7def0",
                    color: "#294469",
                  }}
                >
                  {x.status}
                </span>
              </li>
            ))}
            {!today.length && (
              <li style={{ fontSize: 12, color: "#7a8aa0" }}>
                No activity yet for today.
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Lower grid */}
      <div
        className="row"
        style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr", gap: 12 }}
      >
        {/* Departments (legend + total) */}
        <div className="card" style={{ padding: 16 }}>
          <div className="card-h" style={{ fontWeight: 800, marginBottom: 10 }}>
            Patient Overview{" "}
            <span className="sub" style={{ color: "#7a8aa0", fontWeight: 400 }}>
              by Departments
            </span>
          </div>
          <div
            className="pie-wrap"
            style={{ display: "flex", gap: 16, alignItems: "center" }}
          >
            <div
              className="pie"
              style={{
                width: 160,
                height: 160,
                borderRadius: "50%",
                background:
                  "conic-gradient(#1fbf8f 0 35%, #2f6fed 35% 63%, #f4a534 63% 83%, #c8d3ea 83% 100%)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <div
                className="pie-hole"
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  background: "#fff",
                  display: "grid",
                  placeItems: "center",
                  textAlign: "center",
                  fontWeight: 800,
                  color: "#11233d",
                }}
              >
                {deptTotal.toLocaleString()}
                <br />
                <span
                  style={{ fontSize: 12, color: "#7a8aa0", fontWeight: 400 }}
                >
                  This Period
                </span>
              </div>
            </div>
            <ul
              className="legend"
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "grid",
                gap: 8,
              }}
            >
              {departments.length ? (
                departments.slice(0, 4).map((d, i) => (
                  <li key={d.name || i}>
                    <span
                      className="dot"
                      style={{
                        display: "inline-block",
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        background: deptColors[i] || "#c8d3ea",
                        marginRight: 8,
                      }}
                    />{" "}
                    {d.name || "Department"}{" "}
                    <b>{typeof d.pct === "number" ? `${d.pct}%` : ""}</b>
                  </li>
                ))
              ) : (
                <li style={{ fontSize: 12, color: "#7a8aa0" }}>
                  No department data yet.
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card" style={{ padding: 16 }}>
          <div className="card-h" style={{ fontWeight: 800, marginBottom: 8 }}>
            Recent Activity
          </div>
          <ul
            className="feed"
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gap: 10,
            }}
          >
            {today.slice(0, 6).map((x, i) => (
              <li key={i} style={{ display: "flex", gap: 10 }}>
                <span
                  className="feed-dot"
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#1fbf8f",
                    marginTop: 6,
                  }}
                />
                <div className="feed-body">
                  <div className="l1" style={{ fontWeight: 600 }}>
                    {x.patient || "Someone"} has {x.status} {x.type} with{" "}
                    {x.doctor || "Doctor"}
                  </div>
                  <div
                    className="l2"
                    style={{ color: "#7a8aa0", fontSize: 12 }}
                  >
                    {new Date(x.time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </li>
            ))}
            {!today.length && (
              <li style={{ fontSize: 12, color: "#7a8aa0" }}>
                No activity yet for today.
              </li>
            )}
          </ul>
        </div>

        {/* Quick Links */}
        <div className="card" style={{ padding: 16 }}>
          <div className="card-h" style={{ fontWeight: 800, marginBottom: 8 }}>
            Quick Links
          </div>
          <ul
            className="list"
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gap: 10,
            }}
          >
            {quickLinks.map((q, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  className="list-main"
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <div
                    className="dot"
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      background: "#2f6fed",
                    }}
                  />
                  <div>
                    <div className="l1" style={{ fontWeight: 700 }}>
                      {q.label}
                    </div>
                    <div
                      className="l2"
                      style={{ color: "#7a8aa0", fontSize: 12 }}
                    >
                      Open management
                    </div>
                  </div>
                </div>
                <button
                  className="btn ghost sm"
                  onClick={() => navigate(q.path)}
                >
                  Open
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
