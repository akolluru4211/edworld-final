import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Settings, 
  Shield, 
  Lock, 
  Bell, 
  Save, 
  CheckCircle, 
  Sparkles, 
  Compass, 
  FolderGit2, 
  FileText, 
  ExternalLink,
  Award,
  Users,
  LogOut,
  Edit3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getUserProjects, getUserResumes, getUserInterviews, getConnectedUsers } from '../services/firestoreService';
import UserAvatar from '../components/common/UserAvatar';
import { ScoreRing, PageHeader } from '../components/common/UIComponents';

export default function ProfilePage() {
  const { firebaseUser, profile, updateProfileData, resetPassword, logout } = useAuth();
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState('hub'); // 'hub' | 'edit' | 'privacy' | 'security'
  
  const [projects, setProjects] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [connections, setConnections] = useState([]);

  // Form State
  const [displayName, setDisplayName] = useState('');
  const [headline, setHeadline] = useState('');
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('');
  const [branch, setBranch] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [bio, setBio] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setHeadline(profile.headline || '');
      setCollege(profile.college || '');
      setDegree(profile.degree || '');
      setBranch(profile.branch || '');
      setCareerGoal(profile.careerGoal || '');
      setBio(profile.bio || '');
      setPrivacy(profile.privacy || 'public');
    }
    if (firebaseUser) {
      Promise.all([
        getUserProjects(firebaseUser.uid),
        getUserResumes(firebaseUser.uid),
        getConnectedUsers(firebaseUser.uid)
      ]).then(([p, r, c]) => {
        setProjects(p || []);
        setResumes(r || []);
        setConnections(c || []);
      });
    }
  }, [firebaseUser, profile]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfileData({
        displayName,
        headline,
        college,
        degree,
        branch,
        careerGoal,
        bio,
        privacy
      });
      showToast('Profile and settings updated successfully! ✨');
    } catch (err) {
      showToast('Failed to save profile updates', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!firebaseUser?.email) return;
    try {
      await resetPassword(firebaseUser.email);
      showToast(`Password reset email sent to ${firebaseUser.email}! 📧`);
    } catch (err) {
      showToast('Failed to send reset email', 'error');
    }
  };

  return (
    <div className="profile-control-page" style={{ paddingBottom: '50px' }}>
      
      {/* 1. HEADER HERO */}
      <div className="hero-banner" style={{ padding: '32px 28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <UserAvatar 
              name={profile?.displayName} 
              photoURL={profile?.photoURL} 
              size={76} 
            />
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.18)', border: '1px solid rgba(99, 102, 241, 0.35)', padding: '2px 10px', borderRadius: 'var(--radius-full)', marginBottom: '6px' }}>
                <User size={13} color="var(--primary)" />
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#a5b4fc', textTransform: 'uppercase' }}>
                  Personal Control Center
                </span>
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '4px' }}>
                {profile?.displayName || 'User'}
              </h1>
              <p style={{ color: 'var(--text-body)', fontSize: '0.92rem', maxWidth: '540px', margin: 0 }}>
                {profile?.headline || 'Aspiring Software Engineer'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to={`/u/${profile?.username || ''}`} className="btn btn-secondary btn-sm">
              <ExternalLink size={14} /> Public Passport
            </Link>
          </div>
        </div>
      </div>

      {/* 2. TABS */}
      <div style={{ marginBottom: '24px' }}>
        <div className="nav-tabs">
          {[
            { key: 'hub', label: 'Profile Hub', icon: User },
            { key: 'edit', label: 'Edit Profile', icon: Edit3 },
            { key: 'privacy', label: 'Privacy & Visibility', icon: Shield },
            { key: 'security', label: 'Security & Account', icon: Lock }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`nav-tab ${activeTab === t.key ? 'active' : ''}`}
              >
                <Icon size={14} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TAB CONTENT */}
      {activeTab === 'hub' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Quick Metrics */}
          <div className="grid-4">
            <div className="glass-card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Career Goal</div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: '#fff', marginTop: '4px' }}>{profile?.careerGoal || 'Full Stack'}</div>
            </div>

            <div className="glass-card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Verified Skills</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary)', marginTop: '2px' }}>{profile?.skills?.length || 0}</div>
            </div>

            <div className="glass-card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Projects Built</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--secondary)', marginTop: '2px' }}>{projects.length}</div>
            </div>

            <div className="glass-card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Peer Network</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--emerald)', marginTop: '2px' }}>{connections.length}</div>
            </div>
          </div>

          {/* Connected Quick Hubs */}
          <div className="grid-3">
            <div className="glass-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Compass size={18} color="var(--primary)" /> Career Passport
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                Verified proof-of-work skills, timeline progression, and algorithmic readiness score.
              </p>
              <Link to="/career" className="btn btn-secondary btn-sm" style={{ marginTop: 'auto' }}>
                Open Career OS
              </Link>
            </div>

            <div className="glass-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="var(--secondary)" /> ATS Resume Studio
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                ATS keyword analyzer, bullet point optimizer, and downloadable printable resume.
              </p>
              <Link to="/resume" className="btn btn-secondary btn-sm" style={{ marginTop: 'auto' }}>
                Open Resume Studio
              </Link>
            </div>

            <div className="glass-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#c084fc" /> Developer Portfolio
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                Public engineering portfolio and case studies at edworld.co.in/u/{profile?.username || 'user'}.
              </p>
              <Link to="/portfolio" className="btn btn-secondary btn-sm" style={{ marginTop: 'auto' }}>
                Manage Portfolio
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE TAB */}
      {activeTab === 'edit' && (
        <div className="glass-card" style={{ padding: '28px', maxWidth: '780px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '18px' }}>
            Edit Profile Information
          </h3>

          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label">Full Display Name *</label>
              <input 
                type="text"
                className="form-input"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Professional Headline *</label>
              <input 
                type="text"
                className="form-input"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">University / College</label>
                <input 
                  type="text"
                  className="form-input"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Degree & Major</label>
                <input 
                  type="text"
                  className="form-input"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Target Career Goal</label>
              <input 
                type="text"
                className="form-input"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Developer Bio</label>
              <textarea 
                className="form-textarea"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              <Save size={15} /> {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

      {/* PRIVACY TAB */}
      {activeTab === 'privacy' && (
        <div className="glass-card" style={{ padding: '28px', maxWidth: '780px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '16px' }}>
            Privacy & Visibility Controls
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Control who can discover your profile, view verified projects, and send connection requests.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['public', 'network', 'private'].map(pOption => (
              <label 
                key={pOption}
                style={{
                  background: privacy === pOption ? 'rgba(99, 102, 241, 0.15)' : 'rgba(15, 23, 42, 0.7)',
                  border: privacy === pOption ? '1px solid var(--border-glow)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer'
                }}
              >
                <input 
                  type="radio" 
                  name="privacy" 
                  checked={privacy === pOption}
                  onChange={() => setPrivacy(pOption)}
                />
                <div>
                  <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#fff', textTransform: 'capitalize' }}>
                    {pOption === 'public' ? 'Public (Recommended)' : pOption === 'network' ? 'Network Only' : 'Private'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {pOption === 'public' ? 'Discoverable in Network directory and public passport URLs.' : pOption === 'network' ? 'Only connected peers can view your full proof of work.' : 'Hidden from directory searches.'}
                  </div>
                </div>
              </label>
            ))}
          </div>

          <button onClick={handleSaveProfile} className="btn btn-primary" style={{ marginTop: '20px' }}>
            Save Privacy Preference
          </button>
        </div>
      )}

      {/* SECURITY TAB */}
      {activeTab === 'security' && (
        <div className="glass-card" style={{ padding: '28px', maxWidth: '780px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '16px' }}>
            Account Security & Authentication
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Primary Email: <strong style={{ color: '#fff' }}>{firebaseUser?.email}</strong>
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#fff', marginBottom: '4px' }}>Password Management</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Dispatches a password reset link to your authenticated primary email address.
              </p>
              <button onClick={handlePasswordReset} className="btn btn-secondary btn-sm">
                Send Password Reset Email
              </button>
            </div>

            <div style={{ background: 'rgba(244, 63, 94, 0.08)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(244, 63, 94, 0.25)' }}>
              <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--rose)', marginBottom: '4px' }}>Session Management</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Sign out of your active EdWorld Co. session across this device.
              </p>
              <button onClick={logout} className="btn btn-danger btn-sm">
                <LogOut size={14} /> Sign Out of Session
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
