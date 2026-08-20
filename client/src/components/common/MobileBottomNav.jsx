import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Compass, 
  FolderGit2, 
  Briefcase, 
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function MobileBottomNav() {
  const { user, userProfile, profileCompleted } = useAuth();

  if (!user || !profileCompleted) return null;

  const profileLink = userProfile?.username ? `/u/${userProfile.username}` : '/settings';

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <NavLink
        to="/dashboard"
        className={({ isActive }) => `bottom-nav-tab ${isActive ? 'active' : ''}`}
      >
        <LayoutDashboard size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/career"
        className={({ isActive }) => `bottom-nav-tab ${isActive ? 'active' : ''}`}
      >
        <Compass size={20} />
        <span>Career</span>
      </NavLink>

      <NavLink
        to="/studio"
        className={({ isActive }) => `bottom-nav-tab ${isActive ? 'active' : ''}`}
      >
        <FolderGit2 size={20} />
        <span>Projects</span>
      </NavLink>

      <NavLink
        to="/jobs"
        className={({ isActive }) => `bottom-nav-tab ${isActive ? 'active' : ''}`}
      >
        <Briefcase size={20} />
        <span>Jobs</span>
      </NavLink>

      <NavLink
        to={profileLink}
        className={({ isActive }) => `bottom-nav-tab ${isActive ? 'active' : ''}`}
      >
        <User size={20} />
        <span>Passport</span>
      </NavLink>
    </nav>
  );
}
