import React from 'react';
import { Link } from 'react-router-dom';

export default function BrandLogo({ size = 'md', showBadge = true, to = '/' }) {
  const sizeMap = {
    sm: { icon: 28, text: '1.05rem', box: 30 },
    md: { icon: 38, text: '1.35rem', box: 38 },
    lg: { icon: 48, text: '1.75rem', box: 48 }
  };

  const current = sizeMap[size] || sizeMap.md;

  const content = (
    <div className="brand-logo-container">
      <div 
        className="brand-logo-icon" 
        style={{ width: `${current.box}px`, height: `${current.box}px`, fontSize: `${current.icon * 0.55}px` }}
      >
        E
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span className="brand-logo-text" style={{ fontSize: current.text }}>
          EdWorld Co.
        </span>
        {showBadge && (
          <span className="brand-logo-badge">OS</span>
        )}
      </div>
    </div>
  );

  if (!to) return content;
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      {content}
    </Link>
  );
}
