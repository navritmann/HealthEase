import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../api/axios";

export default function Clinics() {
  return (
    <AdminLayout>
      <ClinicsPage />
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

function ClinicsPage() {
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
        const { data } = await api.get("/admin/clinics", { params });
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

  const filtered = useMemo(() => rows, [rows]);

  const onDelete = async (c) => {
    const ok = window.confirm(`Delete clinic "${c.name}"?`);
    if (!ok) return;
    try {
      await api.delete(`/admin/clinics/${c._id}`);
      setVersion((v) => v + 1);
    } catch (e) {
      alert(e?.response?.data?.error || "Delete failed");
    }
  };

  return (
    <div className="page">
      <div className="page-h">
        <h2>Clinics</h2>

        <div className="h-actions">
          <div className="search">
            <span className="magnify" />
            <input
              placeholder="Search by name, address, city, state…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <button className="btn primary" onClick={() => setShowEdit("new")}>
            Add Clinic
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
                <th>Clinic</th>
                <th>Address</th>
                <th>City/State</th>
                <th>Distance</th>
                <th>Doctors</th>
                <th style={{ width: 260 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} style={{ padding: 24, color: "#7a8aa0" }}>
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && err && (
                <tr>
                  <td colSpan={7} style={{ padding: 24, color: "#b45454" }}>
                    {err}
                  </td>
                </tr>
              )}
              {!loading &&
                !err &&
                filtered.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td className="name">
                      <span className="avatar big">
                        {initials(c.name || "")}
                      </span>
                      <div className="stack">
                        <div className="l1">{c.name}</div>
                        <div className="l2">{c._id}</div>
                      </div>
                    </td>
                    <td>{c.address || "-"}</td>
                    <td>
                      {[c.city, c.state].filter(Boolean).join(", ") || "-"}
                    </td>
                    <td>{c.distanceLabel || "-"}</td>
                    <td>{Array.isArray(c.doctors) ? c.doctors.length : 0}</td>
                    <td className="actions">
                      <button
                        className="btn soft sm"
                        onClick={() => setShowProfile(c._id)}
                      >
                        View
                      </button>
                      <button
                        className="btn soft sm"
                        onClick={() => setShowEdit(c._id)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn link sm"
                        onClick={() => onDelete(c)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              {!loading && !err && !filtered.length && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: 24,
                      color: "#7a8aa0",
                    }}
                  >
                    No clinics match your filters.
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
          clinicId={showProfile}
          onClose={() => setShowProfile(null)}
        />
      )}

      {showEdit && (
        <EditModal
          id={showEdit}
          clinic={rows.find((x) => x._id === showEdit) || null}
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
function initials(s = "") {
  return s
    .trim()
    .split(/\s+/)
    .map((x) => x[0])
    .slice(0, 2)
    .join("");
}

/* View modal */
function ProfileModal({ clinicId, onClose }) {
  const [row, setRow] = useState(null);
  const [err, setErr] = useState("");
  const [doctors, setDoctors] = useState([]);

  React.useEffect(() => {
    let cancel = false;
    (async () => {
      setErr("");
      try {
        const [{ data: clinic }, { data: docList }] = await Promise.all([
          api.get(`/admin/clinics/${clinicId}`),
          api.get(`/admin/doctors`, { params: { limit: 1000 } }),
        ]);
        if (!cancel) {
          setRow(clinic);
          setDoctors(Array.isArray(docList) ? docList : docList.rows || []);
        }
      } catch (e) {
        if (!cancel)
          setErr(e?.response?.data?.error || "Failed to load clinic");
      }
    })();
    return () => (cancel = true);
  }, [clinicId]);

  const c = row || {};
  const docMap = React.useMemo(() => {
    const map = new Map();
    (doctors || []).forEach((d) => map.set(String(d._id || d.id), d));
    return map;
  }, [doctors]);

  const doctorNames = (c.doctors || [])
    .map((id) => docMap.get(String(id))?.name)
    .filter(Boolean);

  return (
    <div className="modal-wrap" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-h">
          <div>Clinic Details</div>
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
                <div className="avatar xl">{initials(c.name || "C")}</div>
                <div>
                  <div className="title">{c.name}</div>
                  {c.logoUrl && (
                    <div style={{ marginTop: 8 }}>
                      <img
                        src={c.logoUrl}
                        alt="logo"
                        style={{ maxWidth: 120, borderRadius: 8 }}
                      />
                    </div>
                  )}
                  <div className="meta">
                    {[c.address, c.city, c.state].filter(Boolean).join(", ") ||
                      "-"}
                  </div>
                  <div className="meta">Distance: {c.distanceLabel || "-"}</div>
                  <div className="meta">
                    Doctors: {doctorNames.length ? doctorNames.join(", ") : "—"}
                  </div>
                </div>
              </div>
              <div className="hr" />
              <div className="grid">
                <label>
                  Notes <input placeholder="Internal note…" defaultValue="" />
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
function EditModal({ id, clinic, onClose }) {
  const isNew = id === "new";
  const base = isNew
    ? {
        name: "",
        address: "",
        city: "",
        state: "",
        logoUrl: "",
        distanceLabel: "",
        doctors: [],
      }
    : clinic || {};

  const [form, setForm] = useState({
    name: base.name || "",
    address: base.address || "",
    city: base.city || "",
    state: base.state || "",
    logoUrl: base.logoUrl || "",
    distanceLabel: base.distanceLabel || "",
    doctors: Array.isArray(base.doctors) ? base.doctors.map(String) : [],
  });
  const [saving, setSaving] = useState(false);
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [search, setSearch] = useState("");

  // Load doctors (for picker)
  React.useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const { data } = await api.get("/admin/doctors", {
          params: { limit: 1000 },
        });
        if (!cancel) {
          const rows = Array.isArray(data) ? data : data.rows || [];
          setDoctorOptions(
            rows.map((d) => ({
              id: String(d._id || d.id),
              name: d.name || "Unnamed",
            }))
          );
        }
      } catch (e) {
        // silent fail → keeps UI usable
        setDoctorOptions([]);
      }
    })();
    return () => (cancel = true);
  }, []);

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const toggleDoctor = (id) => {
    setForm((f) => {
      const s = new Set(f.doctors);
      s.has(id) ? s.delete(id) : s.add(id);
      return { ...f, doctors: [...s] };
    });
  };

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return doctorOptions;
    return doctorOptions.filter((o) => o.name.toLowerCase().includes(q));
  }, [doctorOptions, search]);

  const submit = async () => {
    if (!form.name.trim()) return alert("Name is required");

    const body = {
      name: form.name.trim(),
      address: form.address,
      city: form.city,
      state: form.state,
      logoUrl: form.logoUrl,
      distanceLabel: form.distanceLabel,
      doctors: form.doctors, // array of ObjectId strings
    };

    setSaving(true);
    try {
      if (isNew) {
        await api.post("/admin/clinics", body);
      } else {
        await api.put(`/admin/clinics/${clinic._id}`, body);
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
          <div>{isNew ? "Add Clinic" : "Edit Clinic"}</div>
          <button className="x" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="grid">
            <label>
              Name
              <input value={form.name} onChange={onChange("name")} />
            </label>
            <label>
              Address
              <input
                value={form.address}
                onChange={onChange("address")}
                placeholder="Street address"
              />
            </label>
            <label>
              City
              <input value={form.city} onChange={onChange("city")} />
            </label>
            <label>
              State
              <input value={form.state} onChange={onChange("state")} />
            </label>
            <label>
              Logo URL
              <input
                value={form.logoUrl}
                onChange={onChange("logoUrl")}
                placeholder="https://..."
              />
            </label>
            <label>
              Distance Label
              <input
                value={form.distanceLabel}
                onChange={onChange("distanceLabel")}
                placeholder="2.1 km"
              />
            </label>

            {/* Doctors multi-select */}
            <label style={{ gridColumn: "1 / -1" }}>
              Doctors (assign to this clinic)
              <div className="picker">
                <div className="picker-h">
                  <input
                    placeholder="Search doctors…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="picker-search"
                  />
                </div>

                <div className="picker-body">
                  {filteredOptions.map((opt) => {
                    const checked = form.doctors.includes(opt.id);
                    return (
                      <label key={opt.id} className="picker-row">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleDoctor(opt.id)}
                        />
                        <span className="picker-name">{opt.name}</span>
                        {checked && (
                          <span className="pill confirmed">Selected</span>
                        )}
                      </label>
                    );
                  })}
                  {!filteredOptions.length && (
                    <div style={{ color: "#7a8aa0", padding: 8 }}>
                      No doctors found.
                    </div>
                  )}
                </div>

                {/* Selected chips */}
                <div className="picker-chips">
                  {form.doctors.map((id) => {
                    const name =
                      doctorOptions.find((d) => d.id === id)?.name || id;
                    return (
                      <span key={id} className="chip">
                        {name}
                        <button
                          className="chip-x"
                          onClick={() => toggleDoctor(id)}
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                  {!form.doctors.length && (
                    <div style={{ color: "#7a8aa0" }}>No doctors selected.</div>
                  )}
                </div>
              </div>
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
