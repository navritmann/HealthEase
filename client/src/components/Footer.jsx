import React from "react";
import {
  Box,
  Container,
  Grid,
  Stack,
  Typography,
  Link as MLink,
  IconButton,
  Divider,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import GitHubIcon from "@mui/icons-material/GitHub";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <Box sx={{ bgcolor: "#F7FAFB", borderTop: "1px solid #E6EDF0" }}>
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        <Grid container spacing={{ xs: 4, md: 6 }}>
          {/* Brand + about */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Box
                  component="img"
                  src="/images/logo.png"
                  alt="HealthEase"
                  sx={{ width: 90, height: 36 }}
                />
              </Stack>
              <Typography
                sx={{ color: "text.secondary", fontSize: 14, maxWidth: 420 }}
              >
                At Health Ease, we believe that good health should be simple,
                accessible, and compassionate. Combining advanced healthcare
                technology with a caring human touch, we make your journey to
                better health easier and more comfortable.
              </Typography>

              <Stack direction="row" spacing={1}>
                {/* Social icons now link out */}
                <IconButton
                  size="small"
                  component="a"
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    bgcolor: "#EAF3F2",
                    color: "#0aa07a",
                    "&:hover": { bgcolor: "#DDEEEB" },
                  }}
                  aria-label="Twitter"
                >
                  <TwitterIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  component="a"
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    bgcolor: "#EAF3F2",
                    color: "#0aa07a",
                    "&:hover": { bgcolor: "#DDEEEB" },
                  }}
                  aria-label="Facebook"
                >
                  <FacebookIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  component="a"
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    bgcolor: "#EAF3F2",
                    color: "#0aa07a",
                    "&:hover": { bgcolor: "#DDEEEB" },
                  }}
                  aria-label="Instagram"
                >
                  <InstagramIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  component="a"
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    bgcolor: "#EAF3F2",
                    color: "#0aa07a",
                    "&:hover": { bgcolor: "#DDEEEB" },
                  }}
                  aria-label="GitHub"
                >
                  <GitHubIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2.5}>
            <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
              Quick Links
            </Typography>
            <FooterLinks
              items={[
                "Home",
                "About Us",
                "Services",
                "Doctors & Specialists",
                "FAQs",
                "Blog",
                "Contact Us",
              ]}
            />
          </Grid>

          {/* Our Services */}
          <Grid item xs={12} sm={6} md={2.5}>
            <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
              Our Services
            </Typography>
            <FooterLinks
              items={[
                "General Consultation",
                "Preventive Health Checkups",
                "Chronic Disease Management",
                "Diagnostic & Lab Services",
                "Telemedicine",
                "Pharmacy Support",
              ]}
            />
          </Grid>

          {/* Contact */}
          <Grid item xs={12} md={3}>
            <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
              Contact Us
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 14, mb: 1 }}>
              <b>Address</b>
              <br />
              123 Wellness Avenue, City Name,
              <br />
              State, ZIP
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 14, mb: 1 }}>
              <b>Phone Number</b>
              <br />
              +1 (800) 456-7890
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              <b>Email Address</b>
              <br />
              <MLink
                href="mailto:info@healthease.com"
                underline="hover"
                color="inherit"
              >
                info@healthease.com
              </MLink>
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: { xs: 3, md: 4 } }} />
        <Typography
          align="center"
          sx={{ color: "text.secondary", fontSize: 13 }}
        >
          © {year} Health Ease. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}

function FooterLinks({ items = [] }) {
  // decide how each label should behave
  const resolveLink = (label) => {
    switch (label) {
      case "Home":
        return { type: "router", to: "/" };
      case "About Us":
        return { type: "router", to: "/about" };
      case "Services":
        return { type: "anchor", href: "/#services" };
      case "Doctors & Specialists":
        return { type: "anchor", href: "/#doctors" };
      case "FAQs":
        // assuming you have /faq page
        return { type: "router", to: "/faq" };
      case "Contact Us":
        return { type: "mailto", href: "mailto:info@healthease.com" };
      case "Blog":
        // no blog route yet → plain text
        return { type: "text" };
      default:
        // for "Our Services" items etc → plain text
        return { type: "text" };
    }
  };

  return (
    <Stack spacing={0.75}>
      {items.map((t, i) => {
        const cfg = resolveLink(t);

        if (cfg.type === "router") {
          return (
            <MLink
              key={i}
              component={RouterLink}
              to={cfg.to}
              underline="none"
              sx={{
                color: "text.secondary",
                fontSize: 14,
                "&:hover": { color: "#0aa07a" },
              }}
            >
              {t}
            </MLink>
          );
        }

        if (cfg.type === "anchor") {
          return (
            <MLink
              key={i}
              component="a"
              href={cfg.href}
              underline="none"
              sx={{
                color: "text.secondary",
                fontSize: 14,
                "&:hover": { color: "#0aa07a" },
              }}
            >
              {t}
            </MLink>
          );
        }

        if (cfg.type === "mailto") {
          return (
            <MLink
              key={i}
              href={cfg.href}
              underline="none"
              sx={{
                color: "text.secondary",
                fontSize: 14,
                "&:hover": { color: "#0aa07a" },
              }}
            >
              {t}
            </MLink>
          );
        }

        // plain text fallback
        return (
          <Typography
            key={i}
            sx={{
              color: "text.secondary",
              fontSize: 14,
            }}
          >
            {t}
          </Typography>
        );
      })}
    </Stack>
  );
}
