import React from "react";
import { Button } from "@mui/material";

const Dashboard = () => {
  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Welcome to HealthEase Dashboard</h2>
      <Button variant="contained" color="secondary" onClick={logout}>
        Logout
      </Button>
    </div>
  );
};

export default Dashboard;
