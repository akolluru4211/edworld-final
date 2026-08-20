import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import AuthLoadingScreen from './AuthLoadingScreen';

export default function AdminRoute({ children }) {
  const { firebaseUser, profile, authLoading, profileLoading, isAdmin } = useAuth();

  if (authLoading || profileLoading) {
    return <AuthLoadingScreen message="Verifying administrator credentials..." />;
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="main-content" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ maxWidth: '500px', textAlign: 'center', padding: '40px' }}>
          <ShieldAlert size={48} color="var(--rose)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '10px' }}>Access Restricted</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '24px' }}>
            The Admin Console requires verified administrator privileges. Your account (@{profile?.username || 'user'}) is registered as a {profile?.role || 'student'}.
          </p>
          <Link to="/dashboard" className="btn btn-primary">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
