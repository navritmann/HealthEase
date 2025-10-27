// src/components/appointments/StepOneTypeClinic.jsx
import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";

const TYPE_TILES = [
  { key: "clinic", label: "Clinic", icon: <LocalHospitalRoundedIcon /> },
  { key: "video", label: "Video Call", icon: <VideocamRoundedIcon /> },
  { key: "audio", label: "Audio Call", icon: <CallRoundedIcon /> },
  { key: "chat", label: "Chat", icon: <ChatRoundedIcon /> },
  { key: "home_visit", label: "Home Visit", icon: <HomeRoundedIcon /> },
];

function Tile({ active, icon, label, onClick }) {
  return (
    <Button
      onClick={onClick}
      variant="outlined"
      startIcon={icon}
      sx={{
        px: 3,
        py: 1.5,
        borderRadius: 2,
        borderColor: active ? "primary.main" : "#E5E7EB",
        bgcolor: active ? "rgba(2,132,199,0.06)" : "#fff",
        color: "text.primary",
        textTransform: "none",
        fontWeight: 700,
        "&:hover": { bgcolor: active ? "rgba(2,132,199,0.10)" : "#FAFAFA" },
      }}
    >
      {label}
    </Button>
  );
}

function ClinicRow({ clinic, selected, onSelect }) {
  return (
    <Box
      onClick={onSelect}
      id={`clinic-${clinic._id}`}
      sx={{
        border: selected ? "2px solid" : "1px solid",
        borderColor: selected ? "primary.main" : "#E5E7EB",
        borderRadius: 2,
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
        <Box
          sx={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            border: "2px solid",
            borderColor: selected ? "primary.main" : "#D1D5DB",
            bgcolor: selected ? "primary.main" : "transparent",
            flexShrink: 0,
          }}
        />
      </Stack>
    </Box>
  );
}

/**
 * Props:
 *  - doctor: {_id, name, specialty, rating, photoUrl, addressLine}
 *  - clinics: [{ _id, name, address, city, state, zip, logoUrl, distanceLabel? }]
 *  - initialType, initialClinicId
 *  - onBack()
 *  - onNext({ appointmentType, clinicId, clinicMeta })
 *  - onChange({ appointmentType, clinicId })  // optional live updates
 *  - loading (bool), error (string)           // for clinics fetch state
 */
export default function StepOneTypeClinic({
  doctor,
  clinics = [],
  initialType = "clinic",
  initialClinicId = "",
  onBack,
  onNext,
  onChange,
  loading = false,
  error = "",
}) {
  const [appointmentType, setAppointmentType] = useState(initialType);
  const [clinicId, setClinicId] = useState(initialClinicId);

  useEffect(() => {
    setAppointmentType(initialType);
  }, [initialType]);

  useEffect(() => {
    setClinicId(initialClinicId);
  }, [initialClinicId]);

  const requiresClinic = useMemo(
    () => appointmentType === "clinic" || appointmentType === "home_visit",
    [appointmentType]
  );

  const selectedClinic = useMemo(
    () => clinics.find((c) => c._id === clinicId),
    [clinics, clinicId]
  );

  const canNext = !requiresClinic || Boolean(clinicId);

  const handleTypeChange = (key) => {
    setAppointmentType(key);
    if (!(key === "clinic" || key === "home_visit")) {
      setClinicId("");
      onChange?.({ appointmentType: key, clinicId: "" });
    } else {
      onChange?.({ appointmentType: key, clinicId });
    }
  };

  const handleClinicSelect = (id) => {
    setClinicId(id);
    onChange?.({ appointmentType, clinicId: id });
    // Keep the selected one in view for long lists
    setTimeout(
      () =>
        document
          .getElementById(`clinic-${id}`)
          ?.scrollIntoView({ block: "nearest", behavior: "smooth" }),
      0
    );
  };

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        {/* Doctor header (optional) */}
        {doctor && (
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

        {/* Appointment Type */}
        <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
          Select Appointment Type
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1.25} sx={{ mb: 2 }}>
          {TYPE_TILES.map((t) => (
            <Tile
              key={t.key}
              label={t.label}
              icon={t.icon}
              active={appointmentType === t.key}
              onClick={() => handleTypeChange(t.key)}
            />
          ))}
        </Stack>

        {/* Clinics (if required) */}
        {requiresClinic && (
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
                  {clinics.map((c) => (
                    <ClinicRow
                      key={c._id}
                      clinic={c}
                      selected={clinicId === c._id}
                      onSelect={() => handleClinicSelect(c._id)}
                    />
                  ))}
                </Stack>
                {!clinics.length && (
                  <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                    No clinics available. Try Video Call or Audio Call.
                  </Typography>
                )}
              </>
            )}
          </>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Footer actions */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Button
            variant="outlined"
            onClick={onBack}
            sx={{ borderRadius: 999 }}
          >
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
                  })
                }
                sx={{ borderRadius: 999 }}
              >
                Select Date & Time →
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </CardContent>
    </Card>
  );
}

Tile.propTypes = {
  active: PropTypes.bool.isRequired,
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

ClinicRow.propTypes = {
  clinic: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    logoUrl: PropTypes.string,
    distanceLabel: PropTypes.string,
  }).isRequired,
  selected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};

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
