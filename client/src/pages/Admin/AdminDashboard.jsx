import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";

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
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedPct: 0,
    pendingCount: 0,
    revenueWeek: 0,
  });
  const [today, setToday] = useState([]);
  const [rev, setRev] = useState({ labels: [], values: [] });
  const [revRange, setRevRange] = useState("week");

  useEffect(() => {
    (async () => {
      const s = await fetch("/api/admin/stats")
        .then((r) => r.json())
        .catch(() => null);
      if (s) setStats(s);
      const t = await fetch("/api/admin/today-schedule")
        .then((r) => r.json())
        .catch(() => []);
      setToday(t || []);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const r = await fetch(`/api/admin/revenue?range=${revRange}`)
        .then((r) => r.json())
        .catch(() => null);
      if (r) setRev(r);
    })();
  }, [revRange]);

  const kpis = [
    {
      label: "Total Appointments",
      value: stats.totalAppointments?.toLocaleString?.() || 0,
    },
    { label: "Completed", value: `${stats.completedPct}%` },
    { label: "Pending", value: stats.pendingCount },
    {
      label: "Revenue (This Week)",
      value: `$${Number(stats.revenueWeek || 0).toLocaleString()}`,
    },
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
              gap: 8,
              alignItems: "flex-end",
              height: 140,
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bar"
                style={{
                  width: 18,
                  background: "#eef2f7",
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    display: "block",
                    width: "100%",
                    background: "linear-gradient(180deg,#3bd7b2,#1fbf8f)",
                    height: `${30 + (i % 5) * 14}px`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

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
                    title={`${rev.labels[i]}: $${v}`}
                    style={{
                      display: "block",
                      width: 8,
                      background: "#2f6fed",
                      borderRadius: 4,
                      height: `${18 + (v / Math.max(...rev.values)) * 60}px`,
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
          </ul>
        </div>
      </div>

      {/* Lower grid */}
      <div
        className="row"
        style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr", gap: 12 }}
      >
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
                1,890
                <br />
                <span
                  style={{ fontSize: 12, color: "#7a8aa0", fontWeight: 400 }}
                >
                  This Week
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
              <li>
                <span
                  className="dot"
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: 3,
                    background: "#1fbf8f",
                    marginRight: 8,
                  }}
                />{" "}
                Emergency Medicine <b>35%</b>
              </li>
              <li>
                <span
                  className="dot"
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: 3,
                    background: "#2f6fed",
                    marginRight: 8,
                  }}
                />{" "}
                General Medicine <b>28%</b>
              </li>
              <li>
                <span
                  className="dot"
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: 3,
                    background: "#f4a534",
                    marginRight: 8,
                  }}
                />{" "}
                Internal Medicine <b>20%</b>
              </li>
              <li>
                <span
                  className="dot"
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: 3,
                    background: "#c8d3ea",
                    marginRight: 8,
                  }}
                />{" "}
                Other Departments <b>17%</b>
              </li>
            </ul>
          </div>
        </div>

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
          </ul>
        </div>

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
            {["Appointments", "Doctors", "Patients"].map((t, i) => (
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
                      {t}
                    </div>
                    <div
                      className="l2"
                      style={{ color: "#7a8aa0", fontSize: 12 }}
                    >
                      Open management
                    </div>
                  </div>
                </div>
                <button className="btn ghost sm">Open</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
