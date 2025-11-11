import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../api/axios";

export default function Services() {
  return (
    <AdminLayout>
      <ServicesPage />
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

function ServicesPage() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showView, setShowView] = useState(null); // id
  const [showEdit, setShowEdit] = useState(null); // id | "new"
  const [onlyActive, setOnlyActive] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const params = { q: q.trim(), limit: 500 };
        if (onlyActive) params.active = true;
        const { data } = await api.get("/admin/services", { params });
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
  }, [q, onlyActive, version]);

  const filtered = useMemo(() => rows, [rows]);

  const onDisable = async (s) => {
    const ok = window.confirm(`Disable service "${s.name}"?`);
    if (!ok) return;
    try {
      await api.delete(`/admin/services/${s._id}`);
      setVersion((v) => v + 1);
    } catch (e) {
      alert(e?.response?.data?.error || "Disable failed");
    }
  };

  return (
    <div className="page">
      <div className="page-h">
        <h2>Services</h2>

        <div className="h-actions">
          <div className="search">
            <span className="magnify" />
            <input
              placeholder="Search by code, name, add-on…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <label className="toggle">
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => setOnlyActive(e.target.checked)}
            />
            <span>Only active</span>
          </label>

          <button className="btn primary" onClick={() => setShowEdit("new")}>
            Add Service
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
                <th>Code / Name</th>
                <th>Duration</th>
                <th>Base Price</th>
                <th>Add-ons</th>
                <th>Status</th>
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
                filtered.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td className="name">
                      <span className="avatar big">
                        {initials(s.name || s.code)}
                      </span>
                      <div className="stack">
                        <div className="l1">{s.code}</div>
                        <div className="l2">{s.name}</div>
                      </div>
                    </td>
                    <td>{s.durationMins} min</td>
                    <td>${Number(s.basePrice || 0).toFixed(2)}</td>
                    <td className="mono">
                      {Array.isArray(s.addOns) && s.addOns.length
                        ? s.addOns
                            .filter((a) => a.active !== false)
                            .map((a) => a.code)
                            .join(", ")
                        : "—"}
                    </td>
                    <td>
                      <span
                        className={`pill ${s.active ? "confirmed" : "pending"}`}
                      >
                        {s.active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn soft sm"
                        onClick={() => setShowView(s._id)}
                      >
                        View
                      </button>
                      <button
                        className="btn soft sm"
                        onClick={() => setShowEdit(s._id)}
                      >
                        Edit
                      </button>
                      {s.active ? (
                        <button
                          className="btn link sm"
                          onClick={() => onDisable(s)}
                        >
                          Disable
                        </button>
                      ) : (
                        <span style={{ color: "#7a8aa0" }}>—</span>
                      )}
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
                    No services found.
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

      {showView && (
        <ViewModal id={showView} onClose={() => setShowView(null)} />
      )}
      {showEdit && (
        <EditModal
          id={showEdit}
          service={rows.find((x) => x._id === showEdit) || null}
          onClose={() => {
            setShowEdit(null);
            setVersion((v) => v + 1);
          }}
        />
      )}
    </div>
  );
}

function initials(s = "") {
  return s
    .trim()
    .split(/\s+/)
    .map((x) => x[0])
    .slice(0, 2)
    .join("");
}

/* View modal */
function ViewModal({ id, onClose }) {
  const [row, setRow] = useState(null);
  const [err, setErr] = useState("");

  // quick quote local state
  const [apptType, setApptType] = useState("clinic");
  const [addonSel, setAddonSel] = useState([]); // array of addOn.code
  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);
  const [qErr, setQErr] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      setErr("");
      try {
        const { data } = await api.get(`/admin/services/${id}`);
        if (!cancel) {
          setRow(data);
          // preselect all active add-ons by default
          const actives =
            (data?.addOns || [])
              .filter((a) => a.active !== false && a.code)
              .map((a) => a.code) || [];
          setAddonSel(actives);
        }
      } catch (e) {
        if (!cancel) setErr(e?.response?.data?.error || "Failed to load");
      }
    })();
    return () => (cancel = true);
  }, [id]);

  const s = row || {};

  const toggleAddOn = (code) =>
    setAddonSel((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );

  const runQuote = async () => {
    if (!s?.code) return;
    setQuoting(true);
    setQuote(null);
    setQErr("");
    try {
      // calls your existing public endpoint: POST /api/appointments/quote
      const { data } = await api.post(`/appointments/quote`, {
        serviceCode: s.code,
        addOns: addonSel, // array of addOn codes, e.g. ["ECHO"]
        appointmentType: apptType, // "clinic" | "video" | "audio" | "chat" | "home_visit"
      });
      setQuote(data);
    } catch (e) {
      setQErr(e?.response?.data?.error || "Quote failed");
    } finally {
      setQuoting(false);
    }
  };

  return (
    <div className="modal-wrap" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-h">
          <div>Service</div>
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
                <div className="avatar xl">{initials(s.name || s.code)}</div>
                <div>
                  <div className="title">{s.name}</div>
                  <div className="meta mono">{s.code}</div>
                  <div className="meta">Duration: {s.durationMins} min</div>
                  <div className="meta">
                    Base Price: ${Number(s.basePrice || 0).toFixed(2)}
                  </div>
                  <div className="meta">
                    Status: {s.active ? "Active" : "Disabled"}
                  </div>
                </div>
              </div>

              <div className="hr" />
              <div className="grid" style={{ gridColumn: "1 / -1" }}>
                <label>
                  Description
                  <textarea readOnly value={s.description || ""} rows={3} />
                </label>
              </div>

              <div className="hr" />
              <div>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Add-ons</div>
                {Array.isArray(s.addOns) && s.addOns.length ? (
                  <div className="table-wrap">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Name</th>
                          <th>Price</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {s.addOns.map((a, i) => (
                          <tr key={i}>
                            <td className="mono">{a.code}</td>
                            <td>{a.name}</td>
                            <td>${Number(a.price || 0).toFixed(2)}</td>
                            <td>
                              <span
                                className={`pill ${
                                  a.active !== false ? "confirmed" : "pending"
                                }`}
                              >
                                {a.active !== false ? "Active" : "Disabled"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ color: "#7a8aa0" }}>No add-ons.</div>
                )}
              </div>

              {/* Quick Quote */}
              <div className="hr" />
              <div>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>
                  Quick Quote
                </div>

                <div className="grid">
                  <label>
                    Appointment Type
                    <select
                      value={apptType}
                      onChange={(e) => setApptType(e.target.value)}
                    >
                      <option value="clinic">Clinic</option>
                      <option value="video">Video</option>
                      <option value="audio">Audio</option>
                      <option value="chat">Chat</option>
                      <option value="home_visit">Home Visit</option>
                    </select>
                  </label>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <div style={{ marginBottom: 6 }}>Include Add-ons</div>
                    <div
                      style={{
                        border: "1px solid #e6e8f0",
                        borderRadius: 12,
                        padding: 8,
                        maxHeight: 160,
                        overflow: "auto",
                        background: "#fafbfe",
                      }}
                    >
                      {(s.addOns || [])
                        .filter((a) => a.active !== false)
                        .map((a, i) => (
                          <label
                            key={i}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: 6,
                              borderRadius: 8,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={addonSel.includes(a.code)}
                              onChange={() => toggleAddOn(a.code)}
                            />
                            <span className="mono" style={{ minWidth: 84 }}>
                              {a.code}
                            </span>
                            <span style={{ flex: 1 }}>{a.name}</span>
                            <span>${Number(a.price || 0).toFixed(2)}</span>
                          </label>
                        ))}
                      {!(s.addOns || []).filter((a) => a.active !== false)
                        .length && (
                        <div style={{ color: "#7a8aa0" }}>
                          No active add-ons.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className="modal-f"
                  style={{ justifyContent: "flex-start" }}
                >
                  <button
                    className="btn primary"
                    onClick={runQuote}
                    disabled={quoting}
                  >
                    {quoting ? "Quoting…" : "Use in Quote"}
                  </button>
                  {qErr && (
                    <span style={{ color: "#b45454", marginLeft: 12 }}>
                      {qErr}
                    </span>
                  )}
                </div>

                {quote && (
                  <div className="card" style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>
                      Quote Result
                    </div>
                    <div className="table-wrap">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th style={{ width: 140, textAlign: "right" }}>
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(quote.items || []).map((it, i) => (
                            <tr key={i}>
                              <td>{it.label}</td>
                              <td style={{ textAlign: "right" }}>
                                ${Number(it.amount || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                          <tr>
                            <td style={{ fontWeight: 700 }}>Total</td>
                            <td style={{ textAlign: "right", fontWeight: 700 }}>
                              ${Number(quote.total || 0).toFixed(2)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div style={{ marginTop: 6, color: "#7a8aa0" }}>
                      Currency: {quote.currency || "USD"}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="modal-f">
          <button className="btn ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* Create/Edit modal */
function EditModal({ id, service, onClose }) {
  const isNew = id === "new";
  const base = isNew
    ? {
        code: "",
        name: "",
        durationMins: 30,
        basePrice: 0,
        description: "",
        addOns: [],
        active: true,
      }
    : service || {};

  const [form, setForm] = useState({
    code: base.code || "",
    name: base.name || "",
    durationMins: base.durationMins || 30,
    basePrice: base.basePrice || 0,
    description: base.description || "",
    active: base.active !== false,
  });
  const [addOns, setAddOns] = useState(
    Array.isArray(base.addOns)
      ? base.addOns.map((a) => ({
          code: a.code || "",
          name: a.name || "",
          price: Number(a.price || 0),
          description: a.description || "",
          active: a.active !== false,
        }))
      : []
  );
  const [saving, setSaving] = useState(false);

  const onChange = (k) => (e) =>
    setForm({
      ...form,
      [k]:
        e.target.type === "number"
          ? Number(e.target.value)
          : e.target.type === "checkbox"
          ? e.target.checked
          : e.target.value,
    });

  const setAddOn = (i, k, v) => {
    setAddOns((arr) => {
      const copy = [...arr];
      copy[i] = { ...copy[i], [k]: v };
      return copy;
    });
  };
  const addAddOn = () =>
    setAddOns((arr) => [
      ...arr,
      { code: "", name: "", price: 0, description: "", active: true },
    ]);
  const removeAddOn = (i) =>
    setAddOns((arr) => arr.filter((_, idx) => idx !== i));

  const submit = async () => {
    if (!form.code.trim() || !form.name.trim())
      return alert("Code and Name are required");

    const body = {
      code: form.code.trim(),
      name: form.name.trim(),
      durationMins: Number(form.durationMins) || 30,
      basePrice: Number(form.basePrice) || 0,
      description: form.description,
      active: !!form.active,
      addOns: addOns
        .filter((a) => a.code.trim() && a.name.trim())
        .map((a) => ({
          code: a.code.trim().toUpperCase(),
          name: a.name.trim(),
          price: Number(a.price) || 0,
          description: a.description || "",
          active: a.active !== false,
        })),
    };

    setSaving(true);
    try {
      if (isNew) {
        await api.post("/admin/services", body);
      } else {
        await api.put(`/admin/services/${service._id}`, body);
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
          <div>{isNew ? "Add Service" : "Edit Service"}</div>
          <button className="x" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="grid">
            <label>
              Code
              <input
                value={form.code}
                onChange={onChange("code")}
                placeholder="CARDIO_30"
              />
            </label>
            <label>
              Name
              <input
                value={form.name}
                onChange={onChange("name")}
                placeholder="Cardiology Consultation"
              />
            </label>
            <label>
              Duration (mins)
              <input
                type="number"
                min={1}
                step={1}
                value={form.durationMins}
                onChange={onChange("durationMins")}
              />
            </label>
            <label>
              Base Price
              <input
                type="number"
                min={0}
                step={1}
                value={form.basePrice}
                onChange={onChange("basePrice")}
              />
            </label>
            <label>
              Status
              <select
                value={form.active ? "Active" : "Disabled"}
                onChange={(e) =>
                  setForm({ ...form, active: e.target.value === "Active" })
                }
              >
                <option>Active</option>
                <option>Disabled</option>
              </select>
            </label>
            <label style={{ gridColumn: "1 / -1" }}>
              Description
              <textarea
                rows={3}
                value={form.description}
                onChange={onChange("description")}
              />
            </label>

            {/* Add-ons editor */}
            <div style={{ gridColumn: "1 / -1", marginTop: 8 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ fontWeight: 700 }}>Add-ons</div>
                <button
                  type="button"
                  className="btn soft sm"
                  onClick={addAddOn}
                >
                  + Add Add-on
                </button>
              </div>

              {addOns.length === 0 && (
                <div style={{ color: "#7a8aa0", marginTop: 8 }}>
                  No add-ons added.
                </div>
              )}

              {addOns.map((a, i) => (
                <div
                  key={i}
                  className="card"
                  style={{ padding: 12, marginTop: 8 }}
                >
                  <div className="grid">
                    <label>
                      Code
                      <input
                        value={a.code}
                        onChange={(e) => setAddOn(i, "code", e.target.value)}
                        placeholder="ECHO"
                      />
                    </label>
                    <label>
                      Name
                      <input
                        value={a.name}
                        onChange={(e) => setAddOn(i, "name", e.target.value)}
                        placeholder="Echocardiogram"
                      />
                    </label>
                    <label>
                      Price
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={a.price}
                        onChange={(e) =>
                          setAddOn(i, "price", Number(e.target.value))
                        }
                      />
                    </label>
                    <label>
                      Status
                      <select
                        value={a.active ? "Active" : "Disabled"}
                        onChange={(e) =>
                          setAddOn(i, "active", e.target.value === "Active")
                        }
                      >
                        <option>Active</option>
                        <option>Disabled</option>
                      </select>
                    </label>
                    <label style={{ gridColumn: "1 / -1" }}>
                      Description
                      <textarea
                        rows={2}
                        value={a.description}
                        onChange={(e) =>
                          setAddOn(i, "description", e.target.value)
                        }
                      />
                    </label>
                  </div>
                  <div
                    className="modal-f"
                    style={{
                      justifyContent: "flex-end",
                      padding: 0,
                      marginTop: 8,
                    }}
                  >
                    <button
                      className="btn link sm"
                      onClick={() => removeAddOn(i)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
