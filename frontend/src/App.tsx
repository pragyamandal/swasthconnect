import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import PatientRegistration from './pages/PatientRegistration';
import DoctorRegistration from './pages/DoctorRegistration';
import DoctorOnboarding from './pages/DoctorOnboarding';

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
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/patient" element={<PatientRegistration />} />
        <Route path="/register/doctor" element={<DoctorRegistration />} />

        <Route path="/patient/dashboard" element={<div style={{padding:'2rem'}}>✅ Patient Dashboard — Feature 2 coming soon</div>} />
<Route path="/doctor/dashboard" element={<div style={{padding:'2rem'}}>✅ Doctor Dashboard — Feature 2 coming soon</div>} />

        {/* Patient routes — uncomment as pages are built */}
        {/* <Route path="/patient/*" element={<ProtectedRoute role="PATIENT" />}> ... </Route> */}

        {/* Doctor routes — uncomment as pages are built */}
        {/* <Route path="/doctor/*" element={<ProtectedRoute role="DOCTOR" />}> ... </Route> */}
        <Route path="/doctor/onboarding" element={<ProtectedRoute requiredRole="DOCTOR"><DoctorOnboarding /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    // </AuthProvider>
  );
}

export default App;
