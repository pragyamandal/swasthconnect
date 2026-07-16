import React from 'react';
import { Navigate } from 'react-router-dom';

type ProtectedRouteProps = {
  requiredRole: 'PATIENT' | 'DOCTOR';
  children: React.ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole, children }) => {
  const token = localStorage.getItem('swasth_token')

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const payloadBase64 = token.split('.')[1];
    const decodedJson = atob(payloadBase64);
    const decoded = JSON.parse(decodedJson);
    const userRole = decoded.role;

    if (userRole !== requiredRole) {
      if (userRole === 'PATIENT') {
        return <Navigate to="/patient/dashboard" replace />;
      } else if (userRole === 'DOCTOR') {
        return <Navigate to="/doctor/dashboard" replace />;
      } else {
        return <Navigate to="/login" replace />;
      }
    }
  } catch (error) {
    console.error('Failed to parse token', error);
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
