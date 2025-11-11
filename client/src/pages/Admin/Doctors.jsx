import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../api/axios"; // ✅ uses baseURL http://localhost:5000/api

export default function Doctors() {
  return (
    <AdminLayout>
      <DoctorsPage />
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

function DoctorsPage() {
  const [q, setQ] = useState("");
  const [spec, setSpec] = useState("All");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showProfile, setShowProfile] = useState(null); // id
  const [showEdit, setShowEdit] = useState(null); // id | "new"
  const [version, setVersion] = useState(0); // bump to refetch after save

  // fetch doctors from API
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const params = q.trim() ? { q: q.trim() } : {};
        const { data } = await api.get("/admin/doctors", { params });
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled)
          setErr(
            e?.response?.data?.error || e.message || "Failed to load doctors"
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [q, version]);

  const specialties = useMemo(() => {
    const set = new Set(rows.map((d) => d.specialty).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [rows]);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return rows.filter((d) => {
      const okSpec = spec === "All" || d.specialty === spec;
      const okText =
        !text ||
        (d.name || "").toLowerCase().includes(text) ||
        (d.email || "").toLowerCase().includes(text) ||
        (d.phone || "").toLowerCase().includes(text) ||
        (d.specialty || "").toLowerCase().includes(text);
      return okSpec && okText;
    });
  }, [rows, q, spec]);

  const onDisable = async (d) => {
    const next = d.status === "Disabled" ? "Active" : "Disabled";
    const ok = window.confirm(
      `${next === "Disabled" ? "Disable" : "Enable"} ${d.name}?`
    );
    if (!ok) return;
    try {
      await api.put(`/admin/doctors/${d._id || d.id}`, { status: next });
      setVersion((v) => v + 1);
    } catch (e) {
      alert(e?.response?.data?.error || "Update failed");
    }
  };

  return (
    <div className="page">
      <div className="page-h">
        <h2>Doctors</h2>

        <div className="h-actions">
          <div className="search">
            <span className="magnify" />
            <input
              placeholder="Search by name, email, phone…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <select
            className="select"
            value={spec}
            onChange={(e) => setSpec(e.target.value)}
          >
            {specialties.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button className="btn primary" onClick={() => setShowEdit("new")}>
            Add Doctor
          </button>
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
                <th>Name</th>
                <th>Specialty</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Clinics</th>
                <th>Status</th>
                <th style={{ width: 260 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} style={{ padding: 24, color: "#7a8aa0" }}>
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && err && (
                <tr>
                  <td colSpan={8} style={{ padding: 24, color: "#b45454" }}>
                    {err}
                  </td>
                </tr>
              )}
              {!loading &&
                !err &&
                filtered.map((d) => (
                  <tr key={d._id || d.id}>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td className="name">
                      <span className="avatar big">{initials(d.name)}</span>
                      <div className="stack">
                        <div className="l1">{d.name}</div>
                        <div className="l2">{d._id || d.id}</div>
                      </div>
                    </td>
                    <td>{d.specialty || "-"}</td>
                    <td>{d.email || "-"}</td>
                    <td>{d.phone || "-"}</td>
                    <td>
                      {(d.clinics || []).length
                        ? (d.clinics || []).join(", ")
                        : "-"}
                    </td>
                    <td>
                      <span
                        className={`pill ${
                          (d.status || "Active") === "Active"
                            ? "confirmed"
                            : "pending"
                        }`}
                      >
                        {d.status || "Active"}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn soft sm"
                        onClick={() => setShowProfile(d._id || d.id)}
                      >
                        View Profile
                      </button>
                      <button
                        className="btn soft sm"
                        onClick={() => setShowEdit(d._id || d.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn link sm"
                        onClick={() => onDisable(d)}
                      >
                        {d.status === "Disabled" ? "Enable" : "Disable"}
                      </button>
                    </td>
                  </tr>
                ))}
              {!loading && !err && !filtered.length && (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: "center",
                      padding: 24,
                      color: "#7a8aa0",
                    }}
                  >
                    No doctors match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="showing">
            Showing {filtered.length} of {rows.length}
          </div>
          <div className="pager">
            <button className="pg-arrow" disabled>
              ‹
            </button>
            <button className="pg active">1</button>
            <button className="pg" disabled>
              2
            </button>
            <button className="pg" disabled>
              3
            </button>
            <span className="dots">…</span>
            <button className="pg" disabled>
              10
            </button>
            <button className="pg-arrow" disabled>
              ›
            </button>
          </div>
        </div>
      </div>

      {showProfile && (
        <ProfileModal
          id={showProfile}
          doctor={rows.find((x) => (x._id || x.id) === showProfile) || {}}
          onClose={() => setShowProfile(null)}
        />
      )}
      {showEdit && (
        <EditModal
          id={showEdit}
          doctor={rows.find((x) => (x._id || x.id) === showEdit) || null}
          onClose={() => {
            setShowEdit(null);
            setVersion((v) => v + 1); // refresh after save
          }}
        />
      )}
    </div>
  );
}

/* helpers */
function initials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}

/* Profile modal */
function ProfileModal({ id, doctor = {}, onClose }) {
  const d = doctor || {};
  return (
    <div className="modal-wrap" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-h">
          <div>Doctor Profile</div>
          <button className="x" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="profile">
            <div className="avatar xl">{initials(d.name || "New")}</div>
            <div>
              <div className="title">{d.name}</div>
              <div className="meta">
                {d.specialty || "-"} • {d.status || "Active"}
              </div>
              <div className="meta">
                {d.email || "-"} • {d.phone || "-"}
              </div>
              <div className="meta">
                Clinics:{" "}
                {(d?.clinics || []).length ? d.clinics.join(", ") : "-"}
              </div>
            </div>
          </div>
          <div className="hr" />
          <div className="grid">
            <label>
              Education
              <input placeholder="MBBS, MD (Cardiology)" defaultValue="" />
            </label>
            <label>
              Experience
              <input placeholder="10+ Years" defaultValue="" />
            </label>
            <label>
              Languages
              <input placeholder="English, Spanish" defaultValue="" />
            </label>
            <label>
              Notes
              <input placeholder="Great with kids" defaultValue="" />
            </label>
          </div>
        </div>
        <div className="modal-f">
          <button className="btn ghost" onClick={onClose}>
            Close
          </button>
          <button className="btn primary" onClick={() => alert("Save (stub)")}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* Create/Edit modal (axios to API) */
function EditModal({ id, doctor, onClose }) {
  const isNew = id === "new";
  const base = isNew
    ? {
        name: "",
        specialty: "",
        email: "",
        phone: "",
        clinics: [],
        status: "Active",
      }
    : doctor || {};
  const [form, setForm] = useState({
    name: base.name || "",
    specialty: base.specialty || "",
    email: base.email || "",
    phone: base.phone || "",
    clinics: (base.clinics || []).join(", "),
    status: base.status || "Active",
  });
  const [saving, setSaving] = useState(false);

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    const body = {
      name: form.name.trim(),
      specialty: form.specialty.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      clinics: form.clinics
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      status: form.status,
    };
    if (!body.name) return alert("Name is required");

    setSaving(true);
    try {
      if (isNew) {
        await api.post("/admin/doctors", body);
      } else {
        await api.put(`/admin/doctors/${doctor._id || doctor.id}`, body);
      }
      onClose(); // parent bumps version -> refresh
    } catch (e) {
      alert(e?.response?.data?.error || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-wrap" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-h">
          <div>{isNew ? "Add Doctor" : "Edit Doctor"}</div>
          <button className="x" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="grid">
            <label>
              Name
              <input
                value={form.name}
                onChange={onChange("name")}
                placeholder="Dr. Full Name"
              />
            </label>
            <label>
              Specialty
              <input
                value={form.specialty}
                onChange={onChange("specialty")}
                placeholder="Cardiology"
              />
            </label>
            <label>
              Email
              <input
                value={form.email}
                onChange={onChange("email")}
                placeholder="email@domain.com"
              />
            </label>
            <label>
              Phone
              <input
                value={form.phone}
                onChange={onChange("phone")}
                placeholder="+1 ..."
              />
            </label>
            <label>
              Clinics
              <input
                value={form.clinics}
                onChange={onChange("clinics")}
                placeholder="Main, City"
              />
            </label>
            <label>
              Status
              <select value={form.status} onChange={onChange("status")}>
                <option>Active</option>
                <option>On Leave</option>
                <option>Disabled</option>
              </select>
            </label>
          </div>
        </div>
        <div className="modal-f">
          <button className="btn ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn primary" onClick={submit} disabled={saving}>
            {saving ? "Saving…" : isNew ? "Create" : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}
