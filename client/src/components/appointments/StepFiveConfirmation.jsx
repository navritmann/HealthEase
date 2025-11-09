import PropTypes from "prop-types";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

export default function StepFiveConfirmation({
  doctor,
  summary,
  bookingNumber,
  onBack,
  onReschedule,
  onAddCalendar,
  onStartNew,
  video,
}) {
  const d = doctor ?? {};
  const s = summary ?? {};
  const v = video ?? {};

  return (
    <Card
      sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid #EAECF0" }}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
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
              src={d.photoUrl || ""}
              alt={d.name || "Doctor"}
              sx={{ width: 56, height: 56 }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ fontWeight: 800 }} noWrap>
                  {d.name || "Healthcare Provider"}
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
              <Typography sx={{ color: "primary.main", fontSize: 13 }} noWrap>
                {d.specialty || "Doctor"}
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 12 }} noWrap>
                {d.addressLine || ""}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Confirmation body */}
        <Box
          sx={{
            border: "1px solid #E5E7EB",
            borderRadius: 2,
            p: 2,
            bgcolor: "#fff",
          }}
        >
          <Typography sx={{ fontWeight: 800, mb: 1 }}>
            Booking Confirmed ✅
          </Typography>
          <Typography sx={{ color: "text.secondary", mb: 2 }}>
            Your appointment has been scheduled successfully.
          </Typography>

          <Stack spacing={1.25} sx={{ mb: 2 }}>
            <Row k="Booking No." v={bookingNumber || "—"} />
            <Row k="Service" v={s.service || "—"} />
            <Row k="Add-on(s)" v={s.addOnService || "—"} />
            <Row k="Date & Time" v={s.dateLabel || "—"} />
            <Row k="Appointment type" v={s.appointmentType || "—"} />
            {s.clinicName ? <Row k="Clinic" v={s.clinicName} /> : null}
            {v.joinUrl && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography sx={{ fontWeight: 700, mb: 1 }}>
                  Video Call Info
                </Typography>
                <Row
                  k="Join Link"
                  v={
                    <a href={v.joinUrl} target="_blank" rel="noreferrer">
                      {v.joinUrl}
                    </a>
                  }
                />
                {v.pin && (
                  <Row
                    k="PIN"
                    v={
                      <span style={{ fontWeight: 700, color: "#1976d2" }}>
                        {v.pin}
                      </span>
                    }
                  />
                )}
              </>
            )}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button variant="outlined" onClick={onReschedule}>
              Reschedule
            </Button>
            <Button variant="outlined" onClick={onAddCalendar}>
              Add to Calendar
            </Button>
            <Button variant="contained" onClick={onStartNew}>
              Book Another Appointment
            </Button>
            {s.videoJoinUrl ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => window.open(s.videoJoinUrl, "_blank")}
              >
                Join Video Call
              </Button>
            ) : null}
          </Stack>
        </Box>
      </CardContent>

      {/* Footer */}
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
        <Box />
      </Box>
    </Card>
  );
}

function Row({ k, v }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
      <Typography sx={{ color: "text.secondary" }}>{k}</Typography>
      <Typography sx={{ fontWeight: 700 }}>{v}</Typography>
    </Box>
  );
}
Row.propTypes = { k: PropTypes.string, v: PropTypes.node };

StepFiveConfirmation.propTypes = {
  doctor: PropTypes.object,
  summary: PropTypes.object,
  bookingNumber: PropTypes.string,
  onBack: PropTypes.func,
  onReschedule: PropTypes.func,
  onAddCalendar: PropTypes.func,
  onStartNew: PropTypes.func,
  video: PropTypes.object,
};
