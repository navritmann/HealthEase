// src/pages/DoctorDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios.js"; // 🔁 adjust path to where your axios file is
import "./DoctorDashboard.css";

const RANGE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
];

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [range, setRange] = useState("today");
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // read doctor name from localStorage
  const rawUser = localStorage.getItem("user");
  let doctorName = "Doctor";
  try {
    const u = rawUser ? JSON.parse(rawUser) : null;
    if (u?.name) doctorName = u.name;
  } catch {
    // ignore
  }

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

  return (
    <div className="doctor-layout">
      <aside className="doctor-side-panel">
        <div className="doctor-side-header">
          <h2>Appointments</h2>
          <div className="doctor-range-tabs">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={
                  opt.value === range ? "range-tab active" : "range-tab"
                }
                onClick={() => setRange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="muted">Loading...</p>}
        {err && <p className="error-text">{err}</p>}

        {!loading && !appointments.length && !err && (
          <p className="muted">No appointments in this range.</p>
        )}

        <ul className="doctor-appt-list">
          {appointments.map((apt) => {
            const isSelected = selected && selected.id === apt.id;
            const patientName =
              apt.patient && (apt.patient.firstName || apt.patient.lastName)
                ? `${apt.patient.firstName || ""} ${
                    apt.patient.lastName || ""
                  }`.trim()
                : "Unknown patient";

            return (
              <li
                key={apt.id}
                className={
                  isSelected ? "doctor-appt-item selected" : "doctor-appt-item"
                }
                onClick={() => setSelected(apt)}
              >
                <div className="appt-time">
                  <span className="appt-time-main">
                    {formatTime(apt.start)}
                  </span>
                  <span className="appt-time-sub">{formatDate(apt.start)}</span>
                </div>
                <div className="appt-main">
                  <div className="appt-patient">{patientName}</div>
                  <div className="appt-meta">
                    <span className="pill pill-type">
                      {apt.appointmentType}
                    </span>
                    <span className="pill pill-status">{apt.status}</span>
                  </div>
                  {apt.clinic && (
                    <div className="appt-clinic">{apt.clinic.name}</div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </aside>

      <main className="doctor-main">
        <header className="doctor-main-header">
          <div>
            <h1>Welcome, Dr. {doctorName}</h1>
            <p className="muted">
              View your schedule and join virtual consultations.
            </p>
          </div>
        </header>

        {!selected && (
          <div className="doctor-main-empty">
            <p>Select an appointment from the left to see details.</p>
          </div>
        )}

        {selected && (
          <section className="doctor-details-card">
            <div className="details-row">
              <div>
                <h2>Next patient</h2>
                <p className="details-patient">
                  {selected.patient &&
                  (selected.patient.firstName || selected.patient.lastName)
                    ? `${selected.patient.firstName || ""} ${
                        selected.patient.lastName || ""
                      }`.trim()
                    : "Unknown patient"}
                </p>
              </div>
              <div className="details-time-block">
                <span className="details-time-main">
                  {formatTime(selected.start)} – {formatTime(selected.end)}
                </span>
                <span className="details-time-sub">
                  {formatDate(selected.start)}
                </span>
              </div>
            </div>

            <div className="details-grid">
              <div>
                <h3>Appointment</h3>
                <p>
                  Type: <strong>{selected.appointmentType}</strong>
                </p>
                <p>
                  Status: <strong>{selected.status}</strong>
                </p>
                {selected.bookingNo && (
                  <p>
                    Booking #: <code>{selected.bookingNo}</code>
                  </p>
                )}
              </div>

              <div>
                <h3>Patient contact</h3>
                <p>Email: {selected.patient?.email || "—"}</p>
                <p>Phone: {selected.patient?.phone || "—"}</p>
              </div>

              <div>
                <h3>Clinic</h3>
                <p>{selected.clinic?.name || "Virtual"}</p>
                <p className="muted">{selected.clinic?.addressLine || ""}</p>
              </div>
            </div>

            {selected.video && selected.video.roomId && (
              <div className="details-actions">
                <button className="btn-primary" onClick={handleJoinCall}>
                  Join {selected.video.type} session
                </button>
                {selected.video.joinUrl && (
                  <a
                    href={selected.video.joinUrl}
                    className="btn-link"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open join URL
                  </a>
                )}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
