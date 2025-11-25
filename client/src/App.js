import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminAppointments from "./pages/Admin/Appointments";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import VideoRoom from "./pages/VideoRoom";
import About from "./pages/About";
import Doctors from "./pages/Admin/Doctors";
import Schedule from "./pages/Admin/Schedule";
import Patients from "./pages/Admin/Patients";
import Clinics from "./pages/Admin/Clinics";
import Services from "./pages/Admin/Services";
import ServicesFront from "./pages/Services";
import DoctorsFront from "./pages/Doctors";
import DoctorDetails from "./pages/DoctorDetails";
import FAQ from "./pages/FAQ";
import AudioCallRoom from "./pages/AudioCallRoom";
import ChatRoom from "./pages/ChatRoom";
import MyAppointments from "./pages/MyAppointments";
import Profile from "./pages/Profile";
import AdminPayments from "./pages/Admin/AdminPayments";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorRoute from "./components/DoctorRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<ServicesFront />} />
        <Route path="/doctors" element={<DoctorsFront />} />
        <Route path="/doctor/:id" element={<DoctorDetails />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/audio/:roomId" element={<AudioCallRoom />} />
        <Route path="/chat/:roomId" element={<ChatRoom />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
        <Route path="/profile" element={<Profile />} />

        {/* Public auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* App (user) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <Appointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/video/:roomId"
          element={
            <ProtectedRoute>
              <VideoRoom />
            </ProtectedRoute>
          }
        />
        <Route path="/audio/:roomId" element={<AudioCallRoom />} />
        <Route path="/chat/:roomId" element={<ChatRoom />} />
        {/* Admin (protected) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <AdminRoute>
              <AdminAppointments />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/doctors"
          element={
            <AdminRoute>
              <Doctors />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/patients"
          element={
            <AdminRoute>
              <Patients />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/schedule"
          element={
            <AdminRoute>
              <Schedule />
            </AdminRoute>
          }
        />
        {/* Stubs to keep sidebar links alive (optional) */}
        <Route
          path="/admin/patients"
          element={
            <div style={{ padding: 24, color: "#fff" }}>
              Patients (coming soon)
            </div>
          }
        />
        <Route
          path="/admin/clinics"
          element={
            <AdminRoute>
              <Clinics />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/services"
          element={
            <AdminRoute>
              <Services />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <AdminRoute>
              <AdminPayments />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/departments"
          element={
            <div style={{ padding: 24, color: "#fff" }}>
              Departments (coming soon)
            </div>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <div style={{ padding: 24, color: "#fff" }}>
              Payments (coming soon)
            </div>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <div style={{ padding: 24, color: "#fff" }}>
              Inventory (coming soon)
            </div>
          }
        />
        <Route
          path="/admin/messages"
          element={
            <div style={{ padding: 24, color: "#fff" }}>
              Messages (coming soon)
            </div>
          }
        />
        {/* 404 */}
        <Route
          path="*"
          element={<div style={{ padding: 24 }}>Not Found</div>}
        />

        <Route
          path="/doctor"
          element={
            <DoctorRoute>
              <DoctorDashboard />
            </DoctorRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
