/**
 * ProtectedRoute.tsx
 * Wraps React Router v6 Outlet to enforce auth and role.
 * TRD reference: section 4.1 (Frontend route protection)
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '@swasthconnect/shared';

interface ProtectedRouteProps {
  role: Role;
}

export default function ProtectedRoute({ role }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== role) {
    // Wrong role — redirect to their own dashboard
    return (
      <Navigate
        to={user?.role === 'PATIENT' ? '/patient/dashboard' : '/doctor/dashboard'}
        replace
      />
    );
  }

  return <Outlet />;
}
