import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  MenuItem,
} from "@mui/material";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    slotDate: "",
    slotTime: "",
  });

  const [users, setUsers] = useState([]); // for dropdowns
  const token = localStorage.getItem("token");

  // ✅ Fetch all appointments
  const fetchAppointments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/appointments", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setAppointments(res.data);
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err.message);
    }
  };

  // ✅ Fetch all users (optional for dropdowns)
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("User fetch error:", err.response?.data || err.message);
    }
  };

  // ✅ Add new appointment
  const addAppointment = async () => {
    if (!form.patientId || !form.doctorId || !form.slotDate || !form.slotTime) {
      alert("Please fill all fields.");
      return;
    }

    const payload = {
      patientId: form.patientId,
      doctorId: form.doctorId,
      slot: {
        date: form.slotDate,
        time: form.slotTime,
      },
    };

    try {
      console.log("Sending payload:", payload);
      const res = await axios.post(
        "http://localhost:5000/api/appointments",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Add response:", res.data);
      setForm({ patientId: "", doctorId: "", slotDate: "", slotTime: "" });
      fetchAppointments();
    } catch (err) {
      console.error("Add error:", err.response?.data || err.message);
      alert(
        "Failed to add appointment: " + (err.response?.data?.msg || err.message)
      );
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchUsers();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" mb={3}>
        Manage Appointments
      </Typography>

      {/* Add Form */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr) auto",
          gap: 2,
          alignItems: "center",
        }}
      >
        {/* Patient Dropdown */}
        <TextField
          select
          label="Select Patient"
          value={form.patientId}
          onChange={(e) => setForm({ ...form, patientId: e.target.value })}
        >
          {users.map((u) => (
            <MenuItem key={u._id} value={u._id}>
              {u.name} ({u.email})
            </MenuItem>
          ))}
        </TextField>

        {/* Doctor Dropdown */}
        <TextField
          select
          label="Select Doctor"
          value={form.doctorId}
          onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
        >
          {users
            .filter((u) => u.role === "doctor")
            .map((u) => (
              <MenuItem key={u._id} value={u._id}>
                Dr. {u.name}
              </MenuItem>
            ))}
        </TextField>

        {/* Date */}
        <TextField
          type="date"
          label="Date"
          InputLabelProps={{ shrink: true }}
          value={form.slotDate}
          onChange={(e) => setForm({ ...form, slotDate: e.target.value })}
        />

        {/* Time */}
        <TextField
          label="Time"
          placeholder="e.g. 10:30 AM"
          value={form.slotTime}
          onChange={(e) => setForm({ ...form, slotTime: e.target.value })}
        />

        {/* Add Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={addAppointment}
          sx={{ height: "56px" }}
        >
          Add
        </Button>
      </Paper>

      {/* List of Appointments */}
      {appointments.length > 0 ? (
        appointments.map((appt) => (
          <Paper
            key={appt._id}
            sx={{
              p: 2,
              mb: 2,
              border: "1px solid #ccc",
              borderRadius: 2,
            }}
          >
            <Typography>
              <strong>Patient:</strong> {appt.patientId?.name || appt.patientId}
            </Typography>
            <Typography>
              <strong>Doctor:</strong> Dr.{" "}
              {appt.doctorId?.name || appt.doctorId}
            </Typography>
            <Typography>
              <strong>Date:</strong>{" "}
              {appt.slot?.date
                ? new Date(appt.slot.date).toLocaleDateString()
                : "N/A"}
            </Typography>
            <Typography>
              <strong>Time:</strong> {appt.slot?.time}
            </Typography>
            <Typography>
              <strong>Status:</strong> {appt.status}
            </Typography>
          </Paper>
        ))
      ) : (
        <Typography color="text.secondary">No appointments found.</Typography>
      )}
    </Box>
  );
};

export default Appointments;
