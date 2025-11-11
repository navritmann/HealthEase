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

const TYPE_TILES = [
  { key: "clinic", label: "Clinic Visit", icon: LocalHospitalRoundedIcon },
  { key: "video", label: "Video Call", icon: VideocamRoundedIcon },
  { key: "audio", label: "Audio Call", icon: CallRoundedIcon },
  { key: "chat", label: "Live Chat", icon: ChatRoundedIcon },
  { key: "home_visit", label: "Home Visit", icon: HomeRoundedIcon },
];

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
        px: 2.6,
        py: 1.8,
        borderRadius: 3,
        border: "1px solid",
        borderColor: active ? "#0aa07a" : "#E5E7EB",
        bgcolor: active ? "rgba(10,160,122,0.08)" : "#fff",
        color: active ? "#0a3e57" : "#1e293b",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: 15,
        transition: "all .2s ease",
        "&:hover": { boxShadow: "0 8px 24px rgba(16,24,40,.08)" },
        minWidth: 160,
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          bgcolor: active ? "#0aa07a" : "#F3F4F6",
          color: active ? "#fff" : "#1e293b",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        <Icon fontSize="small" />
      </Box>
      {label}
    </Box>
  );
}

function ClinicRow({ clinic, selected, onSelect }) {
  const fallbackClinicLogo =
    "https://cdn-icons-png.flaticon.com/512/2967/2967596.png"; // small clinic building icon
  return (
    <Box
      onClick={onSelect}
      id={`clinic-${clinic._id}`}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: selected ? "#0aa07a" : "#E5E7EB",
        p: 1.6,
        cursor: "pointer",
        transition: "all .2s ease",
        bgcolor: selected ? "rgba(10,160,122,0.05)" : "#fff",
        "&:hover": { boxShadow: "0 8px 24px rgba(16,24,40,.06)" },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar
          src={clinic.logoUrl || fallbackClinicLogo}
          alt={clinic.name}
          sx={{
            bgcolor: "#f9fafb",
            width: 42,
            height: 42,
            border: "2px solid #fff",
          }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, lineHeight: 1.3 }} noWrap>
            {clinic.name}
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 13 }} noWrap>
            {clinic.address}
            {clinic.city ? `, ${clinic.city}` : ""}
            {clinic.state ? `, ${clinic.state}` : ""}
          </Typography>
        </Box>
        {selected ? (
          <CheckCircleRoundedIcon sx={{ color: "#0aa07a" }} />
        ) : (
          <RadioButtonUncheckedRoundedIcon sx={{ color: "#D1D5DB" }} />
        )}
      </Stack>
    </Box>
  );
}

export default function StepOneTypeClinic({
  doctor,
  clinics,
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
  const [localClinics, setLocalClinics] = useState(() => clinics ?? []);
  const [loading, setLoading] = useState(Boolean(loadingProp));
  const [error, setError] = useState(errorProp || "");
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const fallbackDoctorAvatar =
    "https://cdn-icons-png.flaticon.com/512/5003/5003090.png";

  const requiresClinic = useMemo(
    () => appointmentType === "clinic" || appointmentType === "home_visit",
    [appointmentType]
  );

  const selectedClinic = useMemo(
    () => (localClinics || []).find((c) => c._id === clinicId),
    [localClinics, clinicId]
  );

  const canNext = !requiresClinic || (Boolean(clinicId) && Boolean(doctorId));

  const fetchClinics = useCallback(async () => {
    if (clinics?.length) return;
    setLoading(true);
    try {
      const resp = await api.get("/clinics");
      const data = Array.isArray(resp.data)
        ? resp.data
        : Array.isArray(resp.data.data)
        ? resp.data.data
        : [];
      setLocalClinics(data);
    } catch {
      setError("Failed to load clinics.");
    } finally {
      setLoading(false);
    }
  }, [clinics]);

  useEffect(() => {
    if (requiresClinic && !clinics?.length) fetchClinics();
  }, [requiresClinic, fetchClinics, clinics]);

  useEffect(() => {
    onChange?.({ appointmentType, clinicId });
  }, [appointmentType, clinicId, onChange]);

  useEffect(() => {
    const run = async () => {
      if (!(requiresClinic && clinicId)) return;
      try {
        setLoadingDoctors(true);
        const { data } = await api.get(`/doctors/by-clinic/${clinicId}`);
        const list = Array.isArray(data?.data) ? data.data : [];
        setDoctors(list);
        if (list[0]?._id) setDoctorId(list[0]._id);
      } finally {
        setLoadingDoctors(false);
      }
    };
    run();
  }, [clinicId, requiresClinic]);

  const handleTypeChange = (key) => {
    setAppointmentType(key);
    if (!(key === "clinic" || key === "home_visit")) {
      setClinicId("");
      setDoctors([]);
      setDoctorId("");
      onChange?.({ appointmentType: key, clinicId: "" });
    }
  };

  return (
    <Card
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        border: "1px solid #EAECF0",
        bgcolor: "#fff",
        boxShadow: "0 12px 40px rgba(16,24,40,.08)",
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
        {/* Doctor Header */}
        {doctor && (
          <Box
            sx={{
              border: "1px solid #E5E7EB",
              borderRadius: 3,
              p: 2,
              mb: 3,
              bgcolor: "#fafafa",
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={doctor.photoUrl || fallbackDoctorAvatar}
                alt={doctor.name}
                onError={(e) => (e.currentTarget.src = fallbackDoctorAvatar)}
                sx={{
                  width: 60,
                  height: 60,
                  border: "2px solid #fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,.1)",
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800 }} noWrap>
                  {doctor.name}
                </Typography>
                <Typography sx={{ color: "#0aa07a", fontSize: 13 }} noWrap>
                  {doctor.specialty || "Doctor"}
                </Typography>
                <Typography
                  sx={{ color: "text.secondary", fontSize: 12 }}
                  noWrap
                >
                  {doctor.addressLine || ""}
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
          </Box>
        )}

        {/* Appointment Type */}
        <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
          Select Appointment Type
        </Typography>
        <Stack
          direction="row"
          flexWrap="wrap"
          useFlexGap
          gap={1.25}
          sx={{ mb: 2.5 }}
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

        {/* Clinics */}
        {appointmentType === "clinic" && (
          <>
            <Typography sx={{ fontWeight: 700, mb: 1.25 }}>
              Select Clinic
            </Typography>

            {loading ? (
              <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
                <CircularProgress size={28} />
              </Box>
            ) : (
              <Stack spacing={1.25} sx={{ mb: 2 }}>
                {(localClinics || []).map((c) => (
                  <ClinicRow
                    key={c._id}
                    clinic={c}
                    selected={clinicId === c._id}
                    onSelect={() => setClinicId(c._id)}
                  />
                ))}
                {!localClinics?.length && (
                  <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                    No clinics available. Try a virtual option.
                  </Typography>
                )}
              </Stack>
            )}
          </>
        )}

        {/* Doctors */}
        {appointmentType === "clinic" && clinicId && (
          <>
            <Typography sx={{ fontWeight: 700, mb: 1.25 }}>
              Select Doctor
            </Typography>

            {loadingDoctors ? (
              <Box sx={{ py: 3, display: "flex", justifyContent: "center" }}>
                <CircularProgress size={24} />
              </Box>
            ) : doctors.length ? (
              <Stack spacing={1.25}>
                {doctors.map((d) => (
                  <Box
                    key={d._id}
                    onClick={() => setDoctorId(d._id)}
                    sx={{
                      p: 1.4,
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: doctorId === d._id ? "#0aa07a" : "#E5E7EB",
                      bgcolor:
                        doctorId === d._id ? "rgba(10,160,122,0.05)" : "#fff",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.25,
                      cursor: "pointer",
                      transition: "all .2s",
                      "&:hover": { boxShadow: "0 8px 24px rgba(16,24,40,.06)" },
                    }}
                  >
                    <Avatar
                      src={d.photoUrl || fallbackDoctorAvatar}
                      alt={d.name}
                      onError={(e) =>
                        (e.currentTarget.src = fallbackDoctorAvatar)
                      }
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700 }} noWrap>
                        {d.name}
                      </Typography>
                      <Typography
                        sx={{ color: "text.secondary", fontSize: 13 }}
                        noWrap
                      >
                        {d.specialty || "Doctor"}
                      </Typography>
                    </Box>
                    {doctorId === d._id ? (
                      <CheckCircleRoundedIcon sx={{ color: "#0aa07a" }} />
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
        )}
      </CardContent>

      {/* Footer Buttons */}
      <Box
        sx={{
          px: { xs: 2.5, md: 4 },
          py: 1.75,
          borderTop: "1px dashed #E5E7EB",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "#f9fafb",
        }}
      >
        <Button
          variant="outlined"
          onClick={onBack}
          sx={{
            borderRadius: 999,
            textTransform: "none",
            px: 3,
          }}
        >
          ‹ Back
        </Button>
        <Tooltip
          title={!canNext ? "Please select clinic and doctor" : ""}
          disableHoverListener={canNext}
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
              sx={{
                borderRadius: 999,
                textTransform: "none",
                px: 3,
                fontWeight: 700,
                bgcolor: "#0aa07a",
                "&:hover": { bgcolor: "#088a69" },
              }}
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
  doctor: PropTypes.object,
  clinics: PropTypes.array,
  initialType: PropTypes.string,
  initialClinicId: PropTypes.string,
  onBack: PropTypes.func,
  onNext: PropTypes.func,
  onChange: PropTypes.func,
  loading: PropTypes.bool,
  error: PropTypes.string,
};
