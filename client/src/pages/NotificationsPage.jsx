import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle, Clock, ExternalLink, ShieldCheck, UserPlus } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export default function NotificationsPage() {
  const { notifications, markAsRead } = useNotification();

  return (
    <div className="notifications-page" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="hero-banner" style={{ padding: '32px 28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <Bell size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '4px' }}>
              Notification Center
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Real-time updates on connection requests, application deadlines, and project reviews.
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card">
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <CheckCircle size={36} color="var(--emerald)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '4px' }}>You're all caught up!</h3>
            <p style={{ fontSize: '0.85rem' }}>No new notifications at this time.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.map(n => (
              <div 
                key={n.id}
                onClick={() => markAsRead(n.id)}
                style={{
                  background: n.read ? 'rgba(255, 255, 255, 0.02)' : 'rgba(99, 102, 241, 0.12)',
                  border: n.read ? '1px solid var(--border-subtle)' : '1px solid var(--primary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: n.read ? 'rgba(255,255,255,0.05)' : 'rgba(99, 102, 241, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: n.read ? 'var(--text-muted)' : 'var(--primary)'
                  }}>
                    {n.type === 'connection_request' ? <UserPlus size={18} /> : <Bell size={18} />}
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: n.read ? 'var(--text-muted)' : '#fff' }}>
                      {n.title}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {n.message}
                    </p>
                  </div>
                </div>

                {n.link && (
                  <Link to={n.link} className="btn btn-secondary btn-sm" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                    View <ExternalLink size={12} />
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
