import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Compass, 
  FolderGit2, 
  Users, 
  Briefcase, 
  Kanban, 
  Bot, 
  Search, 
  Bell, 
  Sparkles, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  FileText, 
  Award, 
  Menu, 
  X, 
  ExternalLink,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import UserAvatar from './UserAvatar';
import CommandSearchModal from './CommandSearchModal';
import CareerCopilotDrawer from './CareerCopilotDrawer';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export default function Navbar() {
  const { 
    firebaseUser, 
    profile, 
    authLoading, 
    profileLoading, 
    isProfileComplete, 
    logout, 
    isAdmin 
  } = useAuth();
  const { unreadCount } = useNotification();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Close menus on route navigation
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

  // Primary 7 navigation links as requested
  const desktopNavItems = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/career', label: 'Career', icon: Compass },
    { to: '/studio', label: 'Projects', icon: FolderGit2 },
    { to: '/networking', label: 'Network', icon: Users },
    { to: '/jobs', label: 'Jobs', icon: Briefcase },
    { to: '/applications', label: 'Applications', icon: Kanban },
    { to: '/interview', label: 'Interview', icon: Bot }
  ];

  // Drawer items for complete access
  const allDrawerItems = [
    { to: '/dashboard', label: 'Home Dashboard', icon: LayoutDashboard, tag: null },
    { to: '/career', label: 'Career Passport', icon: Compass, tag: 'Score' },
    { to: '/studio', label: 'Project Studio', icon: FolderGit2, tag: 'Build' },
    { to: '/networking', label: 'Peer Network', icon: Users, tag: null },
    { to: '/jobs', label: 'Opportunity Marketplace', icon: Briefcase, tag: 'New' },
    { to: '/applications', label: 'Applications Pipeline', icon: Kanban, tag: null },
    { to: '/interview', label: 'AI Interview Simulator', icon: Bot, tag: 'AI' },
    { to: '/resume', label: 'ATS Resume Studio', icon: FileText, tag: 'ATS' },
    { to: '/portfolio', label: 'Developer Portfolio', icon: Sparkles, tag: null },
    { to: '/profile', label: 'My Profile Hub', icon: UserCheck, tag: null },
    { to: '/notifications', label: 'Notifications', icon: Bell, tag: unreadCount > 0 ? `${unreadCount}` : null },
    { to: '/settings', label: 'Settings & Privacy', icon: Settings, tag: null }
  ];

  const homeTarget = (firebaseUser && isProfileComplete) ? '/dashboard' : (firebaseUser ? '/onboarding' : '/');

  return (
    <>
      <header className="navbar">
        {/* Left: Brand Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BrandLogo to={homeTarget} />
        </div>

        {/* Center: Desktop Navigation (7 primary items) */}
        {authLoading || profileLoading ? (
          <div className="navbar-actions">
            <div style={{ width: '18px', height: '18px', border: '2px solid rgba(99,102,241,0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : (firebaseUser && isProfileComplete) ? (
          <>
            <nav className="nav-links hide-on-mobile" style={{ display: 'flex' }}>
              {desktopNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Right Actions: Search, Notifications, Career Copilot, Profile */}
            <div className="navbar-actions">
              {/* Global Search Button */}
              <button 
                onClick={() => setSearchOpen(true)}
                className="btn btn-ghost btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', color: 'var(--text-muted)' }}
                aria-label="Global search"
                title="Search (Ctrl+K)"
              >
                <Search size={17} />
                <span className="hide-on-mobile" style={{ fontSize: '0.8rem', opacity: 0.8 }}>Search</span>
                <kbd className="hide-on-mobile" style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>⌘K</kbd>
              </button>

              {/* Career Copilot AI Trigger */}
              <button
                onClick={() => setCopilotOpen(true)}
                className="btn btn-outline btn-sm"
                style={{
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderColor: 'var(--border-glow)',
                  background: 'rgba(99, 102, 241, 0.12)',
                  color: '#c7d2fe'
                }}
                aria-label="Open AI Career Copilot"
              >
                <Sparkles size={14} color="var(--primary)" />
                <span className="hide-on-mobile" style={{ fontSize: '0.82rem', fontWeight: '700' }}>Career Copilot</span>
              </button>

              {/* Notifications */}
              <Link 
                to="/notifications" 
                style={{ position: 'relative', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', minWidth: '36px', minHeight: '36px', justifyContent: 'center' }}
                aria-label="Notifications"
              >
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
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

              {/* Admin Badge if admin */}
              {isAdmin && (
                <Link to="/admin" className="btn btn-outline btn-sm hide-on-mobile" style={{ padding: '6px 10px', fontSize: '0.78rem', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fcd34d' }}>
                  <ShieldCheck size={14} color="var(--amber)" /> Admin
                </Link>
              )}

              {/* Profile Avatar Dropdown */}
              <div className="hide-on-mobile" style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', minHeight: '40px' }}
                  aria-label="User profile menu"
                >
                  <UserAvatar 
                    name={profile?.displayName} 
                    photoURL={profile?.photoURL} 
                    size={36} 
                  />
                </button>

                {showProfileMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '46px',
                    right: '0',
                    width: '250px',
                    background: '#101726',
                    border: '1px solid var(--border-glow)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.85)',
                    zIndex: 200,
                    padding: '8px 0',
                    animation: 'modalEnter 0.15s ease-out'
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#fff' }}>{profile?.displayName || 'User'}</div>
                      {profile?.headline && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                          {profile.headline}
                        </div>
                      )}
                      {profile?.careerScore !== undefined && profile?.careerScore !== null && (
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                          Readiness: <strong style={{ color: 'var(--emerald)' }}>{profile.careerScore}/100</strong>
                        </div>
                      )}
                    </div>

                    <Link 
                      to="/profile" 
                      onClick={() => setShowProfileMenu(false)}
                      style={{ padding: '10px 16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', fontSize: '0.88rem' }}
                    >
                      <UserCheck size={16} color="var(--primary)" /> Profile Control Center
                    </Link>

                    <Link 
                      to="/resume" 
                      onClick={() => setShowProfileMenu(false)}
                      style={{ padding: '10px 16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', fontSize: '0.88rem' }}
                    >
                      <FileText size={16} color="var(--secondary)" /> Resume Studio
                    </Link>

                    <Link 
                      to="/portfolio" 
                      onClick={() => setShowProfileMenu(false)}
                      style={{ padding: '10px 16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', fontSize: '0.88rem' }}
                    >
                      <Sparkles size={16} color="#c084fc" /> Portfolio Builder
                    </Link>

                    <Link 
                      to={`/u/${profile?.username || ''}`} 
                      onClick={() => setShowProfileMenu(false)}
                      style={{ padding: '10px 16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', fontSize: '0.88rem' }}
                    >
                      <ExternalLink size={16} color="var(--emerald)" /> Public Passport
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

              {/* Hamburger Drawer for Mobile & Tablet */}
              <button 
                className="btn btn-secondary btn-sm show-on-mobile"
                onClick={() => setDrawerOpen(true)}
                style={{ padding: '8px', minWidth: '38px', minHeight: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Open menu drawer"
              >
                <Menu size={18} />
              </button>
            </div>
          </>
        ) : firebaseUser ? (
          <div className="navbar-actions">
            <span className="hide-on-mobile" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Signed in as <strong style={{ color: 'var(--text-main)' }}>{firebaseUser.email || firebaseUser.displayName}</strong>
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

      {/* Global Command Search Modal */}
      <CommandSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Career Copilot Drawer */}
      <CareerCopilotDrawer isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />

      {/* Slide-out Navigation Drawer (Mobile & Tablet) */}
      {drawerOpen && firebaseUser && (
        <div className="nav-drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="nav-drawer-content" onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
              <BrandLogo to={isProfileComplete ? '/dashboard' : '/onboarding'} size="sm" />
              <button 
                onClick={() => setDrawerOpen(false)}
                style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Identity Card */}
            {isProfileComplete && (
              <Link 
                to="/profile" 
                onClick={() => setDrawerOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  marginBottom: '18px',
                  textDecoration: 'none',
                  color: 'var(--text-main)'
                }}
              >
                <UserAvatar 
                  name={profile?.displayName} 
                  photoURL={profile?.photoURL} 
                  size={40} 
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '800', fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {profile?.displayName || 'User Profile'}
                  </div>
                  {profile?.username && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--secondary)' }}>
                      @{profile.username}
                    </div>
                  )}
                </div>
                {profile?.careerScore !== undefined && profile?.careerScore !== null && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Score</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--emerald)' }}>
                      {profile.careerScore}
                    </div>
                  </div>
                )}
              </Link>
            )}

            {/* Drawer Links */}
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
                      padding: '11px 14px',
                      borderRadius: 'var(--radius-sm)',
                      textDecoration: 'none',
                      color: isActive ? '#fff' : 'var(--text-muted)',
                      background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                      border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    <Icon size={17} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.tag && (
                      <span className="badge badge-primary" style={{ fontSize: '0.68rem', padding: '2px 7px' }}>
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
                    padding: '11px 14px',
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none',
                    color: '#fcd34d',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    marginTop: '8px'
                  }}
                >
                  <ShieldCheck size={17} color="var(--amber)" />
                  <span style={{ flex: 1 }}>Admin Command Center</span>
                  <ChevronRight size={14} color="var(--amber)" />
                </NavLink>
              )}
            </div>

            {/* Footer */}
            <div style={{ paddingTop: '14px', marginTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
              <button 
                onClick={handleLogout}
                className="btn btn-outline" 
                style={{ width: '100%', color: 'var(--rose)', borderColor: 'rgba(244, 63, 94, 0.3)', padding: '10px', justifyContent: 'center' }}
              >
                <LogOut size={15} /> Sign Out of EdWorld Co.
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
