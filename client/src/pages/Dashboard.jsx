import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h4" mb={2}>
        Welcome to HealthEase {role === "doctor" ? "Doctor" : "User"} Dashboard
      </Typography>

      <Typography variant="h6" mb={4}>
        Hello, {user?.name || "User"} 👋
      </Typography>

      {role === "patient" && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/appointments")}
          sx={{ mr: 2 }}
        >
          Book Appointment
        </Button>
      )}

      {role === "doctor" && (
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate("/appointments")}
          sx={{ mr: 2 }}
        >
          View Appointments
        </Button>
      )}

      <Button variant="outlined" color="error" onClick={handleLogout}>
        Logout
      </Button>
    </Box>
  );
}

export default Dashboard;
