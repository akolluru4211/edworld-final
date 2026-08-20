import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';
import AuthLoadingScreen from '../components/common/AuthLoadingScreen';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function SignupPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingAction, setLoadingAction] = useState(''); // 'google' | 'email' | ''
  const [error, setError] = useState('');

  const { 
    firebaseUser, 
    authLoading, 
    profileLoading, 
    isAuthenticated, 
    isProfileComplete, 
    signupWithEmail, 
    loginWithGoogle 
  } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  // 1. Loading screen while Firebase / Firestore authentication is resolving
  if (authLoading || profileLoading) {
    return <AuthLoadingScreen message="Checking your account..." />;
  }

  // 2. Prevent Signup Page Loop: Route based on profile completion status
  if (isAuthenticated && isProfileComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isAuthenticated && !isProfileComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  // 3. Google Sign-In / Sign-Up
  const handleGoogleSignup = async () => {
    setLoadingAction('google');
    setError('');
    try {
      const { destination, isNewUser } = await loginWithGoogle();
      if (isNewUser) {
        showToast('Google account connected! Please set up your developer identity.');
      } else {
        showToast('Welcome back to EdWorld Co.!');
      }
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Google authentication could not be completed. Please try again.');
    } finally {
      setLoadingAction('');
    }
  };

  // 4. Email Sign-Up
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    if (!email || !password || !displayName) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoadingAction('email');
    setError('');
    try {
      const { destination } = await signupWithEmail(email, password, displayName);
      showToast('Account created! Let us set up your developer identity.');
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoadingAction('');
    }
  };

  const isAuthenticating = Boolean(loadingAction);

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px 16px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-block', marginBottom: '12px' }}>
            <BrandLogo size="md" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '6px' }}>Create your EdWorld account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Join thousands of student engineers building proof-backed careers.
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

        {/* Real Firebase Google OAuth Button */}
        <button 
          onClick={handleGoogleSignup}
          disabled={isAuthenticating}
          className="btn btn-secondary"
          style={{ width: '100%', marginBottom: '20px', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontSize: '0.92rem' }}
        >
          {loadingAction === 'google' ? (
            <>
              <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          <span>OR SIGN UP WITH EMAIL</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        </div>

        {/* Email Signup Form */}
        <form onSubmit={handleEmailSignup}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input 
                type="text" 
                className="input-field" 
                style={{ paddingLeft: '40px' }}
                required
                disabled={isAuthenticating}
                placeholder="e.g. Adarsh Kolluru"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input 
                type="email" 
                className="input-field" 
                style={{ paddingLeft: '40px' }}
                required
                disabled={isAuthenticating}
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password (Min. 6 characters)</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input 
                type="password" 
                className="input-field" 
                style={{ paddingLeft: '40px' }}
                required
                disabled={isAuthenticating}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isAuthenticating}
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '10px', padding: '12px' }}
          >
            {loadingAction === 'email' ? 'Creating Account...' : 'Create Account & Continue'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
