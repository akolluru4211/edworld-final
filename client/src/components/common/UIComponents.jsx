import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export function EmptyState({ 
  icon: Icon = Sparkles, 
  title = 'No items found', 
  description = 'Get started by creating your first entry.', 
  actionText, 
  actionLink, 
  onAction 
}) {
  return (
    <div className="glass-card" style={{ textAlign: 'center', padding: '48px 24px', margin: '20px 0' }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'rgba(99, 102, 241, 0.12)',
        color: 'var(--primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px',
        border: '1px solid rgba(99, 102, 241, 0.3)'
      }}>
        <Icon size={28} />
      </div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '460px', margin: '0 auto 20px', lineHeight: '1.5' }}>
        {description}
      </p>
      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-primary btn-sm">
          {actionText}
        </Link>
      )}
      {actionText && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          {actionText}
        </button>
      )}
    </div>
  );
}

export function SkeletonCard({ count = 3 }) {
  return (
    <div className="grid-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card" style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="skeleton" style={{ height: '24px', width: '60%' }} />
          <div className="skeleton" style={{ height: '14px', width: '90%' }} />
          <div className="skeleton" style={{ height: '14px', width: '75%' }} />
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between' }}>
            <div className="skeleton" style={{ height: '28px', width: '80px', borderRadius: '20px' }} />
            <div className="skeleton" style={{ height: '28px', width: '80px', borderRadius: '8px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>{title}</h3>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer', padding: '4px' }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
