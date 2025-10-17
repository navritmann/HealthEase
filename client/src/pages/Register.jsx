// src/pages/Register.jsx
import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Grid,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Divider,
  Alert,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import GoogleIcon from "@mui/icons-material/Google";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "patient", // hidden in UI to match mock
    agree: false,
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.agree)
      return setErr("Please agree to the Terms and Privacy Policies.");
    if (form.password !== form.confirmPassword)
      return setErr("Passwords do not match.");

    try {
      setLoading(true);
      const payload = {
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone, // backend can ignore if unused
      };
      await api.post("/auth/register", payload);
      navigate("/login");
    } catch (e2) {
      setErr(e2?.response?.data?.msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#F5F7FA",
        display: "grid",
        placeItems: "center",
        p: { xs: 2, md: 4 },
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 1200,
          borderRadius: 5,
          overflow: "hidden",
          boxShadow: "0 18px 60px rgba(16, 24, 40, 0.10)",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1.2fr" }, // image / form
          backgroundColor: "white",
        }}
      >
        {/* LEFT — IMAGE */}
        <Box sx={{ display: { xs: "none", md: "block" }, p: 3 }}>
          <Box
            component="img"
            src="/images/register-hero.png"
            alt="Doctor with patient"
            sx={{
              width: "100%",
              height: "100%",
              maxHeight: 640,
              objectFit: "cover",
              borderRadius: 4,
              display: "block",
            }}
          />
          {/* dots */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ mt: 1.5, justifyContent: "center" }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                bgcolor: "white",
                opacity: 0.8,
                borderRadius: "50%",
              }}
            />
            <Box
              sx={{
                width: 22,
                height: 6,
                bgcolor: "#325F88",
                borderRadius: 999,
              }}
            />
            <Box
              sx={{
                width: 6,
                height: 6,
                bgcolor: "white",
                opacity: 0.8,
                borderRadius: "50%",
              }}
            />
          </Stack>
        </Box>

        {/* RIGHT — FORM */}
        <CardContent sx={{ p: { xs: 3, sm: 5, md: 6 } }}>
          <Typography variant="h4" fontWeight={800} mb={1.5}>
            Sign up
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Let’s get you all set up so you can access your personal account.
          </Typography>

          {err && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {err}
            </Alert>
          )}

          <form onSubmit={onSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="First Name"
                  name="firstName"
                  placeholder="john.doe@gmail.com"
                  value={form.firstName}
                  onChange={onChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Last Name"
                  name="lastName"
                  placeholder="john.doe@gmail.com"
                  value={form.lastName}
                  onChange={onChange}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="john.doe@gmail.com"
                  value={form.email}
                  onChange={onChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone Number"
                  name="phone"
                  placeholder="123-456-7890"
                  value={form.phone}
                  onChange={onChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={onChange}
                  fullWidth
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPass((s) => !s)}
                          edge="end"
                        >
                          {showPass ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={onChange}
                  fullWidth
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirm((s) => !s)}
                          edge="end"
                        >
                          {showConfirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <FormControlLabel
              sx={{ mt: 1.5 }}
              control={
                <Checkbox
                  checked={form.agree}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, agree: e.target.checked }))
                  }
                />
              }
              label={
                <Typography variant="body2">
                  I agree to all the <Link to="/terms">Terms</Link> and{" "}
                  <Link to="/privacy">Privacy Policies</Link>
                </Typography>
              }
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                mt: 2,
                py: 1.6,
                borderRadius: 999,
                textTransform: "none",
                fontSize: 16,
                fontWeight: 700,
                backgroundColor: "#0B3B4A",
                "&:hover": { backgroundColor: "#092F3A" },
              }}
              fullWidth
            >
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </form>

          <Typography textAlign="center" mt={2} fontSize={14}>
            Already have an account? <Link to="/login">Login</Link>
          </Typography>

          <Divider sx={{ my: 2 }}>Or Sign up with</Divider>

          <Button
            variant="outlined"
            startIcon={<GoogleIcon />}
            fullWidth
            sx={{
              textTransform: "none",
              borderRadius: 2,
              py: 1.2,
            }}
            onClick={() => alert("Google sign-up coming soon")}
          >
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
