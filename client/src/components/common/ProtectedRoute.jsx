import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLoadingScreen from './AuthLoadingScreen';

export default function ProtectedRoute({ children }) {
  const { firebaseUser, authLoading, profileLoading, isProfileComplete } = useAuth();
  const location = useLocation();

  if (authLoading || profileLoading) {
    return <AuthLoadingScreen message="Checking your account..." />;
  }

  // Not authenticated with Firebase
  if (!firebaseUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated with Firebase but profile is incomplete (new or incomplete user)
  if (!isProfileComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  // Authenticated + profile completed: render protected route
  return children;
}
