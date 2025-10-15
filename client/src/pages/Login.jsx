import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Box, Button, TextField, Typography } from "@mui/material";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        form
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("Login successful!");
      const user = res.data.user;

      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      alert("Invalid credentials");
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
        Login
      </Typography>

      <form onSubmit={handleSubmit} style={{ width: "300px" }}>
        <TextField
          name="email"
          label="Email"
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
        <Button variant="contained" color="primary" fullWidth type="submit">
          Login
        </Button>
      </form>

      <Typography variant="body2" sx={{ marginTop: 2 }}>
        Don’t have an account?{" "}
        <Link
          to="/register"
          style={{ color: "#1976D2", textDecoration: "none" }}
        >
          Register here
        </Link>
      </Typography>
    </Box>
  );
}

export default Login;
