import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../api/axios";

export default function Patients() {
  return (
    <AdminLayout>
      <PatientsPage />
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

function PatientsPage() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showProfile, setShowProfile] = useState(null); // id
  const [showEdit, setShowEdit] = useState(null); // id | "new"
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const params = { q: q.trim(), limit: 500 };
        const { data } = await api.get("/admin/patients", { params });
        if (!cancelled) {
          setRows(data?.rows || []);
          setTotal(data?.total || 0);
        }
      } catch (e) {
        if (!cancelled)
          setErr(e?.response?.data?.error || e.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => (cancelled = true);
  }, [q, version]);

  const filtered = useMemo(() => rows, [rows]); // server-side search already applied

  const onDisable = async (p) => {
    const ok = window.confirm(`Disable ${p.firstName} ${p.lastName}?`);
    if (!ok) return;
    try {
      await api.delete(`/admin/patients/${p._id}`);
      setVersion((v) => v + 1);
    } catch (e) {
      alert(e?.response?.data?.error || "Disable failed");
    }
  };

  return (
    <div className="page">
      <div className="page-h">
        <h2>Patients</h2>

        <div className="h-actions">
          <div className="search">
            <span className="magnify" />
            <input
              placeholder="Search by name, email, phone…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <button className="btn primary" onClick={() => setShowEdit("new")}>
            Add Patient
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
                <th>Email</th>
                <th>Phone</th>
                <th>Gender</th>
                <th>DOB</th>
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
                filtered.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td className="name">
                      <span className="avatar big">
                        {initials(`${p.firstName || ""} ${p.lastName || ""}`)}
                      </span>
                      <div className="stack">
                        <div className="l1">
                          {p.firstName} {p.lastName}
                        </div>
                        <div className="l2">{p._id}</div>
                      </div>
                    </td>
                    <td>{p.email || "-"}</td>
                    <td>{p.phone || "-"}</td>
                    <td>{p.gender || "-"}</td>
                    <td>{p.dob ? fmtDate(p.dob) : "-"}</td>
                    <td>
                      <span
                        className={`pill ${
                          (p.status || "Active") === "Active"
                            ? "confirmed"
                            : "pending"
                        }`}
                      >
                        {p.status || "Active"}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn soft sm"
                        onClick={() => setShowProfile(p._id)}
                      >
                        View Profile
                      </button>
                      <button
                        className="btn soft sm"
                        onClick={() => setShowEdit(p._id)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn link sm"
                        onClick={() => onDisable(p)}
                      >
                        Disable
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
                    No patients match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="showing">
            Showing {filtered.length} of {total}
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
          patientId={showProfile}
          onClose={() => setShowProfile(null)}
        />
      )}

      {showEdit && (
        <EditModal
          id={showEdit}
          patient={rows.find((x) => x._id === showEdit) || null}
          onClose={() => {
            setShowEdit(null);
            setVersion((v) => v + 1);
          }}
        />
      )}
    </div>
  );
}

/* helpers */
function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}
function fmtDate(d) {
  const dt = new Date(d);
  return dt.toLocaleDateString();
}

/* Profile modal (loads fresh by id, shows full) */
function ProfileModal({ patientId, onClose }) {
  const [row, setRow] = useState(null);
  const [err, setErr] = useState("");

  React.useEffect(() => {
    let cancel = false;
    (async () => {
      setErr("");
      try {
        const { data } = await api.get(`/admin/patients/${patientId}`);
        if (!cancel) setRow(data);
      } catch (e) {
        if (!cancel)
          setErr(e?.response?.data?.error || "Failed to load profile");
      }
    })();
    return () => (cancel = true);
  }, [patientId]);

  const d = row || {};
  return (
    <div className="modal-wrap" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-h">
          <div>Patient Profile</div>
          <button className="x" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {err && (
            <div style={{ color: "#b45454", marginBottom: 12 }}>{err}</div>
          )}
          {!row && !err && <div>Loading…</div>}
          {row && (
            <>
              <div className="profile">
                <div className="avatar xl">
                  {initials(`${d.firstName || ""} ${d.lastName || ""}`)}
                </div>
                <div>
                  <div className="title">
                    {d.firstName} {d.lastName}
                  </div>
                  <div className="meta">
                    {d.email || "-"} • {d.phone || "-"}
                  </div>
                  <div className="meta">
                    {d.gender || "-"} • {d.dob ? fmtDate(d.dob) : "-"}
                  </div>
                  <div className="meta">{d.address || "-"}</div>
                </div>
              </div>
              <div className="hr" />
              <div className="grid">
                <label>
                  Notes{" "}
                  <input placeholder="Add internal note…" defaultValue="" />
                </label>
              </div>
            </>
          )}
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

/* Create/Edit modal */
function EditModal({ id, patient, onClose }) {
  const isNew = id === "new";
  const base = isNew
    ? {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        gender: "",
        dob: "",
        address: "",
        status: "Active",
      }
    : patient || {};

  const [form, setForm] = useState({
    firstName: base.firstName || "",
    lastName: base.lastName || "",
    email: base.email || "",
    phone: base.phone || "",
    gender: base.gender || "",
    dob: base.dob ? new Date(base.dob).toISOString().slice(0, 10) : "",
    address: base.address || "",
    status: base.status || "Active",
  });
  const [saving, setSaving] = useState(false);

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim())
      return alert("First and last name are required");

    const body = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      gender: form.gender,
      dob: form.dob || null,
      address: form.address,
      status: form.status,
    };

    setSaving(true);
    try {
      if (isNew) {
        await api.post("/admin/patients", body);
      } else {
        await api.put(`/admin/patients/${patient._id}`, body);
      }
      onClose();
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
          <div>{isNew ? "Add Patient" : "Edit Patient"}</div>
          <button className="x" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="grid">
            <label>
              First name
              <input value={form.firstName} onChange={onChange("firstName")} />
            </label>
            <label>
              Last name
              <input value={form.lastName} onChange={onChange("lastName")} />
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
              Gender
              <select value={form.gender} onChange={onChange("gender")}>
                <option value="">—</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>
            </label>
            <label>
              DOB
              <input type="date" value={form.dob} onChange={onChange("dob")} />
            </label>
            <label>
              Address
              <input
                value={form.address}
                onChange={onChange("address")}
                placeholder="Street, City"
              />
            </label>
            <label>
              Status
              <select value={form.status} onChange={onChange("status")}>
                <option>Active</option>
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
