import React from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import "./admin.css";

export default function AdminLayout({ children }) {
  return (
    <div className="shell">
      <AdminSidebar />
      <main className="main">
        <AdminTopbar />
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
