// src/pages/MyAppointments.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  Chip,
  Button,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api/axios";

export default function MyAppointments() {
  const navigate = useNavigate();
  const isXs = useMediaQuery("(max-width:600px)");

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  // auth
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("admintoken");

  const role = user?.role || localStorage.getItem("role");

  // Fallbacks: if we don't have patientId yet, use user.id / _id
  const patientId = user?.patientId || user?.id || user?._id || null;

  // Don't block UI just because patientId is missing
  const isPatient = !!token && role === "patient";

  useEffect(() => {
    if (!isPatient) {
      setLoading(false);
      setError("Please sign in as a patient to view your appointments.");
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get(`/appointments/patient/${patientId}`);
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(
          e?.response?.data?.error || "Failed to load your appointments."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isPatient, patientId]);

  const reloadAppointments = async () => {
    try {
      const { data } = await api.get(`/appointments/patient/${patientId}`);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to load your appointments.");
    }
  };

  const handleReschedule = async (row) => {
    // only allow rescheduling for non-cancelled future-ish appointments
    if (!row?.id) return;

    const currentIso = row.date ? new Date(row.date).toISOString() : "";

    const input = window.prompt(
      "Enter new start date & time in ISO format (e.g. 2025-11-16T10:00:00Z):",
      currentIso
    );
    if (!input) return;

    try {
      await api.post(`/appointments/${row.id}/reschedule`, {
        start: input,
      });
      await reloadAppointments();
      alert("Appointment rescheduled successfully.");
    } catch (e) {
      alert(e?.response?.data?.error || "Reschedule failed");
    }
  };

  const getStatusColor = (status) => {
    const v = String(status || "").toLowerCase();
    if (v === "confirmed") return "success";
    if (v === "held") return "warning";
    if (v === "cancelled") return "error";
    if (v === "rescheduled") return "info";
    return "default";
  };

  return (
    <>
      <Navbar />
      <Box
        sx={{
          bgcolor: "#f8fafa",
          minHeight: "100vh",
          pt: { xs: 10, md: 12 },
          pb: { xs: 6, md: 8 },
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={2} mb={3}>
            <Typography variant="h4" fontWeight={800}>
              My Appointments
            </Typography>
            <Typography color="text.secondary" fontSize={14}>
              View your upcoming and past visits, join virtual sessions, or
              review your booking details.
            </Typography>
          </Stack>

          {!isPatient && (
            <Box textAlign="center" mt={4}>
              <Typography sx={{ mb: 2 }}>{error}</Typography>
              <Stack direction="row" spacing={1} justifyContent="center">
                <Button variant="contained" onClick={() => navigate("/login")}>
                  Sign in
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/register")}
                >
                  Create account
                </Button>
              </Stack>
            </Box>
          )}

          {isPatient && loading && (
            <Box textAlign="center" mt={4}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Loading your appointments…</Typography>
            </Box>
          )}

          {isPatient && !loading && !rows.length && !error && (
            <Box textAlign="center" mt={4}>
              <Typography sx={{ mb: 2 }}>
                You have no appointments yet.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate("/appointments")}
              >
                Book your first appointment
              </Button>
            </Box>
          )}

          {isPatient && !loading && error && (
            <Box textAlign="center" mt={4}>
              <Typography color="error">{error}</Typography>
            </Box>
          )}

          {isPatient && !loading && rows.length > 0 && (
            <Stack spacing={2} mt={2}>
              {rows.map((r) => {
                const date = r.date ? new Date(r.date) : null;
                const dateLabel = date
                  ? date.toLocaleDateString()
                  : "Unknown date";
                const timeLabel = date
                  ? date.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "";

                const typeLabel =
                  r.type === "video"
                    ? "Video"
                    : r.type === "audio"
                    ? "Audio"
                    : r.type === "chat"
                    ? "Live Chat"
                    : "Clinic Visit";

                return (
                  <Card
                    key={r.id}
                    sx={{
                      borderRadius: 3,
                      boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                    }}
                  >
                    <CardContent
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "flex-start", sm: "center" },
                        gap: 2,
                      }}
                    >
                      <Box sx={{ flexGrow: 1 }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          mb={0.5}
                        >
                          <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            sx={{ mr: 1 }}
                          >
                            {r.doctor || "Doctor TBD"}
                          </Typography>
                          <Chip
                            label={typeLabel}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                        <Typography fontSize={13} color="text.secondary">
                          Booking #{r.bookingNo || "—"}
                        </Typography>
                        <Typography fontSize={13} mt={0.5}>
                          {dateLabel} · {timeLabel}
                        </Typography>
                        {r.clinic && (
                          <Typography
                            fontSize={12}
                            color="text.secondary"
                            mt={0.5}
                          >
                            {r.clinic}
                          </Typography>
                        )}
                      </Box>

                      <Stack
                        spacing={1}
                        direction={{ xs: "row", sm: "column" }}
                        alignItems={{ xs: "flex-end", sm: "flex-end" }}
                        sx={{ minWidth: { xs: 0, sm: 180 } }}
                      >
                        <Chip
                          label={r.status || "unknown"}
                          size="small"
                          color={getStatusColor(r.status)}
                          sx={{ textTransform: "capitalize" }}
                        />

                        {/* Reschedule button for confirmed/rescheduled appointments */}
                        {["confirmed", "rescheduled"].includes(
                          String(r.status || "").toLowerCase()
                        ) && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleReschedule(r)}
                            sx={{
                              textTransform: "none",
                              borderRadius: 999,
                              fontSize: 13,
                              borderColor: "#0aa07a",
                              color: "#0aa07a",
                              "&:hover": {
                                borderColor: "#088a69",
                                backgroundColor: "rgba(10,160,122,0.06)",
                              },
                            }}
                          >
                            Reschedule
                          </Button>
                        )}
                        {r.videoJoin && (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() =>
                              window.open(r.videoJoin, "_blank", "noopener")
                            }
                            sx={{
                              textTransform: "none",
                              borderRadius: 999,
                              fontSize: 13,
                              bgcolor: "#0aa07a",
                              "&:hover": { bgcolor: "#088a69" },
                            }}
                          >
                            Join Session
                          </Button>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Container>
      </Box>
      <Footer />
    </>
  );
}
