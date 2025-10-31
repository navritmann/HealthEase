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
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

export default function StepFiveConfirmation({
  doctor = {
    name: "Dr. Michael Brown",
    specialty: "Psychologist",
    rating: 5.0,
    photoUrl: "",
  },
  summary = {
    service: "Cardiology (30 Mins)",
    addOnService: "Echocardiograms",
    dateLabel: "10:00 - 11:00 AM, 15, Oct 2025",
    appointmentType: "Clinic",
    clinicName: "Wellness Path",
    clinicLinkLabel: "View Location",
  },
  bookingNumber = "DCRA12565",
  onBack,
  onReschedule,
  onAddCalendar,
  onStartNew,
}) {
  return (
    <Card
      sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid #EAECF0" }}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Grid container spacing={2}>
          {/* LEFT */}
          <Grid item xs={12} md={8.2}>
            {/* success header */}
            <Box
              sx={{
                border: "1px solid #E5E7EB",
                borderRadius: 2,
                p: 2,
                mb: 2,
                bgcolor: "#F8FFF8",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <CheckCircleRoundedIcon sx={{ color: "#16A34A" }} />
                <Typography sx={{ fontWeight: 800 }}>
                  Booking Confirmed
                </Typography>
              </Stack>

              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{ mt: 1.5 }}
              >
                <Avatar
                  src={doctor.photoUrl || ""}
                  alt={doctor.name}
                  sx={{ width: 40, height: 40 }}
                />
                <Typography sx={{ color: "text.secondary" }}>
                  Your Booking has been Confirmed with <b>{doctor.name}</b>{" "}
                  &nbsp; be on time before <b>15 Mins</b> From the appointment
                  Time
                </Typography>
              </Stack>
            </Box>

            {/* booking info card */}
            <Box
              sx={{
                border: "1px solid #E5E7EB",
                borderRadius: 2,
                p: 2,
                mb: 2,
                bgcolor: "#fff",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography sx={{ fontWeight: 700 }}>Booking Info</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={onReschedule}
                  sx={{ textTransform: "none" }}
                >
                  Reschedule
                </Button>
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    Service
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {summary.service}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    Additional Service
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {summary.addOnService}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    Date & Time
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {summary.dateLabel}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    Appointment type
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {summary.appointmentType}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    Clinic Name & Location
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {summary.clinicName}&nbsp;&nbsp;
                    <Button
                      size="small"
                      variant="text"
                      sx={{ textTransform: "none", px: 0.5 }}
                    >
                      {summary.clinicLinkLabel}
                    </Button>
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* assistance card */}
            <Box
              sx={{
                border: "1px solid #E5E7EB",
                borderRadius: 2,
                p: 2,
                bgcolor: "#fff",
              }}
            >
              <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
                Need Our Assistance
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 14, mb: 1 }}>
                Call us in case you face any Issue on Booking / Cancellation
              </Typography>
              <Button
                variant="outlined"
                size="small"
                sx={{ textTransform: "none" }}
              >
                Call Us
              </Button>
            </Box>
          </Grid>

          {/* RIGHT */}
          <Grid item xs={12} md={3.8}>
            <Box
              sx={{
                border: "1px solid #E5E7EB",
                borderRadius: 2,
                p: 2,
                bgcolor: "#fff",
              }}
            >
              <Typography
                align="center"
                sx={{ fontSize: 13, color: "text.secondary" }}
              >
                Booking Number
              </Typography>
              <Box sx={{ display: "grid", placeItems: "center", my: 1 }}>
                <Chip
                  label={bookingNumber}
                  sx={{
                    bgcolor: "#E9FCEB",
                    color: "#047857",
                    fontWeight: 700,
                    borderRadius: 1,
                  }}
                />
              </Box>

              {/* QR placeholder */}
              <Box
                sx={{
                  my: 2,
                  mx: "auto",
                  width: 150,
                  height: 150,
                  borderRadius: 2,
                  bgcolor: "#F3F4F6",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 700,
                  color: "text.secondary",
                }}
                aria-label="QR placeholder"
              >
                QR
              </Box>

              <Typography
                align="center"
                sx={{ color: "text.secondary", fontSize: 13, mb: 2 }}
              >
                Scan this QR Code to Download the details of Appointment
              </Typography>

              <Stack spacing={1}>
                <Button
                  variant="contained"
                  onClick={onAddCalendar}
                  sx={{ textTransform: "none" }}
                >
                  Add To Calendar
                </Button>
                <Button
                  variant="contained"
                  color="info"
                  onClick={onStartNew}
                  sx={{ textTransform: "none", bgcolor: "#0EA5E9" }}
                >
                  Start New Booking
                </Button>
              </Stack>
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
        <Box />
      </Box>
    </Card>
  );
}
