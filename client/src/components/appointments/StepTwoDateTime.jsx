import { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

/** -------- Small helpers (static month: October 2025) -------- */
const MONTH = 9; // 0-indexed (October)
const YEAR = 2025;
const WEEK_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildCalendarGrid(year, month) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay(); // 0-6
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // 31 for Oct 2025

  // Previous month tail
  const prevMonthDays = new Date(year, month, 0).getDate();
  const prefix = Array.from({ length: startDay }, (_, i) => ({
    key: `p-${i}`,
    day: prevMonthDays - startDay + 1 + i,
    muted: true,
  }));

  // Current month
  const main = Array.from({ length: daysInMonth }, (_, i) => ({
    key: `d-${i + 1}`,
    day: i + 1,
    muted: false,
  }));

  // Next month head to fill 6 rows (42 cells)
  const total = prefix.length + main.length;
  const suffixCount = 42 - total;
  const suffix = Array.from({ length: Math.max(0, suffixCount) }, (_, i) => ({
    key: `n-${i + 1}`,
    day: i + 1,
    muted: true,
  }));

  return [...prefix, ...main, ...suffix];
}

/** -------- Slot chip -------- */
function SlotChip({ label, selected, disabled = false, onClick }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      sx={{
        minWidth: 76,
        px: 1.25,
        py: 0.75,
        borderRadius: 1.5,
        fontSize: 13,
        fontWeight: 700,
        textTransform: "none",
        bgcolor: selected ? "primary.main" : "#12B7D012", // teal-ish
        color: selected ? "#fff" : "primary.main",
        "&:hover": {
          bgcolor: selected ? "primary.dark" : "#12B7D01F",
        },
        ...(disabled && {
          bgcolor: "#E5E7EB",
          color: "#9CA3AF",
        }),
      }}
    >
      {label}
    </Button>
  );
}

/** -------- Main component --------
 * Props:
 *  - doctor: {_id, name, specialty, rating, photoUrl, addressLine}
 *  - summary: { service: "Cardiology (30 Mins)", addOnService:"Echocardiograms", appointmentType: "Clinic (Wellness Path)" }
 *  - onBack()
 *  - onNext({ dateISO, time })
 */
export default function StepTwoDateTime({
  doctor = {
    name: "Dr. Michael Brown",
    specialty: "Psychologist",
    rating: 5.0,
    photoUrl: "",
    addressLine: "5th Street – 1011 W 5th St, Suite 120, Austin, TX 78703",
  },
  summary = {
    service: "Cardiology (30 Mins)",
    addOnService: "Echocardiograms",
    appointmentType: "Clinic (Wellness Path)",
  },
  onBack,
  onNext,
}) {
  const grid = useMemo(() => buildCalendarGrid(YEAR, MONTH), []);
  const [selectedDay, setSelectedDay] = useState(15);
  const [selectedTime, setSelectedTime] = useState("10:45");

  // Static slot groups to match screenshot vibe
  const groups = [
    {
      title: "Morning",
      items: ["09:45", "-", "10:45", "10:45", "10:45", "-", ""],
    },
    {
      title: "Afternoon",
      items: ["09:45", "-", "10:45", "10:45", "10:45", ""],
    },
    {
      title: "Evening",
      items: [
        "09:45",
        "09:45",
        "09:45",
        "-",
        "10:45",
        "",
        "09:45",
        "09:45",
        "—",
        "10:45",
        "—",
      ],
    },
  ];

  const dateISO = useMemo(
    () => new Date(YEAR, MONTH, selectedDay).toISOString().slice(0, 10),
    [selectedDay]
  );

  return (
    <Card
      sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid #EAECF0" }}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        {/* Doctor header */}
        <Box
          sx={{
            border: "1px solid #E5E7EB",
            borderRadius: 2,
            p: 2,
            mb: 2,
            bgcolor: "#fff",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={doctor.photoUrl || ""}
              alt={doctor.name}
              sx={{ width: 56, height: 56 }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ fontWeight: 800 }} noWrap>
                  {doctor.name}
                </Typography>
                {doctor.rating ? (
                  <Chip
                    size="small"
                    label={Number(doctor.rating).toFixed(1)}
                    color="warning"
                    sx={{ height: 22 }}
                  />
                ) : null}
              </Stack>
              <Typography sx={{ color: "primary.main", fontSize: 13 }} noWrap>
                {doctor.specialty || "Doctor"}
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 12 }} noWrap>
                {doctor.addressLine || ""}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Booking info row */}
        <Box
          sx={{
            border: "1px solid #E5E7EB",
            borderRadius: 2,
            p: 2,
            mb: 2,
            bgcolor: "#fff",
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                Service
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {summary.service}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                Service
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {summary.addOnService}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                Date & Time
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {selectedTime} , {selectedDay}, Oct {YEAR}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                Appointment type
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {summary.appointmentType}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Calendar + Slots */}
        <Grid container spacing={2}>
          {/* Calendar */}
          <Grid item xs={12} md={6}>
            <Box sx={{ border: "1px solid #E5E7EB", borderRadius: 2, p: 2 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Button
                  size="small"
                  variant="text"
                  disabled
                  sx={{ textTransform: "none" }}
                >
                  ‹
                </Button>
                <Typography sx={{ fontWeight: 700 }}>October {YEAR}</Typography>
                <Button
                  size="small"
                  variant="text"
                  disabled
                  sx={{ textTransform: "none" }}
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
                        py: 1,
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
                  const isSelected = !d.muted && d.day === selectedDay;
                  return (
                    <Grid key={d.key} item xs={12 / 7}>
                      <Box
                        onClick={() => !d.muted && setSelectedDay(d.day)}
                        sx={{
                          height: 36,
                          borderRadius: 1,
                          display: "grid",
                          placeItems: "center",
                          cursor: d.muted ? "default" : "pointer",
                          color: d.muted ? "#9CA3AF" : "inherit",
                          bgcolor: isSelected ? "primary.main" : "transparent",
                          color: isSelected
                            ? "#fff"
                            : d.muted
                            ? "#9CA3AF"
                            : "inherit",
                          fontWeight: isSelected ? 700 : 500,
                          "&:hover": !d.muted
                            ? {
                                bgcolor: isSelected
                                  ? "primary.dark"
                                  : "#F3F4F6",
                              }
                            : undefined,
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

          {/* Slots */}
          <Grid item xs={12} md={6}>
            <Box sx={{ border: "1px solid #E5E7EB", borderRadius: 2, p: 2 }}>
              {groups.map((g) => (
                <Box key={g.title} sx={{ mb: 2.25 }}>
                  <Typography
                    sx={{ fontSize: 13, color: "text.secondary", mb: 1 }}
                  >
                    {g.title}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1.25}
                    flexWrap="wrap"
                    useFlexGap
                  >
                    {g.items.map((label, idx) => {
                      const disabled =
                        label === "-" || label === "—" || label === "";
                      return (
                        <SlotChip
                          key={`${g.title}-${idx}`}
                          label={disabled ? "—" : label}
                          disabled={disabled}
                          selected={!disabled && label === selectedTime}
                          onClick={() => !disabled && setSelectedTime(label)}
                        />
                      );
                    })}
                  </Stack>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </CardContent>

      {/* Footer bar */}
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 1.25,
          borderTop: "1px dashed #E5E7EB",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "#F9FAFB",
        }}
      >
        <Button variant="outlined" onClick={onBack} sx={{ borderRadius: 999 }}>
          ‹ Back
        </Button>
        <Button
          variant="contained"
          sx={{ borderRadius: 999 }}
          onClick={() => onNext({ dateISO, time: selectedTime })}
        >
          Add Basic Information →
        </Button>
      </Box>
    </Card>
  );
}
