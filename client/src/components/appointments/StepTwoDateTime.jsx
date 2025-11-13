import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import api from "../../api/axios.js";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import Navbar from "../Navbar";
import Footer from "../Footer";

const MONTH = 9; // October
const YEAR = 2025;
const WEEK_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildCalendarGrid(y, m) {
  const first = new Date(y, m, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const prefix = Array.from({ length: startDay }, (_, i) => ({
    key: `p-${i}`,
    day: new Date(y, m, -startDay + i + 1).getDate(),
    muted: true,
  }));
  const main = Array.from({ length: daysInMonth }, (_, i) => ({
    key: `d-${i + 1}`,
    day: i + 1,
    muted: false,
  }));
  const total = prefix.length + main.length;
  const suffix = Array.from({ length: Math.max(0, 42 - total) }, (_, i) => ({
    key: `n-${i + 1}`,
    day: i + 1,
    muted: true,
  }));
  return [...prefix, ...main, ...suffix];
}

function SlotChip({ label, selected, disabled, onClick }) {
  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      sx={{
        minWidth: 76,
        px: 1.25,
        py: 0.75,
        borderRadius: 1.5,
        fontSize: 13,
        fontWeight: 700,
        textTransform: "none",
        bgcolor: selected ? "#0aa07a" : "#12B7D012",
        color: selected ? "#fff" : "#0aa07a",
        "&:hover": { bgcolor: selected ? "#088a69" : "#12B7D024" },
      }}
    >
      {label}
    </Button>
  );
}

export default function StepTwoDateTime({
  doctor,
  summary,
  context,
  services = [],
  selectedService,
  selectedAddOns = [],
  onSelectService,
  onToggleAddOn,
  onBack,
  onNext,
}) {
  const grid = useMemo(() => buildCalendarGrid(YEAR, MONTH), []);
  const [selectedDay, setSelectedDay] = useState(15);
  const [selectedTime, setSelectedTime] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const type = context?.appointmentType || "clinic";
  const clinicId = context?.clinicId || null;
  const doctorId = context?.doctorId || doctor?._id || null;
  const hvAddr = context?.homeVisitAddress || null;

  const dateISO = useMemo(
    () => new Date(YEAR, MONTH, selectedDay).toISOString().slice(0, 10),
    [selectedDay]
  );

  const typeHint = {
    clinic: "You’ll visit the selected clinic. Please arrive 10 minutes early.",
    video: "A secure video link will be sent before the visit.",
    audio: "You’ll join a secure, in-browser audio call at the selected time.",
    chat: "A live chat window will open at your appointment time.",
    home_visit:
      "We’ll visit your address; timing may vary slightly for travel.",
  }[type];

  // fetch slots
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const params = { type, date: dateISO, clinicId, doctorId };
        if (type === "home_visit" && hvAddr) Object.assign(params, hvAddr);
        const res = await api.get("/availability/slots", { params });
        const raw = res?.data;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : [];
        setSlots(list);
        if (!selectedTime) {
          const first = list.find((s) => s.available);
          if (first) setSelectedTime(first.time);
        }
      } catch (e) {
        setError("Failed to load slots");
        setSlots([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [dateISO, clinicId, doctorId, hvAddr, type]);

  const parseTime = (t) => {
    const m = String(t).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return null;
    let h = +m[1];
    const min = +m[2];
    if (m[3].toUpperCase() === "PM" && h !== 12) h += 12;
    if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
    return { h, min };
  };
  const toISO = (dStr, timeLabel) => {
    const p = parseTime(timeLabel);
    if (!p) return null;
    const d = new Date(`${dStr}T00:00:00`);
    d.setHours(p.h, p.min, 0, 0);
    return d.toISOString();
  };
  const addMinutes = (iso, mins) => {
    const d = new Date(iso);
    d.setMinutes(d.getMinutes() + mins);
    return d.toISOString();
  };

  const handleContinue = async () => {
    const startISO = toISO(dateISO, selectedTime);
    const endISO = addMinutes(startISO, 30);
    try {
      const body = {
        doctorId,
        clinicId,
        appointmentType: type,
        start: startISO,
        end: endISO,
      };
      const res = await api.post("/appointments/hold", body);
      onNext({
        dateISO,
        time: selectedTime,
        appointmentId: res.data?.id,
        bookingNo: res.data?.bookingNo,
      });
    } catch {
      onNext({ dateISO, time: selectedTime });
    }
  };

  return (
    <>
      <Box
        sx={{
          bgcolor: "#f8fafa",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 6,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 720, mx: "auto" }}>
          <Card
            sx={{
              borderRadius: 4,
              border: "1px solid #EAECF0",
              boxShadow: "0 12px 40px rgba(16,24,40,.08)",
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
              {/* doctor header */}
              {doctor && (
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                  <Avatar
                    src={doctor.photoUrl || "/images/doctor-placeholder.png"}
                    sx={{ width: 56, height: 56 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 800 }}>
                      {doctor.name}
                    </Typography>
                    <Typography sx={{ color: "#0aa07a", fontSize: 13 }}>
                      {doctor.specialty || "Doctor"}
                    </Typography>
                  </Box>
                  {doctor.rating && (
                    <Chip
                      size="small"
                      label={Number(doctor.rating).toFixed(1)}
                      color="warning"
                      sx={{ height: 22 }}
                    />
                  )}
                </Stack>
              )}

              <Typography sx={{ color: "text.secondary", mb: 2 }}>
                {typeHint}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{ border: "1px solid #E5E7EB", borderRadius: 2, p: 2 }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Button size="small" disabled>
                        ‹
                      </Button>
                      <Typography sx={{ fontWeight: 700 }}>
                        October {YEAR}
                      </Typography>
                      <Button size="small" disabled>
                        ›
                      </Button>
                    </Stack>
                    <Grid container>
                      {WEEK_HEADERS.map((w) => (
                        <Grid key={w} item xs={12 / 7}>
                          <Box
                            sx={{
                              textAlign: "center",
                              py: 0.5,
                              fontSize: 12,
                              color: "text.secondary",
                            }}
                          >
                            {w}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                    <Grid container spacing={0.5}>
                      {grid.map((d) => {
                        const selected = !d.muted && d.day === selectedDay;
                        return (
                          <Grid key={d.key} item xs={12 / 7}>
                            <Box
                              onClick={() => !d.muted && setSelectedDay(d.day)}
                              sx={{
                                height: 34,
                                borderRadius: 1,
                                textAlign: "center",
                                lineHeight: "34px",
                                cursor: d.muted ? "default" : "pointer",
                                bgcolor: selected ? "#0aa07a" : "transparent",
                                color: selected
                                  ? "#fff"
                                  : d.muted
                                  ? "#9CA3AF"
                                  : "inherit",
                                fontWeight: selected ? 700 : 500,
                                "&:hover": !d.muted
                                  ? {
                                      bgcolor: selected ? "#088a69" : "#F3F4F6",
                                    }
                                  : {},
                              }}
                            >
                              {d.day}
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      border: "1px solid #E5E7EB",
                      borderRadius: 2,
                      p: 2,
                      minHeight: 220,
                    }}
                  >
                    {loading ? (
                      <Stack alignItems="center" py={4}>
                        <CircularProgress size={28} />
                      </Stack>
                    ) : error ? (
                      <Typography color="error">{error}</Typography>
                    ) : slots.length ? (
                      <Stack direction="row" flexWrap="wrap" gap={1}>
                        {slots.map((s, i) => (
                          <SlotChip
                            key={i}
                            label={s.time}
                            selected={s.time === selectedTime}
                            disabled={!s.available}
                            onClick={() => setSelectedTime(s.time)}
                          />
                        ))}
                      </Stack>
                    ) : (
                      <Typography color="text.secondary">
                        No slots available
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
            <Box
              sx={{
                px: { xs: 2.5, md: 4 },
                py: 1.5,
                borderTop: "1px dashed #E5E7EB",
                display: "flex",
                justifyContent: "space-between",
                bgcolor: "#f9fafb",
              }}
            >
              <Button
                variant="outlined"
                onClick={onBack}
                sx={{ borderRadius: 999 }}
              >
                ‹ Back
              </Button>
              <Button
                variant="contained"
                onClick={handleContinue}
                disabled={!selectedTime}
                sx={{
                  borderRadius: 999,
                  bgcolor: "#0aa07a",
                  "&:hover": { bgcolor: "#088a69" },
                }}
              >
                Add Basic Information →
              </Button>
            </Box>
          </Card>
        </Box>
      </Box>
    </>
  );
}

StepTwoDateTime.propTypes = {
  doctor: PropTypes.object,
  summary: PropTypes.object,
  context: PropTypes.object,
  onBack: PropTypes.func,
  onNext: PropTypes.func,
};
