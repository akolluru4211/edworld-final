import React, { useState } from 'react';

export default function UserAvatar({ 
  name = '', 
  photoURL = '', 
  size = 38, 
  fontSize,
  style = {},
  className = '' 
}) {
  const [imgError, setImgError] = useState(false);

  // Generate real initials from actual name
  const getInitials = (str) => {
    if (!str || typeof str !== 'string') return '?';
    const parts = str.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);
  const calculatedFontSize = fontSize || Math.max(12, Math.floor(size * 0.38));

  if (photoURL && !imgError) {
    return (
      <img
        src={photoURL}
        alt={name || 'User'}
        onError={() => setImgError(true)}
        className={`avatar ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '1px solid var(--border-glow)',
          flexShrink: 0,
          ...style
        }}
      />
    );
  }

  // High-contrast clean initial avatar
  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #06b6d4 100%)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '800',
        fontSize: `${calculatedFontSize}px`,
        letterSpacing: '0.02em',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        flexShrink: 0,
        userSelect: 'none',
        ...style
      }}
      aria-label={name || 'User Avatar'}
    >
      {initials}
    </div>
  );
}
