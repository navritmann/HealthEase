// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Button,
  Link as MLink,
  Avatar,
  useMediaQuery,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useNavigate, useLocation } from "react-router-dom";

const links = ["Home", "About", "Services", "Doctors", "FAQ"];

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

  const isDesktop = useMediaQuery("(min-width:900px)");
  const isXs = useMediaQuery("(max-width:600px)");

  const [auth, setAuth] = useState({
    isLoggedIn: false,
    role: null,
    user: null,
  });

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("adminToken") ||
      localStorage.getItem("admintoken");

    const storedRole = localStorage.getItem("role");
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      user = null;
    }

    setAuth({
      isLoggedIn: !!token,
      role: user?.role || storedRole || null,
      user,
    });
  }, [location.pathname]);

  const { isLoggedIn, role, user } = auth;
  const isPatient = role === "patient";
  const displayName = user?.firstName || user?.name || user?.email || "Account";
  const initials = (user?.firstName || user?.name || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleNav = (label) => {
    const key = label.toLowerCase();
    setMenuOpen(false); // close drawer on mobile

    if (key === "about") return navigate("/about");
    if (key === "services") return navigate("/services");
    if (key === "doctors") return navigate("/doctors");
    if (key === "faq") return navigate("/faq");
    if (key === "home") return navigate("/");

    if (location.pathname !== "/") {
      navigate("/", { state: { anchor: key } });
    } else {
      scrollToId(key);
    }
  };

  const handleLogout = () => {
    [
      "token",
      "accessToken",
      "role",
      "user",
      "adminToken",
      "admintoken",
    ].forEach((k) => localStorage.removeItem(k));

    setAuth({ isLoggedIn: false, role: null, user: null });
    setMenuOpen(false);
    navigate("/");
  };

  const goToProfile = () => {
    setMenuOpen(false);
    navigate("/profile");
  };

  const goToMyAppointments = () => {
    setMenuOpen(false);
    navigate("/my-appointments");
  };

  /* ───────────────── Desktop Navbar ───────────────── */
  if (isDesktop) {
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
            gap: 3,
            px: 3,
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
                fontSize: 18,
              }}
            >
              Health<span style={{ color: "#111" }}>Ease</span>
            </Box>
          </Stack>

          {/* Center links */}
          <Stack
            direction="row"
            spacing={4}
            alignItems="center"
            sx={{ mx: "auto" }}
          >
            {links.map((item) => {
              const key = item.toLowerCase();
              const isActive =
                (location.pathname === "/" && key === "home") ||
                (location.pathname === "/about" && key === "about") ||
                (location.pathname === "/services" && key === "services") ||
                (location.pathname === "/doctors" && key === "doctors") ||
                (location.pathname.includes("/faq") && key === "faq");

              return (
                <MLink
                  key={item}
                  underline="none"
                  onClick={() => handleNav(item)}
                  sx={{
                    cursor: "pointer",
                    color: isActive ? "#0aa07a" : "#222",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 14,
                    whiteSpace: "nowrap",
                    position: "relative",
                    "&:hover": { color: "#0aa07a" },
                    "&::after": isActive
                      ? {
                          content: '""',
                          position: "absolute",
                          left: 0,
                          right: 0,
                          bottom: -4,
                          height: 2,
                          borderRadius: 2,
                          bgcolor: "#0aa07a",
                        }
                      : {},
                  }}
                >
                  {item}
                </MLink>
              );
            })}
          </Stack>

          {/* Right side (auth) */}
          {!isLoggedIn ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="text"
                onClick={() => navigate("/login")}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 14,
                  minWidth: "auto",
                }}
              >
                Sign in
              </Button>
              <Button
                variant="contained"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={() => navigate("/register")}
                sx={{
                  borderRadius: 999,
                  px: 3,
                  fontWeight: 700,
                  fontSize: 14,
                  bgcolor: "#0aa07a",
                  textTransform: "none",
                  "&:hover": { bgcolor: "#088a69" },
                }}
              >
                Join Now
              </Button>
            </Stack>
          ) : (
            <Stack direction="row" spacing={1.5} alignItems="center">
              {isPatient && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={goToMyAppointments}
                  sx={{
                    textTransform: "none",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 600,
                    borderColor: "#0aa07a",
                    color: "#0aa07a",
                    "&:hover": {
                      borderColor: "#088a69",
                      backgroundColor: "rgba(10,160,122,0.06)",
                    },
                  }}
                >
                  My Appointments
                </Button>
              )}

              <Stack
                direction="row"
                spacing={0.75}
                alignItems="center"
                sx={{ cursor: "pointer" }}
                onClick={goToProfile}
              >
                <Avatar
                  sx={{
                    width: 30,
                    height: 30,
                    bgcolor: "#0aa07a",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {initials}
                </Avatar>
                <Box
                  sx={{
                    maxWidth: 120,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#111",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {displayName}
                </Box>
              </Stack>

              <Button
                variant="text"
                onClick={handleLogout}
                sx={{
                  textTransform: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#555",
                  minWidth: "auto",
                  "&:hover": { color: "#111" },
                }}
              >
                Logout
              </Button>
            </Stack>
          )}
        </Box>
      </Box>
    );
  }

  /* ───────────────── Mobile / Tablet Navbar ───────────────── */
  return (
    <>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 2000,
          bgcolor: "rgba(255,255,255,0.98)",
          boxShadow: "0 4px 18px rgba(0,0,0,.08)",
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              component="img"
              src="/images/logo.png"
              alt="HealthEase"
              sx={{
                width: 26,
                height: 26,
                objectFit: "contain",
                borderRadius: 1,
              }}
            />
            <Box
              sx={{
                fontWeight: 800,
                letterSpacing: 0.2,
                color: "#0aa07a",
                fontSize: 16,
              }}
            >
              Health<span style={{ color: "#111" }}>Ease</span>
            </Box>
          </Stack>

          <IconButton onClick={() => setMenuOpen(true)} size="small">
            <MenuIcon />
          </IconButton>
        </Box>
      </Box>

      {/* offset for fixed bar */}
      <Box sx={{ height: 56 }} />

      {/* Drawer menu */}
      <Drawer anchor="right" open={menuOpen} onClose={() => setMenuOpen(false)}>
        <Box
          sx={{
            width: 260,
            pt: 1,
            pb: 2,
            px: 2,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <TypographySmall>Menu</TypographySmall>
            <IconButton onClick={() => setMenuOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 1 }} />

          <List sx={{ flexGrow: 1 }}>
            {links.map((item) => (
              <ListItemButton key={item} onClick={() => handleNav(item)}>
                <ListItemText
                  primary={item}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            ))}
          </List>

          <Divider sx={{ my: 1 }} />

          {!isLoggedIn ? (
            <Stack spacing={1}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/login");
                }}
                sx={{
                  textTransform: "none",
                  borderRadius: 999,
                  fontWeight: 700,
                  fontSize: 14,
                  bgcolor: "#0aa07a",
                  "&:hover": { bgcolor: "#088a69" },
                }}
              >
                Sign in
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/register");
                }}
                sx={{
                  textTransform: "none",
                  borderRadius: 999,
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Create account
              </Button>
            </Stack>
          ) : (
            <Stack spacing={1.2}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                onClick={goToProfile}
                sx={{ cursor: "pointer" }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "#0aa07a",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {initials}
                </Avatar>
                <Box sx={{ fontSize: 14, fontWeight: 600 }}>{displayName}</Box>
              </Stack>

              {isPatient && (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={goToMyAppointments}
                  sx={{
                    textTransform: "none",
                    borderRadius: 999,
                    fontWeight: 600,
                    fontSize: 14,
                    borderColor: "#0aa07a",
                    color: "#0aa07a",
                    "&:hover": {
                      borderColor: "#088a69",
                      backgroundColor: "rgba(10,160,122,0.06)",
                    },
                  }}
                >
                  My Appointments
                </Button>
              )}

              <Button
                variant="text"
                fullWidth
                onClick={handleLogout}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 13,
                  color: "#555",
                  "&:hover": { color: "#111" },
                }}
              >
                Logout
              </Button>
            </Stack>
          )}
        </Box>
      </Drawer>
    </>
  );
}

/* Small helper component for drawer title */
function TypographySmall({ children }) {
  return (
    <Box sx={{ fontSize: 14, fontWeight: 600, textTransform: "uppercase" }}>
      {children}
    </Box>
  );
}
