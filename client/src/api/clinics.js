// src/api/clinics.js
import api from "./axios";

export const fetchClinics = () =>
  api.get("/clinics").then((r) => r.data?.data ?? []);
