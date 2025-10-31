import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

export default function StepFourPayment({
  doctor = {
    name: "Dr. Michael Brown",
    specialty: "Psychologist",
    rating: 5.0,
    photoUrl: "",
    addressLine: "5th Street – 1011 W 5th St, Suite 120, Austin, TX 78703",
  },
  summary = {
    dateLabel: "10:00 - 11:00 AM, 15, Oct 2025",
    appointmentType: "Clinic (Wellness Path)",
  },
  price = {
    serviceLabel: "Echocardiograms",
    serviceAmount: 200,
    bookingFee: 20,
    tax: 18,
    discount: -15,
    total: 320,
    currency: "USD",
  },
  onBack,
  onPay,
}) {
  const [method, setMethod] = useState("card");
  const [card, setCard] = useState({
    holder: "",
    number: "",
    expiry: "",
    cvv: "",
  });

  const onCardChange = (e) =>
    setCard((c) => ({ ...c, [e.target.name]: e.target.value }));

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
                <Chip
                  size="small"
                  label={Number(doctor.rating).toFixed(1)}
                  color="warning"
                  sx={{ height: 22 }}
                />
              </Stack>
              <Typography sx={{ color: "primary.main", fontSize: 13 }} noWrap>
                {doctor.specialty}
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 12 }} noWrap>
                {doctor.addressLine}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Grid container spacing={2}>
          {/* LEFT: Payment Gateway */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                border: "1px solid #E5E7EB",
                borderRadius: 2,
                p: 2,
                bgcolor: "#fff",
              }}
            >
              <Typography sx={{ fontWeight: 700, mb: 1.25 }}>
                Payment Gateway
              </Typography>

              <ToggleButtonGroup
                value={method}
                exclusive
                onChange={(_e, v) => v && setMethod(v)}
                sx={{ mb: 2 }}
              >
                <ToggleButton
                  value="card"
                  sx={{ textTransform: "none", px: 1.5 }}
                >
                  💳&nbsp; Credit Card
                </ToggleButton>
                <ToggleButton
                  value="paypal"
                  sx={{ textTransform: "none", px: 1.5 }}
                >
                  🅿️&nbsp; Paypal
                </ToggleButton>
                <ToggleButton
                  value="stripe"
                  sx={{ textTransform: "none", px: 1.5 }}
                >
                  🟣&nbsp; Stripe
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Simple static form (only shows for card to match mock) */}
              {method === "card" && (
                <Stack spacing={1.5}>
                  <Box>
                    <Typography sx={{ fontSize: 12, mb: 0.5 }}>
                      Card Holder Name
                    </Typography>
                    <TextField
                      size="small"
                      fullWidth
                      name="holder"
                      value={card.holder}
                      onChange={onCardChange}
                    />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, mb: 0.5 }}>
                      Card Number
                    </Typography>
                    <TextField
                      size="small"
                      fullWidth
                      name="number"
                      value={card.number}
                      onChange={onCardChange}
                    />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, mb: 0.5 }}>
                      Expire Date
                    </Typography>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="MM/YY"
                      name="expiry"
                      value={card.expiry}
                      onChange={onCardChange}
                    />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, mb: 0.5 }}>CVV</Typography>
                    <TextField
                      size="small"
                      fullWidth
                      name="cvv"
                      value={card.cvv}
                      onChange={onCardChange}
                    />
                  </Box>
                </Stack>
              )}

              {method !== "card" && (
                <Box
                  sx={{
                    border: "1px dashed #E5E7EB",
                    borderRadius: 2,
                    p: 2,
                    color: "text.secondary",
                    fontSize: 14,
                  }}
                >
                  Demo placeholder: {method.toUpperCase()} selected. (Static UI
                  only)
                </Box>
              )}
            </Box>
          </Grid>

          {/* RIGHT: Booking + Payment info */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                border: "1px solid #E5E7EB",
                borderRadius: 2,
                p: 2,
                bgcolor: "#fff",
              }}
            >
              <Typography sx={{ fontWeight: 700, mb: 1 }}>
                Booking Info
              </Typography>

              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                Date & Time
              </Typography>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>
                {summary.dateLabel}
              </Typography>

              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                Appointment type
              </Typography>
              <Typography sx={{ fontWeight: 700, mb: 2 }}>
                {summary.appointmentType}
              </Typography>

              <Divider sx={{ my: 1.5 }} />

              <Typography sx={{ fontWeight: 700, mb: 1 }}>
                Payment Info
              </Typography>

              <Stack spacing={0.75} sx={{ mb: 2 }}>
                <Row label={price.serviceLabel} amount={price.serviceAmount} />
                <Row label="Booking Fees" amount={price.bookingFee} />
                <Row label="Tax" amount={price.tax} />
                <Row label="Discount" amount={price.discount} negative />
              </Stack>

              {/* Total bar */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  bgcolor: "primary.main",
                  color: "#fff",
                  borderRadius: 1.5,
                  px: 2,
                  py: 1.2,
                  fontWeight: 800,
                }}
              >
                <span>Total</span>
                <span>
                  {price.currency === "USD" ? "$" : ""}
                  {price.total}
                </span>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>

      {/* Footer bar */}
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
          onClick={() => onPay?.({ method, card })}
        >
          Confirm & Pay →
        </Button>
      </Box>
    </Card>
  );
}

/* small row component */
function Row({ label, amount, negative = false }) {
  const fmt = (n) => (negative ? "-" : "") + (n < 0 ? Math.abs(n) : n);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Typography sx={{ color: "text.secondary" }}>{label}</Typography>
      <Typography
        sx={{
          fontWeight: 700,
          color: negative || amount < 0 ? "#EF4444" : "inherit",
        }}
      >
        ${fmt(amount)}
      </Typography>
    </Box>
  );
}
