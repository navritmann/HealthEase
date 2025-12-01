import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Stack,
  Typography,
  CircularProgress,
  Button,
  Rating,
  Divider,
  Paper,
  Link as MLink,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";

export default function DoctorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRes = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/doctors/${id}`
        );
        setDoctor(docRes.data);
        const svcRes = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/services/doctor/${id}`
        );
        setServices(svcRes.data);
      } catch (err) {
        console.error("Error fetching doctor:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading)
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
        <CircularProgress />
      </Stack>
    );

  if (!doctor)
    return (
      <Container sx={{ py: 8 }}>
        <Typography align="center" color="text.secondary">
          Doctor not found.
        </Typography>
      </Container>
    );

  // Modern neutral avatar placeholder (no upload needed)
  const fallbackImage =
    "https://cdn-icons-png.flaticon.com/512/5003/5003090.png";

  return (
    <>
      <Navbar />

      {/* ==== Hero Section ==== */}
      <Box
        sx={{
          background: "linear-gradient(135deg,#0aa07a 0%,#0a3e57 100%)",
          color: "#fff",
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="lg">
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate("/doctors")}
            sx={{
              mb: 3,
              color: "#fff",
              textTransform: "none",
              fontWeight: 600,
              opacity: 0.9,
              "&:hover": { opacity: 1 },
            }}
          >
            Back to Doctors
          </Button>

          <Grid container spacing={5} alignItems="center">
            {/* Left Column */}
            <Grid item xs={12} md={4}>
              <Stack alignItems="center" spacing={2}>
                <Box
                  component="img"
                  src={doctor.photoUrl || fallbackImage}
                  alt={doctor.name}
                  onError={(e) => (e.currentTarget.src = fallbackImage)}
                  sx={{
                    width: 180,
                    height: 180,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "5px solid rgba(255,255,255,0.8)",
                    boxShadow: "0 10px 30px rgba(0,0,0,.25)",
                  }}
                />
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, textAlign: "center" }}
                >
                  {doctor.name}
                </Typography>
                <Typography sx={{ opacity: 0.85, fontSize: 16 }}>
                  {doctor.specialty || "Specialty not specified"}
                </Typography>
                <Rating
                  value={doctor.rating || 0}
                  precision={0.5}
                  readOnly
                  sx={{ mt: 0.5 }}
                />
                <Typography
                  sx={{
                    fontSize: 14,
                    opacity: 0.85,
                    textAlign: "center",
                    mt: 1,
                    maxWidth: 260,
                  }}
                >
                  {doctor.addressLine || "Clinic address not available"}
                </Typography>
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{
                    mt: 2,
                    borderRadius: 999,
                    px: 3,
                    py: 1,
                    fontWeight: 700,
                    textTransform: "none",
                    bgcolor: "#fff",
                    color: "#0a3e57",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                  }}
                  onClick={() => navigate(`/appointments?doctor=${doctor._id}`)}
                >
                  Book Appointment
                </Button>
              </Stack>
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={8}>
              <Paper
                elevation={3}
                sx={{
                  p: { xs: 3, md: 5 },
                  borderRadius: 4,
                  bgcolor: "#ffffff",
                  boxShadow: "0 10px 30px rgba(0,0,0,.12)",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "#0a3e57",
                    mb: 1.5,
                  }}
                >
                  About {doctor.name.split(" ")[0]}
                </Typography>
                <Typography
                  sx={{ color: "text.secondary", mb: 3, fontSize: 15 }}
                >
                  {doctor.bio ||
                    `Dr. ${
                      doctor.name.split(" ")[1] || doctor.name
                    } is a dedicated healthcare
                    professional providing compassionate, evidence-based care.`}
                </Typography>

                {doctor.clinics?.length > 0 && (
                  <Typography
                    sx={{ color: "text.secondary", mb: 3, fontSize: 15 }}
                  >
                    <b>Clinics:</b> {doctor.clinics.join(", ")}
                  </Typography>
                )}

                <Divider sx={{ my: 3 }} />

                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#0a3e57", mb: 2 }}
                >
                  Offered Services
                </Typography>

                {services.length === 0 ? (
                  <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                    No services listed for this doctor.
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {services.map((svc) => (
                      <Grid key={svc._id} item xs={12} sm={6}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: "1px solid #E4EBEF",
                            bgcolor: "#fafafa",
                            transition: "0.25s",
                            "&:hover": {
                              boxShadow: "0 6px 16px rgba(16,24,40,.1)",
                            },
                          }}
                        >
                          <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                            {svc.name}
                          </Typography>
                          <Typography
                            sx={{ color: "text.secondary", fontSize: 14 }}
                          >
                            {svc.description || "No description provided."}
                          </Typography>
                          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                            <Typography
                              sx={{ fontWeight: 600, color: "#0aa07a" }}
                            >
                              ${svc.basePrice}
                            </Typography>
                            <Typography
                              sx={{ color: "text.secondary", fontSize: 13 }}
                            >
                              {svc.durationMins} mins
                            </Typography>
                          </Stack>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ bgcolor: "#fff", borderTop: "1px solid #E9EEF3" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
          <Grid container spacing={{ xs: 4, md: 6 }}>
            {/* Col 1: Logo + blurb + social */}
            <Grid item xs={12} md={4}>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <Box
                    component="img"
                    src="/images/logo.png"
                    alt="HealthEase"
                    sx={{
                      width: 36,
                      height: 36,
                      objectFit: "contain",
                      borderRadius: 1,
                    }}
                  />
                  <Typography sx={{ fontWeight: 800, color: "#0aa07a" }}>
                    Health<span style={{ color: "#111" }}>Ease</span>
                  </Typography>
                </Stack>
                <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                  At Health Ease, we believe that good health should be simple,
                  accessible, and compassionate. Combining advanced healthcare
                  technology with a caring human touch, we make your journey to
                  better health easier and more comfortable.
                </Typography>
                <Stack direction="row" spacing={1.5} sx={{ mt: 0.5 }}>
                  <MLink
                    href="#"
                    sx={{ color: "#0a3e57" }}
                    aria-label="Twitter"
                  >
                    <TwitterIcon fontSize="small" />
                  </MLink>
                  <MLink
                    href="#"
                    sx={{ color: "#0a3e57" }}
                    aria-label="Facebook"
                  >
                    <FacebookIcon fontSize="small" />
                  </MLink>
                  <MLink
                    href="#"
                    sx={{ color: "#0a3e57" }}
                    aria-label="Instagram"
                  >
                    <InstagramIcon fontSize="small" />
                  </MLink>
                </Stack>
              </Stack>
            </Grid>

            {/* Col 2: Quick Links */}
            <Grid item xs={12} sm={6} md={2.5}>
              <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
                Quick Links
              </Typography>
              <Stack spacing={1}>
                {[
                  { label: "Home", to: "/" },
                  { label: "About Us", to: "/about" },
                  { label: "Services", to: "/#services" },
                  { label: "Doctors & Specialists", to: "/#doctors" },
                  { label: "FAQs", to: "/#faq" },
                  { label: "Blog", to: "#" },
                  { label: "Contact Us", to: "/contact" },
                ].map((l) => (
                  <MLink
                    key={l.label}
                    component={RouterLink}
                    to={l.to}
                    underline="none"
                    sx={{
                      color: "text.secondary",
                      fontSize: 14,
                      "&:hover": { color: "#0aa07a" },
                    }}
                  >
                    {l.label}
                  </MLink>
                ))}
              </Stack>
            </Grid>

            {/* Col 3: Our Services */}
            <Grid item xs={12} sm={6} md={2.5}>
              <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
                Our Services
              </Typography>
              <Stack spacing={1}>
                {[
                  "General Consultation",
                  "Preventive Health Checkups",
                  "Chronic Disease Management",
                  "Diagnostic & Lab Services",
                  "Telemedicine",
                  "Pharmacy Support",
                ].map((t) => (
                  <Typography
                    key={t}
                    sx={{ color: "text.secondary", fontSize: 14 }}
                  >
                    {t}
                  </Typography>
                ))}
              </Stack>
            </Grid>

            {/* Col 4: Contact Us */}
            <Grid item xs={12} md={3}>
              <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
                Contact Us
              </Typography>
              <Stack spacing={1}>
                <Box>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    Address
                  </Typography>
                  <Typography sx={{ fontSize: 14 }}>
                    123 Wellness Avenue, City Name, State, ZIP
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    Phone Number
                  </Typography>
                  <Typography sx={{ fontSize: 14 }}>
                    +1 (000) 456-7890
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    Email Address
                  </Typography>
                  <Typography sx={{ fontSize: 14 }}>
                    info@healthease.com
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Container>

        {/* copyright strip */}
        <Box sx={{ borderTop: "1px solid #E9EEF3", py: 2 }}>
          <Container maxWidth="lg">
            <Typography
              align="center"
              sx={{ color: "text.secondary", fontSize: 13 }}
            >
              © {new Date().getFullYear()} Health Ease. All rights reserved.
            </Typography>
          </Container>
        </Box>
      </Box>
    </>
  );
}
