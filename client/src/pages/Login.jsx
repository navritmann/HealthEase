import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  Stack,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Divider,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff, ArrowForward } from "@mui/icons-material";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import GoogleIcon from "@mui/icons-material/Google";
import AppleIcon from "@mui/icons-material/Apple";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login() {
  const navigate = useNavigate();

  // keep role for backend (hidden in UI to match design)
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "patient",
  });

  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const remembered = localStorage.getItem("rememberEmail");
    if (remembered) {
      setForm((s) => ({ ...s, email: remembered }));
      setRemember(true);
    }
  }, []);

  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      // if your backend DOESN'T require role, send only {email,password}
      const payload = {
        email: form.email,
        password: form.password,
        role: form.role,
      };
      const { data } = await api.post("/auth/login", payload);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.user.role);
      if (remember) localStorage.setItem("rememberEmail", form.email);
      else localStorage.removeItem("rememberEmail");

      // admins have a separate page; others to dashboard
      if (data.user.role === "admin") navigate("/admin/login");
      else navigate("/");
    } catch (err) {
      setError(err?.response?.data?.msg || "Invalid credentials");
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
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, // left form / right image
          backgroundColor: "white",
        }}
      >
        {/* LEFT — FORM */}
        <CardContent sx={{ p: { xs: 3, sm: 5, md: 6 } }}>
          <Typography variant="h4" fontWeight={800} mb={3}>
            Login
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={onSubmit} noValidate>
            <Stack spacing={2}>
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
                        aria-label="toggle password visibility"
                        onClick={() => setShowPass((s) => !s)}
                        edge="end"
                      >
                        {showPass ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* remember + forgot in one row */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                {/* <FormControlLabel
                  control={
                    <Checkbox
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                  }
                  label="Remember me"
                /> */}
                {/* <Link to="/forgot-password" style={{ fontSize: 14 }}>
                  Forgot Password
                </Link> */}
              </Stack>

              {/* big rounded CTA like mock */}
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                endIcon={<ArrowForward />}
                sx={{
                  mt: 1,
                  py: 1.6,
                  borderRadius: 999,
                  textTransform: "none",
                  fontSize: 16,
                  fontWeight: 700,
                  backgroundColor: "#0B3B4A", // deep teal from mock
                  "&:hover": { backgroundColor: "#092F3A" },
                }}
                fullWidth
              >
                {loading ? "Logging in..." : "Login"}
              </Button>

              {/* already have account / login text */}
              <Typography textAlign="center" mt={1} fontSize={14}>
                Don’t have an account? <Link to="/register">Register</Link>
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="left"
                sx={{ mt: 1 }}
              >
                Login to access your Healthease account
              </Typography>
            </Stack>
          </form>
        </CardContent>

        {/* RIGHT — IMAGE PANEL */}
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            position: "relative",
            p: 3,
            background: "#ffffff",
          }}
        >
          <Box
            component="img"
            src="/images/doctor-hero.png"
            alt="Doctor greeting patient"
            sx={{
              width: "100%",
              height: "100%",
              maxHeight: 620,
              objectFit: "cover",
              borderRadius: 4,
              display: "block",
            }}
          />
          {/* small slider dots like mock */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              position: "absolute",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
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
                bgcolor: "#ffffff",
                opacity: 0.8,
                borderRadius: "50%",
              }}
            />
            <Box
              sx={{
                width: 6,
                height: 6,
                bgcolor: "#ffffff",
                opacity: 0.8,
                borderRadius: "50%",
              }}
            />
          </Stack>
        </Box>
      </Card>
    </Box>
  );
}
