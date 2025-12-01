// src/pages/doctor/DoctorDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DoctorLayout from "../../components/doctor/DoctorLayout";
import api from "../../api/axios";

const RANGE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
];

export default function DoctorDashboard() {
  return (
    <DoctorLayout>
      <DashboardPage />
      <footer className="footer">
        <span>Copyright © 2025 Health Ease</span>
        <nav>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms and Conditions</a>
          <a href="#">Contact</a>
        </nav>
      </footer>
    </DoctorLayout>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const [range, setRange] = useState("today");
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchAppointments() {
      setLoading(true);
      setErr("");
      try {
        const res = await api.get(
          `/doctor/appointments?range=${encodeURIComponent(range)}`
        );
        if (cancelled) return;
        const appts = res.data?.appointments || [];
        setAppointments(appts);
        setSelected(appts[0] || null);
      } catch (e) {
        console.error("Doctor appts error", e);
        if (!cancelled) setErr("Failed to load appointments.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAppointments();
    return () => {
      cancelled = true;
    };
  }, [range]);

  const handleJoinCall = () => {
    if (!selected || !selected.video || !selected.video.roomId) return;
    navigate(`/video/${selected.video.roomId}`);
  };

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const displayPatientName = (apt) => {
    if (apt.patient && (apt.patient.firstName || apt.patient.lastName)) {
      return `${apt.patient.firstName || ""} ${
        apt.patient.lastName || ""
      }`.trim();
    }
    return "Unknown patient";
  };

  return (
    <div className="page">
      <div className="page-h">
        <h2>My Appointments</h2>

        <div className="h-actions">
          <div className="tabs">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`tab ${opt.value === range ? "active" : ""}`}
                onClick={() => setRange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main grid: left list + right details, like admin cards */}
      <div
        className="row"
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 3fr",
          gap: 12,
          alignItems: "stretch",
        }}
      >
        {/* LEFT: list of appointments */}
        <div className="card" style={{ padding: 16, minHeight: 320 }}>
          <div className="card-h" style={{ fontWeight: 800, marginBottom: 8 }}>
            Schedule
          </div>

          {loading && <p style={{ color: "#7a8aa0" }}>Loading…</p>}
          {err && <p style={{ color: "#b45454" }}>{err}</p>}

          {!loading && !err && !appointments.length && (
            <p style={{ color: "#7a8aa0" }}>No appointments in this range.</p>
          )}

          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gap: 8,
            }}
          >
            {appointments.map((apt) => {
              const isSelected = selected && selected.id === apt.id;
              const patientName = displayPatientName(apt);

              return (
                <li
                  key={apt.id}
                  onClick={() => setSelected(apt)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 10,
                    borderRadius: 10,
                    cursor: "pointer",
                    background: isSelected ? "#f0f5ff" : "#ffffff",
                    border: isSelected
                      ? "1px solid #2f6fed"
                      : "1px solid #e1e7f5",
                  }}
                >
                  <div
                    style={{ display: "flex", gap: 10, alignItems: "center" }}
                  >
                    <div
                      className="avatar"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 999,
                        background: "#5b8cff",
                        display: "grid",
                        placeItems: "center",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {patientName
                        .split(" ")
                        .map((x) => x[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{patientName}</div>
                      <div style={{ fontSize: 12, color: "#7a8aa0" }}>
                        {formatTime(apt.start)} •{" "}
                        {apt.appointmentType || "Appointment"}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      className="pill"
                      style={{
                        fontSize: 11,
                        textTransform: "capitalize",
                      }}
                    >
                      {apt.status}
                    </div>
                    <div style={{ fontSize: 11, color: "#7a8aa0" }}>
                      {formatDate(apt.start)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* RIGHT: appointment details */}
        <div className="card" style={{ padding: 16 }}>
          {!selected && (
            <div
              style={{
                fontSize: 14,
                color: "#7a8aa0",
                display: "grid",
                placeItems: "center",
                minHeight: 240,
              }}
            >
              Select an appointment from the left to see details.
            </div>
          )}

          {selected && (
            <>
              <div
                className="card-h"
                style={{ fontWeight: 800, marginBottom: 8 }}
              >
                Next Patient
              </div>

              <div
                className="details-row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      marginBottom: 4,
                    }}
                  >
                    {displayPatientName(selected)}
                  </div>
                  <div style={{ fontSize: 13, color: "#7a8aa0" }}>
                    {selected.patient?.email || "—"} •{" "}
                    {selected.patient?.phone || "—"}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    {formatTime(selected.start)} – {formatTime(selected.end)}
                  </div>
                  <div style={{ fontSize: 12, color: "#7a8aa0" }}>
                    {formatDate(selected.start)}
                  </div>
                  <div
                    className="pill"
                    style={{
                      marginTop: 4,
                      fontSize: 11,
                      textTransform: "capitalize",
                    }}
                  >
                    {selected.status}
                  </div>
                </div>
              </div>

              <div
                className="details-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0,1fr))",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <div>
                  <h3 style={{ fontSize: 13, marginBottom: 4 }}>Appointment</h3>
                  <p style={{ fontSize: 13 }}>
                    Type:{" "}
                    <strong>{selected.appointmentType || "Appointment"}</strong>
                  </p>
                  {selected.bookingNo && (
                    <p style={{ fontSize: 13 }}>
                      Booking #: <code>{selected.bookingNo}</code>
                    </p>
                  )}
                </div>

                <div>
                  <h3 style={{ fontSize: 13, marginBottom: 4 }}>Clinic</h3>
                  <p style={{ fontSize: 13 }}>
                    {selected.clinic?.name || "Virtual"}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#7a8aa0",
                      margin: 0,
                    }}
                  >
                    {selected.clinic?.addressLine || ""}
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: 13, marginBottom: 4 }}>
                    Notes / Type
                  </h3>
                  <p style={{ fontSize: 13 }}>
                    Channel: <strong>{selected.video?.type || "Clinic"}</strong>
                  </p>
                  {/* You can add more fields here later (reason, notes, etc.) */}
                </div>
              </div>

              {selected.video && selected.video.roomId && (
                <div
                  className="details-actions"
                  style={{ display: "flex", gap: 8 }}
                >
                  <button className="btn primary" onClick={handleJoinCall}>
                    Join {selected.video.type} session
                  </button>
                  {selected.video.joinUrl && (
                    <button
                      className="btn ghost"
                      onClick={() =>
                        window.open(selected.video.joinUrl, "_blank")
                      }
                    >
                      Open join URL
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
