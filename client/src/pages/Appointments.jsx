import { useEffect, useMemo, useState } from "react";
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  Stack,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import api from "../api/axios.js";

// Layout components
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Step components
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

  const doctorIdFromUrl = q.get("doctor") || "";
  const initialTypeFromUrl = q.get("type") || "clinic";
  const initialClinicFromUrl = q.get("clinic") || "";

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

  /* ---------- Loading / Error UI ---------- */
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

  /* ---------- SAVE TO LOCALSTORAGE ---------- */
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

  /* ---------- MAIN RENDER ---------- */
  return (
    <>
      <Navbar />

      {/* Background & Centering */}
      <Box
        sx={{
          bgcolor: "#f8fafa",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          pt: { xs: 10, md: 12 }, // space for navbar
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
              onAddCalendar={() =>
                window.open(videoDetails?.joinUrl || "#", "_blank")
              }
              onStartNew={handleStartNew}
            />
          )}
        </Container>
      </Box>

      <Footer />
    </>
  );
}
