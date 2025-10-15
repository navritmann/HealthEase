import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  Paper,
  Select,
  MenuItem,
  TextField,
  Grid,
} from "@mui/material";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
  });
  const token = localStorage.getItem("adminToken");

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Fetch users error:", err.response?.data || err.message);
    }
  };

  const addUser = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/register", newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("User added successfully!");
      setNewUser({ name: "", email: "", password: "", role: "patient" });
      fetchUsers();
    } catch (err) {
      alert("Failed to add user");
      console.error(err.response?.data || err.message);
    }
  };

  const updateRole = async (id, role) => {
    await axios.put(
      `http://localhost:5000/api/admin/users/${id}`,
      { role },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchUsers();
  };

  const deleteUser = async (id) => {
    await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchUsers();
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" mb={2}>
        Admin Panel – User Management
      </Typography>

      <Button
        variant="contained"
        color="secondary"
        sx={{ mb: 3 }}
        onClick={handleLogout}
      >
        Logout
      </Button>

      {/* 🔹 Summary cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6">Total Users</Typography>
            <Typography variant="h4">{users.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6">Doctors</Typography>
            <Typography variant="h4">
              {users.filter((u) => u.role === "doctor").length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6">Patients</Typography>
            <Typography variant="h4">
              {users.filter((u) => u.role === "patient").length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* 🔹 Add new user form */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" mb={2}>
          Add New User
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            label="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <TextField
            label="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <TextField
            label="Password"
            type="password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
          />
          <Select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            <MenuItem value="patient">Patient</MenuItem>
            <MenuItem value="doctor">Doctor</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
          <Button variant="contained" onClick={addUser}>
            Add
          </Button>
        </Box>
      </Paper>

      {/* 🔹 User list */}
      {users.length === 0 ? (
        <Typography>No users found</Typography>
      ) : (
        users.map((u) => (
          <Paper
            key={u._id}
            sx={{
              p: 2,
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography>
                <strong>Name:</strong> {u.name}
              </Typography>
              <Typography>
                <strong>Email:</strong> {u.email}
              </Typography>
              <Typography>
                <strong>Role:</strong> {u.role}
              </Typography>
            </Box>
            <Box>
              <Select
                value={u.role}
                onChange={(e) => updateRole(u._id, e.target.value)}
                sx={{ mr: 2 }}
              >
                <MenuItem value="patient">Patient</MenuItem>
                <MenuItem value="doctor">Doctor</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
              <Button
                variant="outlined"
                color="error"
                onClick={() => deleteUser(u._id)}
              >
                Delete
              </Button>
            </Box>
          </Paper>
        ))
      )}
    </Box>
  );
}
