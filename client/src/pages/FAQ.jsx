// src/pages/FAQ.jsx
import React, { useState } from "react";
import {
  Box,
  Container,
  Stack,
  Typography,
  Breadcrumbs,
  Link as MLink,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Button,
  Grid,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { Link as RouterLink } from "react-router-dom";
import Navbar from "../components/Navbar";
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";

export default function FAQ() {
  const [expanded, setExpanded] = useState(false);
  const handleChange = (panel) => (_e, isExpanded) =>
    setExpanded(isExpanded ? panel : false);

  const faqs = [
    {
      id: "f1",
      q: "How do I book an appointment with a doctor?",
      a: "You can easily book an appointment by visiting our 'Appointments' page, selecting a doctor, and choosing an available time slot. Confirmation will be sent to your registered email.",
    },
    {
      id: "f2",
      q: "Do I need to create an account to book appointments?",
      a: "Yes. Creating an account allows us to securely store your medical records and appointment history, ensuring a seamless healthcare experience.",
    },
    {
      id: "f3",
      q: "Can I reschedule or cancel my appointment?",
      a: "Absolutely. You can reschedule or cancel your appointment from your dashboard before the scheduled time. Cancellation policies may vary by doctor or clinic.",
    },
    {
      id: "f4",
      q: "What payment methods are accepted?",
      a: "We accept all major credit and debit cards, as well as secure online payments through trusted gateways.",
    },
    {
      id: "f5",
      q: "Do you offer telemedicine or online consultations?",
      a: "Yes. Many of our doctors offer virtual consultations via our secure video platform. You can select 'Online Appointment' when booking.",
    },
    {
      id: "f6",
      q: "Is my personal information safe on HealthEase?",
      a: "Your privacy is our priority. All user data is encrypted and stored securely. We follow HIPAA-compliant data protection standards.",
    },
  ];

  return (
    <>
      <Navbar />

      <Box component="main" role="main">
        {/* ===== Hero Section ===== */}
        <Box
          sx={{
            position: "relative",
            height: { xs: 360, md: 460 },
            backgroundImage: `url(https://img.freepik.com/free-photo/doctor-holding-patient-hand_53876-14957.jpg)`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            display: "flex",
            alignItems: "center",
            color: "#fff",
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
            }}
          >
            <Stack spacing={2}>
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
                  FAQ
                </Typography>
              </Breadcrumbs>

              {/* H1 for page */}
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
                Frequently Asked{" "}
                <span style={{ fontStyle: "italic" }}>Questions</span>
              </Typography>

              <Typography
                sx={{
                  maxWidth: 720,
                  color: "rgba(255,255,255,.92)",
                  fontSize: { xs: 14, md: 16 },
                }}
              >
                Here are answers to the most common questions about HealthEase,
                appointments, and our services.
              </Typography>
            </Stack>
          </Container>
        </Box>

        {/* ===== FAQ Section ===== */}
        <Box sx={{ bgcolor: "#fff" }}>
          <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
            {faqs.map((item, idx) => (
              <Accordion
                key={item.id}
                expanded={expanded === item.id}
                onChange={handleChange(item.id)}
                disableGutters
                elevation={0}
                sx={{
                  mb: 1.5,
                  borderRadius: 2,
                  border: "1px solid #E4EBEF",
                  "&::before": { display: "none" },
                  boxShadow:
                    expanded === item.id
                      ? "0 6px 24px rgba(16,24,40,.08)"
                      : "0 2px 6px rgba(16,24,40,.05)",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: "#047857" }} />}
                >
                  <Typography sx={{ fontWeight: 700, color: "#1d2b3a" }}>
                    {idx + 1}. {item.q}
                  </Typography>
                </AccordionSummary>
                <Divider />
                <AccordionDetails>
                  <Typography sx={{ color: "text.secondary", fontSize: 15 }}>
                    {item.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Container>
        </Box>

        {/* ===== Still Have Questions Section ===== */}
        <Box
          sx={{
            bgcolor: "#f8fafa",
            py: { xs: 6, md: 10 },
            textAlign: "center",
          }}
        >
          <Container maxWidth="sm">
            {/* H2, next level after page H1 */}
            <Typography
              component="h2"
              variant="h5"
              sx={{ fontWeight: 700, color: "#0a3e57", mb: 1 }}
            >
              Still have questions?
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 3 }}>
              We’re here to help you. Reach out to our support team for any
              additional queries.
            </Typography>
            <Button
              variant="contained"
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{
                borderRadius: 999,
                px: 3,
                py: 1.2,
                textTransform: "none",
                fontWeight: 700,
                bgcolor: "#047857",
                "&:hover": { bgcolor: "#065F46" },
              }}
              onClick={() =>
                (window.location.href =
                  "mailto:info@healthease.com?subject=Support%20Request")
              }
            >
              Contact Support
            </Button>
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
                <Stack
                  direction="row"
                  spacing={1.25}
                  alignItems="center"
                  component={RouterLink}
                  to="/"
                  sx={{ textDecoration: "none" }}
                >
                  {/* decorative logo: no redundant alt */}
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
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: "#102A43" }}
                    aria-label="Twitter"
                  >
                    <TwitterIcon fontSize="small" />
                  </MLink>
                  <MLink
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: "#102A43" }}
                    aria-label="Facebook"
                  >
                    <FacebookIcon fontSize="small" />
                  </MLink>
                  <MLink
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: "#102A43" }}
                    aria-label="Instagram"
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
                  { label: "Contact Us", to: "mailto:info@healthease.com" },
                ].map((l) => {
                  const isSectionLink = l.to.startsWith("/#");
                  const isPlaceholder = l.to === "#";
                  const isMail = l.to.startsWith("mailto:");

                  if (isPlaceholder) {
                    return (
                      <MLink
                        key={l.label}
                        href="#"
                        underline="none"
                        sx={{
                          color: "text.secondary",
                          fontSize: 14,
                          "&:hover": { color: "#047857" },
                        }}
                      >
                        {l.label}
                      </MLink>
                    );
                  }

                  if (isMail) {
                    return (
                      <MLink
                        key={l.label}
                        href={l.to}
                        underline="none"
                        sx={{
                          color: "text.secondary",
                          fontSize: 14,
                          "&:hover": { color: "#047857" },
                        }}
                      >
                        {l.label}
                      </MLink>
                    );
                  }

                  if (isSectionLink) {
                    return (
                      <MLink
                        key={l.label}
                        component="a"
                        href={l.to}
                        underline="none"
                        sx={{
                          color: "text.secondary",
                          fontSize: 14,
                          "&:hover": { color: "#047857" },
                        }}
                      >
                        {l.label}
                      </MLink>
                    );
                  }

                  return (
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
                  );
                })}
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
