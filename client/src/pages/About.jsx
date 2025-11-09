// src/pages/About.jsx
import React from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Container,
  Grid,
  Stack,
  Typography,
  Link as MLink,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function About() {
  const navigate = useNavigate();
  const [faqOpen, setFaqOpen] = React.useState("a1");
  const handleFaq = (id) => (_e, expanded) => setFaqOpen(expanded ? id : false);

  return (
    <>
      <Navbar />

      {/* ===== Section 1: Hero ===== */}
      <Box
        sx={{
          position: "relative",
          height: { xs: 360, md: 460 },
          overflow: "hidden",
          backgroundImage: `url(/images/about-hero.png)`,
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
              <Typography component="span" sx={{ opacity: 0.9, fontSize: 13 }}>
                About
              </Typography>
            </Breadcrumbs>

            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                lineHeight: 1.1,
                fontSize: { xs: 32, md: 56 },
                textShadow: "0 2px 16px rgba(0,0,0,.35)",
              }}
            >
              About <span style={{ fontStyle: "italic" }}>Health</span>Ease
            </Typography>

            <Typography
              sx={{
                maxWidth: 760,
                color: "rgba(255,255,255,.92)",
                fontSize: { xs: 14, md: 16 },
              }}
            >
              We combine compassionate care with modern medicine—putting people
              first and delivering the support you need at every step of your
              health journey.
            </Typography>

            <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
              <Button
                variant="contained"
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 999,
                  px: 2.6,
                  py: 1.1,
                  bgcolor: "#0aa07a",
                  "&:hover": { bgcolor: "#088a69" },
                }}
                onClick={() => navigate("/register")}
              >
                Join Now
              </Button>

              <Button
                variant="contained"
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 999,
                  px: 2.2,
                  py: 1.05,
                  bgcolor: "rgba(255,255,255,0.92)",
                  color: "#0a3e57",
                  "&:hover": { bgcolor: "#fff" },
                }}
                onClick={() => navigate("/appointments")}
              >
                Book Appointment
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* ===== Section 2: Dedicated to Excellence ===== */}
      <Box sx={{ bgcolor: "#fff" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ position: "relative", width: "100%", maxWidth: 520 }}>
                <Box
                  component="img"
                  src="/images/about-excellence-main.png"
                  alt="Blood pressure check"
                  sx={{
                    width: "100%",
                    height: { xs: 260, md: 340 },
                    objectFit: "cover",
                    borderRadius: 4,
                    boxShadow: "0 12px 40px rgba(16,24,40,.10)",
                  }}
                />
                <Box
                  component="img"
                  src="/images/about-excellence-inset.png"
                  alt="Clinic team"
                  sx={{
                    position: "absolute",
                    right: { xs: -8, md: -24 },
                    bottom: { xs: -18, md: -24 },
                    width: { xs: 180, md: 220 },
                    height: { xs: 120, md: 140 },
                    objectFit: "cover",
                    borderRadius: 3,
                    boxShadow: "0 10px 28px rgba(16,24,40,.12)",
                    border: "6px solid #fff",
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={2.2}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, lineHeight: 1.2, color: "#1d2b3a" }}
                >
                  Dedicated to Excellence in
                  <br /> Healthcare
                </Typography>

                <Typography sx={{ color: "text.secondary" }}>
                  At Health Ease, we believe that true wellness begins with
                  compassion, care, and trust. Our mission is to make healthcare
                  more accessible, reliable, and comforting for everyone—where
                  compassion and expertise meet for better health.
                </Typography>

                <Typography sx={{ color: "text.secondary" }}>
                  We are dedicated to providing quality healthcare solutions
                  that empower individuals to take control of their well-being.
                  From preventive care and diagnosis to personalized treatment
                  and long-term support, Health Ease ensures a seamless
                  experience that prioritizes your comfort and recovery.
                </Typography>

                <Box>
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardRoundedIcon />}
                    onClick={() => navigate("/appointments")}
                    sx={{
                      mt: 0.5,
                      px: 2.6,
                      py: 1.05,
                      borderRadius: 999,
                      textTransform: "none",
                      fontWeight: 700,
                      bgcolor: "#0aa07a",
                      "&:hover": { bgcolor: "#088a69" },
                    }}
                  >
                    Book Appointment
                  </Button>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ===== Section 3: Mission & Vision ===== */}
      <Box sx={{ bgcolor: "#fff" }}>
        <Container
          maxWidth="lg"
          sx={{ pt: { xs: 3, md: 2 }, pb: { xs: 8, md: 10 } }}
        >
          <Typography
            align="center"
            sx={{
              fontWeight: 800,
              fontSize: { xs: 22, md: 28 },
              color: "#2b3a3a",
              mb: { xs: 3, md: 4 },
            }}
          >
            The Heart of Health Ease: Our
            <br />
            Mission & Vision
          </Typography>

          <Grid container spacing={{ xs: 3, md: 4 }}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: "0 12px 28px rgba(16,24,40,.10)",
                }}
              >
                <Box
                  component="img"
                  src="/images/mission.png"
                  alt="Our Mission"
                  sx={{
                    width: "100%",
                    height: { xs: 220, md: 280 },
                    objectFit: "cover",
                  }}
                />
                <Paper
                  elevation={0}
                  sx={{
                    position: "absolute",
                    left: 12,
                    right: 12,
                    bottom: 12,
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    border: "1px solid #E6EAEE",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 2,
                        bgcolor: "#0aa07a",
                        display: "grid",
                        placeItems: "center",
                        color: "#fff",
                        fontSize: 18,
                        fontWeight: 800,
                      }}
                    >
                      M
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
                        Our Mission
                      </Typography>
                      <Typography
                        sx={{ color: "text.secondary", fontSize: 14 }}
                      >
                        To deliver exceptional healthcare services with empathy
                        and excellence, ensuring every patient receives the care
                        they deserve—when and where they need it most.
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: "0 12px 28px rgba(16,24,40,.10)",
                }}
              >
                <Box
                  component="img"
                  src="/images/vision.png"
                  alt="Our Vision"
                  sx={{
                    width: "100%",
                    height: { xs: 220, md: 280 },
                    objectFit: "cover",
                  }}
                />
                <Paper
                  elevation={0}
                  sx={{
                    position: "absolute",
                    left: 12,
                    right: 12,
                    bottom: 12,
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    border: "1px solid #E6EAEE",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 2,
                        bgcolor: "#0aa07a",
                        display: "grid",
                        placeItems: "center",
                        color: "#fff",
                        fontSize: 18,
                        fontWeight: 800,
                      }}
                    >
                      V
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
                        Our Vision
                      </Typography>
                      <Typography
                        sx={{ color: "text.secondary", fontSize: 14 }}
                      >
                        To create a healthier community by blending innovation,
                        compassion, and expertise—empowering individuals to live
                        longer, stronger, and happier lives.
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ===== Section 4: Our Core Values (teal band) ===== */}
      <Box sx={{ bgcolor: "#157F79" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="flex-start">
            <Grid item xs={12} md={6}>
              <Typography
                sx={{
                  color: "#EAFDF9",
                  fontWeight: 800,
                  fontSize: { xs: 24, md: 28 },
                  mb: 1.5,
                }}
              >
                Our Core Values
              </Typography>

              <Typography sx={{ color: "rgba(255,255,255,.9)", mb: 3 }}>
                At Health Ease, our values are the foundation of everything we
                do. They guide our decisions, inspire our care, and shape how we
                serve our patients and communities.
              </Typography>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                {[
                  { n: "20+", l: "Years of Experience" },
                  { n: "10,000+", l: "Satisfied Patients" },
                  { n: "500+", l: "Qualified Staff" },
                  { n: "100+", l: "Medical Services Offered" },
                  { n: "50+", l: "Awards & Recognitions" },
                ].map((s) => (
                  <Grid key={s.l} item xs={6}>
                    <Stack spacing={0.5}>
                      <Typography
                        sx={{ color: "#ffffff", fontWeight: 800, fontSize: 28 }}
                      >
                        {s.n}
                      </Typography>
                      <Typography sx={{ color: "#CFEDEA", fontSize: 13 }}>
                        {s.l}
                      </Typography>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid rgba(255,255,255,.35)",
                  background: "#ffffff",
                  overflow: "hidden",
                }}
              >
                {[
                  {
                    id: "c1",
                    title: "Compassion in Care",
                    text: "Providing care with empathy and understanding, ensuring every patient feels valued and respected.",
                    defaultOpen: true,
                  },
                  {
                    id: "c2",
                    title: "Integrity in Action",
                    text: "Honesty, transparency, and ethics in everything we do.",
                  },
                  {
                    id: "c3",
                    title: "Excellence in Service",
                    text: "Relentless focus on quality, safety, and outcomes.",
                  },
                  {
                    id: "c4",
                    title: "Innovation for Impact",
                    text: "Adopting modern methods to improve patient experiences.",
                  },
                  {
                    id: "c5",
                    title: "Commitment to Community",
                    text: "Serving with purpose and supporting healthier lives.",
                  },
                ].map((item, idx) => (
                  <Accordion
                    key={item.id}
                    defaultExpanded={item.defaultOpen}
                    disableGutters
                    elevation={0}
                    sx={{
                      "&::before": { display: "none" },
                      borderBottom: idx === 4 ? "none" : "1px solid #E8EDF1",
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Box
                          sx={{
                            width: 26,
                            height: 26,
                            borderRadius: 1.2,
                            bgcolor: "#E7F7F4",
                            color: "#157F79",
                            display: "grid",
                            placeItems: "center",
                            fontWeight: 800,
                            fontSize: 14,
                          }}
                        >
                          {idx + 1}
                        </Box>
                        <Typography sx={{ fontWeight: 700 }}>
                          {item.title}
                        </Typography>
                      </Stack>
                    </AccordionSummary>
                    <Divider />
                    <AccordionDetails>
                      <Typography
                        sx={{ color: "text.secondary", fontSize: 14 }}
                      >
                        {item.text}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ===== Section 5: FAQ (image + accordions) ===== */}
      <Box sx={{ bgcolor: "#fff" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
            <Grid item xs={12} md={5}>
              <Box
                component="img"
                src="/images/about-faq.png"
                alt="Consultation discussion"
                sx={{
                  width: "100%",
                  height: { xs: 260, md: 360 },
                  objectFit: "cover",
                  borderRadius: 3,
                  boxShadow: "0 12px 40px rgba(16,24,40,.12)",
                }}
              />
            </Grid>

            <Grid item xs={12} md={7}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: 28, md: 40 },
                  lineHeight: 1.2,
                  mb: { xs: 2, md: 3 },
                  color: "#3a3a3a",
                }}
              >
                Your Questions, Electrified
                <br /> Answers
              </Typography>

              {[
                {
                  id: "a1",
                  q: "Who is eligible for Medicare?",
                  a: "You are eligible for Medicare if you are 65 or older, a U.S. citizen or permanent resident, or under 65 with a qualifying disability or specific condition like End-Stage Renal Disease.",
                },
                {
                  id: "a2",
                  q: "How do I apply for Medicare?",
                  a: "Apply online at SSA.gov, by phone with Social Security, or by visiting your local office. Enrollment windows and parts (A, B, C, D) vary—review your timeline to avoid penalties.",
                },
                {
                  id: "a3",
                  q: "Can I have both Medicare and private insurance?",
                  a: "Yes. This is called coordination of benefits. One plan pays first (primary) and the other may cover remaining costs depending on your policy.",
                },
                {
                  id: "a4",
                  q: "What does Medicare not cover?",
                  a: "Typically long-term care, most dental, vision, hearing aids, and routine foot care. Supplemental plans may help with gaps.",
                },
              ].map((item, idx) => (
                <Accordion
                  key={item.id}
                  disableGutters
                  elevation={0}
                  expanded={faqOpen === item.id}
                  onChange={handleFaq(item.id)}
                  TransitionProps={{ unmountOnExit: true }}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    border: "1px solid #eee",
                    "&::before": { display: "none" },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight={600}>{item.q}</Typography>
                  </AccordionSummary>
                  <Divider />
                  <AccordionDetails>
                    <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                      {item.a}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ===== Section 6: Footer (About page) ===== */}
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
