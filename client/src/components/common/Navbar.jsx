import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Compass, 
  FolderGit2, 
  FileText, 
  Briefcase, 
  Kanban, 
  Bot, 
  Users, 
  Bell, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  User, 
  Menu, 
  X,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export default function Navbar() {
  const { user, userProfile, logout, isAdmin } = useAuth();
  const { unreadCount } = useNotification();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setShowProfileMenu(false);
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/career', label: 'Career OS', icon: Compass },
    { to: '/studio', label: 'Studio', icon: FolderGit2 },
    { to: '/portfolio', label: 'Portfolio', icon: Sparkles },
    { to: '/resume', label: 'Resume ATS', icon: FileText },
    { to: '/jobs', label: 'Jobs', icon: Briefcase },
    { to: '/applications', label: 'Pipeline', icon: Kanban },
    { to: '/interview', label: 'AI Interview', icon: Bot },
    { to: '/networking', label: 'Network', icon: Users }
  ];

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <BrandLogo to={user ? '/dashboard' : '/'} />
      </div>

      {user ? (
        <>
          {/* Desktop Nav Links */}
          <nav className="nav-links" style={{ display: 'none', lg: 'flex' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User Right Menu */}
          <div className="navbar-actions">
            {isAdmin && (
              <Link to="/admin" className="btn btn-outline btn-sm" style={{ padding: '6px 10px', fontSize: '0.8rem' }}>
                <ShieldCheck size={14} /> Admin
              </Link>
            )}

            <Link to="/notifications" style={{ position: 'relative', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              <Bell size={20} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-6px',
                  background: 'var(--rose)',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: '800',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {unreadCount}
                </span>
              )}
            </Link>

            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <img 
                  src={userProfile?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${userProfile?.username || 'dev'}`} 
                  alt={userProfile?.displayName || 'User'} 
                  className="avatar" 
                  style={{ width: '36px', height: '36px' }}
                />
              </button>

              {showProfileMenu && (
                <div style={{
                  position: 'absolute',
                  top: '46px',
                  right: '0',
                  width: '230px',
                  background: '#101726',
                  border: '1px solid var(--border-glow)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.8)',
                  zIndex: 200,
                  padding: '8px 0',
                  animation: 'modalEnter 0.15s ease-out'
                }}>
                  <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>{userProfile?.displayName || 'User'}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--secondary)' }}>@{userProfile?.username || 'user'}</div>
                  </div>

                  <Link 
                    to={`/u/${userProfile?.username}`} 
                    onClick={() => setShowProfileMenu(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.88rem' }}
                  >
                    <ExternalLink size={15} color="var(--primary)" /> Public Passport
                  </Link>

                  <Link 
                    to="/settings" 
                    onClick={() => setShowProfileMenu(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.88rem' }}
                  >
                    <Settings size={15} color="var(--secondary)" /> Settings
                  </Link>

                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      onClick={() => setShowProfileMenu(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.88rem' }}
                    >
                      <ShieldCheck size={15} color="var(--amber)" /> Admin Panel
                    </Link>
                  )}

                  <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />

                  <button 
                    onClick={handleLogout}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', color: 'var(--rose)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.88rem', textAlign: 'left' }}
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', lg: 'none', padding: '6px' }}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </>
      ) : (
        <div className="navbar-actions">
          <Link to="/login" className="btn btn-secondary btn-sm">
            Sign In
          </Link>
          <Link to="/signup" className="btn btn-primary btn-sm">
            Get Started
          </Link>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && user && (
        <div style={{
          position: 'fixed',
          top: '65px',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(9, 13, 22, 0.98)',
          zIndex: 99,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          overflowY: 'auto'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                style={{ justifyContent: 'flex-start', padding: '12px 18px' }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '12px 0' }} />
          <Link to={`/u/${userProfile?.username}`} onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
            <User size={18} /> View Public Passport
          </Link>
          <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
            <Settings size={18} /> Account Settings
          </Link>
          <button onClick={handleLogout} className="btn btn-danger" style={{ justifyContent: 'flex-start' }}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      )}
    </header>
  );
}
