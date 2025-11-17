// client/src/pages/admin/Appointments.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../api/axios"; // 👈 use your axios instance

export default function Appointments() {
  return (
    <AdminLayout>
      <AppointmentsPage />
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

function AppointmentsPage() {
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(13);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  const status = tab === "All" ? "" : tab.toLowerCase();
  const pages = Math.max(1, Math.ceil(total / limit));

  const fetchData = async () => {
    try {
      const params = { page, limit };
      if (status) params.status = status;
      if (q) params.q = q;

      // baseURL = https://healthease-g67g.onrender.com/api from your api helper
      const { data } = await api.get("/admin/appointments", { params });

      setRows(data.rows || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Admin appointments error:", err);
      setRows([]);
      setTotal(0);
    }
  };

  useEffect(() => {
    fetchData();
  }, [status, q, page, limit]);

  const tabs = [
    { key: "All", count: total },
    { key: "Confirmed", count: undefined },
    { key: "Pending", count: undefined },
    { key: "Cancelled", count: undefined },
  ];

  const cancelAppt = async (id) => {
    const ok = window.confirm("Cancel this appointment?");
    if (!ok) return;
    try {
      const { data } = await api.post("/admin/appointments/cancel", {
        id,
        reason: "admin_cancel",
      });
      if (data.ok) {
        setPage(1);
        fetchData();
      } else {
        alert(data.error || "Cancel failed");
      }
    } catch (e) {
      console.error(e);
      alert("Cancel failed");
    }
  };

  const rescheduleAppt = async (id) => {
    const start = prompt("New start ISO (e.g. 2025-11-09T10:00:00Z):");
    if (!start) return;
    const end = prompt("New end ISO (e.g. 2025-11-09T10:30:00Z):");
    if (!end) return;
    try {
      const { data } = await api.post("/admin/appointments/reschedule", {
        id,
        start,
        end,
      });
      if (data.ok) {
        setPage(1);
        fetchData();
      } else {
        alert(data.error || "Reschedule failed");
      }
    } catch (e) {
      console.error(e);
      alert("Reschedule failed");
    }
  };

  const exportCSV = () => {
    const header = [
      "Booking #",
      "Patient",
      "Date",
      "Time",
      "Doctor",
      "Treatment",
      "Status",
    ];
    const lines = rows.map((r) => [
      r.bookingNo || "",
      r.patient || "",
      r.date ? new Date(r.date).toLocaleDateString() : "",
      r.time
        ? new Date(r.time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
      r.doctor || "",
      r.treatment || "",
      r.status || "",
    ]);
    const csv = [header, ...lines]
      .map((arr) =>
        arr.map((x) => `"${String(x).replaceAll('"', '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    a.download = `appointments-${stamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page">
      <div className="page-h">
        <h2>Appointments</h2>

        <div className="tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`tab ${tab === t.key ? "active" : ""}`}
              onClick={() => {
                setTab(t.key);
                setPage(1);
              }}
            >
              {t.key}{" "}
              {typeof t.count === "number" ? (
                <span className="badge-num">{t.count}</span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="h-actions">
          <div className="search">
            <span className="magnify" />
            <input
              placeholder="Search by booking #, name, doctor…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <button className="select" onClick={exportCSV}>
            Export CSV
          </button>
          <select
            className="select"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
          >
            {[13, 25, 50].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <input type="checkbox" />
                </th>
                <th>Booking #</th>
                <th>Patient</th>
                <th>Date</th>
                <th>Time</th>
                <th>Doctor</th>
                <th>Treatment</th>
                <th>Status</th>
                <th style={{ width: 220 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id || i}>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>{r.bookingNo}</td>
                  <td className="name">
                    <span className="avatar" />
                    <span>{r.patient}</span>
                  </td>
                  <td>
                    {r.date ? new Date(r.date).toLocaleDateString() : "-"}
                  </td>
                  <td>
                    {r.time
                      ? new Date(r.time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>
                  <td>{r.doctor}</td>
                  <td>{r.treatment}</td>
                  <td>
                    <span
                      className={`pill ${String(r.status || "").toLowerCase()}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="actions">
                    {r.videoJoin ? (
                      <button
                        className="btn soft sm"
                        onClick={() => window.open(r.videoJoin, "_blank")}
                      >
                        Open Room
                      </button>
                    ) : null}
                    <button
                      className="btn soft sm"
                      onClick={() => rescheduleAppt(r.id)}
                    >
                      Reschedule
                    </button>
                    <button
                      className="btn link sm"
                      onClick={() => cancelAppt(r.id)}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      textAlign: "center",
                      padding: 24,
                      color: "#7a8aa0",
                    }}
                  >
                    No appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="showing">
            Showing {rows.length} of {total}
          </div>
          <div className="pager">
            <button
              className="pg-arrow"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>
            {Array.from({ length: pages })
              .slice(0, 5)
              .map((_, i) => (
                <button
                  key={i}
                  className={`pg ${page === i + 1 ? "active" : ""}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            {pages > 5 && <span className="dots">…</span>}
            <button
              className="pg-arrow"
              disabled={page >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
