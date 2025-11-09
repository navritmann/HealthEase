import { useMemo, useState } from "react";

/**
 * HealthEase Admin – Appointments (Pixel-close to mock)
 * Light UI, left sidebar, header actions, tab filters, rounded table, footer pager.
 */
export default function AdminAppointmentsExact() {
  return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <Topbar />
        <div className="content">
          <AppointmentsPage />
        </div>
      </main>
      <style>{css}</style>
    </div>
  );
}

function Sidebar() {
  const items = [
    { label: "Dashboard" },
    { label: "Appointments", active: true },
    { label: "Patients" },
    { label: "Doctors" },
    { label: "Departments" },
    { label: "Doctors' Schedule" },
    { label: "Payments" },
    { label: "Inventory" },
    { label: "Messages", badge: 1 },
  ];
  return (
    <aside className="aside">
      <div className="brand">
        <div className="logo">HE</div>
        <div className="brand-n">
          Health
          <br />
          Ease
        </div>
      </div>
      <nav className="nav">
        {items.map((it, i) => (
          <a
            key={i}
            className={`nav-item ${it.active ? "active" : ""}`}
            href="#"
          >
            <span className="icon" /> {it.label}
            {it.badge ? <span className="badge">{it.badge}</span> : null}
          </a>
        ))}
      </nav>
      <div className="upgrade">
        <div className="lock" />
        <div className="up-title">
          Unlock New Features & Maximize Your Hospital Management Efficiency
        </div>
        <button className="btn ghost">What's New?</button>
        <button className="btn">Upgrade</button>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="topbar">
      <div className="crumb">Appointments – Desktop</div>
      <div className="r">
        <button className="icon-btn" title="Notifications" />
        <div className="user">
          <span className="color-dot" />
          <span className="name">Alfredo Westervelt</span>
          <span className="caret">▾</span>
        </div>
      </div>
    </header>
  );
}

function AppointmentsPage() {
  const [tab, setTab] = useState("All");
  const tabs = [
    { key: "All", count: 128 },
    { key: "Confirmed", count: 98 },
    { key: "Pending", count: 18 },
    { key: "Cancelled", count: 12 },
  ];

  const all = [
    {
      name: "Caren C. Simpson",
      date: "20 July 2028",
      time: "09:00 AM",
      doctor: "Dr. Petra Winsbury",
      treatment: "Routine Check-Up",
      status: "Confirmed",
    },
    {
      name: "Edgar Warrow",
      date: "20 July 2028",
      time: "10:30 AM",
      doctor: "Dr. Olivia Martinez",
      treatment: "Cardiac Consultation",
      status: "Confirmed",
    },
    {
      name: "Ocean Jane Lupro",
      date: "20 July 2028",
      time: "11:00 AM",
      doctor: "Dr. Damian Sanchez",
      treatment: "Pediatric Check-Up",
      status: "Pending",
    },
    {
      name: "Shane Riddick",
      date: "20 July 2028",
      time: "01:00 PM",
      doctor: "Dr. Chloe Harrington",
      treatment: "Skin Allergy",
      status: "Cancelled",
    },
    {
      name: "Queen Lawnston",
      date: "20-07-28",
      time: "02:30 PM",
      doctor: "Dr. Petra Winsbury",
      treatment: "Follow-Up Visit",
      status: "Confirmed",
    },
    {
      name: "Alice Mitchell",
      date: "20 July 2028",
      time: "09:00 AM",
      doctor: "Dr. Emily Smith",
      treatment: "Routine Check-Up",
      status: "Confirmed",
    },
    {
      name: "Mikhail Morozov",
      date: "20 July 2028",
      time: "10:30 AM",
      doctor: "Dr. Samuel Thompson",
      treatment: "Cardiac Consultation",
      status: "Confirmed",
    },
    {
      name: "Mateus Fernandes",
      date: "20 July 2028",
      time: "11:00 AM",
      doctor: "Dr. Sarah Johnson",
      treatment: "Pediatric Check-Up",
      status: "Pending",
    },
    {
      name: "Pari Desai",
      date: "20 July 2028",
      time: "01:00 PM",
      doctor: "Dr. Luke Harrison",
      treatment: "Skin Allergy",
      status: "Cancelled",
    },
    {
      name: "Omar Ali",
      date: "20 July 2028",
      time: "02:30 PM",
      doctor: "Dr. Andrew Peterson",
      treatment: "Follow-Up Visit",
      status: "Confirmed",
    },
    {
      name: "Camila Alvarez",
      date: "20 July 2028",
      time: "03:00 PM",
      doctor: "Dr. Olivia Martinez",
      treatment: "Cardiac Check-Up",
      status: "Confirmed",
    },
    {
      name: "Thabo van Rooyen",
      date: "20 July 2028",
      time: "04:00 PM",
      doctor: "Dr. William Carter",
      treatment: "Pediatric Check-Up",
      status: "Pending",
    },
    {
      name: "Chance Geist",
      date: "20 July 2028",
      time: "04:30 PM",
      doctor: "Dr. Samuel Thompson",
      treatment: "Follow-Up Visit",
      status: "Confirmed",
    },
  ];

  const rows = useMemo(
    () => (tab === "All" ? all : all.filter((r) => r.status === tab)),
    [tab]
  );

  return (
    <div className="page">
      <div className="page-h">
        <h2>Appointments</h2>
        <div className="tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`tab ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.key} <span className="badge-num">{t.count}</span>
            </button>
          ))}
        </div>
        <div className="h-actions">
          <div className="search">
            <span className="magnify" />
            <input placeholder="Search placeholder" />
          </div>
          <button className="select">Today</button>
          <button className="btn primary">Add Appointment</button>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 36 }}>
                <input type="checkbox" />
              </th>
              <th>Name</th>
              <th>Date</th>
              <th>Time</th>
              <th>Doctor</th>
              <th>Treatment</th>
              <th>Status</th>
              <th style={{ width: 170 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={i === 2 ? "active-row" : ""}>
                <td>
                  <input type="checkbox" />
                </td>
                <td className="name">
                  <span className="avatar" />
                  <span>{r.name}</span>
                </td>
                <td>{r.date}</td>
                <td>{r.time}</td>
                <td>{r.doctor}</td>
                <td>{r.treatment}</td>
                <td>
                  <span className={`pill ${r.status.toLowerCase()}`}>
                    {r.status}
                  </span>
                </td>
                <td className="actions">
                  <button className="btn soft sm">Reschedule</button>
                  <button className="btn link sm">Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="table-footer">
          <div className="showing">
            Showing{" "}
            <select>
              <option>13</option>
              <option>25</option>
              <option>50</option>
            </select>{" "}
            out of 128
          </div>
          <div className="pager">
            <button className="pg-arrow">‹</button>
            <button className="pg active">1</button>
            <button className="pg">2</button>
            <button className="pg">3</button>
            <span className="dots">…</span>
            <button className="pg">10</button>
            <button className="pg-arrow">›</button>
          </div>
        </div>
      </div>

      <footer className="footer">
        <span>Copyright © 2025 Health Ease</span>
        <nav>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms and Conditions</a>
          <a href="#">Contact</a>
        </nav>
      </footer>
    </div>
  );
}

const css = `
:root{
  --bg:#f5f7fb; --panel:#ffffff; --line:#e6e9f1; --muted:#7a8aa0; --text:#1d2b3a;
  --brand:#1fbf8f; --brand-900:#0f7b62; --accent:#2f6fed; --warn:#f4a534; --danger:#f06565;
}
*{box-sizing:border-box}
html,body,#root{height:100%}
body{margin:0;background:#0f1526;font:14px/1.5 Inter,system-ui,Segoe UI,Roboto}

.shell{display:grid;grid-template-columns:260px 1fr;min-height:100vh}
.aside{background:#0f1526;color:#e9eefb;border-right:1px solid rgba(255,255,255,.08);display:flex;flex-direction:column}
.brand{display:flex;align-items:center;gap:10px;padding:18px}
.logo{width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,var(--brand),#3cd8b2);display:grid;place-items:center;color:#08352a;font-weight:900}
.brand-n{font-weight:800;line-height:1.1}
.nav{display:flex;flex-direction:column;padding:6px}
.nav-item{display:flex;align-items:center;gap:10px;color:#dbe3fb;text-decoration:none;padding:10px 12px;border-radius:10px}
.nav-item:hover{background:rgba(255,255,255,.06)}
.nav-item.active{background:rgba(31,191,143,.18);color:#e9eefb}
.nav-item .icon{width:16px;height:16px;border-radius:4px;background:#5b8cff;opacity:.6}
.badge{margin-left:auto;background:#ecfdf5;color:#0b7a61;border-radius:999px;padding:2px 8px;font-size:12px}
.upgrade{margin-top:auto;margin:16px;border:1px dashed rgba(255,255,255,.2);border-radius:12px;padding:14px;color:#d9e2ff;background:rgba(255,255,255,.04)}
.lock{width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#0e223f,#243d67);margin-bottom:8px}
.btn{border:1px solid #d7def0;background:#eef3ff;color:#27406d;border-radius:10px;padding:8px 10px;cursor:pointer}
.btn.ghost{background:transparent;border-color:rgba(255,255,255,.25);color:#e9eefb}

.main{display:flex;flex-direction:column;background:var(--bg)}
.topbar{height:56px;background:#ffffff;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;padding:0 16px}
.crumb{color:#6c7c94}
.r{display:flex;align-items:center;gap:10px}
.icon-btn{width:32px;height:32px;border-radius:8px;border:1px solid var(--line);background:#fff}
.user{display:flex;align-items:center;gap:8px;background:#f3f6fb;border:1px solid var(--line);padding:6px 10px;border-radius:999px}
.color-dot{width:10px;height:10px;border-radius:50%;background:var(--brand)}
.name{color:#0f2542;font-weight:600}
.caret{color:#8091a7}

.content{padding:16px}
.page{max-width:1100px;margin:0 auto}
.page-h{display:grid;grid-template-columns:1fr auto;grid-template-rows:auto auto;gap:10px;margin-bottom:10px}
.page-h h2{grid-column:1/3;margin:0;color:#11233d}
.tabs{display:flex;gap:8px}
.tab{background:#eff4ff;border:1px solid #d7def0;color:#21406f;border-radius:999px;padding:8px 12px;cursor:pointer}
.tab.active{background:#e6fff6;border-color:#94f3da;color:#0b614f}
.badge-num{margin-left:6px;opacity:.7}
.h-actions{display:flex;align-items:center;gap:8px}
.search{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid var(--line);border-radius:999px;padding:8px 12px;min-width:260px}
.magnify{width:16px;height:16px;border-radius:50%;background:#8fa3bf;display:inline-block}
.select{border:1px solid var(--line);background:#fff;color:#223b64;border-radius:10px;padding:8px 10px}
.btn.primary{background:linear-gradient(135deg,var(--brand),#3bd7b2);color:#063c30;border:none;font-weight:800}
.btn.soft{background:#eef2f7;border:1px solid #d9e1ef;color:#5d6f89}
.btn.link{background:transparent;border:none;color:#7b8fe0}
.btn.sm{padding:6px 8px;font-size:12px;border-radius:8px}

.card{background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow:hidden}
.table{width:100%;border-collapse:separate;border-spacing:0}
.table thead th{background:#fafcff;color:#7a8aa0;text-align:left;font-size:12px;padding:12px;border-bottom:1px solid var(--line)}
.table tbody td{padding:12px;border-bottom:1px solid var(--line)}
.table tr:last-child td{border-bottom:none}
.table tr:hover td{background:#fbfdff}
.active-row td{background:#f2f7ff}
.name{display:flex;align-items:center;gap:10px}
.avatar{width:10px;height:10px;border-radius:3px;background:#5b8cff;display:inline-block}
.pill{padding:6px 10px;border-radius:999px;font-size:12px;border:1px solid transparent}
.pill.confirmed{background:#e7fbf5;color:#0b705a;border-color:#9ae9d5}
.pill.pending{background:#fff7e9;color:#915e07;border-color:#ffd89a}
.pill.cancelled{background:#ffecec;color:#8c2f2f;border-color:#ffb2b2}
.actions{display:flex;justify-content:flex-end;gap:6px}

.table-footer{display:flex;align-items:center;justify-content:space-between;padding:12px;background:#fafcff;border-top:1px solid var(--line)}
.showing select{background:#fff;border:1px solid var(--line);border-radius:8px;padding:6px}
.pager{display:flex;align-items:center;gap:6px}
.pg{min-width:32px;height:32px;border-radius:8px;border:1px solid var(--line);background:#fff;color:#294469}
.pg.active{background:#e6fff6;border-color:#94f3da;color:#0b614f;font-weight:800}
.pg-arrow{min-width:32px;height:32px;border-radius:8px;border:1px solid var(--line);background:#fff}
.dots{color:#8aa0ba;padding:0 6px}

.footer{display:flex;align-items:center;justify-content:space-between;color:#7a8aa0;font-size:12px;margin:16px 0}
.footer nav{display:flex;gap:18px}
.footer a{color:#7a8aa0;text-decoration:none}

@media (max-width: 1160px){
  .shell{grid-template-columns:88px 1fr}
  .brand-n{display:none}
}
`;
