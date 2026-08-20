import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
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
  ExternalLink,
  ChevronRight,
  Search
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export default function Navbar() {
  const { user, userProfile, profileCompleted, logout, isAdmin } = useAuth();
  const { unreadCount } = useNotification();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close drawer and dropdown on route change
  useEffect(() => {
    setDrawerOpen(false);
    setShowProfileMenu(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    setDrawerOpen(false);
    setShowProfileMenu(false);
    navigate('/');
  };

  const desktopNavItems = [
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

  const allDrawerItems = [
    { to: '/dashboard', label: 'Home Dashboard', icon: LayoutDashboard, tag: null },
    { to: '/career', label: 'Career Identity OS', icon: Compass, tag: 'Score' },
    { to: '/studio', label: 'Project Studio', icon: FolderGit2, tag: 'Kanban' },
    { to: '/portfolio', label: 'Developer Portfolio', icon: Sparkles, tag: null },
    { to: '/resume', label: 'ATS Resume Studio', icon: FileText, tag: 'AI' },
    { to: '/jobs', label: 'Opportunities & Jobs', icon: Briefcase, tag: 'Feed' },
    { to: '/applications', label: 'Application Pipeline', icon: Kanban, tag: null },
    { to: '/interview', label: 'AI Interview Simulator', icon: Bot, tag: 'Voice' },
    { to: '/networking', label: 'Peer Network Directory', icon: Users, tag: null },
    { to: '/notifications', label: 'Notifications', icon: Bell, tag: unreadCount > 0 ? `${unreadCount}` : null },
    { to: '/settings', label: 'Settings & Privacy', icon: Settings, tag: null }
  ];

  return (
    <>
      <header className="navbar">
        {/* Left: Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <BrandLogo to={user && profileCompleted ? '/dashboard' : (user ? '/onboarding' : '/')} />
        </div>

        {/* Center: Desktop Navigation Links (≥ 1024px) */}
        {user && profileCompleted ? (
          <>
            <nav className="nav-links" style={{ display: 'none', lg: 'flex' }}>
              {desktopNavItems.map((item) => {
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

            {/* Right Actions */}
            <div className="navbar-actions">
              {isAdmin && (
                <Link to="/admin" className="btn btn-outline btn-sm hide-on-mobile" style={{ padding: '6px 10px', fontSize: '0.8rem' }}>
                  <ShieldCheck size={14} /> Admin
                </Link>
              )}

              {/* Notification Bell */}
              <Link 
                to="/notifications" 
                style={{ position: 'relative', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', minWidth: '32px', minHeight: '32px', justifyContent: 'center' }}
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
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

              {/* Desktop Avatar Dropdown (≥ 1024px) */}
              <div className="hide-on-mobile" style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', minHeight: '44px' }}
                  aria-label="User profile menu"
                >
                  <img 
                    src={userProfile?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${userProfile?.username || 'dev'}`} 
                    alt={userProfile?.displayName || 'User'} 
                    className="avatar" 
                    style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border-glow)' }}
                  />
                </button>

                {showProfileMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '48px',
                    right: '0',
                    width: '240px',
                    background: '#101726',
                    border: '1px solid var(--border-glow)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.8)',
                    zIndex: 200,
                    padding: '8px 0',
                    animation: 'modalEnter 0.15s ease-out'
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>{userProfile?.displayName || 'Developer'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--secondary)' }}>@{userProfile?.username || 'user'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Career Readiness: <strong style={{ color: 'var(--emerald)' }}>{userProfile?.careerScore || 70}/100</strong>
                      </div>
                    </div>

                    <Link 
                      to={`/u/${userProfile?.username}`} 
                      onClick={() => setShowProfileMenu(false)}
                      style={{ padding: '10px 16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', fontSize: '0.88rem' }}
                    >
                      <ExternalLink size={16} color="var(--primary)" /> Public Passport
                    </Link>

                    <Link 
                      to="/settings" 
                      onClick={() => setShowProfileMenu(false)}
                      style={{ padding: '10px 16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', fontSize: '0.88rem' }}
                    >
                      <Settings size={16} color="var(--text-muted)" /> Settings
                    </Link>

                    <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />

                    <button 
                      onClick={handleLogout}
                      style={{ width: '100%', padding: '10px 16px', background: 'transparent', border: 'none', color: 'var(--rose)', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.88rem', textAlign: 'left' }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* Hamburger Toggle (Tablet & Mobile) */}
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setDrawerOpen(true)}
                style={{ padding: '8px', minWidth: '40px', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Open Navigation Drawer"
              >
                <Menu size={20} />
              </button>
            </div>
          </>
        ) : user ? (
          /* User authenticated in Onboarding */
          <div className="navbar-actions">
            <span className="hide-on-mobile" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Signed in as <strong style={{ color: 'var(--text-main)' }}>{user.email || user.displayName}</strong>
            </span>
            <button 
              onClick={handleLogout}
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        ) : (
          /* Public Guest Navigation */
          <div className="navbar-actions">
            <Link to="/login" className="btn btn-outline btn-sm" style={{ padding: '8px 16px' }}>
              Sign In
            </Link>
            <Link to="/signup" className="btn btn-primary btn-sm" style={{ padding: '8px 18px' }}>
              Get Started
            </Link>
          </div>
        )}
      </header>

      {/* Full Responsive Drawer (Tablet & Mobile Slide-Out) */}
      {drawerOpen && user && (
        <div className="nav-drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="nav-drawer-content" onClick={(e) => e.stopPropagation()}>
            
            {/* Drawer Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
              <BrandLogo to={profileCompleted ? '/dashboard' : '/onboarding'} size="sm" />
              <button 
                onClick={() => setDrawerOpen(false)}
                style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>

            {/* User Identity Card */}
            {profileCompleted && (
              <Link 
                to={`/u/${userProfile?.username}`} 
                onClick={() => setDrawerOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  marginBottom: '20px',
                  textDecoration: 'none',
                  color: 'var(--text-main)'
                }}
              >
                <img 
                  src={userProfile?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${userProfile?.username || 'dev'}`} 
                  alt={userProfile?.displayName}
                  style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid var(--primary)' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '800', fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {userProfile?.displayName || 'Developer'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--secondary)' }}>
                    @{userProfile?.username || 'user'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Score</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--emerald)' }}>
                    {userProfile?.careerScore || 70}
                  </div>
                </div>
              </Link>
            )}

            {/* Navigation Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
              {allDrawerItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      textDecoration: 'none',
                      color: isActive ? '#fff' : 'var(--text-muted)',
                      background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                      border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                      fontWeight: '600',
                      fontSize: '0.92rem',
                      transition: 'var(--transition)'
                    }}
                  >
                    <Icon size={18} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.tag && (
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                        {item.tag}
                      </span>
                    )}
                    <ChevronRight size={14} color="var(--text-dim)" />
                  </NavLink>
                );
              })}

              {isAdmin && (
                <NavLink
                  to="/admin"
                  onClick={() => setDrawerOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none',
                    color: '#fcd34d',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    fontWeight: '700',
                    fontSize: '0.92rem',
                    marginTop: '8px'
                  }}
                >
                  <ShieldCheck size={18} color="var(--amber)" />
                  <span style={{ flex: 1 }}>Admin Command Center</span>
                  <ChevronRight size={14} color="var(--amber)" />
                </NavLink>
              )}
            </div>

            {/* Drawer Footer */}
            <div style={{ paddingTop: '16px', marginTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <button 
                onClick={handleLogout}
                className="btn btn-outline" 
                style={{ width: '100%', color: 'var(--rose)', borderColor: 'rgba(244, 63, 94, 0.3)', padding: '12px', justifyContent: 'center' }}
              >
                <LogOut size={16} /> Sign Out of EdWorld
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
