import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, MenuItem, Typography } from "@mui/material";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", form);
      alert("Registration successful!");
      navigate("/login");
    } catch (err) {
      alert("Error: " + err.response?.data?.msg);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      flexDirection="column"
    >
      <Typography variant="h4" gutterBottom>
        Register
      </Typography>
      <form onSubmit={handleSubmit} style={{ width: "300px" }}>
        <TextField
          name="name"
          label="Name"
          fullWidth
          margin="normal"
          onChange={handleChange}
          required
        />
        <TextField
          name="email"
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          onChange={handleChange}
          required
        />
        <TextField
          name="password"
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          onChange={handleChange}
          required
        />
        <TextField
          select
          name="role"
          label="Role"
          fullWidth
          margin="normal"
          onChange={handleChange}
          value={form.role}
        >
          <MenuItem value="patient">Patient</MenuItem>
          <MenuItem value="doctor">Doctor</MenuItem>
        </TextField>
        <Button variant="contained" color="primary" fullWidth type="submit">
          Register
        </Button>
      </form>
    </Box>
  );
}

export default Register;
