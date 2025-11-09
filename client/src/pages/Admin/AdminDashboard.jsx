import { useMemo } from "react";

export default function AdminDashboardExact() {
  return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <Topbar />
        <div className="content">
          <DashboardPage />
        </div>
      </main>
      <style>{css}</style>
    </div>
  );
}

function Sidebar() {
  const items = [
    { label: "Dashboard", active: true },
    { label: "Appointments" },
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
      <div className="search">
        <span className="magnify" />
        <input placeholder="Search anything" />
      </div>
      <div className="r">
        <div className="flag" />
        <div className="user">
          <span className="color-dot" />
          <span className="name">Alfredo Watersworth</span>
          <span className="caret">▾</span>
        </div>
      </div>
    </header>
  );
}

function DashboardPage() {
  const kpis = [
    { label: "Total Invoice", value: "1,287", delta: "+2.1%" },
    { label: "Total Patients", value: "965", delta: "+1.0%" },
    { label: "Appointments", value: "128", delta: "-3.5%" },
    { label: "Bed Occupancy", value: "315", delta: "+1.7%" },
  ];

  const schedule = [
    {
      name: "Dr. Petra Winsbury",
      spec: "General Medicine",
      time: "09:00 AM",
      tag: "Available",
    },
    {
      name: "Dr. Ameena Karim",
      spec: "Orthopedics",
      time: "09:30 AM",
      tag: "On Duty",
    },
    {
      name: "Dr. Olivia Martinez",
      spec: "Cardiology",
      time: "10:15 AM",
      tag: "In Surgery",
    },
    {
      name: "Dr. Damian Sanchez",
      spec: "Pediatrics",
      time: "11:00 AM",
      tag: "Available",
    },
  ];

  const activities = [
    {
      text: "Felix Walter was discharged from Room 205 after successful treatment",
      time: "1h ago",
    },
    {
      text: "Lia Rousseau admitted to Room 312 for surgery scheduled for today",
      time: "2h ago",
    },
    {
      text: "MRI machine in Radiology Department received routine maintenance check",
      time: "3h ago",
    },
    { text: "ICU received restock of essential medications", time: "4h ago" },
  ];

  const appts = [
    {
      name: "Caren C. Simpson",
      date: "20-07-28",
      time: "08:00 AM",
      doctor: "Dr. Petra Winsbury",
      type: "Routine Check-Up",
      status: "Confirmed",
    },
    {
      name: "Edgar Witarow",
      date: "20-07-28",
      time: "10:30 AM",
      doctor: "Dr. Olivia Martinez",
      type: "Cardiac Consultation",
      status: "Confirmed",
    },
    {
      name: "Ocean Jane Lupro",
      date: "20-07-28",
      time: "11:00 AM",
      doctor: "Dr. Damian Sanchez",
      type: "Pediatric Check-Up",
      status: "Pending",
    },
    {
      name: "Shane Riddick",
      date: "20-07-28",
      time: "01:00 PM",
      doctor: "Dr. Chloe Harrington",
      type: "Skin Allergy",
      status: "Cancelled",
    },
  ];

  return (
    <div className="dash">
      {/* KPI row */}
      <div className="row kpis">
        {kpis.map((k, idx) => (
          <div className="card kpi" key={idx}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
            <div
              className={`kpi-delta ${k.delta.startsWith("-") ? "neg" : ""}`}
            >
              {k.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Middle grid: Patient Overview (bars), Revenue (line), Calendar */}
      <div className="row">
        <div className="card flex-2">
          <div className="card-h">
            Patient Overview <span className="sub">by Stage</span>
            <div className="seg">
              <span className="dot dot-a" /> Child
              <span className="dot dot-b" /> Adult
              <span className="dot dot-c" /> Elderly
            </div>
          </div>
          <div className="mini-bars">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bar">
                <span style={{ height: `${30 + (i % 5) * 14}px` }} />
              </div>
            ))}
          </div>
        </div>
        <div className="card flex-2">
          <div className="card-h">
            Revenue
            <div className="seg right">
              <span className="chip">Week</span>
              <span className="chip ghost">Month</span>
              <span className="chip ghost">Year</span>
            </div>
          </div>
          <div className="mini-line">
            {Array.from({ length: 22 }).map((_, i) => (
              <span key={i} style={{ height: `${18 + (i % 7) * 8}px` }} />
            ))}
          </div>
        </div>
        <div className="card flex-1">
          <div className="card-h">July 2028</div>
          <div className="calendar">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className={`cell ${i === 10 ? "today" : ""}`}>
                {(i + 1) % 31 || ""}
              </div>
            ))}
          </div>
          <div className="events">
            <div className="event green">Morning Staff Meeting</div>
            <div className="event teal">
              Patient Consultation – General Medicine
            </div>
            <div className="event blue">Surgery – Orthopedics</div>
            <div className="event gray">Training Session</div>
          </div>
        </div>
      </div>

      {/* Lower grid: Pie + Doctor schedule + Report + Appointments + Activity */}
      <div className="row">
        <div className="card flex-2">
          <div className="card-h">
            Patient Overview <span className="sub">by Departments</span>
          </div>
          <div className="pie-wrap">
            <div className="pie">
              <div className="pie-hole">
                1,890
                <br />
                <span>This Week</span>
              </div>
            </div>
            <ul className="legend">
              <li>
                <span className="dot dot-a" /> Emergency Medicine <b>35%</b>
              </li>
              <li>
                <span className="dot dot-d" /> General Medicine <b>28%</b>
              </li>
              <li>
                <span className="dot dot-b" /> Internal Medicine <b>20%</b>
              </li>
              <li>
                <span className="dot dot-c" /> Other Departments <b>17%</b>
              </li>
            </ul>
          </div>
        </div>
        <div className="col">
          <div className="card">
            <div className="card-h">Doctors' Schedule</div>
            <ul className="list">
              {schedule.map((s, i) => (
                <li key={i}>
                  <div className="list-main">
                    <div className="avatar">
                      {s.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <div className="l1">{s.name}</div>
                      <div className="l2">
                        {s.spec} • {s.time}
                      </div>
                    </div>
                  </div>
                  <span className="pill ghost">{s.tag}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <div className="card-h">Report</div>
            <ul className="list">
              {[
                "Room Cleaning Needed",
                "Equipment Maintenance",
                "Medication Restock",
                "Patient Transport Required",
              ].map((t, i) => (
                <li key={i}>
                  <div className="list-main">
                    <div className="dot dot-b" />
                    <div>
                      <div className="l1">{t}</div>
                      <div className="l2">Today</div>
                    </div>
                  </div>
                  <button className="btn ghost sm">View</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="card flex-2">
          <div className="card-h">Patient Appointment</div>
          <table className="table mini">
            <thead>
              <tr>
                <th>Name</th>
                <th>Date</th>
                <th>Time</th>
                <th>Doctor</th>
                <th>Treatment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appts.map((a, i) => (
                <tr key={i}>
                  <td>{a.name}</td>
                  <td>{a.date}</td>
                  <td>{a.time}</td>
                  <td>{a.doctor}</td>
                  <td>{a.type}</td>
                  <td>
                    <span className={`pill ${a.status.toLowerCase()}`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card flex-1">
          <div className="card-h">Recent Activity</div>
          <ul className="feed">
            {activities.map((a, i) => (
              <li key={i}>
                <span className="feed-dot" />
                <div className="feed-body">
                  <div className="l1">{a.text}</div>
                  <div className="l2">{a.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const css = `
:root{
  --bg:#f5f7fb; --panel:#ffffff; --line:#e6e9f1; --muted:#7a8aa0; --text:#1d2b3a;
  --brand:#1fbf8f; --brand-900:#0f7b62; --accent:#2f6fed; --warn:#f4a534; --danger:#f06565;
}
*{box-sizing:border-box}
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
.topbar{height:64px;background:#ffffff;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;padding:0 16px}
.search{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid var(--line);border-radius:999px;padding:8px 12px;min-width:320px}
.magnify{width:16px;height:16px;border-radius:50%;background:#8fa3bf;display:inline-block}
.r{display:flex;align-items:center;gap:10px}
.flag{width:28px;height:18px;border-radius:4px;background:#eaeef7;border:1px solid var(--line)}
.user{display:flex;align-items:center;gap:8px;background:#f3f6fb;border:1px solid var(--line);padding:6px 10px;border-radius:999px}
.color-dot{width:10px;height:10px;border-radius:50%;background:var(--brand)}
.name{color:#0f2542;font-weight:600}
.caret{color:#8091a7}

.content{padding:16px}
.dash{max-width:1200px;margin:0 auto;display:flex;flex-direction:column;gap:16px}
.row{display:grid;grid-template-columns:2fr 2fr 1.5fr;gap:16px}
.kpis{grid-template-columns:repeat(4,1fr)}
.card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px}
.card-h{font-weight:800;color:#11233d;display:flex;align-items:center;justify-content:space-between}
.sub{color:#7a8aa0;font-weight:600;margin-left:6px}

.kpi .kpi-label{color:#7a8aa0;font-size:12px}
.kpi .kpi-value{font-size:22px;font-weight:800;margin-top:4px}
.kpi .kpi-delta{margin-top:4px;color:#0b705a;font-weight:700}
.kpi .kpi-delta.neg{color:#8c2f2f}

.mini-bars{height:160px;display:flex;align-items:flex-end;gap:12px;margin-top:8px}
.mini-bars .bar{flex:1;background:#f4f7ff;border-radius:10px;display:flex;align-items:flex-end;overflow:hidden;border:1px solid var(--line)}
.mini-bars .bar span{display:block;width:100%;background:linear-gradient(180deg,#2f6fed,#9ab4ff)}

.mini-line{height:160px;display:flex;align-items:flex-end;gap:6px;margin-top:8px}
.mini-line span{flex:1;background:linear-gradient(180deg,#1fbf8f,#a6f2d9);border-radius:6px}

.flex-1{grid-column:span 1}
.flex-2{grid-column:span 2}

.calendar{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-top:6px}
.cell{height:28px;border-radius:8px;display:grid;place-items:center;background:#f7f9ff;border:1px solid var(--line);font-size:12px}
.cell.today{background:#e6fff6;border-color:#94f3da}
.events{display:flex;flex-direction:column;gap:6px;margin-top:8px}
.event{padding:8px 10px;border-radius:10px;border:1px solid var(--line);background:#f6faff;color:#183a6c}
.event.green{background:#e6fff6;color:#0b614f;border-color:#94f3da}
.event.teal{background:#eefcfe;color:#116277;border-color:#b2edf6}
.event.blue{background:#edf3ff;color:#294a86;border-color:#c8d7ff}
.event.gray{background:#f5f7fb;color:#5b6a82}

.pie-wrap{display:flex;gap:14px;align-items:center}
.pie{width:180px;height:180px;border-radius:50%;background:conic-gradient(#1fbf8f 0 35%, #2f6fed 0 63%, #ffd166 0 83%, #cfd8ea 0 100%);position:relative}
.pie-hole{position:absolute;inset:24px;border-radius:50%;background:#fff;display:grid;place-items:center;text-align:center;font-weight:800;color:#11233d}
.pie-hole span{display:block;font-size:11px;color:#7a8aa0;font-weight:600}
.legend{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.legend li{display:flex;align-items:center;gap:8px;color:#11233d}
.dot{width:10px;height:10px;border-radius:50%;display:inline-block}
.dot-a{background:#1fbf8f}
.dot-b{background:#2f6fed}
.dot-c{background:#ffd166}
.dot-d{background:#a7d4c7}

.list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
.list li{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid var(--line);border-radius:12px;padding:10px;background:#f7faff}
.list .avatar{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#5b8cff,#9ab4ff);display:grid;place-items:center;font-weight:800;color:#0b1020}
.l1{font-weight:700}
.l2{color:#7a8aa0;font-size:12px}
.pill{padding:6px 10px;border-radius:999px;font-size:12px;border:1px solid var(--line);background:#fff}
.pill.ghost{background:#fff}

.table{width:100%;border-collapse:separate;border-spacing:0 8px}
.table th{color:#7a8aa0;text-align:left;font-size:12px;padding:0 8px}
.table td{background:#f7faff;border:1px solid var(--line);padding:8px;border-left:none;border-right:none}
.table tr td:first-child{border-top-left-radius:10px;border-bottom-left-radius:10px;border-left:1px solid var(--line)}
.table tr td:last-child{border-top-right-radius:10px;border-bottom-right-radius:10px;border-right:1px solid var(--line)}
.pill.confirmed{background:#e7fbf5;color:#0b705a;border-color:#9ae9d5}
.pill.pending{background:#fff7e9;color:#915e07;border-color:#ffd89a}
.pill.cancelled{background:#ffecec;color:#8c2f2f;border-color:#ffb2b2}

.feed{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}
.feed li{display:flex;gap:10px;align-items:flex-start}
.feed-dot{width:10px;height:10px;border-radius:50%;background:#1fbf8f;margin-top:6px}
.feed-body .l1{font-weight:600;color:#11233d}
.feed-body .l2{font-size:12px;color:#7a8aa0}

@media (max-width: 1200px){
  .shell{grid-template-columns:88px 1fr}
  .brand-n{display:none}
  .row{grid-template-columns:1fr}
  .flex-2,.flex-1{grid-column:auto}
}
`;
