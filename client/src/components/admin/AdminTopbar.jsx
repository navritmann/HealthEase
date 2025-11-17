import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminTopbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropRef = useRef(null);

  /** CLOSE DROPDOWN ON OUTSIDE CLICK **/
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const handleLogout = () => {
    [
      "adminToken",
      "admintoken",
      "token",
      "accessToken",
      "role",
      "user",
    ].forEach((k) => localStorage.removeItem(k));

    navigate("/admin/login");
  };

  return (
    <header className="topbar">
      <div
        className="r"
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* Notification icon */}
        <button className="icon-btn" title="Notifications" />

        {/* USER DROPDOWN */}
        <div
          ref={dropRef}
          className="user"
          style={{
            position: "relative",
            marginLeft: 16,
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            gap: 6,
          }}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="color-dot" />
          <span className="name" style={{ fontSize: 14, fontWeight: 600 }}>
            Admin
          </span>
          <span className="caret" style={{ marginLeft: 4 }}>
            ▾
          </span>

          {/* DROPDOWN */}
          {open && (
            <div
              className="dropdown"
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                background: "#fff",
                border: "1px solid #d7def0",
                borderRadius: 10,
                boxShadow: "0 8px 28px rgba(0,0,0,0.08)",
                minWidth: 160,
                padding: "6px 0",
                zIndex: 9999,
              }}
            >
              <button
                className="dropdown-item"
                onClick={handleLogout}
                style={{
                  ...dropdownItem,
                  color: "#d93636",
                  fontWeight: 700,
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* Reusable dropdown button styles */
const dropdownItem = {
  width: "100%",
  padding: "10px 16px",
  textAlign: "left",
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 14,
  lineHeight: "18px",
  color: "#11233d",
  display: "block",
};
