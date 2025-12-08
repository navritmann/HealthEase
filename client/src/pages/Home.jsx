// src/pages/Home.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Footer from "../components/Footer";

const SLIDE_INTERVAL_MS = 5500;
const SLIDES = [
  "/images/home-hero.png",
  "/images/home-banner.jpg",
  "/images/home-banner-1.jpg",
];

const SOLUTIONS = [
  {
    title: "Patient-Centered Approach",
    desc: "Your health and well-being are at the center of our care. We work closely with you to understand your needs.",
    icon: "/images/section3-1.png",
  },
  {
    title: "Tailored Treatment Plans",
    desc: "We create customized plans based on comprehensive assessments and consultations.",
    icon: "/images/section3-2.png",
  },
  {
    title: "Comprehensive Follow-Up",
    desc: "We offer ongoing evaluations and support to adapt and refine your care plan as needs evolve.",
    icon: "/images/section3-3.png",
  },
  {
    title: "State-of-the-Art Methods",
    desc: "Utilizing cutting-edge medical technology and treatments to ensure your care is modern and effective.",
    icon: "/images/section3-4.png",
  },
];

const CONTROLS = [
  {
    key: "mic",
    src: "/icons/mic.png",
    bg: "#F2F4F7",
    alt: "Microphone",
  },
  {
    key: "video",
    src: "/icons/video.png",
    bg: "#F2F4F7",
    alt: "Camera",
  },
  {
    key: "screen",
    src: "/icons/screen.png",
    bg: "#F2F4F7",
    alt: "Share screen",
  },
  { key: "chat", src: "/icons/chat.png", bg: "#F2F4F7", alt: "Chat" },
  { key: "end", src: "/icons/end.png", bg: "#ef4444", alt: "End call" },
];

const YT_ID = "v3n2BDKwTq8";

const DOCTORS = [
  {
    name: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    photo: "https://cdn-icons-png.flaticon.com/512/5003/5003090.png",
  },
  {
    name: "Dr. Rajesh Patel",
    specialty: "General Physician",
    photo: "https://cdn-icons-png.flaticon.com/512/5003/5003090.png",
  },
  {
    name: "Dr. Michael Brown",
    specialty: "Psychologist",
    photo: "https://cdn-icons-png.flaticon.com/512/5003/5003090.png",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const rootRef = useRef(null);
  const touchRef = useRef({ x: 0, y: 0, moved: false });

  const [expanded, setExpanded] = useState(false);
  const handleChange = (panel) => (_e, isExpanded) =>
    setExpanded(isExpanded ? panel : false);

  const [expandedFaq, setExpandedFaq] = useState("a1"); // first open by default

  useMemo(() => {
    SLIDES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const next = () => setIndex((i) => (i + 1) % SLIDES.length);
  const prev = () => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length);
  const goto = (i) => setIndex(i);

  useEffect(() => {
    const start = () => {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(next, SLIDE_INTERVAL_MS);
    };
    const stop = () => clearInterval(timerRef.current);
    if (!document.hidden) start();
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, []);

  const handleMouseEnter = () => clearInterval(timerRef.current);
  const handleMouseLeave = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(next, SLIDE_INTERVAL_MS);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onTouchStart = (e) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY, moved: false };
  };
  const onTouchMove = () => {
    touchRef.current.moved = true;
  };
  const onTouchEnd = (e) => {
    if (!touchRef.current.moved) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
  };

  function FaqRow({ item, expanded, setExpanded, isFirst }) {
    const open = expanded === item.id;
    return (
      <Box sx={{ mb: 0.75 }}>
        <Box
          onClick={() => setExpanded(open ? false : item.id)}
          sx={{
            py: 2,
            cursor: "pointer",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 600, color: "#3d3d3d" }}>
              {item.q}
            </Typography>
            {open && (
              <Typography sx={{ color: "text.secondary", mt: 1, fontSize: 14 }}>
                {item.a}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              bgcolor: "#F3F4F6",
              color: "#444",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            {open ? (
              <RemoveRoundedIcon fontSize="small" />
            ) : (
              <AddRoundedIcon fontSize="small" />
            )}
          </Box>
        </Box>
        <Box sx={{ height: 1, bgcolor: "#E6E8EB" }} />
      </Box>
    );
  }

  const goBookDr = (doctorId, type = "clinic", clinicId) => {
    const params = new URLSearchParams({
      doctor: doctorId,
      type,
      ...(clinicId ? { clinic: clinicId } : {}),
    });
    navigate(`/appointments?${params.toString()}`);
  };

  // simple click handler for virtual call controls
  const handleControlClick = (key, alt) => {
    if (key === "chat") {
      navigate("/appointments");
      return;
    }
    if (key === "end") {
      alert("Call ended (demo).");
      return;
    }
    alert(`${alt} clicked (demo control).`);
  };

  return (
    <>
      <Navbar />
      {/* Hero / Slider */}
      <Box
        ref={rootRef}
        role="region"
        aria-label="Hero slider"
        tabIndex={0}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        sx={{
          position: "relative",
          height: { xs: "88vh", md: "92vh" },
          overflow: "hidden",
          bgcolor: "transparent",
        }}
      >
        {/* Slides */}
        <Box
          sx={{
            height: "100%",
            width: `${SLIDES.length * 100}%`,
            display: "flex",
            transition: "transform 700ms cubic-bezier(.2,.6,.2,1)",
            transform: `translateX(-${index * (100 / SLIDES.length)}%)`,
          }}
        >
          {SLIDES.map((src, i) => (
            <Box
              key={`slide-${i}`}
              aria-hidden={i !== index}
              sx={{
                width: `${100 / SLIDES.length}%`,
                height: "100%",
                position: "relative",
                flex: "0 0 auto",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url(${src})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "brightness(0.75)",
                }}
              />
              <Container
                maxWidth="lg"
                sx={{
                  position: "relative",
                  zIndex: 2,
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Box sx={{ maxWidth: { xs: "100%", md: 640 }, color: "white" }}>
                  <Typography
                    variant="h2"
                    component="h1" // semantic h1 for accessibility
                    sx={{
                      fontSize: { xs: 36, md: 64 },
                      fontWeight: 800,
                      lineHeight: 1.1,
                      mb: 3,
                    }}
                  >
                    Your Partner in
                    <br />
                    Achieving{" "}
                    <span style={{ fontStyle: "italic" }}>Health</span>
                    <br />
                    Excellence
                  </Typography>

                  <Button
                    onClick={() =>
                      document
                        .getElementById("about")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    variant="contained"
                    endIcon={<ArrowForwardRoundedIcon />}
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.9)",
                      color: "#111",
                      borderRadius: 999,
                      px: 3,
                      py: 1.2,
                      textTransform: "none",
                      fontWeight: 700,
                      "&:hover": { backgroundColor: "rgba(255,255,255,1)" },
                    }}
                  >
                    Explore Now
                  </Button>
                  <Button
                    onClick={() => navigate("/appointments")}
                    variant="contained"
                    endIcon={<ArrowForwardRoundedIcon />}
                    sx={{
                      ml: 2,
                      backgroundColor: "#047857", // darker green for contrast
                      color: "#fff",
                      borderRadius: 999,
                      px: 3,
                      py: 1.2,
                      textTransform: "none",
                      fontWeight: 700,
                      "&:hover": { backgroundColor: "#03614a" },
                    }}
                  >
                    Book Appointment
                  </Button>
                </Box>
              </Container>
            </Box>
          ))}
        </Box>

        {/* Arrows */}
        <Button
          aria-label="Previous slide"
          onClick={prev}
          sx={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            minWidth: 0,
            p: 1,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.9)",
            color: "#111", // dark icon for contrast
            "&:hover": { bgcolor: "rgba(255,255,255,1)" },
            zIndex: 1,
          }}
        >
          <ChevronLeftRoundedIcon />
        </Button>
        <Button
          aria-label="Next slide"
          onClick={next}
          sx={{
            position: "absolute",
            right: 16,
            top: "50%",
            transform: "translateY(-50%)",
            minWidth: 0,
            p: 1,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.9)",
            color: "#111",
            "&:hover": { bgcolor: "rgba(255,255,255,1)" },
            zIndex: 1,
          }}
        >
          <ChevronRightRoundedIcon />
        </Button>

        {/* Dots */}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            position: "absolute",
            right: { xs: 20, md: 40 },
            bottom: { xs: 18, md: 28 },
          }}
        >
          {SLIDES.map((_, i) => (
            <Chip
              key={i}
              onClick={() => goto(i)}
              label=""
              aria-label={`Go to slide ${i + 1}`}
              aria-pressed={i === index}
              role="button"
              size="small"
              sx={{
                width: 36,
                height: 6,
                borderRadius: 3,
                bgcolor:
                  i === index
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(255,255,255,0.45)",
                cursor: "pointer",
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* ===== Section 2: About / Features ===== */}
      <Box id="about" sx={{ bgcolor: "#fff" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          {/* Top row: Left image, Right copy */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 4, md: 6 }}
            alignItems="center"
          >
            {/* Left rounded image */}
            <Box
              component="img"
              src="/images/about-left.png"
              alt="Blood pressure check"
              sx={{
                width: { xs: "100%", md: 520 },
                height: { xs: 280, md: 360 },
                objectFit: "cover",
                borderRadius: 4,
                boxShadow: "0 12px 40px rgba(16,24,40,.08)",
              }}
            />

            {/* Right text + CTA + avatars */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                component="h2"
                fontWeight={800}
                sx={{ mb: 1 }}
              >
                Dedicated to Excellence in
                <br /> Healthcare
              </Typography>
              <Typography sx={{ color: "text.secondary", mb: 3 }}>
                At the core of our mission is an unwavering commitment to
                delivering the highest standards of care. We strive to combine
                cutting-edge medical technology with a patient-centered
                approach, ensuring that every individual receives the most
                effective and compassionate treatment.
              </Typography>

              <Stack direction="row" alignItems="center" spacing={2}>
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardRoundedIcon />}
                  onClick={() => navigate("/register")}
                  sx={{
                    px: 2.5,
                    py: 1.1,
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 700,
                    bgcolor: "#047857",
                    "&:hover": { bgcolor: "#03614a" },
                  }}
                >
                  Join Now
                </Button>

                {/* avatar cluster + stat */}
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <Stack direction="row" sx={{ ml: 0.5 }}>
                    <Box
                      component="img"
                      src="/images/about-avatar-1.png"
                      alt=""
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        border: "2px solid #fff",
                        transform: "translateX(12px)",
                      }}
                    />
                    <Box
                      component="img"
                      src="/images/about-avatar-2.png"
                      alt=""
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        border: "2px solid #fff",
                        transform: "translateX(6px)",
                      }}
                    />
                    <Box
                      component="img"
                      src="/images/about-avatar-3.png"
                      alt=""
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        border: "2px solid #fff",
                      }}
                    />
                  </Stack>
                  <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                    <b>1.2K+</b> Specialists
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Stack>

          {/* Spacer */}
          <Box sx={{ height: { xs: 32, md: 48 } }} />

          {/* Bottom grid: Left text & photo strip  |  Right feature cards */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 4, md: 6 }}
            alignItems="flex-start"
          >
            {/* Left column */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h5"
                component="h3"
                fontWeight={800}
                sx={{ mb: 1 }}
              >
                The Faces Behind
                <br /> Your Health
              </Typography>
              <Typography sx={{ color: "text.secondary", mb: 2.5 }}>
                At the heart of our healthcare practice are the dedicated
                professionals who bring their expertise, compassion, and
                innovation to every patient interaction. Our team of doctors,
                nurses, and specialists are committed to providing personalized
                care that meets the unique needs of each individual.
              </Typography>

              {/* tiny badge */}
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Box
                  component="img"
                  src="/images/about-avatar-1.png"
                  alt=""
                  sx={{ width: 28, height: 28, borderRadius: "50%" }}
                />
                <Typography sx={{ fontSize: 13 }}>
                  <b>Medical specialist</b> &nbsp;·&nbsp; 10+ medical experts
                </Typography>
              </Stack>

              {/* three mini photos */}
              <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
                {[
                  "about-strip-1.png",
                  "about-strip-2.png",
                  "about-strip-3.png",
                ].map((p) => (
                  <Box
                    key={p}
                    component="img"
                    src={`/images/${p}`}
                    alt=""
                    sx={{
                      width: { xs: "23%", md: 150 },
                      height: 100,
                      objectFit: "cover",
                      borderRadius: 2,
                      boxShadow: "0 6px 20px rgba(16,24,40,.06)",
                    }}
                  />
                ))}
              </Stack>
            </Box>

            {/* Right column: stacked feature cards */}
            <Box sx={{ flex: 1.1, width: "100%" }}>
              <Stack spacing={2.5}>
                {/* light card 1 */}
                <Box
                  sx={{
                    p: 2.25,
                    borderRadius: 3,
                    border: "1px solid #EEE",
                    bgcolor: "#fff",
                    boxShadow: "0 6px 20px rgba(16,24,40,.04)",
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Box>
                      <Typography fontWeight={700}>
                        Highly Skilled Medical Experts
                      </Typography>
                      <Typography
                        sx={{ color: "text.secondary", fontSize: 14 }}
                      >
                        Our team consists of highly skilled medical experts
                        dedicated to delivering top-notch care.
                      </Typography>
                    </Box>
                    <Button
                      aria-label="View our doctors"
                      onClick={() =>
                        document
                          .getElementById("doctors")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                      sx={{
                        minWidth: 0,
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        bgcolor: "#F3F4F6",
                      }}
                    >
                      →
                    </Button>
                  </Stack>
                </Box>

                {/* dark / blue card */}
                <Box
                  sx={{
                    p: 2.25,
                    borderRadius: 3,
                    bgcolor: "#0a3e57",
                    color: "#EAF4FA",
                    overflow: "hidden",
                  }}
                >
                  <Stack direction="row" spacing={2}>
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={800} sx={{ color: "#fff" }}>
                        Compassionate Service
                      </Typography>
                      <Typography sx={{ opacity: 0.9, fontSize: 14, mb: 2 }}>
                        Beyond their medical expertise, our team is known for
                        their empathy, understanding, and dedication to patient
                        well-being.
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() =>
                          document
                            .getElementById("compassion")
                            ?.scrollIntoView({ behavior: "smooth" })
                        }
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          borderRadius: 999,
                          bgcolor: "#fff",
                          color: "#0a3e57",
                          "&:hover": { bgcolor: "#F2F7FA" },
                          px: 2.5,
                          py: 0.9,
                          minWidth: 0,
                        }}
                      >
                        →
                      </Button>
                    </Box>
                    <Box
                      component="img"
                      src="/images/about-card.png"
                      alt=""
                      sx={{
                        width: 120,
                        height: 96,
                        objectFit: "cover",
                        borderRadius: 2,
                        display: { xs: "none", sm: "block" },
                      }}
                    />
                  </Stack>
                </Box>

                {/* light card 2 */}
                <Box
                  sx={{
                    p: 2.25,
                    borderRadius: 3,
                    border: "1px solid #EEE",
                    bgcolor: "#fff",
                    boxShadow: "0 6px 20px rgba(16,24,40,.04)",
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Box>
                      <Typography fontWeight={700}>
                        Patient-Centered Care
                      </Typography>
                      <Typography
                        sx={{ color: "text.secondary", fontSize: 14 }}
                      >
                        We focus on treating the whole person, not just the
                        symptoms, ensuring a holistic approach to health.
                      </Typography>
                    </Box>
                    <Button
                      aria-label="View our services"
                      onClick={() =>
                        document
                          .getElementById("services")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                      sx={{
                        minWidth: 0,
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        bgcolor: "#F3F4F6",
                      }}
                    >
                      →
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* ===== Section 3: Personalized Medical Solutions ===== */}
      <Box id="services" sx={{ bgcolor: "#157F79" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          {/* Heading + paragraph */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 3, md: 6 }}
            sx={{ mb: { xs: 4, md: 6 } }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                component="h2"
                sx={{ color: "#F6FFFD", fontWeight: 800, lineHeight: 1.2 }}
              >
                Personalized Medical
                <br /> Solutions
              </Typography>
            </Box>
            <Box sx={{ flex: 1.2 }}>
              <Typography sx={{ color: "rgba(255,255,255,0.85)" }}>
                At our practice, we believe in delivering healthcare that is
                tailored to your unique needs. Our personalized medical
                solutions are designed to address each patient’s situation with
                precision and care.
              </Typography>
            </Box>
          </Stack>

          {/* 2 x 2 cards */}
          <Grid container spacing={3}>
            {SOLUTIONS.map((item) => (
              <Grid key={item.title} item xs={12} md={6}>
                <Box
                  sx={{
                    p: { xs: 2, md: 2.5 },
                    borderRadius: 4,
                    bgcolor: "#FFFFFF",
                    boxShadow: "0 10px 30px rgba(16,24,40,.10)",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={700}>{item.title}</Typography>
                      <Typography
                        sx={{ color: "text.secondary", fontSize: 14, mt: 0.5 }}
                      >
                        {item.desc}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        bgcolor: "#F2F4F7",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Box
                        component="img"
                        src={item.icon}
                        alt=""
                        sx={{
                          width: 24,
                          height: 24,
                          objectFit: "contain",
                          display: "block",
                        }}
                      />
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ===== Section 4: Virtual Consultations ===== */}
      <Box sx={{ bgcolor: "#fff" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
            {/* Left: Title + CTA */}
            <Grid item xs={12} md={4}>
              <Typography
                variant="h4"
                component="h2"
                sx={{ fontWeight: 800, lineHeight: 1.2, mb: 4 }}
              >
                Details for Virtual
                <br /> Consultations
              </Typography>

              <Button
                variant="contained"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={() => navigate("/register")}
                sx={{
                  px: 2.5,
                  py: 1.1,
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 700,
                  bgcolor: "#047857",
                  "&:hover": { bgcolor: "#03614a" },
                }}
              >
                Join Now
              </Button>
            </Grid>

            {/* Middle: Accordions */}
            <Grid item xs={12} md={4}>
              <Typography
                variant="h6"
                component="h3"
                sx={{ fontWeight: 700, mb: 2 }}
              >
                Ongoing Support and
                <br /> Follow-Up Care
              </Typography>

              <Accordion
                disableGutters
                elevation={0}
                expanded={expanded === "panel1"}
                onChange={handleChange("panel1")}
                TransitionProps={{ unmountOnExit: true }}
                sx={{ borderRadius: 2, mb: 1, border: "1px solid #eee" }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={600}>Technical Support</Typography>
                </AccordionSummary>
                <Divider />
                <AccordionDetails>
                  <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                    Our team is available to assist with any technical issues or
                    questions you may have before or during your visit.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion
                disableGutters
                elevation={0}
                expanded={expanded === "panel2"}
                onChange={handleChange("panel2")}
                TransitionProps={{ unmountOnExit: true }}
                sx={{ borderRadius: 2, mb: 1, border: "1px solid #eee" }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={600}>Secure Platform</Typography>
                </AccordionSummary>
                <Divider />
                <AccordionDetails>
                  <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                    Encrypted video and messaging to keep your information
                    private and safe.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion
                disableGutters
                elevation={0}
                expanded={expanded === "panel3"}
                onChange={handleChange("panel3")}
                TransitionProps={{ unmountOnExit: true }}
                sx={{ borderRadius: 2, mb: 1, border: "1px solid #eee" }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={600}>
                    Comprehensive Evaluation
                  </Typography>
                </AccordionSummary>
                <Divider />
                <AccordionDetails>
                  <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                    Thorough assessments with licensed clinicians, including
                    follow-up plans and notes.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion
                disableGutters
                elevation={0}
                expanded={expanded === "panel4"}
                onChange={handleChange("panel4")}
                TransitionProps={{ unmountOnExit: true }}
                sx={{ borderRadius: 2, border: "1px solid #eee" }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={600}>Easy Scheduling</Typography>
                </AccordionSummary>
                <Divider />
                <AccordionDetails>
                  <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                    Book, reschedule, and receive reminders—all from your
                    dashboard.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Right: Video-call styled image */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  borderRadius: 4,
                  overflow: "hidden",
                  boxShadow: "0 12px 40px rgba(16,24,40,.12)",
                }}
              >
                <Box
                  component="img"
                  src="/images/virtual-call.png"
                  alt="Virtual consultation"
                  sx={{
                    width: "100%",
                    height: { xs: 300, md: 360 },
                    objectFit: "cover",
                  }}
                />

                {/* Bottom control bar with icon images */}
                <Box
                  sx={{
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                    bottom: 10,
                    bgcolor: "rgba(255,255,255,0.95)",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 999,
                    boxShadow: "0 6px 20px rgba(16,24,40,.10)",
                  }}
                >
                  {CONTROLS.map((c) => (
                    <Box
                      key={c.key}
                      aria-label={c.alt}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleControlClick(c.key, c.alt)}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        bgcolor: c.bg,
                        display: "grid",
                        placeItems: "center",
                        transition: "transform .15s ease",
                        cursor: "pointer",
                        "&:hover": { transform: "translateY(-1px)" },
                      }}
                    >
                      <Box
                        component="img"
                        src={c.src}
                        alt={c.alt}
                        sx={{
                          width: 16,
                          height: 16,
                          objectFit: "contain",
                          filter:
                            c.key === "end"
                              ? "invert(1) brightness(2)"
                              : "none",
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ===== Section 5: Progress Tracking ===== */}
      <Box id="progress" sx={{ bgcolor: "#fff" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Typography
            variant="h5"
            component="h2"
            align="center"
            sx={{ fontWeight: 700, mb: 3, color: "text.primary" }}
          >
            Progress Tracking
          </Typography>

          <Box
            sx={{
              position: "relative",
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: "0 16px 44px rgba(16,24,40,.12)",
              maxWidth: 1000,
              mx: "auto",
            }}
          >
            <Box sx={{ position: "relative", width: "100%", pt: "56.25%" }}>
              <Box
                component="iframe"
                title="Progress Tracking Video"
                src={`https://www.youtube.com/embed/${YT_ID}?rel=0&modestbranding=1&color=white`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                frameBorder={0}
                sx={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  border: 0,
                  display: "block",
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ===== Section 6: Compassion + Expertise ===== */}
      <Box id="compassion" sx={{ bgcolor: "#fff" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
            {/* Left: Copy + CTA */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.25,
                  mb: 2,
                }}
              >
                Where Compassion and
                <br /> Expertise Meet for Better
                <br /> Health
              </Typography>

              <Typography sx={{ color: "text.secondary", mb: 3 }}>
                It emphasizes a holistic approach where patients receive not
                only the best treatments but also empathy, understanding, and
                personalized attention. This philosophy ensures every individual
                experiences healing in both body and mind, supported by trusted
                professionals who truly care.
              </Typography>

              <Button
                variant="contained"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={() => navigate("/register")}
                sx={{
                  px: 2.5,
                  py: 1.1,
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 700,
                  bgcolor: "#047857",
                  "&:hover": { bgcolor: "#03614a" },
                }}
              >
                Join Now
              </Button>
            </Grid>

            {/* Right: Image */}
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/images/compassion.png"
                alt="Doctor assisting elder patient"
                sx={{
                  width: "100%",
                  height: { xs: 240, md: 340 },
                  objectFit: "cover",
                  borderRadius: 3,
                  boxShadow: "0 12px 40px rgba(16,24,40,.10)",
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ===== Section 7: Doctors grid ===== */}
      <Box id="doctors" sx={{ bgcolor: "#EAF7F5" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Typography
            align="center"
            component="h2"
            sx={{
              fontSize: { xs: 24, md: 32 },
              fontWeight: 800,
              mb: { xs: 3, md: 5 },
              color: "#2b3a3a",
            }}
          >
            Meet the Experts Behind
            <br /> Your Health Success
          </Typography>

          <Grid container spacing={{ xs: 3, md: 4 }} justifyContent="center">
            {DOCTORS.map((d, i) => (
              <Grid key={`doc-${i}`} item xs={12} sm={6} md={4}>
                <Box
                  sx={{
                    bgcolor: "#fff",
                    borderRadius: 3,
                    boxShadow: "0 10px 30px rgba(16,24,40,.10)",
                    p: 2,
                  }}
                >
                  {/* framed image */}
                  <Box
                    sx={{
                      bgcolor: "#F7F7F7",
                      borderRadius: 2,
                      p: 1.25,
                      mb: 1.5,
                    }}
                  >
                    <Box
                      component="img"
                      src={d.photo}
                      alt={d.name}
                      sx={{
                        width: "100%",
                        height: 240,
                        objectFit: "cover",
                        borderRadius: 1.5,
                      }}
                    />
                  </Box>

                  {/* teal footer bar */}
                  <Box
                    sx={{
                      bgcolor: "#047857",
                      color: "#fff",
                      borderRadius: 2,
                      px: 2,
                      py: 1.25,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 700, lineHeight: 1 }}>
                        {d.name}
                      </Typography>
                      <Typography sx={{ fontSize: 12, opacity: 0.95 }}>
                        {d.specialty}
                      </Typography>
                    </Box>

                    {/* booking button intentionally commented out for now */}
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: { xs: 3, md: 4 },
            }}
          >
            <Button
              variant="contained"
              onClick={() => navigate("/doctors")}
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{
                borderRadius: 999,
                px: 2.8,
                py: 1.1,
                textTransform: "none",
                fontWeight: 700,
                bgcolor: "#0d5d6a",
                "&:hover": { bgcolor: "#0b4e59" },
              }}
            >
              View More
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ===== Section 8: FAQ ===== */}
      <Box id="faq" sx={{ bgcolor: "#fff" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
            {/* Left image */}
            <Grid item xs={12} md={5}>
              <Box
                component="img"
                src="/images/faq-side.png"
                alt="Patients consulting"
                sx={{
                  width: "100%",
                  height: { xs: 260, md: 360 },
                  objectFit: "cover",
                  borderRadius: 3,
                  boxShadow: "0 12px 40px rgba(16,24,40,.12)",
                }}
              />
            </Grid>

            {/* Right: Heading + Accordions */}
            <Grid item xs={12} md={7}>
              <Typography
                component="h2"
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
                  defaultOpen: true,
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
                <FaqRow
                  key={item.id}
                  item={item}
                  expanded={expandedFaq}
                  setExpanded={setExpandedFaq}
                  isFirst={idx === 0}
                />
              ))}
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Footer />
    </>
  );
}
