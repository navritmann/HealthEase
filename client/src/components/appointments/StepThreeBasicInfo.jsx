import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export default function StepThreeBasicInfo({
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
    dateLabel: "10:00 - 11:00 AM, 15, Oct 2025",
    appointmentType: "Clinic (Wellness Path)",
  },
  onBack,
  onNext,
}) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    patientId: "p1",
    symptoms: "",
    reason: "",
    attachmentName: "",
  });

  const PATIENTS = [
    { id: "p1", label: "Andrew Fletcher" },
    { id: "p2", label: "Self" },
    { id: "p3", label: "Family – John" },
  ];

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const fakePickFile = () =>
    setForm((f) => ({ ...f, attachmentName: "report.pdf" }));

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
                {summary.dateLabel}
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

        {/* Form card */}
        <Box
          sx={{
            border: "1px solid #E5E7EB",
            borderRadius: 2,
            p: 2,
            bgcolor: "#fff",
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography sx={{ fontSize: 12, mb: 0.5 }}>First Name</Typography>
              <TextField
                size="small"
                fullWidth
                name="firstName"
                value={form.firstName}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography sx={{ fontSize: 12, mb: 0.5 }}>Last Name</Typography>
              <TextField
                size="small"
                fullWidth
                name="lastName"
                value={form.lastName}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography sx={{ fontSize: 12, mb: 0.5 }}>
                Phone Number
              </Typography>
              <TextField
                size="small"
                fullWidth
                name="phone"
                value={form.phone}
                onChange={onChange}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography sx={{ fontSize: 12, mb: 0.5 }}>
                Email Address
              </Typography>
              <TextField
                size="small"
                fullWidth
                name="email"
                value={form.email}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography sx={{ fontSize: 12, mb: 0.5 }}>
                  Select Patient
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  sx={{ textTransform: "none" }}
                >
                  Add New
                </Button>
              </Stack>
              <FormControl fullWidth size="small">
                <Select
                  name="patientId"
                  value={form.patientId}
                  onChange={onChange}
                >
                  {PATIENTS.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography sx={{ fontSize: 12, mb: 0.5 }}>Symptoms</Typography>
              <TextField
                size="small"
                fullWidth
                name="symptoms"
                value={form.symptoms}
                onChange={onChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography sx={{ fontSize: 12, mb: 0.5 }}>Attachment</Typography>
              <Button
                variant="text"
                onClick={fakePickFile}
                sx={{
                  border: "1px solid #E5E7EB",
                  borderRadius: 1.5,
                  px: 1.5,
                  py: 1,
                  justifyContent: "flex-start",
                  color: "primary.main",
                }}
                fullWidth
              >
                {form.attachmentName ? form.attachmentName : "Upload File"}
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Typography sx={{ fontSize: 12, mb: 0.5 }}>
                Reason for Visit
              </Typography>
              <TextField
                size="small"
                fullWidth
                multiline
                minRows={4}
                name="reason"
                value={form.reason}
                onChange={onChange}
              />
            </Grid>
          </Grid>
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
        <Button
          variant="contained"
          sx={{ borderRadius: 999 }}
          onClick={() => onNext({ ...form })}
        >
          Select Payment →
        </Button>
      </Box>
    </Card>
  );
}
