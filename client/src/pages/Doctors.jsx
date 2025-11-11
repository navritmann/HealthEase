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

export default function Doctors() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/doctors");
        setDoctors(res.data);
      } catch (err) {
        console.error("Error fetching doctors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // ✅ dummy fallback avatar (medical-style)
  const fallbackImage =
    "https://cdn-icons-png.flaticon.com/512/5003/5003090.png";

  return (
    <>
      <Navbar />

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
              <Typography component="span" sx={{ opacity: 0.9, fontSize: 13 }}>
                Doctors
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
              Meet Our <span style={{ fontStyle: "italic" }}>Specialists</span>
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
          <Typography
            align="center"
            sx={{
              fontWeight: 800,
              fontSize: { xs: 24, md: 30 },
              color: "#1d2b3a",
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
                    <Box
                      component="img"
                      src={doc.photoUrl || fallbackImage}
                      alt={doc.name}
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

                    <Typography sx={{ fontWeight: 700 }}>{doc.name}</Typography>
                    <Typography
                      sx={{ color: "#0aa07a", fontSize: 14, mb: 0.5 }}
                    >
                      {doc.specialty || "Specialty not specified"}
                    </Typography>

                    <Rating
                      name="doctor-rating"
                      value={doc.rating || 0}
                      precision={0.5}
                      readOnly
                      size="small"
                      sx={{ mb: 1 }}
                    />

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
                        bgcolor: "#0aa07a",
                        "&:hover": { bgcolor: "#088a69" },
                      }}
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
    </>
  );
}
