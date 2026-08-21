const fs = require('fs');

// 1. Update ProfilePage.jsx
const profilePageCode = `import React, { useState, useEffect, useRef } from 'react';
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
  Edit3,
  Camera,
  Upload,
  Image,
  MapPin,
  GraduationCap,
  Target,
  Github,
  Linkedin,
  Globe,
  Plus,
  X,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getUserProjects, getUserResumes, getUserInterviews, getConnectedUsers } from '../services/firestoreService';
import UserAvatar from '../components/common/UserAvatar';
import { ScoreRing, PageHeader, Modal } from '../components/common/UIComponents';

const POPULAR_SKILLS = [
  'React', 'JavaScript', 'TypeScript', 'Node.js', 'Python',
  'Firebase', 'Tailwind CSS', 'Next.js', 'PostgreSQL', 'MongoDB',
  'Docker', 'AWS', 'System Design', 'Algorithms', 'Git', 'REST APIs'
];

export default function ProfilePage() {
  const { firebaseUser, profile, updateProfileData, resetPassword, logout } = useAuth();
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'hub' | 'skills' | 'privacy' | 'security'
  
  const [projects, setProjects] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [connections, setConnections] = useState([]);

  // Form State
  const [displayName, setDisplayName] = useState('');
  const [headline, setHeadline] = useState('');
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('B.Tech / B.E.');
  const [branch, setBranch] = useState('');
  const [gradYear, setGradYear] = useState('2026');
  const [location, setLocation] = useState('');
  const [careerGoal, setCareerGoal] = useState('Full Stack Software Engineer');
  const [bio, setBio] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [networkVisibility, setNetworkVisibility] = useState(true);
  const [photoURL, setPhotoURL] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [customPhotoInput, setCustomPhotoInput] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || firebaseUser?.displayName || '');
      setHeadline(profile.headline || 'Aspiring Software Engineer');
      setCollege(profile.college || '');
      setDegree(profile.degree || 'B.Tech / B.E.');
      setBranch(profile.branch || 'Computer Science');
      setGradYear(profile.gradYear || '2026');
      setLocation(profile.location || '');
      setCareerGoal(profile.careerGoal || 'Full Stack Software Engineer');
      setBio(profile.bio || '');
      setGithub(profile.github || '');
      setLinkedin(profile.linkedin || '');
      setPortfolioUrl(profile.portfolioUrl || '');
      setPrivacy(profile.privacy || 'public');
      setNetworkVisibility(profile.networkVisibility !== false);
      setPhotoURL(profile.photoURL || firebaseUser?.photoURL || '');
      setSkills(profile.skills || ['React', 'JavaScript', 'Node.js']);
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
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await updateProfileData({
        displayName: displayName.trim(),
        headline: headline.trim(),
        college: college.trim(),
        degree,
        branch: branch.trim(),
        gradYear,
        location: location.trim(),
        careerGoal,
        bio: bio.trim(),
        github: github.trim().replace(/^https?:\\/\\/github\\.com\\//, ''),
        linkedin: linkedin.trim().replace(/^https?:\\/\\/linkedin\\.com\\/in\\//, ''),
        portfolioUrl: portfolioUrl.trim(),
        privacy,
        networkVisibility,
        photoURL,
        skills
      });
      showToast('Profile updated & synchronized successfully! ✨');
    } catch (err) {
      showToast('Failed to save profile updates', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Image Upload Handler (reads file as high-quality data URL)
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Please select an image smaller than 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string') {
        setPhotoURL(dataUrl);
        setShowPhotoModal(false);
        try {
          await updateProfileData({ photoURL: dataUrl });
          showToast('Profile photo updated! 📸');
        } catch (err) {
          showToast('Photo uploaded locally, remember to click Save', 'info');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCustomPhotoUrlSubmit = async (e) => {
    e.preventDefault();
    if (!customPhotoInput.trim()) return;
    setPhotoURL(customPhotoInput.trim());
    setShowPhotoModal(false);
    setCustomPhotoInput('');
    try {
      await updateProfileData({ photoURL: customPhotoInput.trim() });
      showToast('Profile photo updated! 📸');
    } catch (err) {
      showToast('Photo URL set', 'info');
    }
  };

  const handleAddSkill = (skillToAdd) => {
    const clean = skillToAdd.trim();
    if (clean && !skills.includes(clean) && skills.length < 15) {
      setSkills([...skills, clean]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handlePasswordReset = async () => {
    if (!firebaseUser?.email) return;
    try {
      await resetPassword(firebaseUser.email);
      showToast(\`Password reset email sent to \${firebaseUser.email}! 📧\`);
    } catch (err) {
      showToast('Failed to send reset email', 'error');
    }
  };

  const username = profile?.username || 'developer';

  return (
    <div className="profile-control-page" style={{ paddingBottom: '60px' }}>
      
      {/* 1. TOP HERO PROFILE CARD WITH AVATAR EDIT TRIGGER */}
      <div className="hero-banner" style={{ padding: '32px 28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            
            {/* Interactive Avatar with Camera Overlay */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <UserAvatar 
                name={displayName || profile?.displayName} 
                photoURL={photoURL || profile?.photoURL} 
                size={88} 
              />
              <button 
                type="button"
                onClick={() => setShowPhotoModal(true)}
                style={{
                  position: 'absolute',
                  bottom: '0px',
                  right: '0px',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  border: '2px solid #090d16',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                  transition: 'var(--transition-fast)'
                }}
                title="Change profile photo"
                aria-label="Change photo"
              >
                <Camera size={15} />
              </button>
            </div>

            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.18)', border: '1px solid rgba(99, 102, 241, 0.35)', padding: '3px 10px', borderRadius: 'var(--radius-full)', marginBottom: '8px' }}>
                <User size={13} color="var(--primary)" />
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#a5b4fc', textTransform: 'uppercase' }}>
                  Developer Control Center
                </span>
              </div>

              <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '4px' }}>
                {displayName || profile?.displayName || 'Developer'}
              </h1>

              <p style={{ color: 'var(--text-body)', fontSize: '0.94rem', maxWidth: '560px', margin: 0 }}>
                {headline || profile?.headline || 'Aspiring Software Engineer'}
              </p>

              <div style={{ display: 'flex', gap: '14px', marginTop: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <span>@{username}</span>
                {college && <span>· {college}</span>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to={\`/u/\${username}\`} target="_blank" className="btn btn-secondary btn-sm">
              <ExternalLink size={14} /> Public Passport
            </Link>
          </div>

        </div>
      </div>

      {/* 2. SPLIT LAYOUT: STICKY SIDEBAR (LEFT) + SCROLLABLE FEATURE CONTENT (RIGHT) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(240px, 280px) minmax(400px, 1fr)',
        gap: '24px',
        alignItems: 'start'
      }} className="profile-layout-container">
        
        {/* ========================================================================= */}
        {/* LEFT STICKY SIDEBAR MENU */}
        {/* ========================================================================= */}
        <div className="glass-card sticky-sidebar" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '6px 12px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
            Profile Navigation
          </div>

          {[
            { key: 'edit', label: 'Edit Profile & Info', icon: Edit3 },
            { key: 'skills', label: 'Skills & Tech Stack', icon: Target },
            { key: 'hub', label: 'Metrics & Quick Hub', icon: Compass },
            { key: 'privacy', label: 'Privacy & Visibility', icon: Shield },
            { key: 'security', label: 'Account & Security', icon: Lock }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: isActive ? '800' : '600',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'var(--transition-fast)'
                }}
              >
                <Icon size={16} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '12px', paddingTop: '12px' }}>
            <button
              type="button"
              onClick={() => setShowPhotoModal(true)}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Camera size={14} /> Change Photo
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT SCROLLABLE FEATURE CONTENT */}
        {/* ========================================================================= */}
        <div className="scrollable-features">
          
          {/* TAB 1: EDIT PROFILE & GENERAL INFO */}
          {activeTab === 'edit' && (
            <div className="glass-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
                    Edit Profile Information
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                    Changes are automatically synchronized to your public developer passport and peer network.
                  </p>
                </div>

                <button 
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="btn btn-primary btn-sm"
                >
                  <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              <form onSubmit={handleSaveProfile}>
                
                {/* Name & Headline */}
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Full Display Name *</label>
                    <input 
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. Adarsh Kolluru"
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
                      placeholder="e.g. Full Stack Developer | Distributed Systems"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                    />
                  </div>
                </div>

                {/* College, Degree, Major, Grad Year */}
                <div className="grid-2" style={{ marginTop: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">University / College</label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="e.g. Indian Institute of Technology / Stanford"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Degree</label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="e.g. B.Tech / B.S. in Computer Science"
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid-2" style={{ marginTop: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Branch / Major</label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="e.g. Computer Science & Engineering"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Graduation Year</label>
                    <select 
                      className="form-select"
                      value={gradYear}
                      onChange={(e) => setGradYear(e.target.value)}
                    >
                      {['2024', '2025', '2026', '2027', '2028', '2029'].map(yr => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location & Career Goal */}
                <div className="grid-2" style={{ marginTop: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="e.g. Bengaluru, India / San Francisco, CA"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Primary Career Goal</label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="e.g. Full Stack Software Engineer"
                      value={careerGoal}
                      onChange={(e) => setCareerGoal(e.target.value)}
                    />
                  </div>
                </div>

                {/* Social Links */}
                <div className="grid-2" style={{ marginTop: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">GitHub Username</label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="e.g. octocat"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">LinkedIn Handle / URL</label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="e.g. in/username"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                    />
                  </div>
                </div>

                {/* Bio / Story */}
                <div className="form-group" style={{ marginTop: '14px' }}>
                  <label className="form-label">Developer Bio & Story</label>
                  <textarea 
                    className="form-textarea"
                    rows={4}
                    placeholder="Share your engineering focus, project accomplishments, and technical background..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button type="submit" disabled={saving} className="btn btn-primary">
                    <Save size={15} /> {saving ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: SKILLS & TECH STACK */}
          {activeTab === 'skills' && (
            <div className="glass-card" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px' }}>
                Skills Matrix & Tech Stack
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Add your languages, frameworks, and developer tools to power opportunity match calculation.
              </p>

              {/* Active Skill Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                {skills.map(sk => (
                  <span key={sk} className="badge badge-primary" style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span>{sk}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSkill(sk)} 
                      style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Custom Skill Input */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Type new skill (e.g. Next.js, Redis, Rust)..."
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(newSkillInput);
                    }
                  }}
                />
                <button 
                  type="button" 
                  onClick={() => handleAddSkill(newSkillInput)}
                  className="btn btn-secondary"
                >
                  <Plus size={15} /> Add Skill
                </button>
              </div>

              {/* Popular Suggestions */}
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
                Popular Technologies
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
                {POPULAR_SKILLS.filter(s => !skills.includes(s)).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAddSkill(s)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-body)',
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    + {s}
                  </button>
                ))}
              </div>

              <button 
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="btn btn-primary"
              >
                <Save size={15} /> Save Skills Matrix
              </button>
            </div>
          )}

          {/* TAB 3: PROFILE HUB & QUICK STATS */}
          {activeTab === 'hub' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="grid-4">
                <div className="glass-card" style={{ padding: '18px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Career Goal</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff', marginTop: '4px' }}>{careerGoal}</div>
                </div>

                <div className="glass-card" style={{ padding: '18px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Verified Skills</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary)', marginTop: '2px' }}>{skills.length}</div>
                </div>

                <div className="glass-card" style={{ padding: '18px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Studio Projects</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--secondary)', marginTop: '2px' }}>{projects.length}</div>
                </div>

                <div className="glass-card" style={{ padding: '18px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Peer Network</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--emerald)', marginTop: '2px' }}>{connections.length}</div>
                </div>
              </div>

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
                    Public engineering portfolio and case studies at edworld.co.in/u/{username}.
                  </p>
                  <Link to="/portfolio" className="btn btn-secondary btn-sm" style={{ marginTop: 'auto' }}>
                    Manage Portfolio
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRIVACY & VISIBILITY */}
          {activeTab === 'privacy' && (
            <div className="glass-card" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '10px' }}>
                Privacy & Visibility Controls
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Choose who can discover your developer passport and send you collaboration requests.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {[
                  { key: 'public', title: 'Public (Recommended)', desc: 'Discoverable in the Peer Network directory and visible on your public URL.' },
                  { key: 'network', title: 'Network Only', desc: 'Only connected peers can view your full proof-of-work repositories.' },
                  { key: 'private', title: 'Private', desc: 'Hidden from directory searches and discovery.' }
                ].map(opt => (
                  <label 
                    key={opt.key}
                    style={{
                      background: privacy === opt.key ? 'rgba(99, 102, 241, 0.16)' : 'rgba(15, 23, 42, 0.7)',
                      border: privacy === opt.key ? '1px solid var(--border-glow)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    <input 
                      type="radio" 
                      name="privacy" 
                      checked={privacy === opt.key} 
                      onChange={() => setPrivacy(opt.key)}
                    />
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#fff' }}>{opt.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              <button 
                type="button" 
                onClick={handleSaveProfile} 
                disabled={saving} 
                className="btn btn-primary"
              >
                <Save size={15} /> Save Privacy Settings
              </button>
            </div>
          )}

          {/* TAB 5: SECURITY & ACCOUNT */}
          {activeTab === 'security' && (
            <div className="glass-card" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px' }}>
                Account Security & Authentication
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Primary Email: <strong style={{ color: '#fff' }}>{firebaseUser?.email}</strong>
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#fff', marginBottom: '4px' }}>Password Reset</div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    Send a password reset link to your verified email address.
                  </p>
                  <button onClick={handlePasswordReset} className="btn btn-secondary btn-sm">
                    Send Password Reset Email
                  </button>
                </div>

                <div style={{ background: 'rgba(244, 63, 94, 0.08)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(244, 63, 94, 0.25)' }}>
                  <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--rose)', marginBottom: '4px' }}>Sign Out Across Devices</div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    Terminate your active session on this device.
                  </p>
                  <button onClick={logout} className="btn btn-danger btn-sm">
                    <LogOut size={14} /> Sign Out of Session
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 3. PHOTO UPLOAD & CHANGE MODAL (EXACT SCREEN CENTERED) */}
      <Modal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        title="Update Profile Photo"
        maxWidth="500px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
          
          {/* Avatar Preview */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <UserAvatar 
              name={displayName || profile?.displayName} 
              photoURL={photoURL} 
              size={96} 
            />
          </div>

          {/* Option A: Upload File */}
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px dashed var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: '24px', textAlign: 'center' }}>
            <Upload size={24} color="var(--primary)" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>
              Upload Image from Computer
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Supports PNG, JPG, WEBP (Max 2MB)
            </p>

            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleImageFileChange} 
              style={{ display: 'none' }} 
            />

            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()} 
              className="btn btn-primary btn-sm"
            >
              Choose Image File
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
            <span>OR ENTER IMAGE URL</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          </div>

          {/* Option B: Enter Direct URL */}
          <form onSubmit={handleCustomPhotoUrlSubmit} style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="url" 
              className="form-input" 
              placeholder="https://example.com/my-avatar.jpg"
              value={customPhotoInput}
              onChange={(e) => setCustomPhotoInput(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-secondary btn-sm">
              Apply URL
            </button>
          </form>

        </div>
      </Modal>

      {/* Responsive Styles for Sticky Sidebar & Split Grid */}
      <style>{\`
        @media (max-width: 900px) {
          .profile-layout-container {
            grid-template-columns: 1fr !important;
          }
          .sticky-sidebar {
            position: relative !important;
            top: 0 !important;
            max-height: none !important;
          }
        }
      \`}</style>
    </div>
  );
}
`;

// 2. Update styles.css for Centered Modals and Sticky Sidebar
const currentStyles = fs.readFileSync('E:/edworldco/client/src/styles.css', 'utf8');

// Replace modal-overlay and modal-content with robust screen-centered CSS
const updatedStyles = currentStyles
  .replace(
    /\.modal-overlay\s*\{[\s\S]*?\}/,
    `.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(4, 6, 12, 0.82);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.2s ease-out;
  overflow-y: auto;
}`
  )
  .replace(
    /\.modal-content\s*\{[\s\S]*?\}/,
    `.modal-content {
  background: #0f172a;
  border: 1px solid var(--border-glow);
  border-radius: var(--radius-xl);
  padding: 28px;
  max-width: 600px;
  width: 100%;
  max-height: 88vh;
  overflow-y: auto;
  margin: auto;
  box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.95);
  animation: modalEnter 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}`
  );

// Add sticky sidebar utility
const finalStyles = updatedStyles + `

/* Sticky Sidebar Utility */
.sticky-sidebar {
  position: sticky;
  top: 84px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  align-self: flex-start;
  scrollbar-width: thin;
}

.sticky-sidebar::-webkit-scrollbar {
  width: 4px;
}

.sticky-sidebar::-webkit-scrollbar-thumb {
  background: var(--border-medium);
  border-radius: 4px;
}

.scrollable-features {
  min-width: 0;
}
`;

fs.writeFileSync('E:/edworldco/client/src/pages/ProfilePage.jsx', profilePageCode, 'utf8');
fs.writeFileSync('E:/edworldco/client/src/styles.css', finalStyles, 'utf8');
console.log('Successfully written updated ProfilePage.jsx and styles.css!');
`;

fs.writeFileSync('C:/Users/adars/.gemini/antigravity/brain/59af2ed0-1102-48fa-a5f2-e3defb203860/scratch/build_enhanced_profile_ui.js', profilePageCode, 'utf8');
