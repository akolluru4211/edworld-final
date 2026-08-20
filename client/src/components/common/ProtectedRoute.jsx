import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLoadingScreen from './AuthLoadingScreen';

export default function ProtectedRoute({ children }) {
  const { user, loading, profileCompleted } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthLoadingScreen message="Checking your account..." />;
  }

  // Not signed in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Signed in with Firebase but hasn't completed profile onboarding
  if (!profileCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
