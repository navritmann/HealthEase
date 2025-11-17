// src/components/appointments/StepTwoDateTime.jsx
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

const WEEK_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// --- Date helpers ---
const todayLocal = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
};
const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

function buildCalendarGrid(year, month, minDate, maxDate) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  // prefix (prev month)
  for (let i = 0; i < startDay; i++) {
    const d = new Date(year, month, i - startDay + 1);
    d.setHours(0, 0, 0, 0);
    cells.push({ key: `p-${i}`, date: d, muted: true, disabled: true });
  }
  // main
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    d.setHours(0, 0, 0, 0);
    const disabled = d < minDate || d > maxDate;
    cells.push({ key: `d-${i}`, date: d, muted: false, disabled });
  }
  // suffix
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const d = addDays(last, 1);
    cells.push({
      key: `n-${cells.length}`,
      date: d,
      muted: true,
      disabled: true,
    });
  }
  // ensure 6 rows (42 cells)
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    const d = addDays(last, 1);
    cells.push({
      key: `n-${cells.length}`,
      date: d,
      muted: true,
      disabled: true,
    });
  }
  return cells;
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
  advanceWindowDays = 60,
}) {
  // Range: today → today + N
  const minDate = useMemo(() => todayLocal(), []);
  const maxDate = useMemo(
    () => addDays(minDate, advanceWindowDays),
    [minDate, advanceWindowDays]
  );

  // View state (month being displayed)
  const [viewYear, setViewYear] = useState(minDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(minDate.getMonth());

  // Selected date/time
  const [selectedDate, setSelectedDate] = useState(minDate);
  const [selectedTime, setSelectedTime] = useState("");

  // Slots state
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const type = context?.appointmentType || "clinic";
  const clinicId = context?.clinicId || null;
  const doctorId = context?.doctorId || doctor?._id || null;
  const hvAddr = context?.homeVisitAddress || null;
  const patientId = context?.patientId || null;

  const dateISO = useMemo(
    () => selectedDate.toISOString().slice(0, 10),
    [selectedDate]
  );

  const typeHint = {
    clinic: "You’ll visit the selected clinic. Please arrive 10 minutes early.",
    video: "A secure video link will be sent before the visit.",
    audio: "You’ll join a secure, in-browser audio call at the selected time.",
    chat: "A live chat window will open at your appointment time.",
    home_visit:
      "We’ll visit your address; timing may vary slightly for travel.",
  }[type];

  // Build calendar grid for current view
  const grid = useMemo(
    () => buildCalendarGrid(viewYear, viewMonth, minDate, maxDate),
    [viewYear, viewMonth, minDate, maxDate]
  );

  // helpers for time sort
  const parseTime = (t) => {
    const m = String(t).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return null;
    let h = +m[1];
    const min = +m[2];
    const ampm = m[3].toUpperCase();
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return { h, min };
  };
  const timeToMinutes = (label) => {
    const p = parseTime(label);
    return p ? p.h * 60 + p.min : Number.MAX_SAFE_INTEGER;
  };

  // fetch slots for selectedDate
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const params = { type, date: dateISO };
        if (clinicId) params.clinicId = clinicId;
        if (doctorId) params.doctorId = doctorId;
        if (type === "home_visit" && hvAddr) Object.assign(params, hvAddr);

        const res = await api.get("/availability/slots", { params });
        const raw = res?.data;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : [];

        // --- De-duplicate by time label; mark available if ANY duplicate is available ---
        const byTime = new Map();
        for (const s of list) {
          const key = String(s.time || "").trim();
          if (!key) continue;
          if (!byTime.has(key))
            byTime.set(key, { time: key, available: !!s.available });
          else if (s.available) byTime.get(key).available = true;
        }
        const deduped = Array.from(byTime.values()).sort(
          (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)
        );

        setSlots(deduped);

        // auto-select first available from the de-duplicated list
        const first = deduped.find((s) => s.available);
        setSelectedTime(first ? first.time : "");
      } catch (e) {
        setError("Failed to load slots");
        setSlots([]);
        setSelectedTime("");
      } finally {
        setLoading(false);
      }
    })();
  }, [dateISO, clinicId, doctorId, hvAddr, type]);

  const toISO = (dStr, timeLabel) => {
    const p = parseTime(timeLabel);
    if (!p) return null;
    const d = new Date(`${dStr}T00:00:00`);
    d.setHours(p.h, p.min, 0, 0);
    return d.toISOString();
  };
  const addMinutesISO = (iso, mins) => {
    const d = new Date(iso);
    d.setMinutes(d.getMinutes() + mins);
    return d.toISOString();
  };

  const handleContinue = async () => {
    const startISO = toISO(dateISO, selectedTime);
    const endISO = addMinutesISO(startISO, 30);
    try {
      const body = {
        doctorId,
        clinicId,
        appointmentType: type,
        start: startISO,
        end: endISO,
        patientId,
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

  const canPrevMonth = () => {
    const lastOfPrev = new Date(viewYear, viewMonth, 0);
    return lastOfPrev >= minDate;
  };
  const canNextMonth = () => {
    const firstOfNext = new Date(viewYear, viewMonth + 1, 1);
    return firstOfNext <= maxDate;
  };
  const prevMonth = () => {
    if (!canPrevMonth()) return;
    const d = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };
  const nextMonth = () => {
    if (!canNextMonth()) return;
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  useEffect(() => {
    if (selectedDate < minDate) setSelectedDate(minDate);
    if (selectedDate > maxDate) setSelectedDate(maxDate);
  }, [minDate, maxDate, selectedDate]);

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
                {/* Calendar */}
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
                      <Button
                        size="small"
                        onClick={prevMonth}
                        disabled={!canPrevMonth()}
                      >
                        ‹
                      </Button>
                      <Typography sx={{ fontWeight: 700 }}>
                        {new Date(viewYear, viewMonth, 1).toLocaleString(
                          undefined,
                          {
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </Typography>
                      <Button
                        size="small"
                        onClick={nextMonth}
                        disabled={!canNextMonth()}
                      >
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
                      {grid.map((cell) => {
                        const selected = isSameDay(cell.date, selectedDate);
                        const isMuted = cell.muted;
                        const disabled = cell.disabled;
                        return (
                          <Grid key={cell.key} item xs={12 / 7}>
                            <Box
                              onClick={() => {
                                if (disabled) return;
                                setSelectedDate(cell.date);
                                if (isMuted) {
                                  setViewYear(cell.date.getFullYear());
                                  setViewMonth(cell.date.getMonth());
                                }
                              }}
                              sx={{
                                height: 34,
                                borderRadius: 1,
                                textAlign: "center",
                                lineHeight: "34px",
                                cursor: disabled ? "default" : "pointer",
                                bgcolor: selected ? "#0aa07a" : "transparent",
                                color: selected
                                  ? "#fff"
                                  : disabled
                                  ? "#9CA3AF"
                                  : isMuted
                                  ? "#9CA3AF"
                                  : "inherit",
                                fontWeight: selected ? 700 : 500,
                                "&:hover": !disabled
                                  ? {
                                      bgcolor: selected ? "#088a69" : "#F3F4F6",
                                    }
                                  : {},
                              }}
                            >
                              {cell.date.getDate()}
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                </Grid>

                {/* Times */}
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
                            key={`${s.time}-${i}`}
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
  services: PropTypes.array,
  selectedService: PropTypes.object,
  selectedAddOns: PropTypes.array,
  onSelectService: PropTypes.func,
  onToggleAddOn: PropTypes.func,
  onBack: PropTypes.func,
  onNext: PropTypes.func,
  advanceWindowDays: PropTypes.number,
};
