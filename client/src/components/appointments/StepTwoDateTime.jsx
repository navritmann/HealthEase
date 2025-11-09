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
import {
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

/** -------- Static month (October 2025) to keep your current design -------- */
const MONTH = 9; // 0-indexed (October)
const YEAR = 2025;
const WEEK_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildCalendarGrid(year, month) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = new Date(year, month, 0).getDate();
  const prefix = Array.from({ length: startDay }, (_, i) => ({
    key: `p-${i}`,
    day: prevMonthDays - startDay + 1 + i,
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
        bgcolor: selected ? "primary.main" : "#12B7D012",
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
export default function StepTwoDateTime({
  doctor,
  summary,
  context,
  services = [], // NEW
  selectedService = null, // NEW
  selectedAddOns = [], // NEW
  onSelectService, // NEW
  onToggleAddOn, // NEW
  onBack,
  onNext,
}) {
  const grid = useMemo(() => buildCalendarGrid(YEAR, MONTH), []);
  const [selectedDay, setSelectedDay] = useState(15);
  const [selectedTime, setSelectedTime] = useState("");

  // Backend data for slots
  const [slots, setSlots] = useState([]); // [{ time, available, slotId? }]
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  const type = context?.appointmentType || "clinic";
  const clinicId = context?.clinicId || null;
  const hvAddr = context?.homeVisitAddress || null;
  const doctorId = context?.doctorId || doctor?._id || null;

  const dateISO = useMemo(
    () => new Date(YEAR, MONTH, selectedDay).toISOString().slice(0, 10),
    [selectedDay]
  );

  const typeHint = {
    clinic: "You’ll visit the selected clinic. Please arrive 10 minutes early.",
    video: "A secure video link will be sent before the visit.",
    audio: "We’ll call your phone at the selected time.",
    chat: "You’ll receive a live chat link for your window.",
    home_visit: "We’ll visit your address. Timing may include travel buffer.",
  }[type];

  // --- Fetch slots whenever date/type/clinic/address/doctor changes ---
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setSlotsLoading(true);
        setSlotsError("");

        const params = { type, date: dateISO };
        if ((type === "clinic" || type === "home_visit") && clinicId) {
          params.clinicId = clinicId;
        }
        if (doctorId) params.doctorId = doctorId;
        if (type === "home_visit" && hvAddr?.city && hvAddr?.postal) {
          params.city = hvAddr.city;
          params.postal = hvAddr.postal;
        }

        const resp = await api.get("/availability/slots", { params });
        const raw = resp?.data;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : [];

        setSlots(list);
        // auto-pick first available if none selected
        if (!selectedTime) {
          const first = list.find((s) => s.available);
          if (first?.time) setSelectedTime(first.time);
        }
      } catch (e) {
        setSlots([]);
        setSelectedTime("");
        setSlotsError(e?.response?.data?.error || "Failed to load slots");
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [type, clinicId, doctorId, hvAddr?.city, hvAddr?.postal, dateISO]);

  // --- HOLD: convert "Oct 15 10:00 AM" into ISO start/end and call /appointments/hold ---
  const parse12h = (timeLabel) => {
    // "10:00 AM" -> { hours: 10, minutes: 0, ampm: "AM" }
    const m = String(timeLabel).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return null;
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    const ampm = m[3].toUpperCase();
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return { h, min };
  };

  const toISO = (dateStr, timeLabel) => {
    const p = parse12h(timeLabel);
    if (!p) return null;
    const d = new Date(`${dateStr}T00:00:00`);
    d.setHours(p.h, p.min, 0, 0);
    return d.toISOString();
  };

  const addMinutes = (iso, mins) => {
    const d = new Date(iso);
    d.setMinutes(d.getMinutes() + mins);
    return d.toISOString();
  };

  const handleContinue = async () => {
    // If you want to “hold” the slot before Step 3 (recommended)
    const startISO = toISO(dateISO, selectedTime);
    if (!startISO) {
      return onNext({ dateISO, time: selectedTime }); // fallback
    }
    const durationMins = type === "home_visit" ? 45 : 30;
    const endISO = addMinutes(startISO, durationMins);

    try {
      const body = {
        doctorId, // may be null if you’re skipping doctors – server can allow null
        clinicId: clinicId || null,
        appointmentType: type,
        start: startISO,
        end: endISO,
        // patientDraft: you can pass email/phone here if you want to pre-create the patient
      };
      const resp = await api.post("/appointments/hold", body);
      console.log("HOLD →", body);
      const id = resp?.data?.id || null;
      const bookingNo = resp?.data?.bookingNo || null;

      onNext({
        dateISO,
        time: selectedTime,
        appointmentId: id,
        bookingNo,
      });
    } catch (e) {
      // If hold fails, you can either block or proceed without id.
      console.error("Hold failed:", e?.response?.data || e);
      onNext({
        dateISO,
        time: selectedTime,
      });
    }
  };

  // Live labels so the top card updates immediately
  const serviceLabel = selectedService
    ? `${selectedService.name} (${selectedService.durationMins} Mins)`
    : summary?.service || "—";

  const addOnLabel =
    selectedService?.addOns?.length && selectedAddOns?.length
      ? selectedService.addOns
          .filter((a) => selectedAddOns.includes(a.code))
          .map((a) => a.name)
          .join(", ")
      : summary?.addOnService || "—";

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
              src={doctor?.photoUrl || ""}
              alt={doctor?.name || "Doctor"}
              sx={{ width: 56, height: 56 }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ fontWeight: 800 }} noWrap>
                  {doctor?.name || "Healthcare Provider"}
                </Typography>
                {doctor?.rating ? (
                  <Chip
                    size="small"
                    label={Number(doctor.rating).toFixed(1)}
                    color="warning"
                    sx={{ height: 22 }}
                  />
                ) : null}
              </Stack>
              <Typography sx={{ color: "primary.main", fontSize: 13 }} noWrap>
                {doctor?.specialty || "Doctor"}
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 12 }} noWrap>
                {doctor?.addressLine || ""}
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
              <Typography sx={{ fontWeight: 700 }}>{serviceLabel}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                Add-on
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>{addOnLabel}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                Date & Time
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {selectedTime || "—"} , {selectedDay}, Oct {YEAR}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                Appointment type
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {summary?.appointmentType}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Type hint */}
        <Typography sx={{ color: "text.secondary", mb: 2 }}>
          {typeHint}
        </Typography>

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
            <Box
              sx={{
                border: "1px solid #E5E7EB",
                borderRadius: 2,
                p: 2,
                minHeight: 240,
              }}
            >
              {slotsLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : slotsError ? (
                <Typography color="error">{slotsError}</Typography>
              ) : slots?.length ? (
                <Stack
                  direction="row"
                  spacing={1.25}
                  flexWrap="wrap"
                  useFlexGap
                >
                  {slots.map((s, i) => (
                    <SlotChip
                      key={s.slotId || i}
                      label={s.available ? s.time : "—"}
                      disabled={!s.available}
                      selected={s.available && s.time === selectedTime}
                      onClick={() => setSelectedTime(s.time)}
                    />
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">
                  No slots for this date. Pick another day.
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
      {/* NEW: Service & Add-on pickers */}
      <Box
        sx={{
          border: "1px solid #E5E7EB",
          borderRadius: 2,
          p: 2,
          mb: 2,
          bgcolor: "#fff",
        }}
      >
        <Stack spacing={2}>
          <FormControl size="small" fullWidth>
            <InputLabel id="svc-label">Service</InputLabel>
            <Select
              labelId="svc-label"
              label="Service"
              value={selectedService?.code || ""}
              onChange={(e) => {
                const svc = services.find((s) => s.code === e.target.value);
                onSelectService?.(svc);
                // reset add-ons to first one if you want
                // onToggleAddOn is a toggler; to reset, you’d manage state in parent if needed
              }}
            >
              {services.map((s) => (
                <MenuItem key={s.code} value={s.code}>
                  {s.name} ({s.durationMins} mins)
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {!!selectedService?.addOns?.length && (
            <Box>
              <Typography
                sx={{ fontSize: 13, color: "text.secondary", mb: 0.5 }}
              >
                Add-ons
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                {selectedService.addOns.map((a) => (
                  <label
                    key={a.code}
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <Checkbox
                      size="small"
                      checked={selectedAddOns.includes(a.code)}
                      onChange={() => onToggleAddOn?.(a.code)}
                    />
                    <Typography sx={{ fontSize: 14 }}>
                      {a.name} (+{a.price})
                    </Typography>
                  </label>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </Box>
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
          disabled={!selectedTime || (type !== "video" && !doctorId)}
          onClick={handleContinue}
        >
          Add Basic Information →
        </Button>
      </Box>
    </Card>
  );
}

StepTwoDateTime.propTypes = {
  doctor: PropTypes.object,
  summary: PropTypes.object,
  context: PropTypes.object,
  onBack: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
};
