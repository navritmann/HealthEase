import { useEffect, useMemo, useState } from "react";
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  Stack,
  Button,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios.js";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import StepOneTypeClinic from "../components/appointments/StepOneTypeClinic";
import StepTwoDateTime from "../components/appointments/StepTwoDateTime";
import StepThreeBasicInfo from "../components/appointments/StepThreeBasicInfo";
import StepFourPayment from "../components/appointments/StepFourPayment";
import StepFiveConfirmation from "../components/appointments/StepFiveConfirmation";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Appointments() {
  const q = useQuery();
  const navigate = useNavigate();

  const doctorIdFromUrl = q.get("doctor") || "";
  const initialTypeFromUrl = q.get("type") || "clinic";
  const initialClinicFromUrl = q.get("clinic") || "";

  // --- auth: read once from localStorage
  const authToken = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();
  const patientId = user?.id || user?._id || null;
  const isPatient = !!authToken && role === "patient" && !!patientId;

  const [step, setStep] = useState(1);
  const [s1, setS1] = useState(null);
  const [s2, setS2] = useState(null);
  const [s3, setS3] = useState(null);
  const [appointmentId, setAppointmentId] = useState(null);
  const [bookingNo, setBookingNo] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(Boolean(doctorIdFromUrl));
  const [errorDoctor, setErrorDoctor] = useState("");
  const [videoDetails, setVideoDetails] = useState(null);

  /* ---------- block booking if not logged-in patient ---------- */
  if (!isPatient) {
    return (
      <>
        <Navbar />
        <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Please sign in as a patient
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            You must be logged in with a patient account to book an appointment.
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="center">
            <Button variant="contained" onClick={() => navigate("/login")}>
              Sign in
            </Button>
            <Button variant="outlined" onClick={() => navigate("/register")}>
              Create account
            </Button>
          </Stack>
        </Container>
        <Footer />
      </>
    );
  }

  /* ---------- FETCH DOCTOR ---------- */
  useEffect(() => {
    const fetchDoctor = async () => {
      if (!doctorIdFromUrl) return;
      setLoadingDoctor(true);
      setErrorDoctor("");
      try {
        const { data } = await api.get(`/doctors/${doctorIdFromUrl}`);
        setDoctor(data);
      } catch (e) {
        setErrorDoctor(e?.response?.data?.error || "Failed to load doctor.");
      } finally {
        setLoadingDoctor(false);
      }
    };
    fetchDoctor();
  }, [doctorIdFromUrl]);

  /* ---------- Handle Stripe success redirect ---------- */
  useEffect(() => {
    const success = q.get("success");
    const aid = q.get("aid");
    const cs = q.get("cs");
    if (success === "1" && aid) {
      (async () => {
        try {
          if (cs) {
            await api.get(`/payments/stripe/verify`, { params: { cs, aid } });
          }

          const { data } = await api.get(`/appointments/${aid}`);
          if (data?.bookingNo) setBookingNo(data.bookingNo);
          if (data?.video) {
            setVideoDetails(data.video);
            setS2((prev) => ({
              ...(prev || {}),
              videoJoinUrl: data.video.joinUrl,
            }));
          }
          setAppointmentId(aid);
          setStep(5);
        } catch (e) {
          console.error("Failed to fetch confirmed appointment:", e);
        }
      })();
    }
  }, [q]);

  /* ---------- FETCH SERVICES ---------- */
  useEffect(() => {
    const loadServices = async () => {
      const res = doctorIdFromUrl
        ? await api.get(`/services/doctor/${doctorIdFromUrl}`)
        : await api.get(`/services`);
      const svcs = Array.isArray(res.data) ? res.data : [];
      setServices(svcs);
      if (svcs.length) {
        setSelectedService(svcs[0]);
        setSelectedAddOns(
          svcs[0].addOns?.length ? [svcs[0].addOns[0].code] : []
        );
      }
    };
    loadServices().catch(console.error);
  }, [doctorIdFromUrl]);

  /* ---------- STEP CONTROLS ---------- */
  const toggleAddOn = (code) =>
    setSelectedAddOns((a) =>
      a.includes(code) ? a.filter((x) => x !== code) : [...a, code]
    );

  const goBack = () => setStep((x) => Math.max(1, x - 1));
  const goNext = (payload) => {
    if (step === 1) {
      setS1(payload);
      setStep(2);
    } else if (step === 2) {
      setS2(payload);
      if (payload?.appointmentId) setAppointmentId(payload.appointmentId);
      if (payload?.bookingNo) setBookingNo(payload.bookingNo);
      setStep(3);
    } else if (step === 3) {
      setS3(payload);
      setStep(4);
    }
  };

  const handleStartNew = () => {
    setStep(1);
    setS1(null);
    setS2(null);
    setS3(null);
    setAppointmentId(null);
    setBookingNo(null);
  };

  const dateLabel =
    s2?.dateISO && s2?.time
      ? `${s2.time}, ${new Date(s2.dateISO).toLocaleDateString()}`
      : "10:00 - 11:00 AM, Oct 15, 2025";

  const clinicName = s1?.clinicMeta?.name || "Selected Clinic";
  const apptTypeLabel =
    s1?.appointmentType === "clinic"
      ? `Clinic (${clinicName})`
      : s1?.appointmentType === "video"
      ? "Video"
      : s1?.appointmentType === "audio"
      ? "Audio"
      : s1?.appointmentType === "chat"
      ? "Live Chat"
      : "Clinic";
  const doctorForStep = doctorIdFromUrl ? doctor : doctor || null;

  // Step 5: go to My Appointments so user can reschedule with your existing logic
  const handleRescheduleFromConfirmation = () => {
    // change this path if your route is different
    navigate("/my-appointments");
    // e.g. navigate(`/my-appointments?booking=${bookingNo || ""}`);
  };

  // Make this async so we can fetch from the API if needed
  const handleAddToCalendar = async () => {
    let startLocal = null;

    // 1) Try to build start time from Step 2 state (normal flow)
    if (s2?.dateISO && s2?.time) {
      const m = String(s2.time).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (m) {
        let hours = parseInt(m[1], 10);
        const minutes = parseInt(m[2], 10);
        const ampm = m[3].toUpperCase();
        if (ampm === "PM" && hours !== 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;

        const d = new Date(`${s2.dateISO}T00:00:00`);
        d.setHours(hours, minutes, 0, 0);
        startLocal = d;
      }
    }

    // 2) If s2 is empty (Stripe redirect case), fetch the appointment by id
    if (!startLocal && appointmentId) {
      try {
        const { data } = await api.get(`/appointments/${appointmentId}`);
        const startRaw =
          data.start || data.date || data.startTime || data.startAt;

        if (startRaw) {
          startLocal = new Date(startRaw);
        }
      } catch (e) {
        console.error("Failed to load appointment for calendar:", e);
      }
    }

    // Still nothing? Then we really don't know the time.
    if (!startLocal) {
      alert("Could not determine appointment date & time. Please try again.");
      return;
    }

    const durationMins = selectedService?.durationMins || 30;
    const endLocal = new Date(startLocal.getTime() + durationMins * 60000);

    const pad = (n) => String(n).padStart(2, "0");
    const formatICSDate = (d) =>
      `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(
        d.getUTCDate()
      )}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

    const escapeICS = (str = "") =>
      String(str)
        .replace(/\\/g, "\\\\")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,")
        .replace(/\n/g, "\\n");

    const joinUrl = videoDetails?.joinUrl || s2?.videoJoinUrl;

    const title =
      s1?.appointmentType === "video" || s1?.appointmentType === "audio"
        ? `Online appointment with ${doctorForStep?.name || "provider"}`
        : `Clinic appointment with ${doctorForStep?.name || "provider"}`;

    const timeOptions = { hour: "2-digit", minute: "2-digit" };
    const timeRange = `${startLocal.toLocaleTimeString(
      [],
      timeOptions
    )} - ${endLocal.toLocaleTimeString(
      [],
      timeOptions
    )} ${startLocal.toLocaleDateString()}`;

    const detailsLines = [
      `When: ${timeRange}`,
      `Service: ${selectedService?.name || ""}`,
      selectedAddOns?.length
        ? `Add-ons: ${selectedAddOns
            .map(
              (code) =>
                selectedService?.addOns?.find((a) => a.code === code)?.name ||
                code
            )
            .join(", ")}`
        : null,
      `Type: ${apptTypeLabel}`,
      clinicName ? `Clinic: ${clinicName}` : null,
      bookingNo ? `Booking No: ${bookingNo}` : null,
      joinUrl ? `Join link: ${joinUrl}` : null,
    ].filter(Boolean);

    const description = detailsLines.join("\n");
    const location =
      s1?.appointmentType === "video" || s1?.appointmentType === "audio"
        ? "Online"
        : doctorForStep?.addressLine || clinicName || "";

    const dtStart = formatICSDate(startLocal);
    const dtEnd = formatICSDate(endLocal);
    const dtStamp = formatICSDate(new Date());

    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//HealthEase//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${(bookingNo || Date.now()).toString()}@healthease.local
DTSTAMP:${dtStamp}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${escapeICS(title)}
DESCRIPTION:${escapeICS(description)}
LOCATION:${escapeICS(location)}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `appointment-${bookingNo || "healthease"}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (doctorIdFromUrl && loadingDoctor) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading doctor…</Typography>
      </Container>
    );
  }

  if (doctorIdFromUrl && errorDoctor) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography color="error">{errorDoctor}</Typography>
      </Container>
    );
  }

  const handleSelectService = (svc) => {
    setSelectedService(svc);
    setSelectedAddOns([]);
  };

  useEffect(() => {
    const payload = {
      step,
      s1,
      s2,
      selectedService,
      selectedAddOns,
      appointmentId,
      bookingNo,
    };
    localStorage.setItem("he.booking", JSON.stringify(payload));
  }, [step, s1, s2, selectedService, selectedAddOns, appointmentId, bookingNo]);

  return (
    <>
      <Navbar />
      <Box
        sx={{
          bgcolor: "#f8fafa",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          pt: { xs: 10, md: 12 },
          pb: { xs: 6, md: 8 },
        }}
      >
        <Container
          maxWidth="md"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {step === 1 && (
            <StepOneTypeClinic
              doctor={doctorForStep}
              initialType={initialTypeFromUrl}
              initialClinicId={initialClinicFromUrl}
              onBack={() => window.history.back()}
              onNext={goNext}
            />
          )}

          {step === 2 && (
            <StepTwoDateTime
              doctor={doctorForStep}
              services={services}
              selectedService={selectedService}
              selectedAddOns={selectedAddOns}
              onSelectService={handleSelectService}
              onToggleAddOn={toggleAddOn}
              summary={{
                service: selectedService
                  ? `${selectedService.name} (${selectedService.durationMins} Mins)`
                  : "Cardiology (30 Mins)",
                addOnService:
                  selectedService && selectedAddOns.length
                    ? selectedService.addOns?.find(
                        (a) => a.code === selectedAddOns[0]
                      )?.name || ""
                    : "",
                appointmentType: apptTypeLabel,
              }}
              context={{
                appointmentType: s1?.appointmentType,
                clinicId: s1?.clinicId || null,
                doctorId: s1?.doctorId || null,
                doctorMeta: s1?.doctorMeta || null,
                serviceCode: selectedService?.code || "CARDIO_30",
                addOns: selectedAddOns,
                patientId, // <-- pass it
              }}
              onBack={goBack}
              onNext={goNext}
            />
          )}

          {step === 3 && (
            <StepThreeBasicInfo
              doctor={doctorForStep}
              summary={{
                service: selectedService
                  ? `${selectedService.name} (${selectedService.durationMins} Mins)`
                  : "—",
                addOnService:
                  selectedService && selectedAddOns.length
                    ? selectedService.addOns
                        ?.filter((a) => selectedAddOns.includes(a.code))
                        .map((a) => a.name)
                        .join(", ")
                    : "—",
                dateLabel,
                appointmentType: apptTypeLabel,
              }}
              onBack={goBack}
              onNext={goNext}
            />
          )}

          {step === 4 && (
            <StepFourPayment
              doctor={doctorForStep}
              summary={{ dateLabel, appointmentType: `Clinic (${clinicName})` }}
              appointmentId={appointmentId}
              bookingNo={bookingNo}
              serviceCode={selectedService?.code || "CARDIO_30"}
              addOns={selectedAddOns || []}
              appointmentType={s1?.appointmentType || "clinic"}
              patientDraft={s3}
              patientId={patientId} // <-- pass it
              onBack={goBack}
              onPay={(confirmed) => {
                if (confirmed?.bookingNo) setBookingNo(confirmed.bookingNo);
                if (confirmed?.video) {
                  setVideoDetails(confirmed.video);
                  setS2((prev) => ({
                    ...(prev || {}),
                    videoJoinUrl: confirmed.video.joinUrl,
                  }));
                }
                setStep(5);
              }}
            />
          )}

          {step === 5 && (
            <StepFiveConfirmation
              doctor={doctorForStep}
              video={videoDetails}
              summary={{
                service: selectedService?.name || "—",
                addOnService: selectedAddOns?.length
                  ? selectedAddOns
                      .map(
                        (c) =>
                          selectedService?.addOns?.find((a) => a.code === c)
                            ?.name
                      )
                      .filter(Boolean)
                      .join(", ")
                  : "—",
                dateLabel,
                appointmentType:
                  s1?.appointmentType === "video"
                    ? "Video"
                    : `Clinic (${clinicName})`,
                clinicName,
                clinicLinkLabel:
                  s1?.appointmentType === "video"
                    ? "Join Video"
                    : "View Location",
                videoJoinUrl: s2?.videoJoinUrl,
              }}
              bookingNumber={bookingNo || "TBD"}
              onBack={goBack}
              onReschedule={handleRescheduleFromConfirmation}
              onAddCalendar={handleAddToCalendar}
              onStartNew={handleStartNew}
            />
          )}
        </Container>
      </Box>
      <Footer />
    </>
  );
}
