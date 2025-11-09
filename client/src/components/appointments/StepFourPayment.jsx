// src/components/appointments/StepFourPayment.jsx
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import api from "../../api/axios";
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
  doctor,
  summary,
  // NEW: all needed to quote & confirm
  appointmentId, // must come from Step 2 /appointments/hold
  bookingNo, // optional, from hold
  serviceCode, // e.g. "CARDIO_30"
  addOns = [], // e.g. ["ECHO"]
  appointmentType = "clinic",
  patientDraft, // optional: carry Step 3 form to confirm
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

  const [quote, setQuote] = useState(null); // { currency, items:[{label,amount}], total }
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  const [confirming, setConfirming] = useState(false);
  const canConfirm = !!quote && !!appointmentId && !confirming;

  const onCardChange = (e) =>
    setCard((c) => ({ ...c, [e.target.name]: e.target.value }));

  // ---- Fetch quote whenever inputs change ----
  useEffect(() => {
    let ignore = false;
    const run = async () => {
      try {
        setQuoteLoading(true);
        setQuoteError("");
        const { data } = await api.post("/appointments/quote", {
          serviceCode,
          addOns,
          appointmentType,
        });
        if (!ignore) setQuote(data);
      } catch (e) {
        if (!ignore) {
          setQuote(null);
          setQuoteError(e?.response?.data?.error || "Failed to fetch quote");
        }
      } finally {
        if (!ignore) setQuoteLoading(false);
      }
    };
    run();
    return () => {
      ignore = true;
    };
  }, [serviceCode, addOns, appointmentType]);

  // ---- Confirm & Pay (fake gateway) ----
  const handleConfirm = async () => {
    if (!appointmentId) {
      setQuoteError(
        "Missing appointment hold. Please go back and re-select time."
      );
      return;
    }
    setConfirming(true);
    try {
      // Normally you'd charge the card first, then confirm with gateway result.
      const paymentPayload = {
        status: "paid", // simulate a success
        currency: quote?.currency || "USD",
        amount: quote?.total || 0,
        gateway: method,
        intentId: "demo_intent_id",
        chargeId: "demo_charge_id",
      };

      const { data } = await api.post("/appointments/confirm", {
        appointmentId,
        payment: paymentPayload,
        patient: patientDraft || null,
      });

      // Bubble up to the parent so it can go to Step 5
      onPay?.(data);
    } catch (e) {
      setQuoteError(e?.response?.data?.error || "Payment/confirmation failed");
    } finally {
      setConfirming(false);
    }
  };

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
              src={doctor?.photoUrl || ""}
              alt={doctor?.name || "Doctor"}
              sx={{ width: 56, height: 56 }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ fontWeight: 800 }} noWrap>
                  {doctor?.name || "Healthcare Provider"}
                </Typography>
                {doctor?.rating ? (
                  <Chip
                    size="small"
                    label={Number(doctor.rating).toFixed(1)}
                    color="warning"
                    sx={{ height: 22 }}
                  />
                ) : null}
              </Stack>
              <Typography sx={{ color: "primary.main", fontSize: 13 }} noWrap>
                {doctor?.specialty || "Doctor"}
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 12 }} noWrap>
                {doctor?.addressLine || ""}
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
                {summary?.dateLabel}
              </Typography>

              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                Appointment type
              </Typography>
              <Typography sx={{ fontWeight: 700, mb: 2 }}>
                {summary?.appointmentType}
              </Typography>

              <Divider sx={{ my: 1.5 }} />

              <Typography sx={{ fontWeight: 700, mb: 1 }}>
                Payment Info
              </Typography>

              {!quote && !quoteError && (
                <Typography color="text.secondary">
                  Calculating quote…
                </Typography>
              )}

              {quoteError && (
                <Typography color="error">{quoteError}</Typography>
              )}

              {quote && (
                <>
                  <Stack spacing={0.75} sx={{ mb: 2 }}>
                    {quote.items?.map((it, idx) => (
                      <Row key={idx} label={it.label} amount={it.amount} />
                    ))}
                  </Stack>

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
                      {quote.currency === "USD" ? "$" : ""}
                      {quote.total}
                    </span>
                  </Box>

                  {bookingNo ? (
                    <Typography
                      sx={{ mt: 1, fontSize: 12, color: "text.secondary" }}
                    >
                      Booking No: {bookingNo}
                    </Typography>
                  ) : null}
                </>
              )}
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
          disabled={!canConfirm}
          onClick={handleConfirm}
        >
          {confirming ? "Processing…" : "Confirm & Pay →"}
        </Button>
      </Box>
    </Card>
  );
}

function Row({ label, amount }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Typography sx={{ color: "text.secondary" }}>{label}</Typography>
      <Typography sx={{ fontWeight: 700 }}>${amount}</Typography>
    </Box>
  );
}

StepFourPayment.propTypes = {
  doctor: PropTypes.object,
  summary: PropTypes.object,
  appointmentId: PropTypes.string,
  bookingNo: PropTypes.string,
  serviceCode: PropTypes.string,
  addOns: PropTypes.array,
  appointmentType: PropTypes.string,
  patientDraft: PropTypes.object,
  onBack: PropTypes.func.isRequired,
  onPay: PropTypes.func.isRequired,
};
