// src/pages/Appointments.jsx
import { useState } from "react";
import { Container } from "@mui/material";

// Step components
import StepOneTypeClinic from "../components/appointments/StepOneTypeClinic";
import StepTwoDateTime from "../components/appointments/StepTwoDateTime";
import StepThreeBasicInfo from "../components/appointments/StepThreeBasicInfo";
import StepFourPayment from "../components/appointments/StepFourPayment";
import StepFiveConfirmation from "../components/appointments/StepFiveConfirmation";

/* -------------------- STATIC MOCKS FOR DEMO -------------------- */
const MOCK_DOCTOR = {
  _id: "doc1",
  name: "Dr. Michael Brown",
  specialty: "Psychologist",
  rating: 5.0,
  photoUrl: "", // keep empty to avoid external fetch
  addressLine: "5th Street – 1011 W 5th St, Suite 120, Austin, TX 78703",
};

const MOCK_CLINICS = [
  {
    _id: "c1",
    name: "AllCare Family Medicine",
    address: "3343 Private Lane",
    city: "Valdosta",
    state: "",
    logoUrl: "",
    distanceLabel: "500 Meters",
  },
  {
    _id: "c2",
    name: "Vitalplus Clinic",
    address: "4223 Pleasant Hill Road",
    city: "Miami",
    state: "FL 33169",
    logoUrl: "",
    distanceLabel: "12 KM",
  },
  {
    _id: "c3",
    name: "Wellness Path Chiropractic",
    address: "2394 Sunset Blvd",
    city: "Austin",
    state: "TX",
    logoUrl: "",
    distanceLabel: "3.1 KM",
  },
];

/* -------------------- PAGE -------------------- */
export default function Appointments() {
  const [step, setStep] = useState(1);

  // collected data across steps (static demo)
  const [s1, setS1] = useState(null); // { appointmentType, clinicId, clinicMeta }
  const [s2, setS2] = useState(null); // { dateISO, time }
  const [s3, setS3] = useState(null); // basic info form payload
  const [bookingNo] = useState("DCRA12565"); // static booking number for demo

  const goBack = () => setStep((x) => Math.max(1, x - 1));

  const goNext = (payload) => {
    if (step === 1) {
      setS1(payload);
      setStep(2);
    } else if (step === 2) {
      setS2(payload);
      setStep(3);
    } else if (step === 3) {
      setS3(payload);
      setStep(4);
    }
  };

  const handlePay = () => {
    // static confirmation for demo
    setStep(5);
  };

  const handleStartNew = () => {
    // reset everything for a fresh demo cycle
    setStep(1);
    setS1(null);
    setS2(null);
    setS3(null);
  };

  // helpers for labels
  const dateLabel =
    s2?.dateISO && s2?.time
      ? `${s2.time} , ${new Date(s2.dateISO).getDate()}, Oct 2025`
      : "10:00 - 11:00 AM, 15, Oct 2025";

  const clinicName = s1?.clinicMeta?.name || "Wellness Path";

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* STEP 1: Appointment Type + Clinic */}
      {step === 1 && (
        <StepOneTypeClinic
          doctor={MOCK_DOCTOR}
          clinics={MOCK_CLINICS}
          initialType="clinic"
          initialClinicId="c2"
          loading={false}
          error=""
          onBack={() => window.history.back()}
          onNext={goNext}
        />
      )}

      {/* STEP 2: Date & Time */}
      {step === 2 && (
        <StepTwoDateTime
          doctor={MOCK_DOCTOR}
          summary={{
            service: "Cardiology (30 Mins)",
            addOnService: "Echocardiograms",
            appointmentType: `Clinic (${clinicName})`,
          }}
          onBack={goBack}
          onNext={goNext}
        />
      )}

      {/* STEP 3: Basic Information */}
      {step === 3 && (
        <StepThreeBasicInfo
          doctor={MOCK_DOCTOR}
          summary={{
            service: "Cardiology (30 Mins)",
            addOnService: "Echocardiograms",
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
          doctor={MOCK_DOCTOR}
          summary={{
            dateLabel,
            appointmentType: `Clinic (${clinicName})`,
          }}
          price={{
            serviceLabel: "Echocardiograms",
            serviceAmount: 200,
            bookingFee: 20,
            tax: 18,
            discount: -15,
            total: 320,
            currency: "USD",
          }}
          onBack={goBack}
          onPay={handlePay}
        />
      )}

      {/* STEP 5: Confirmation */}
      {step === 5 && (
        <StepFiveConfirmation
          doctor={MOCK_DOCTOR}
          summary={{
            service: "Cardiology (30 Mins)",
            addOnService: "Echocardiograms",
            dateLabel,
            appointmentType: "Clinic",
            clinicName,
            clinicLinkLabel: "View Location",
          }}
          bookingNumber={bookingNo}
          onBack={goBack}
          onReschedule={() => alert("Static demo: reschedule")}
          onAddCalendar={() => alert("Static demo: add to calendar")}
          onStartNew={handleStartNew}
        />
      )}
    </Container>
  );
}
