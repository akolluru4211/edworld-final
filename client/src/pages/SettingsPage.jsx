import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Shield, 
  Lock, 
  Bell, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function SettingsPage() {
  const { user, userProfile, updateProfileData, resetPassword, logout } = useAuth();
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState('account'); // 'account' | 'privacy' | 'security'

  // Account State
  const [displayName, setDisplayName] = useState('');
  const [headline, setHeadline] = useState('');
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('');
  const [branch, setBranch] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setHeadline(userProfile.headline || '');
      setCollege(userProfile.college || '');
      setDegree(userProfile.degree || '');
      setBranch(userProfile.branch || '');
      setCareerGoal(userProfile.careerGoal || '');
      setPrivacy(userProfile.privacy || 'public');
    }
  }, [userProfile]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfileData({
        displayName,
        headline,
        college,
        degree,
        branch,
        careerGoal,
        privacy
      });
      showToast('Settings saved and profile updated! ✨');
    } catch (err) {
      showToast('Failed to update settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    try {
      await resetPassword(user.email);
      showToast(`Password reset link dispatched to ${user.email}! 📧`);
    } catch (err) {
      showToast('Failed to trigger reset email', 'error');
    }
  };

  return (
    <div className="settings-page" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="hero-banner" style={{ padding: '32px 28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99, 102, 241, 0.18)', border: '1px solid rgba(99, 102, 241, 0.35)', padding: '4px 12px', borderRadius: 'var(--radius-full)', marginBottom: '8px' }}>
              <Settings size={14} color="var(--primary)" />
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#a5b4fc', textTransform: 'uppercase' }}>
                Account Controls
              </span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '4px' }}>
              Settings & Privacy
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Manage your career profile, privacy visibility, and account security.
            </p>
          </div>

          <div className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => setActiveTab('account')}
            >
              <User size={14} /> Profile
            </button>
            <button 
              className={`nav-tab ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              <Shield size={14} /> Privacy
            </button>
            <button 
              className={`nav-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <Lock size={14} /> Security
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'account' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            Profile Details
          </h3>

          <form onSubmit={handleSaveProfile}>
            <div className="grid-2-even" style={{ gap: '14px', marginBottom: '14px' }}>
              <div>
                <label className="form-label">Display Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Username (Permanent Handle)</label>
                <input 
                  type="text" 
                  disabled
                  className="input-field" 
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                  value={`@${userProfile?.username || 'user'}`}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Professional Headline</label>
              <input 
                type="text" 
                className="input-field" 
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
            </div>

            <div className="grid-2-even" style={{ gap: '14px', marginBottom: '14px' }}>
              <div>
                <label className="form-label">College / University</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Target Career Goal</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '10px' }}>
              <Save size={15} /> {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            Career Passport Visibility
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            {[
              { val: 'public', label: 'Public (Recommended)', desc: 'Discoverable in the Peer Network and accessible via your public URL edworld.co.in/u/username.' },
              { val: 'network', label: 'Network Only', desc: 'Visible only to accepted peer connections on EdWorld Co.' },
              { val: 'private', label: 'Private Mode', desc: 'Hidden from discovery; visible only to yourself.' }
            ].map(opt => (
              <label 
                key={opt.val}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  background: privacy === opt.val ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  border: privacy === opt.val ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  padding: '16px',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                <input 
                  type="radio" 
                  name="privacy"
                  value={opt.val}
                  checked={privacy === opt.val}
                  onChange={(e) => setPrivacy(e.target.value)}
                  style={{ marginTop: '4px' }}
                />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{opt.label}</div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '2px' }}>{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <button onClick={handleSaveProfile} disabled={loading} className="btn btn-primary">
            <Save size={15} /> Save Privacy Settings
          </button>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            Authentication & Security
          </h3>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '4px' }}>Primary Account Email</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '14px' }}>{user?.email}</div>
            <button onClick={handlePasswordReset} className="btn btn-secondary btn-sm">
              <Lock size={14} /> Send Password Reset Email
            </button>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
            <h4 style={{ color: 'var(--rose)', fontSize: '0.95rem', fontWeight: '700', marginBottom: '8px' }}>Session Logout</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '14px' }}>
              Terminate your active authenticated session on this device.
            </p>
            <button onClick={logout} className="btn btn-danger btn-sm">
              <LogOut size={14} /> Sign Out of EdWorld
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
