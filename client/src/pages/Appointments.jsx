// src/pages/Appointments.jsx
import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Container, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";
import api from "../api/axios.js";

// Step components
import StepOneTypeClinic from "../components/appointments/StepOneTypeClinic";
import StepTwoDateTime from "../components/appointments/StepTwoDateTime";
import StepThreeBasicInfo from "../components/appointments/StepThreeBasicInfo";
import StepFourPayment from "../components/appointments/StepFourPayment";
import StepFiveConfirmation from "../components/appointments/StepFiveConfirmation";

/* -------------------- HELPERS -------------------- */
function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

/* -------------------- PAGE -------------------- */
export default function Appointments() {
  const q = useQuery();

  // URL presets
  const doctorIdFromUrl = q.get("doctor") || ""; // optional
  const initialTypeFromUrl = q.get("type") || "clinic";
  const initialClinicFromUrl = q.get("clinic") || "";

  // Step control
  const [step, setStep] = useState(1);

  // Collected data across steps
  const [s1, setS1] = useState(null); // { appointmentType, clinicId, clinicMeta }
  const [s2, setS2] = useState(null); // { dateISO, time, (optionally slotId/appointmentId later) }
  const [s3, setS3] = useState(null); // basic info form payload
  const [appointmentId, setAppointmentId] = useState(null); // set after HOLD at Step 2 (later)
  const [bookingNo, setBookingNo] = useState(null); // set after HOLD/CONFIRM (later)
  const [services, setServices] = useState([]); // list from /api/services or /api/services/doctor/:id
  const [selectedService, setSelectedService] = useState(null); // one object {code,name,durationMins,addOns:[...]}
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  // Doctor data (from DB)
  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(Boolean(doctorIdFromUrl));
  const [errorDoctor, setErrorDoctor] = useState("");
  const [videoDetails, setVideoDetails] = useState(null);
  // Fetch doctor if a doctorId is provided in URL
  useEffect(() => {
    const fetchDoctor = async () => {
      if (!doctorIdFromUrl) return; // not required; skip
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

  // after fetching services:
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

  // helper to toggle add-ons (optional)
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
      // payload can later include slot info + hold response
      // e.g., { dateISO, time, appointmentId, bookingNo }
      setS2(payload);
      if (payload?.appointmentId) setAppointmentId(payload.appointmentId);
      if (payload?.bookingNo) setBookingNo(payload.bookingNo);
      setStep(3);
    } else if (step === 3) {
      setS3(payload);
      setStep(4);
    }
  };

  const handlePay = () => {
    // In a real flow you'll conf
    if (confirmed?.bookingNo) setBookingNo(confirmed.bookingNo);
    if (confirmed?.video) setVideoDetails(confirmed.video);
    // setBookingNo(serverBookingNo);
    setStep(5);
  };

  const handleStartNew = () => {
    setStep(1);
    setS1(null);
    setS2(null);
    setS3(null);
    setAppointmentId(null);
    setBookingNo(null);
  };

  // helpers for labels
  const dateLabel =
    s2?.dateISO && s2?.time
      ? `${s2.time} , ${new Date(s2.dateISO).getDate()}, Oct 2025`
      : "10:00 - 11:00 AM, 15, Oct 2025";

  const clinicName = s1?.clinicMeta?.name || "Selected Clinic";

  // Decide which doctor object to use:
  // - If URL had doctorId and fetch succeeded → use DB doctor
  // - Else, allow Step 1 to render with minimal doctor info (or null)
  const doctorForStep = doctorIdFromUrl ? doctor : doctor || null;

  // Loading state when doctorId is present
  if (doctorIdFromUrl && loadingDoctor) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <CircularProgress size={24} />
          <Typography>Loading doctor…</Typography>
        </Box>
      </Container>
    );
  }

  // Error state (doctor fetch)
  if (doctorIdFromUrl && errorDoctor) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography color="error">{errorDoctor}</Typography>
      </Container>
    );
  }
  const handleSelectService = (svc) => {
    setSelectedService(svc);
    // choose your behavior:
    // A) clear all add-ons on service change
    setSelectedAddOns([]);

    // or B) default to first add-on if present
    // setSelectedAddOns(svc?.addOns?.length ? [svc.addOns[0].code] : []);
  };

  // Persist appointment picks (updates whenever key picks change)
  useEffect(() => {
    const payload = {
      step: step,
      s1, // type + clinic chosen
      s2, // date/time (+ hold ids if present)
      selectedService,
      selectedAddOns,
      appointmentId,
      bookingNo,
    };
    localStorage.setItem("he.booking", JSON.stringify(payload));
  }, [step, s1, s2, selectedService, selectedAddOns, appointmentId, bookingNo]);

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* STEP 1: Appointment Type + Clinic */}
      {step === 1 && (
        <StepOneTypeClinic
          doctor={doctorForStep}
          // ⬇️ Do NOT pass static clinics anymore; StepOne will fetch from /api/clinics when needed
          initialType={initialTypeFromUrl}
          initialClinicId={initialClinicFromUrl}
          onBack={() => window.history.back()}
          onNext={goNext}
        />
      )}

      {/* STEP 2: Date & Time */}
      {step === 2 && (
        <StepTwoDateTime
          doctor={doctorForStep}
          services={services} // NEW
          selectedService={selectedService} // NEW
          selectedAddOns={selectedAddOns} // NEW
          onSelectService={handleSelectService} // NEW
          onToggleAddOn={toggleAddOn} // NEW
          summary={{
            service: selectedService
              ? `${selectedService.name} (${selectedService.durationMins} Mins)`
              : "Cardiology (30 Mins)",
            addOnService:
              selectedService && selectedAddOns.length
                ? selectedService.addOns?.find(
                    (a) => a.code === selectedAddOns[0]
                  )?.name || ""
                : "Echocardiograms",
            appointmentType: `Clinic (${clinicName})`,
          }}
          context={{
            appointmentType: s1?.appointmentType,
            clinicId: s1?.clinicId || null,
            doctorId: s1?.doctorId || null,
            doctorMeta: s1?.doctorMeta || null,
            serviceCode: selectedService?.code || "CARDIO_30",
            addOns: selectedAddOns,
          }}
          onBack={goBack}
          onNext={goNext}
        />
      )}

      {/* STEP 3: Basic Information */}
      {step === 3 && (
        // Appointments.jsx (when rendering StepThreeBasicInfo)
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
            appointmentType: `Clinic (${clinicName})`,
          }}
          onBack={goBack}
          onNext={goNext}
        />
      )}

      {/* STEP 4: Payment */}
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
          onBack={goBack}
          onPay={(confirmed) => {
            if (confirmed?.bookingNo) setBookingNo(confirmed.bookingNo);
            // capture full video details (joinUrl + pin)
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

      {/* STEP 5: Confirmation */}
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
                      selectedService?.addOns?.find((a) => a.code === c)?.name
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
              s1?.appointmentType === "video" ? "Join Video" : "View Location",
            // 👇 If your backend returned the appointment object:
            videoJoinUrl: s2?.videoJoinUrl, // or keep it in state after /confirm
          }}
          bookingNumber={bookingNo || "TBD"}
          onBack={goBack}
          onAddCalendar={() =>
            window.open(videoDetails?.joinUrl || "#", "_blank")
          }
          // reuse button
          onReschedule={() => {
            /* ... */
          }}
          onStartNew={handleStartNew}
        />
      )}
    </Container>
  );
}
