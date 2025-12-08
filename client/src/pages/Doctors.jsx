// src/pages/Doctors.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Stack,
  Typography,
  Paper,
  Button,
  Breadcrumbs,
  Link as MLink,
  CircularProgress,
  Rating,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";

export default function Doctors() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/doctors`
        );
        setDoctors(res.data);
      } catch (err) {
        console.error("Error fetching doctors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const fallbackImage =
    "https://cdn-icons-png.flaticon.com/512/5003/5003090.png";

  return (
    <>
      <Navbar />

      {/* MAIN CONTENT AREA */}
      <Box component="main" role="main">
        {/* ===== Hero Section ===== */}
        <Box
          sx={{
            position: "relative",
            height: { xs: 360, md: 460 },
            backgroundImage: `url(/images/doctors-hero.jpg)`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.35) 100%)",
            }}
          />
          <Container
            maxWidth="lg"
            sx={{
              position: "relative",
              zIndex: 1,
              height: "100%",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Stack spacing={2} sx={{ color: "#fff" }}>
              <Breadcrumbs
                aria-label="breadcrumb"
                sx={{
                  "& a, & p": { color: "rgba(255,255,255,.85)", fontSize: 13 },
                  mb: { xs: 0.5, md: 1 },
                }}
              >
                <MLink
                  component={RouterLink}
                  underline="hover"
                  color="inherit"
                  to="/"
                >
                  Home
                </MLink>
                <Typography
                  component="span"
                  sx={{ opacity: 0.9, fontSize: 13 }}
                >
                  Doctors
                </Typography>
              </Breadcrumbs>

              {/* H1 for the page */}
              <Typography
                component="h1"
                variant="h2"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.1,
                  fontSize: { xs: 32, md: 56 },
                  textShadow: "0 2px 16px rgba(0,0,0,.35)",
                }}
              >
                Meet Our{" "}
                <span style={{ fontStyle: "italic" }}>Specialists</span>
              </Typography>

              <Typography
                sx={{
                  maxWidth: 720,
                  color: "rgba(255,255,255,.92)",
                  fontSize: { xs: 14, md: 16 },
                }}
              >
                Experienced professionals across multiple specialties — ready to
                guide you on your health journey.
              </Typography>
            </Stack>
          </Container>
        </Box>

        {/* ===== Doctors Grid ===== */}
        <Box sx={{ bgcolor: "#f8fafa" }}>
          <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
            {/* H2 section heading */}
            <Typography
              component="h2"
              variant="h4"
              align="center"
              sx={{
                fontWeight: 800,
                fontSize: { xs: 24, md: 30 },
                color: "#102A43",
                mb: { xs: 3, md: 5 },
              }}
            >
              Our Expert Doctors
            </Typography>

            {loading ? (
              <Stack alignItems="center" py={5}>
                <CircularProgress />
              </Stack>
            ) : doctors.length === 0 ? (
              <Typography align="center" color="text.secondary">
                No doctors found.
              </Typography>
            ) : (
              <Grid container spacing={{ xs: 3, md: 4 }}>
                {doctors.map((doc) => (
                  <Grid key={doc._id} item xs={12} sm={6} md={4}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        border: "1px solid #E4EBEF",
                        boxShadow: "0 6px 22px rgba(16,24,40,.06)",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        alignItems: "center",
                        textAlign: "center",
                        transition: "all .3s",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "0 12px 32px rgba(16,24,40,.12)",
                        },
                      }}
                    >
                      {/* decorative avatar – text name is the real label */}
                      <Box
                        component="img"
                        src={doc.photoUrl || fallbackImage}
                        alt=""
                        role="presentation"
                        onError={(e) => (e.currentTarget.src = fallbackImage)}
                        sx={{
                          width: 140,
                          height: 140,
                          borderRadius: "50%",
                          objectFit: "cover",
                          mb: 2,
                          border: "4px solid #fff",
                          boxShadow: "0 4px 14px rgba(0,0,0,.12)",
                          backgroundColor: "#fff",
                        }}
                      />

                      {/* Card title as H3 */}
                      <Typography
                        component="h3"
                        sx={{ fontWeight: 700, fontSize: 16 }}
                      >
                        {doc.name}
                      </Typography>
                      <Typography
                        sx={{ color: "#03543F", fontSize: 14, mb: 0.75 }}
                      >
                        {doc.specialty || "Specialty not specified"}
                      </Typography>

                      {/* Rating – stars hidden from SR, text gives info */}
                      <Rating
                        value={doc.rating || 0}
                        precision={0.5}
                        readOnly
                        size="small"
                        sx={{ mb: 0.25 }}
                        aria-hidden="true"
                      />
                      <Typography
                        sx={{
                          color: "text.secondary",
                          fontSize: 12,
                          mb: 1.5,
                        }}
                        aria-label={
                          doc.rating
                            ? `Average rating ${doc.rating} out of 5`
                            : "No ratings yet"
                        }
                      >
                        {doc.rating
                          ? `${doc.rating.toFixed(1)} / 5 rating`
                          : "No ratings yet"}
                      </Typography>

                      <Typography
                        sx={{
                          color: "text.secondary",
                          fontSize: 13,
                          mb: 2,
                          maxWidth: 240,
                        }}
                      >
                        {doc.addressLine || "Clinic address not available"}
                      </Typography>

                      <Button
                        variant="contained"
                        endIcon={<ArrowForwardRoundedIcon />}
                        onClick={() => navigate(`/doctor/${doc._id}`)}
                        sx={{
                          borderRadius: 999,
                          textTransform: "none",
                          fontWeight: 700,
                          bgcolor: "#047857",
                          "&:hover": { bgcolor: "#065F46" },
                        }}
                        aria-label={`View profile for ${doc.name}`}
                      >
                        View Profile
                      </Button>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Container>
        </Box>
      </Box>

      {/* ===== Footer ===== */}
      <Box sx={{ bgcolor: "#fff", borderTop: "1px solid #E9EEF3" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
          <Grid container spacing={{ xs: 4, md: 6 }}>
            {/* Col 1: Logo + blurb + social */}
            <Grid item xs={12} md={4}>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  {/* decorative logo to avoid redundant alt */}
                  <Box
                    component="img"
                    src="/images/logo.png"
                    alt=""
                    role="presentation"
                    sx={{
                      width: 36,
                      height: 36,
                      objectFit: "contain",
                      borderRadius: 1,
                    }}
                  />
                  <Typography sx={{ fontWeight: 800, color: "#047857" }}>
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
                    sx={{ color: "#102A43" }}
                    aria-label="Visit HealthEase on Twitter"
                  >
                    <TwitterIcon fontSize="small" />
                  </MLink>
                  <MLink
                    href="#"
                    sx={{ color: "#102A43" }}
                    aria-label="Visit HealthEase on Facebook"
                  >
                    <FacebookIcon fontSize="small" />
                  </MLink>
                  <MLink
                    href="#"
                    sx={{ color: "#102A43" }}
                    aria-label="Visit HealthEase on Instagram"
                  >
                    <InstagramIcon fontSize="small" />
                  </MLink>
                </Stack>
              </Stack>
            </Grid>

            {/* Col 2: Quick Links */}
            <Grid item xs={12} sm={6} md={2.5}>
              <Typography
                component="h2"
                variant="subtitle1"
                sx={{ fontWeight: 700, mb: 1.5 }}
              >
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
                      "&:hover": { color: "#047857" },
                    }}
                  >
                    {l.label}
                  </MLink>
                ))}
              </Stack>
            </Grid>

            {/* Col 3: Our Services */}
            <Grid item xs={12} sm={6} md={2.5}>
              <Typography
                component="h2"
                variant="subtitle1"
                sx={{ fontWeight: 700, mb: 1.5 }}
              >
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
              <Typography
                component="h2"
                variant="subtitle1"
                sx={{ fontWeight: 700, mb: 1.5 }}
              >
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
