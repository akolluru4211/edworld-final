import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle, X, ChevronRight } from 'lucide-react';

export function EmptyState({ 
  icon: Icon = Sparkles, 
  title = 'No items found', 
  description = 'Get started by creating your first entry.', 
  actionText, 
  actionLink, 
  onAction,
  secondaryActionText,
  secondaryActionLink,
  onSecondaryAction
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
        <Icon size={26} />
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '480px', margin: '0 auto 24px', lineHeight: '1.6' }}>
        {description}
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
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
        {secondaryActionText && secondaryActionLink && (
          <Link to={secondaryActionLink} className="btn btn-secondary btn-sm">
            {secondaryActionText}
          </Link>
        )}
        {secondaryActionText && onSecondaryAction && (
          <button onClick={onSecondaryAction} className="btn btn-secondary btn-sm">
            {secondaryActionText}
          </button>
        )}
      </div>
    </div>
  );
}

export function SkeletonCard({ count = 3 }) {
  return (
    <div className="grid-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card" style={{ minHeight: '180px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="skeleton" style={{ height: '22px', width: '60%' }} />
          <div className="skeleton" style={{ height: '14px', width: '90%' }} />
          <div className="skeleton" style={{ height: '14px', width: '75%' }} />
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="skeleton" style={{ height: '26px', width: '90px', borderRadius: '20px' }} />
            <div className="skeleton" style={{ height: '32px', width: '80px', borderRadius: '8px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="skeleton" style={{ height: '28px', width: '220px' }} />
          <div className="skeleton" style={{ height: '16px', width: '340px' }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: '18px', width: '100%' }} />
      <div className="skeleton" style={{ height: '18px', width: '80%' }} />
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children, maxWidth = '600px' }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{title}</h3>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Drawer({ isOpen, onClose, title, children, width = '440px' }) {
  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{title}</h3>
          <button 
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function BottomSheet({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>{title}</h3>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            aria-label="Close bottom sheet"
          >
            <X size={20} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function ScoreRing({ score = 0, size = 64, strokeWidth = 6, label = "Readiness" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  const color = clampedScore >= 80 ? 'var(--emerald)' : clampedScore >= 60 ? 'var(--primary)' : 'var(--amber)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '900',
          fontSize: size > 70 ? '1.25rem' : '0.95rem',
          color: '#fff',
          fontFamily: 'var(--font-mono)'
        }}>
          {clampedScore}
        </div>
      </div>
      {label && (
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
            {label}
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: '800', color }}>
            {clampedScore >= 80 ? 'Job Ready' : clampedScore >= 60 ? 'Career Ready' : 'Developing'}
          </div>
        </div>
      )}
    </div>
  );
}

export function SkillBadge({ skill, level = 'Advanced', verified = true, evidenceCount = 2, onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{
        background: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        transition: 'var(--transition-fast)',
        cursor: onClick ? 'pointer' : 'default'
      }}
      className="glass-card-interactive"
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontWeight: '800', fontSize: '0.92rem', color: '#fff' }}>{skill}</span>
          {verified && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--emerald)', fontSize: '0.72rem', fontWeight: '800' }}>
              <CheckCircle size={12} /> Verified
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          {level} · {evidenceCount} Evidence {evidenceCount === 1 ? 'Source' : 'Sources'}
        </div>
      </div>
      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
        {level}
      </span>
    </div>
  );
}

export function StatCard({ title, value, subtitle, icon: Icon, color = 'var(--primary)' }) {
  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          {title}
        </span>
        {Icon && (
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            background: `rgba(99, 102, 241, 0.12)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color
          }}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', lineHeight: 1.1, marginBottom: '4px' }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

export function PageHeader({ badge, title, description, action }) {
  return (
    <div className="glass-card" style={{ padding: '28px 24px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(18, 26, 44, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          {badge && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.18)', border: '1px solid rgba(99, 102, 241, 0.35)', padding: '4px 10px', borderRadius: 'var(--radius-full)', marginBottom: '8px' }}>
              <Sparkles size={13} color="var(--primary)" />
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {badge}
              </span>
            </div>
          )}
          <h1 style={{ fontSize: '1.9rem', fontWeight: '800', marginBottom: '4px' }}>
            {title}
          </h1>
          {description && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '600px', margin: 0 }}>
              {description}
            </p>
          )}
        </div>
        {action && (
          <div>
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

