// src/components/Navbar.jsx
import React from "react";
import { Box, Stack, Button, Link as MLink } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useNavigate, useLocation } from "react-router-dom";

const links = ["Home", "About", "Services", "Doctor", "FAQ"];

const scrollToId = (id) => {
  if (id === "home") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
};

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (label) => {
    const key = label.toLowerCase();

    if (key === "about") {
      // ✅ go to About.jsx route
      navigate("/about");
      return;
    }

    if (key === "home") {
      navigate("/");
      return;
    }

    // For in-page sections (services/doctor/faq):
    if (location.pathname !== "/") {
      // Navigate home first, then scroll after mount
      navigate("/", { state: { anchor: key } });
    } else {
      scrollToId(key);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 2000,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 1.5, md: 3 },
          px: { xs: 1.5, md: 3 },
          py: 1,
          borderRadius: 999,
          bgcolor: "rgba(255,255,255,0.96)",
          boxShadow: "0 8px 28px rgba(0,0,0,.08)",
          backdropFilter: "saturate(180%) blur(6px)",
          maxWidth: "100vw",
        }}
      >
        {/* Logo */}
        <Stack
          direction="row"
          spacing={1.25}
          alignItems="center"
          sx={{ mr: 1 }}
        >
          <Box
            component="img"
            src="/images/logo.png"
            alt="HealthEase"
            sx={{
              width: 32,
              height: 32,
              objectFit: "contain",
              borderRadius: 1,
            }}
          />
          <Box
            sx={{
              fontWeight: 800,
              letterSpacing: 0.2,
              color: "#0aa07a",
              display: { xs: "none", sm: "block" },
            }}
          >
            Health<span style={{ color: "#111" }}>Ease</span>
          </Box>
        </Stack>

        {/* Center links */}
        <Stack
          direction="row"
          spacing={{ xs: 2, md: 4 }}
          alignItems="center"
          sx={{ mx: "auto" }}
        >
          {links.map((item, i) => (
            <MLink
              key={item}
              underline="none"
              onClick={() => handleNav(item)}
              sx={{
                cursor: "pointer",
                color: i === 0 ? "#0aa07a" : "#222",
                fontWeight: i === 0 ? 700 : 500,
                fontSize: 14,
                whiteSpace: "nowrap",
                "&:hover": { color: "#0aa07a" },
              }}
            >
              {item}
            </MLink>
          ))}
        </Stack>

        <Button
          variant="contained"
          endIcon={<ArrowForwardRoundedIcon />}
          onClick={() => navigate("/register")}
          sx={{
            borderRadius: 999,
            px: { xs: 2, md: 3 },
            fontWeight: 700,
            bgcolor: "#0aa07a",
            textTransform: "none",
            "&:hover": { bgcolor: "#088a69" },
          }}
        >
          Join Now
        </Button>
      </Box>
    </Box>
  );
}
