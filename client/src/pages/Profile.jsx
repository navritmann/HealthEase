// src/pages/Profile.jsx
import React from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Card,
  CardContent,
  Avatar,
  Divider,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Profile() {
  const navigate = useNavigate();
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const token = localStorage.getItem("token");
  const role = user?.role || localStorage.getItem("role");
  const isLoggedIn = !!token && !!user;

  const initials = (user?.firstName || user?.name || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!isLoggedIn) {
    return (
      <>
        <Navbar />
        <Box
          sx={{
            minHeight: "100vh",
            bgcolor: "#f8fafa",
            pt: { xs: 10, md: 12 },
            pb: { xs: 6, md: 8 },
          }}
        >
          <Container maxWidth="sm" sx={{ textAlign: "center", mt: 6 }}>
            <Typography variant="h5" fontWeight={700} mb={1}>
              You’re not signed in
            </Typography>
            <Typography color="text.secondary" mb={3}>
              Please sign in to view your profile and manage your bookings.
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center">
              <Button variant="contained" onClick={() => navigate("/login")}>
                Sign in
              </Button>
              <Button variant="outlined" onClick={() => navigate("/register")}>
                Create account
              </Button>
            </Stack>
          </Container>
        </Box>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#f8fafa",
          pt: { xs: 10, md: 12 },
          pb: { xs: 6, md: 8 },
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="h4" fontWeight={800} mb={3}>
            My Profile
          </Typography>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: "0 18px 60px rgba(15, 23, 42, 0.10)",
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2.5}
                alignItems={{ xs: "flex-start", sm: "center" }}
                mb={2.5}
              >
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: "#0aa07a",
                    fontSize: 28,
                    fontWeight: 700,
                  }}
                >
                  {initials}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {user?.firstName || user?.name || "Your name"}
                  </Typography>
                  {user?.lastName && (
                    <Typography fontWeight={500}>
                      {user.firstName} {user.lastName}
                    </Typography>
                  )}
                  <Typography
                    fontSize={13}
                    color="text.secondary"
                    sx={{ textTransform: "capitalize", mt: 0.5 }}
                  >
                    {role || "patient"}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1.5}>
                <FieldRow label="Email" value={user?.email} />
                <FieldRow label="Phone" value={user?.phone || "Not provided"} />
              </Stack>

              {/* For future edit functionality */}
              {/* <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 3, textTransform: "none", borderRadius: 999 }}
                onClick={() => {}}
              >
                Edit profile (coming soon)
              </Button> */}
            </CardContent>
          </Card>
        </Container>
      </Box>
      <Footer />
    </>
  );
}

function FieldRow({ label, value }) {
  return (
    <Stack
      direction="row"
      spacing={1}
      justifyContent="space-between"
      sx={{ fontSize: 14 }}
    >
      <Typography color="text.secondary" sx={{ minWidth: 100 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 500, textAlign: "right" }}>
        {value || "—"}
      </Typography>
    </Stack>
  );
}
