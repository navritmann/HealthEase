// src/components/appointments/StepOneTypeClinic.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
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
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";

// ...icons imports unchanged...

const TYPE_TILES = [
  { key: "clinic", label: "Clinic", icon: LocalHospitalRoundedIcon },
  { key: "video", label: "Video Call", icon: VideocamRoundedIcon },
  { key: "audio", label: "Audio Call", icon: CallRoundedIcon },
  { key: "chat", label: "Chat", icon: ChatRoundedIcon },
  { key: "home_visit", label: "Home Visit", icon: HomeRoundedIcon },
];

// --- small atoms (TypeTile, ClinicRow) unchanged ---
/* ---------- SMALL UI ATOMS ---------- */

function TypeTile({ active, Icon, label, onClick }) {
  return (
    <Box
      onClick={onClick}
      role="button"
      tabIndex={0}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        px: 2.25,
        py: 1.6,
        borderRadius: 2,
        border: "1px solid",
        borderColor: active ? "primary.main" : "#E5E7EB",
        bgcolor: active ? "rgba(2,132,199,0.06)" : "#fff",
        cursor: "pointer",
        userSelect: "none",
        transition: "all .15s ease",
        "&:hover": { boxShadow: "0 8px 20px rgba(16,24,40,.06)" },
        minWidth: 150,
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          bgcolor: active ? "primary.main" : "#F3F4F6",
          color: active ? "#fff" : "text.primary",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        <Icon fontSize="small" />
      </Box>
      <Typography sx={{ fontWeight: 700 }}>{label}</Typography>
    </Box>
  );
}

function ClinicRow({ clinic, selected, onSelect }) {
  return (
    <Box
      onClick={onSelect}
      id={`clinic-${clinic._id}`}
      sx={{
        borderRadius: 2,
        border: "1px solid",
        borderColor: selected ? "primary.main" : "#E5E7EB",
        p: 1.5,
        cursor: "pointer",
        transition: "all .15s ease",
        "&:hover": { boxShadow: "0 8px 24px rgba(16,24,40,.06)" },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar src={clinic.logoUrl || ""} alt={clinic.name} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
            {clinic.name}
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 13 }} noWrap>
            {clinic.address}
            {clinic.city ? `, ${clinic.city}` : ""}
            {clinic.state ? `, ${clinic.state}` : ""}
            {clinic.distanceLabel ? `  •  ${clinic.distanceLabel}` : ""}
          </Typography>
        </Box>
        {selected ? (
          <CheckCircleRoundedIcon sx={{ color: "primary.main" }} />
        ) : (
          <RadioButtonUncheckedRoundedIcon sx={{ color: "#D1D5DB" }} />
        )}
      </Stack>
    </Box>
  );
}

export default function StepOneTypeClinic({
  doctor,
  // ❌ DO NOT default to [] (creates a new array each render)
  clinics, // ← may be undefined if parent wants auto-fetch
  initialType = "clinic",
  initialClinicId = "",
  onBack,
  onNext,
  onChange,
  loading: loadingProp,
  error: errorProp,
}) {
  const [appointmentType, setAppointmentType] = useState(initialType);
  const [clinicId, setClinicId] = useState(initialClinicId);

  // internal data / status
  const [localClinics, setLocalClinics] = useState(() => clinics ?? []);
  const [loading, setLoading] = useState(Boolean(loadingProp));
  const [error, setError] = useState(errorProp || "");

  // NEW: Home visit inputs + validation state
  const [hvCity, setHvCity] = useState("");
  const [hvPostal, setHvPostal] = useState("");
  const [hvValidating, setHvValidating] = useState(false);
  const [hvCovered, setHvCovered] = useState(false);
  const [hvError, setHvError] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [errorDoctors, setErrorDoctors] = useState("");

  // keep internal in sync with props
  useEffect(() => setAppointmentType(initialType), [initialType]);
  useEffect(() => setClinicId(initialClinicId), [initialClinicId]);
  useEffect(() => setLocalClinics(clinics ?? []), [clinics]);
  useEffect(() => setError(errorProp || ""), [errorProp]);
  useEffect(() => setLoading(Boolean(loadingProp)), [loadingProp]);

  const requiresClinic = useMemo(
    () => appointmentType === "clinic" || appointmentType === "home_visit",
    [appointmentType]
  );

  const selectedClinic = useMemo(
    () => (localClinics || []).find((c) => c._id === clinicId),
    [localClinics, clinicId]
  );
  const isVirtual =
    appointmentType === "video" ||
    appointmentType === "audio" ||
    appointmentType === "chat";

  const isHomeVisit = appointmentType === "home_visit";

  const canNext = !requiresClinic || (Boolean(clinicId) && Boolean(doctorId));
  const nextHint = !requiresClinic
    ? ""
    : !clinicId
    ? "Please select a clinic to continue"
    : !doctorId
    ? "Please select a doctor to continue"
    : "";

  // ✅ stable primitives for dependencies (avoid raw array/object)
  const hasPropClinics = Boolean(clinics && clinics.length);
  // const doctorId = doctor?._id || null;

  // ✅ fetchClinics no longer depends on `clinics` or `requiresClinic` directly
  const fetchClinics = useCallback(async () => {
    // if parent provided clinics, skip fetching
    if (hasPropClinics) return;

    setLoading(true);
    setError("");
    try {
      const params = {};
      if (doctorId) params.doctorId = doctorId;
      const resp = await api.get("/clinics", { params });

      const raw = resp?.data;

      // accept either an array or { data: [...] }
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
        ? raw.data
        : [];

      console.log("Clinics API params:", params);
      console.log("Clinics API normalized list:", list);

      setLocalClinics(list);

      // auto-select matching initialClinicId (if valid), or the only clinic
      if (initialClinicId && list.some((d) => d._id === initialClinicId)) {
        setClinicId(initialClinicId);
      } else if (!initialClinicId && list.length === 1) {
        setClinicId(list[0]._id);
      }
    } catch (e) {
      setError(
        e?.response?.data?.error || e.message || "Failed to load clinics."
      );
    } finally {
      setLoading(false);
    }
  }, [doctorId, hasPropClinics, initialClinicId]);

  // ✅ trigger fetch only when: type needs clinic, we don't already have prop clinics
  useEffect(() => {
    if (requiresClinic && !hasPropClinics) {
      fetchClinics();
    }
    // deps are all scalars/booleans → stable
  }, [requiresClinic, hasPropClinics, fetchClinics]);

  // notify parent when selection changes
  useEffect(() => {
    onChange?.({ appointmentType, clinicId });
  }, [appointmentType, clinicId, onChange]);

  // const handleTypeChange = (key) => {
  //   setAppointmentType(key);
  //   if (!(key === "clinic" || key === "home_visit")) {
  //     setClinicId("");
  //     onChange?.({ appointmentType: key, clinicId: "" });
  //   } else {
  //     onChange?.({ appointmentType: key, clinicId });
  //   }
  // };

  // fetch doctors whenever clinicId changes (also covers initialClinicId cases)
  useEffect(() => {
    const run = async () => {
      if (!(requiresClinic && clinicId)) return;

      try {
        setLoadingDoctors(true);
        setErrorDoctors("");
        setDoctors([]);
        setDoctorId("");

        const { data } = await api.get(`/doctors/by-clinic/${clinicId}`);
        const list = Array.isArray(data?.data) ? data.data : [];
        setDoctors(list);
        if (list[0]?._id) setDoctorId(list[0]._id); // preselect first
      } catch (e) {
        setErrorDoctors(e?.response?.data?.error || "Failed to load doctors.");
      } finally {
        setLoadingDoctors(false);
      }
    };

    run();
  }, [clinicId, requiresClinic]);

  const handleClinicSelect = (id) => {
    setClinicId(id);
    onChange?.({ appointmentType, clinicId: id });

    setTimeout(() => {
      document
        .getElementById(`clinic-${id}`)
        ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 0);
  };

  // Validate service area coverage for Home Visit
  const validateHomeVisitCoverage = async () => {
    setHvValidating(true);
    setHvError("");
    try {
      const resp = await api.get("/service-area/check", {
        params: { city: hvCity, postal: hvPostal },
      });
      const covered = Boolean(resp?.data?.covered);
      setHvCovered(covered);
      if (!covered) setHvError("Sorry, we don’t cover that area yet.");
    } catch (e) {
      setHvError(e?.response?.data?.error || "Could not validate address.");
      setHvCovered(false);
    } finally {
      setHvValidating(false);
    }
  };

  const handleTypeChange = (key) => {
    setAppointmentType(key);

    if (!(key === "clinic" || key === "home_visit")) {
      setClinicId("");
      setDoctors([]);
      setDoctorId("");
      onChange?.({ appointmentType: key, clinicId: "" });
    } else {
      onChange?.({ appointmentType: key, clinicId });
    }
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid #EAECF0",
        bgcolor: "#fff",
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        {/* header ... (unchanged) */}
        {doctor && (
          <Box
            sx={{
              border: "1px solid #E5E7EB",
              borderRadius: 2,
              p: 2,
              mb: 2.5,
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
                <Typography
                  sx={{ color: "text.secondary", fontSize: 12 }}
                  noWrap
                >
                  {doctor.addressLine || ""}
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}

        <Typography sx={{ fontWeight: 700, mb: 1.25 }}>
          Select Appointment Type
        </Typography>
        <Stack
          direction="row"
          flexWrap="wrap"
          useFlexGap
          gap={1.25}
          sx={{ mb: 2.25 }}
        >
          {TYPE_TILES.map((t) => (
            <TypeTile
              key={t.key}
              label={t.label}
              Icon={t.icon}
              active={appointmentType === t.key}
              onClick={() => handleTypeChange(t.key)}
            />
          ))}
        </Stack>

        {/* ---- TYPE-SPECIFIC PANEL IN STEP 1 (same page) ---- */}
        {appointmentType === "clinic" && (
          <>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>
              Select Clinics
            </Typography>

            {loading ? (
              <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
                <CircularProgress size={28} />
              </Box>
            ) : error ? (
              <Typography sx={{ color: "error.main", fontSize: 14, mb: 1 }}>
                {error || "Failed to load clinics."}
              </Typography>
            ) : (
              <>
                <Stack spacing={1.25} sx={{ mb: 1 }}>
                  {(localClinics || []).map((c) => (
                    <ClinicRow
                      key={c._id}
                      clinic={c}
                      selected={clinicId === c._id}
                      onSelect={() => handleClinicSelect(c._id)}
                    />
                  ))}
                </Stack>
                {!localClinics?.length && (
                  <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                    No clinics available. Try Video, Audio, or Chat.
                  </Typography>
                )}
              </>
            )}

            {requiresClinic && clinicId ? (
              <>
                <Typography sx={{ fontWeight: 700, mb: 1 }}>
                  Select Doctor
                </Typography>

                {loadingDoctors ? (
                  <Box
                    sx={{ py: 3, display: "flex", justifyContent: "center" }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                ) : errorDoctors ? (
                  <Typography sx={{ color: "error.main", fontSize: 14, mb: 1 }}>
                    {errorDoctors}
                  </Typography>
                ) : doctors.length ? (
                  <Stack spacing={1.25} sx={{ mb: 1 }}>
                    {doctors.map((d) => (
                      <Box
                        key={d._id}
                        onClick={() => setDoctorId(d._id)}
                        sx={{
                          p: 1.25,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor:
                            doctorId === d._id ? "primary.main" : "#E5E7EB",
                          display: "flex",
                          alignItems: "center",
                          gap: 1.25,
                          cursor: "pointer",
                          "&:hover": {
                            boxShadow: "0 8px 24px rgba(16,24,40,.06)",
                          },
                        }}
                      >
                        <Avatar src={d.photoUrl || ""} alt={d.name} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Typography sx={{ fontWeight: 700 }} noWrap>
                              {d.name}
                            </Typography>
                            {d.rating ? (
                              <Chip
                                size="small"
                                label={Number(d.rating).toFixed(1)}
                                color="warning"
                                sx={{ height: 22 }}
                              />
                            ) : null}
                          </Stack>
                          <Typography
                            sx={{ color: "text.secondary", fontSize: 13 }}
                            noWrap
                          >
                            {d.specialty || "Doctor"}
                          </Typography>
                        </Box>
                        {doctorId === d._id ? (
                          <CheckCircleRoundedIcon
                            sx={{ color: "primary.main" }}
                          />
                        ) : (
                          <RadioButtonUncheckedRoundedIcon
                            sx={{ color: "#D1D5DB" }}
                          />
                        )}
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                    No doctors linked to this clinic.
                  </Typography>
                )}
              </>
            ) : null}
          </>
        )}

        {(appointmentType === "video" ||
          appointmentType === "audio" ||
          appointmentType === "chat") && (
          <Box
            sx={{
              p: 2,
              border: "1px solid #E5E7EB",
              borderRadius: 2,
              bgcolor: "#F9FAFB",
            }}
          >
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
              {appointmentType === "video" && "Video Consultation"}
              {appointmentType === "audio" && "Audio Consultation"}
              {appointmentType === "chat" && "Live Chat Consultation"}
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              {appointmentType === "video" &&
                "You’ll receive a secure video link before the appointment."}
              {appointmentType === "audio" &&
                "We’ll call your phone at the selected time."}
              {appointmentType === "chat" &&
                "You’ll receive a chat link and can message live during your slot."}
            </Typography>
          </Box>
        )}

        {appointmentType === "home_visit" && (
          <Box
            sx={{
              p: 2,
              border: "1px solid #E5E7EB",
              borderRadius: 2,
              bgcolor: "#F9FAFB",
            }}
          >
            <Typography sx={{ fontWeight: 700, mb: 1 }}>
              Home Visit – Service Area Check
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ mb: 1 }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 13, mb: 0.5 }}>City</Typography>
                <input
                  value={hvCity}
                  onChange={(e) => {
                    setHvCity(e.target.value);
                    setHvCovered(false);
                    setHvError("");
                  }}
                  placeholder="e.g., Kitchener"
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid #E5E7EB",
                  }}
                />
              </Box>
              <Box sx={{ width: { xs: "100%", sm: 200 } }}>
                <Typography sx={{ fontSize: 13, mb: 0.5 }}>
                  Postal Code
                </Typography>
                <input
                  value={hvPostal}
                  onChange={(e) => {
                    setHvPostal(e.target.value.toUpperCase());
                    setHvCovered(false);
                    setHvError("");
                  }}
                  placeholder="e.g., N2G 2J1"
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid #E5E7EB",
                  }}
                />
              </Box>
              <Button
                variant="outlined"
                disabled={!hvCity || !hvPostal || hvValidating}
                onClick={validateHomeVisitCoverage}
                sx={{ borderRadius: 999, whiteSpace: "nowrap" }}
              >
                {hvValidating ? "Checking…" : "Check Coverage"}
              </Button>
            </Stack>

            {hvError && (
              <Typography color="error" sx={{ mb: 1 }}>
                {hvError}
              </Typography>
            )}
            {hvCovered && (
              <Typography sx={{ color: "success.main", fontSize: 14 }}>
                Great news! We cover your area.
              </Typography>
            )}
            {!hvCovered && !hvError && (
              <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                We’ll confirm your exact time in the next step if your address
                is covered.
              </Typography>
            )}
          </Box>
        )}
      </CardContent>

      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 1.25,
          borderTop: "1px dashed #E5E7EB",
          display: "flex",
          justifyContent: "space-between",
          bgcolor: "#F9FAFB",
        }}
      >
        <Button variant="outlined" onClick={onBack} sx={{ borderRadius: 999 }}>
          ‹ Back
        </Button>
        <Tooltip
          title={!canNext ? "Please select a clinic to continue" : ""}
          disableHoverListener={canNext}
          placement="top"
        >
          <span>
            <Button
              variant="contained"
              disabled={!canNext}
              onClick={() =>
                onNext({
                  appointmentType,
                  clinicId: selectedClinic?._id || null,
                  clinicMeta: selectedClinic
                    ? {
                        name: selectedClinic.name,
                        address: selectedClinic.address,
                      }
                    : null,
                  doctorId: doctorId || null,
                  doctorMeta: doctorId
                    ? doctors.find((d) => d._id === doctorId) || null
                    : null,
                })
              }
              sx={{ borderRadius: 999 }}
            >
              Select Date & Time →
            </Button>
          </span>
        </Tooltip>
      </Box>
    </Card>
  );
}

StepOneTypeClinic.propTypes = {
  doctor: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    specialty: PropTypes.string,
    rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    photoUrl: PropTypes.string,
    addressLine: PropTypes.string,
  }),
  clinics: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      address: PropTypes.string,
      city: PropTypes.string,
      state: PropTypes.string,
      logoUrl: PropTypes.string,
      distanceLabel: PropTypes.string,
    })
  ),
  initialType: PropTypes.oneOf([
    "clinic",
    "video",
    "audio",
    "chat",
    "home_visit",
  ]),
  initialClinicId: PropTypes.string,
  onBack: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  loading: PropTypes.bool,
  error: PropTypes.string,
};
