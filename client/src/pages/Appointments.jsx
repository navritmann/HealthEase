import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";
import api from "../api/axios";

const Appointment = () => {
  const [form, setForm] = useState({
    doctorId: "",
    slotDate: "",
    slotTime: "",
  });
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const resDoctors = await api.get("/auth/doctors");
      setDoctors(resDoctors.data);
      const resAppointments = await api.get("/appointments");
      setAppointments(resAppointments.data);
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      console.log(user);

      const patientId = user?.id;

      await api.post("/appointments", {
        patientId,
        doctorId: form.doctorId,
        slot: { date: form.slotDate, time: form.slotTime },
      });

      alert("Appointment booked successfully!");
      // Optional: refresh appointments list
      const resAppointments = await api.get("/appointments");
      setAppointments(resAppointments.data);
    } catch (err) {
      alert(err.response?.data?.msg || "Error booking appointment");
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3} fontWeight="bold">
        Book an Appointment
      </Typography>

      <Card sx={{ maxWidth: 600, mb: 4 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <TextField
              select
              label="Select Doctor"
              name="doctorId"
              fullWidth
              margin="normal"
              value={form.doctorId}
              onChange={handleChange}
            >
              {doctors.map((doc) => (
                <MenuItem key={doc._id} value={doc._id}>
                  {doc.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Date"
              name="slotDate"
              type="date"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              value={form.slotDate}
              onChange={handleChange}
            />
            <TextField
              label="Time"
              name="slotTime"
              type="time"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              value={form.slotTime}
              onChange={handleChange}
            />

            <Button variant="contained" type="submit" fullWidth sx={{ mt: 2 }}>
              Book Appointment
            </Button>
          </form>
        </CardContent>
      </Card>

      <Typography variant="h5" mb={2}>
        Your Appointments
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Doctor</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {appointments.map((a) => (
            <TableRow key={a._id}>
              <TableCell>{a.doctorId?.name}</TableCell>
              <TableCell>{a.slot?.date}</TableCell>
              <TableCell>{a.slot?.time}</TableCell>
              <TableCell>{a.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default Appointment;
