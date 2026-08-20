import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function AdminRoute({ children }) {
  const { user, userProfile, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="brand-logo-icon" style={{ width: '50px', height: '50px', margin: '0 auto 16px', fontSize: '1.5rem' }}>E</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>Verifying Administrator Credentials...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="main-content" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ maxWidth: '500px', textAlign: 'center', padding: '40px' }}>
          <ShieldAlert size={48} color="var(--rose)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '10px' }}>Access Restricted</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '24px' }}>
            The Admin Console requires verified administrator privileges. Your account (@{userProfile?.username || 'user'}) is registered as a {userProfile?.role || 'student'}.
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
