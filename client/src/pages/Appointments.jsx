import React, { useEffect, useState } from "react";
import { Container } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import StepOneTypeClinic from "../components/appointments/StepOneTypeClinic";
import { fetchClinics } from "../api/clinics";
import api from "../api/axios"; // to fetch doctor details if doctor query present

export default function Appointments() {
  const [searchParams] = useSearchParams();
  const doctorIdFromUrl = searchParams.get("doctor") || "";
  const typeFromUrl = searchParams.get("type") || "clinic";
  const clinicFromUrl = searchParams.get("clinic") || "";

  const [doctor, setDoctor] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [step, setStep] = useState(1);

  // fetch doctor header if doctorId present
  useEffect(() => {
    (async () => {
      if (!doctorIdFromUrl) return;
      try {
        const { data } = await api.get(`/auth/doctors/${doctorIdFromUrl}`); // adjust to your route
        // expect { name, specialty, rating, photoUrl, addressLine }
        setDoctor(data);
      } catch (_) {}
    })();
  }, [doctorIdFromUrl]);

  // fetch clinics
  useEffect(() => {
    (async () => setClinics(await fetchClinics()))();
  }, []);

  const handleStep1Next = ({ appointmentType, clinicId, clinicMeta }) => {
    // store in state or context for later steps
    // ... setBooking(prev => ({ ...prev, appointmentType, clinicId, clinicMeta, doctorId: doctorIdFromUrl }))
    setStep(2); // proceed to date/time step
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {step === 1 && (
        <StepOneTypeClinic
          doctor={doctor}
          clinics={clinics.map((c) => ({
            ...c,
            distanceLabel: c.geo?.distanceKm
              ? `${c.geo.distanceKm} KM`
              : undefined,
          }))}
          initialType={typeFromUrl}
          initialClinicId={clinicFromUrl}
          onBack={() => window.history.back()}
          onNext={handleStep1Next}
        />
      )}

      {step === 2 && (
        // your Step 2 (calendar + slot chips) will go here
        <div>Step 2 — Date & Time (coming next)</div>
      )}
    </Container>
  );
}
