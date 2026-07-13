import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import ProtectedRoute from './components/ProtectedRoute';

// ── Public pages (to be built) ─────────────────────────────────────────────
// import LandingPage from './pages/LandingPage';
// import LoginPage from './pages/auth/LoginPage';
// import PatientRegisterPage from './pages/auth/PatientRegisterPage';
// import DoctorRegisterPage from './pages/auth/DoctorRegisterPage';

// ── Patient pages (to be built) ────────────────────────────────────────────
// import PatientDashboard from './pages/patient/Dashboard';
// import FindDoctorPage from './pages/patient/FindDoctor';
// import DoctorProfilePage from './pages/patient/DoctorProfile';
// import TriagePage from './pages/patient/Triage';
// import WaitingRoomPage from './pages/patient/WaitingRoom';
// import CallPage from './pages/call/CallRoom';
// import PostCallPage from './pages/patient/PostCall';
// import HealthTimelinePage from './pages/patient/HealthTimeline';
// import PatientSettingsPage from './pages/patient/Settings';

// ── Doctor pages (to be built) ──────────────────────────────────────────────
// import DoctorOnboarding from './pages/doctor/Onboarding';
// import DoctorDashboard from './pages/doctor/Dashboard';
// import PrescriptionPage from './pages/doctor/Prescription';
// import DoctorProfilePage from './pages/doctor/Profile';

function App() {
  return (
    // <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<div className="p-8 text-center text-2xl font-bold">SwasthConnect — Coming soon 🩺</div>} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/register/patient" element={<Navigate to="/" replace />} />
        <Route path="/register/doctor" element={<Navigate to="/" replace />} />

        {/* Patient routes — uncomment as pages are built */}
        {/* <Route path="/patient/*" element={<ProtectedRoute role="PATIENT" />}> ... </Route> */}

        {/* Doctor routes — uncomment as pages are built */}
        {/* <Route path="/doctor/*" element={<ProtectedRoute role="DOCTOR" />}> ... </Route> */}

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    // </AuthProvider>
  );
}

export default App;
