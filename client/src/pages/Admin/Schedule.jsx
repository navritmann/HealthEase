import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../api/axios";

// helpers
const pad = (n) => (n < 10 ? "0" + n : "" + n);
const toISO = (d) => new Date(d).toISOString();
function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 Sun .. 6 Sat
  const diff = d.getDate() - day; // Sunday as first day
  d.setHours(0, 0, 0, 0);
  d.setDate(diff);
  return d;
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function fmtRange(d) {
  const o = new Intl.DateTimeFormat([], { month: "short", day: "numeric" });
  return o.format(addDays(d, 0)) + " - " + o.format(addDays(d, 6));
}
function hhmm(date) {
  const d = new Date(date);
  return pad(d.getHours()) + ":" + pad(d.getMinutes());
}

export default function Schedule() {
  return (
    <AdminLayout>
      <SchedulePage />
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

function SchedulePage() {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [type, setType] = useState("clinic"); // filter type
  const [rows, setRows] = useState([]); // availability slots
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [version, setVersion] = useState(0); // refresh after change

  // Fetch doctors for dropdown
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/admin/doctors", {
          params: { limit: 200 },
        });
        setDoctors(data || []);
        if (!doctorId && data?.length) setDoctorId(data[0]._id || data[0].id);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Fetch availability for selected doctor/week
  useEffect(() => {
    if (!doctorId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const from = toISO(weekStart);
        const to = toISO(addDays(weekStart, 7));
        const params = { doctorId, from, to };
        if (type) params.type = type;
        const { data } = await api.get("/admin/availability", { params });
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled)
          setErr(
            e?.response?.data?.error || e.message || "Failed to load schedule"
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => (cancelled = true);
  }, [doctorId, weekStart, type, version]);

  const days = useMemo(
    () => [...Array(7)].map((_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // slots by day
  const grouped = useMemo(() => {
    const map = new Map();
    days.forEach((d, i) => map.set(i, []));
    rows.forEach((s) => {
      const idx = Math.floor(
        (new Date(s.start) - weekStart) / (1000 * 60 * 60 * 24)
      );
      if (idx >= 0 && idx < 7) map.get(idx).push(s);
    });
    // sort by time
    for (const [, arr] of map)
      arr.sort((a, b) => new Date(a.start) - new Date(b.start));
    return map;
  }, [rows, days, weekStart]);

  const prevWeek = () => setWeekStart((d) => addDays(d, -7));
  const nextWeek = () => setWeekStart((d) => addDays(d, 7));

  const onToggle = async (slot) => {
    try {
      await api.patch(`/admin/availability/${slot._id}`, {
        blocked: !slot.blocked,
      });
      setVersion((v) => v + 1);
    } catch (e) {
      alert(e?.response?.data?.error || "Toggle failed");
    }
  };

  const onDelete = async (slot) => {
    if (slot.blocked) return alert("Cannot delete blocked/booked slot");
    const ok = window.confirm("Delete this slot?");
    if (!ok) return;
    try {
      await api.delete(`/admin/availability/${slot._id}`);
      setVersion((v) => v + 1);
    } catch (e) {
      alert(e?.response?.data?.error || "Delete failed");
    }
  };

  return (
    <div className="page">
      <div className="page-h">
        <h2>Doctors’ Schedule</h2>
        <div className="h-actions">
          <select
            className="select"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
          >
            {doctors.map((d) => (
              <option key={d._id || d.id} value={d._id || d.id}>
                {d.name} {d.specialty ? `• ${d.specialty}` : ""}
              </option>
            ))}
          </select>

          <select
            className="select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="clinic">Clinic</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="chat">Chat</option>
            <option value="home_visit">Home Visit</option>
          </select>

          <div className="btn-group">
            <button className="btn soft" onClick={prevWeek}>
              ‹ Prev
            </button>
            <div className="btn ghost" style={{ cursor: "default" }}>
              {fmtRange(weekStart)}
            </div>
            <button className="btn soft" onClick={nextWeek}>
              Next ›
            </button>
          </div>

          <button className="btn primary" onClick={() => setShowAdd(true)}>
            Add Slot
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                {days.map((d, i) => (
                  <th key={i}>
                    {d.toLocaleDateString(undefined, { weekday: "short" })}{" "}
                    {d.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {days.map((_, i) => (
                  <td key={i}>
                    {loading && (
                      <div style={{ color: "#7a8aa0" }}>Loading…</div>
                    )}
                    {err && !loading && (
                      <div style={{ color: "#b45454" }}>{err}</div>
                    )}
                    {!loading &&
                      !err &&
                      (grouped.get(i) || []).map((s) => (
                        <div
                          key={s._id}
                          className="slot"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 8,
                            padding: "6px 8px",
                            border: "1px solid #e6e8f0",
                            borderRadius: 8,
                            marginBottom: 6,
                            background: s.blocked ? "#ffeceb" : "#f6f8fc",
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600 }}>
                              {hhmm(s.start)}–{hhmm(s.end)}
                            </div>
                            <div style={{ fontSize: 12, color: "#7a8aa0" }}>
                              {s.type}
                              {s.clinicId ? ` • ${s.clinicId}` : ""}
                            </div>
                          </div>
                          <div
                            className="actions"
                            style={{ display: "flex", gap: 6 }}
                          >
                            <button
                              className="btn soft sm"
                              onClick={() => onToggle(s)}
                            >
                              {s.blocked ? "Unblock" : "Block"}
                            </button>
                            <button
                              className="btn link sm"
                              onClick={() => onDelete(s)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    {!loading && !err && !(grouped.get(i) || []).length && (
                      <div style={{ color: "#7a8aa0" }}>No slots</div>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <AddSlotModal
          doctorId={doctorId}
          defaultType={type}
          weekStart={weekStart}
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            setVersion((v) => v + 1);
          }}
        />
      )}
    </div>
  );
}

function AddSlotModal({
  doctorId,
  defaultType = "clinic",
  weekStart,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState({
    dayIndex: 0,
    start: "09:00",
    end: "09:30",
    type: defaultType,
    clinicId: "", // optional
    blocked: false,
  });
  const [saving, setSaving] = useState(false);

  // NEW: clinics assigned to this doctor
  const [clinicOptions, setClinicOptions] = useState([]);
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const { data } = await api.get("/admin/clinics", {
          params: { limit: 500 },
        });
        const rows = Array.isArray(data?.rows) ? data.rows : data || [];

        // keep only clinics where this doctor is assigned
        const filtered = rows.filter((c) =>
          (c.doctors || []).some((dId) => String(dId) === String(doctorId))
        );

        if (!cancel) setClinicOptions(filtered);
      } catch (e) {
        if (!cancel) setClinicOptions([]);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [doctorId]);

  const onChange = (k) => (e) => {
    const value = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [k]: value };
      // if type is changed away from clinic/home_visit, clear clinicId
      if (k === "type" && value !== "clinic" && value !== "home_visit") {
        next.clinicId = "";
      }
      return next;
    });
  };
  const onCheck = (k) => (e) => setForm({ ...form, [k]: e.target.checked });

  const submit = async () => {
    try {
      setSaving(true);
      const day = addDays(weekStart, Number(form.dayIndex));
      const [sh, sm] = form.start.split(":").map(Number);
      const [eh, em] = form.end.split(":").map(Number);
      const start = new Date(day);
      start.setHours(sh, sm, 0, 0);
      const end = new Date(day);
      end.setHours(eh, em, 0, 0);

      const payload = {
        doctorId,
        start: start.toISOString(),
        end: end.toISOString(),
        type: form.type,
        blocked: !!form.blocked,
      };
      if (form.clinicId.trim()) payload.clinicId = form.clinicId.trim();
      else payload.clinicId = null; // align with backend unique index

      await api.post("/admin/availability", payload);
      onSaved();
    } catch (e) {
      alert(e?.response?.data?.error || "Create failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-wrap" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-h">
          <div>Add Slot</div>
          <button className="x" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="grid">
            <label>
              Day
              <select value={form.dayIndex} onChange={onChange("dayIndex")}>
                {[...Array(7)].map((_, i) => (
                  <option key={i} value={i}>
                    {addDays(weekStart, i).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Start
              <input
                type="time"
                value={form.start}
                onChange={onChange("start")}
              />
            </label>
            <label>
              End
              <input type="time" value={form.end} onChange={onChange("end")} />
            </label>
            <label>
              Type
              <select value={form.type} onChange={onChange("type")}>
                <option value="clinic">Clinic</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="chat">Chat</option>
                <option value="home_visit">Home Visit</option>
              </select>
            </label>
            <label>
              Clinic (for in-clinic slots)
              <select
                value={form.clinicId}
                onChange={onChange("clinicId")}
                disabled={form.type !== "clinic" && form.type !== "home_visit"}
              >
                <option value="">-- No clinic / Telehealth --</option>
                {clinicOptions.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div style={{ fontSize: 11, color: "#7a8aa0", marginTop: 4 }}>
                Required for in-clinic slots; leave as “No clinic” for
                video/audio/chat.
              </div>
            </label>

            <label>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={form.blocked}
                  onChange={onCheck("blocked")}
                />
                Blocked (unavailable)
              </span>
            </label>
          </div>
        </div>
        <div className="modal-f">
          <button className="btn ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn primary" onClick={submit} disabled={saving}>
            {saving ? "Saving…" : "Add Slot"}
          </button>
        </div>
      </div>
    </div>
  );
}
