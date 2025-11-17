// src/pages/admin/AdminPayments.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../api/axios";

export default function AdminPayments() {
  return (
    <AdminLayout>
      <PaymentsPage />
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

function PaymentsPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [status, setStatus] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get("/admin/payments", {
          params: {
            status: status === "all" ? "" : status,
            q,
            page,
            limit,
          },
        });
        setRows(data.rows || []);
        setTotal(data.total || 0);
      } catch (e) {
        setError(e?.response?.data?.error || "Failed to load payments");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [status, q, page, limit]);

  const handleStatusClick = (value) => {
    setStatus(value);
    setPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setQ(searchInput.trim());
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(total, page * limit);

  const statusLabel = (s) => {
    const v = String(s || "").toLowerCase();
    if (v === "paid") return "Paid";
    if (v === "pending") return "Pending";
    if (v === "failed") return "Failed";
    if (v === "refunded") return "Refunded";
    if (v === "requires_payment") return "Requires Payment";
    return v || "Unknown";
  };

  const statusChipClass = (s) => {
    const v = String(s || "").toLowerCase();
    if (v === "paid") return "pill pill-ok";
    if (v === "pending" || v === "requires_payment") return "pill pill-warn";
    if (v === "failed") return "pill pill-bad";
    if (v === "refunded") return "pill pill-neutral";
    return "pill ghost";
  };

  return (
    <div className="page">
      <div
        className="row"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Payments</h2>
          <p style={{ margin: 0, color: "#7a8aa0", fontSize: 13 }}>
            Track all appointment payments across gateways and statuses.
          </p>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          style={{ display: "flex", gap: 8, alignItems: "center" }}
        >
          <div
            className="search"
            style={{
              display: "flex",
              alignItems: "center",
              borderRadius: 999,
              border: "1px solid #d7def0",
              padding: "6px 10px",
              background: "#fff",
            }}
          >
            <input
              type="text"
              placeholder="Search booking, gateway, intent…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                fontSize: 13,
                minWidth: 140,
                background: "transparent",
              }}
            />
          </div>
          <button className="btn ghost sm" type="submit">
            Search
          </button>
        </form>
      </div>

      {/* Status filters */}
      <div
        className="row"
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        {[
          { key: "all", label: "All" },
          { key: "paid", label: "Paid" },
          { key: "unpaid", label: "Unpaid" },
          { key: "failed", label: "Failed" },
          { key: "refunded", label: "Refunded" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleStatusClick(tab.key)}
            className={`chip ${status === tab.key ? "" : "ghost"}`}
            style={{
              border: "1px solid #d7def0",
              background: status === tab.key ? "#e6fff6" : "#fff",
              borderRadius: 999,
              padding: "6px 12px",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            overflowX: "auto",
          }}
        >
          <table
            className="table"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
            }}
          >
            <thead
              style={{
                background: "#f9fafb",
                textAlign: "left",
              }}
            >
              <tr>
                {[
                  "Booking #",
                  "Date",
                  "Patient",
                  "Doctor",
                  "Clinic",
                  "Type",
                  "Gateway",
                  "Amount",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 14px",
                      borderBottom: "1px solid #edf0f6",
                      color: "#7a8aa0",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} style={{ padding: 20, textAlign: "center" }}>
                    Loading payments…
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td
                    colSpan={9}
                    style={{ padding: 20, textAlign: "center", color: "red" }}
                  >
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && rows.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: 20, textAlign: "center" }}>
                    No payments found.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                rows.map((r) => {
                  const d = r.date ? new Date(r.date) : null;
                  const dateLabel = d ? d.toLocaleDateString() : "Unknown date";
                  const timeLabel = d
                    ? d.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "";
                  const amountLabel =
                    r.amount != null
                      ? `${r.currency === "USD" ? "$" : ""}${r.amount}`
                      : "—";

                  return (
                    <tr key={r.id}>
                      <td style={cellStyle}>{r.bookingNo || "—"}</td>
                      <td style={cellStyle}>
                        {dateLabel}
                        {timeLabel && (
                          <span style={{ color: "#7a8aa0" }}>
                            {" "}
                            · {timeLabel}
                          </span>
                        )}
                      </td>
                      <td style={cellStyle}>{r.patient || "—"}</td>
                      <td style={cellStyle}>{r.doctor || "—"}</td>
                      <td style={cellStyle}>{r.clinic || "—"}</td>
                      <td style={cellStyle}>{r.type || "—"}</td>
                      <td style={cellStyle}>{r.gateway || "stripe"}</td>
                      <td style={cellStyle}>{amountLabel}</td>
                      <td style={cellStyle}>
                        <span className={statusChipClass(r.status)}>
                          {statusLabel(r.status)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* footer / pagination */}
        <div
          style={{
            padding: "10px 14px",
            borderTop: "1px solid #edf0f6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 12,
          }}
        >
          <span style={{ color: "#7a8aa0" }}>
            Showing {from}–{to} of {total}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              className="btn ghost sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>
            <span
              style={{
                display: "inline-block",
                minWidth: 40,
                textAlign: "center",
                lineHeight: "24px",
              }}
            >
              {page} / {totalPages}
            </span>
            <button
              type="button"
              className="btn ghost sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const cellStyle = {
  padding: "10px 14px",
  borderBottom: "1px solid #f1f3fa",
  whiteSpace: "nowrap",
};
