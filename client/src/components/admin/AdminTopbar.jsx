import React from "react";

export default function AdminTopbar() {
  return (
    <header className="topbar">
      <div className="search">
        <span className="magnify" />
        <input placeholder="Search anything" />
      </div>
      <div className="r">
        <button className="icon-btn" title="Notifications" />
        <div className="user">
          <span className="color-dot" />
          <span className="name">Admin</span>
          <span className="caret">▾</span>
        </div>
      </div>
    </header>
  );
}
