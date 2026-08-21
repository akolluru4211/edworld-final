import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';
import AuthLoadingScreen from '../components/common/AuthLoadingScreen';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { 
    firebaseUser, 
    authLoading, 
    profileLoading, 
    isAuthenticated, 
    isProfileComplete, 
    loginWithEmail 
  } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  if (authLoading || profileLoading) {
    return <AuthLoadingScreen message="Checking your account..." />;
  }

  if (isAuthenticated && isProfileComplete) {
    return <Navigate to={redirectPath} replace />;
  }

  if (isAuthenticated && !isProfileComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const { destination, isNewUser } = await loginWithEmail(email, password);
      if (isNewUser) {
        showToast('Please complete your profile to access EdWorld.');
      } else {
        showToast('Welcome back to EdWorld Co.! Signed in successfully.');
      }
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please verify your email and password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px 16px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-block', marginBottom: '12px' }}>
            <BrandLogo size="md" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '6px' }}>Sign in to your account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Access your career passport, projects, and pipeline.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            color: '#fda4af',
            padding: '12px 14px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleEmailLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input 
                type="email" 
                className="input-field" 
                style={{ paddingLeft: '40px' }}
                required
                disabled={submitting}
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ color: 'var(--primary)', fontSize: '0.8rem', textDecoration: 'none' }}>
                Forgot?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input 
                type="password" 
                className="input-field" 
                style={{ paddingLeft: '40px' }}
                required
                disabled={submitting}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '12px', padding: '13px', fontSize: '0.95rem' }}
          >
            {submitting ? 'Signing In...' : 'Sign In to EdWorld'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>
            Create one free
          </Link>
        </div>
      </div>
    </div>
  );
}
