import React from 'react';
import BrandLogo from './BrandLogo';

export default function AuthLoadingScreen({ message = 'Checking your account...' }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      color: 'var(--text-main)',
      padding: '24px',
      position: 'fixed',
      inset: 0,
      zIndex: 9999
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '360px',
        animation: 'fadeIn 0.3s ease-out'
      }}>
        {/* Animated Brand Logo */}
        <div style={{
          display: 'inline-block',
          marginBottom: '24px',
          animation: 'float 3s ease-in-out infinite'
        }}>
          <BrandLogo size="lg" />
        </div>

        {/* Loading Spinner */}
        <div style={{
          width: '36px',
          height: '36px',
          margin: '0 auto 20px',
          border: '3px solid rgba(99, 102, 241, 0.15)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />

        {/* Status Message */}
        <h3 style={{
          fontSize: '1.15rem',
          fontWeight: '700',
          marginBottom: '8px',
          color: 'var(--text-main)'
        }}>
          {message}
        </h3>

        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          margin: 0
        }}>
          Connecting to EdWorld Career Operating System
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
