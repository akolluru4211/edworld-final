import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  Share2, 
  Download, 
  QrCode, 
  ExternalLink, 
  CheckCircle, 
  Award, 
  FolderGit2, 
  TrendingUp, 
  ShieldCheck, 
  Plus, 
  Sparkles, 
  Code, 
  FileCheck,
  UserCheck,
  Zap,
  ChevronDown,
  ChevronUp,
  X,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { calculateCareerReadiness } from '../services/aiService';
import { getUserProjects, getUserResumes, getUserInterviews, getUserApplications } from '../services/firestoreService';
import UserAvatar from '../components/common/UserAvatar';

export default function CareerPage() {
  const { user, userProfile, updateProfileData } = useAuth();
  const { showToast } = useNotification();
  const [projects, setProjects] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'skills' | 'projects' | 'credentials'
  const [expandedSkill, setExpandedSkill] = useState(null);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [p, r, i, a] = await Promise.all([
          getUserProjects(user.uid),
          getUserResumes(user.uid),
          getUserInterviews(user.uid),
          getUserApplications(user.uid)
        ]);
        setProjects(p || []);
        setResumes(r || []);
        setInterviews(i || []);
        setApplications(a || []);
      } catch (err) {
        console.warn('Career data loading error:', err);
      }
    }
    loadData();
  }, [user]);

  const readiness = calculateCareerReadiness(userProfile, projects, resumes, interviews, applications);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    const current = userProfile?.skills || [];
    if (current.includes(newSkillInput.trim())) {
      showToast('Skill already in your matrix.');
      return;
    }
    const updated = [...current, newSkillInput.trim()];
    try {
      await updateProfileData({ skills: updated });
      setNewSkillInput('');
      showToast(`Added ${newSkillInput.trim()} to verified skill matrix! 🎯`);
    } catch (err) {
      showToast('Failed to add skill', 'error');
    }
  };

  const handleSharePassport = () => {
    const url = `${window.location.origin}/u/${userProfile?.username || ''}`;
    if (navigator.share) {
      navigator.share({
        title: `${userProfile?.displayName || ''} — EdWorld Career Passport`,
        text: `Check out my verified developer passport and projects on EdWorld Co.`,
        url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      showToast('Public Career Passport URL copied to clipboard! 📋');
    }
  };

  const handleDownloadPassport = () => {
    window.print();
  };

  const passportUrl = `${window.location.origin}/u/${userProfile?.username || ''}`;

  return (
    <div className="career-page" style={{ paddingBottom: '60px' }}>
      {/* 1. HERO HEADER */}
      <div className="glass-card" style={{ padding: '28px 24px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(18, 26, 44, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.18)', border: '1px solid rgba(99, 102, 241, 0.35)', padding: '4px 10px', borderRadius: 'var(--radius-full)', marginBottom: '8px' }}>
              <Compass size={14} color="var(--primary)" />
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#a5b4fc', textTransform: 'uppercase' }}>
                Career Identity OS
              </span>
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: '800', marginBottom: '4px' }}>
              {userProfile?.displayName ? `${userProfile.displayName}'s Career Passport` : 'Career Passport'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '580px', margin: 0 }}>
              Proof-backed verification, algorithmic readiness scoring, and skill intelligence matrix.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={handleSharePassport} className="btn btn-secondary btn-sm" style={{ padding: '8px 14px' }}>
              <Share2 size={14} /> Share
            </button>
            <button onClick={() => setShowQrModal(true)} className="btn btn-secondary btn-sm" style={{ padding: '8px 14px' }}>
              <QrCode size={14} /> QR Code
            </button>
            <button onClick={handleDownloadPassport} className="btn btn-primary btn-sm" style={{ padding: '8px 14px' }}>
              <Download size={14} /> PDF
            </button>
          </div>
        </div>
      </div>

      {/* 2. HORIZONTAL SCROLL SEGMENT TABS (MOBILE & TABLET) */}
      <div style={{ marginBottom: '20px' }}>
        <div className="segment-tabs-container">
          {[
            { id: 'overview', label: 'Passport Overview' },
            { id: 'skills', label: `Verified Skills (${userProfile?.skills?.length || 0})` },
            { id: 'projects', label: `Projects (${projects.length})` },
            { id: 'credentials', label: 'AI Readiness & Scoring' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`segment-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="responsive-grid-2">
          {/* Left Column: Passport Identity Card */}
          <div className="glass-card" style={{ padding: '24px', borderTop: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <UserAvatar 
                name={userProfile?.displayName} 
                photoURL={userProfile?.photoURL} 
                size={64} 
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {userProfile?.displayName}
                </h2>
                <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', fontWeight: '700' }}>
                  @{userProfile?.username}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
                  {userProfile?.headline}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Target Career Role:</span>
                <span style={{ fontWeight: '700', color: '#fff' }}>{userProfile?.careerGoal || 'Not specified'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Institution:</span>
                <span style={{ fontWeight: '600' }}>{userProfile?.college || 'Not specified'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Degree / Class:</span>
                <span style={{ fontWeight: '600' }}>{userProfile?.degree || ''} {userProfile?.gradYear ? `(${userProfile.gradYear})` : ''}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Identity Status:</span>
                <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>✓ EdWorld Verified</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Link 
                to={`/u/${userProfile?.username}`} 
                className="btn btn-primary btn-sm"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <ExternalLink size={14} /> Open Public Link
              </Link>
            </div>
          </div>

          {/* Right Column: Score Breakdown */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Algorithmic Readiness Score</h3>
              <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>{readiness.readinessLevel}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '20px' }}>
              <span style={{ fontSize: '2.8rem', fontWeight: '900', color: 'var(--emerald)' }}>{readiness.score}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '700' }}>/ 100 PTS</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Profile Completeness', val: readiness.breakdown.profile, max: 15 },
                { label: 'Technical Skills Matrix', val: readiness.breakdown.skills, max: 15 },
                { label: 'Proof of Work Projects', val: readiness.breakdown.projects, max: 20 },
                { label: 'ATS Resume Coverage', val: readiness.breakdown.resume, max: 15 },
                { label: 'AI Technical Interview Performance', val: readiness.breakdown.interview, max: 15 }
              ].map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                    <span style={{ fontWeight: '700' }}>{item.val} / {item.max}</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${(item.val / item.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: SKILLS */}
      {activeTab === 'skills' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>
              Verified Skill Intelligence Matrix ({userProfile?.skills?.length || 0})
            </h3>

            <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Add skill (e.g. Docker, GraphQL)..."
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                <Plus size={14} /> Add
              </button>
            </form>
          </div>

          {(!userProfile?.skills || userProfile.skills.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
              No skills added yet. Type a skill above to expand your intelligence matrix.
            </div>
          ) : (
            <div className="responsive-grid-3">
              {userProfile.skills.map((skill, idx) => {
                const isExp = expandedSkill === skill;
                return (
                  <div 
                    key={idx}
                    onClick={() => setExpandedSkill(isExp ? null : skill)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{skill}</span>
                      {isExp ? <ChevronUp size={16} color="var(--secondary)" /> : <ChevronDown size={16} color="var(--text-dim)" />}
                    </div>

                    {isExp && (
                      <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <div>Status: <span style={{ color: 'var(--emerald)', fontWeight: '700' }}>Active in Matrix</span></div>
                        <div style={{ marginTop: '4px' }}>Linked Projects: {projects.filter(p => p.techStack?.includes(skill)).length}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: PROJECTS */}
      {activeTab === 'projects' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>Proof of Work Projects ({projects.length})</h3>
            <Link to="/studio" className="btn btn-primary btn-sm">
              <Plus size={14} /> Open Project Studio
            </Link>
          </div>

          {projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <FolderGit2 size={40} color="var(--text-dim)" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                No projects added yet. Build your first project in Project Studio to link Git verification.
              </p>
              <Link to="/studio" className="btn btn-primary btn-sm">
                <Plus size={14} /> Build Project
              </Link>
            </div>
          ) : (
            <div className="responsive-grid-2">
              {projects.map(p => (
                <div key={p.id} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h4 style={{ fontWeight: '700', fontSize: '1rem', margin: 0 }}>{p.title}</h4>
                    <span className={`badge ${p.verificationStatus === 'verified' ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.65rem' }}>
                      {p.verificationStatus}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '12px' }}>
                    {p.tagline || p.description}
                  </p>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {p.techStack?.map((t, i) => (
                      <span key={i} className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: CREDENTIALS & ROADMAP */}
      {activeTab === 'credentials' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>Action Roadmap to Boost Score</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {readiness.recommendations.map((rec, i) => (
              <div key={i} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{rec.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{rec.description}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="badge badge-emerald">{rec.impact}</span>
                  <Link to={rec.actionUrl} className="btn btn-secondary btn-sm">
                    Execute
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. QR CODE MODAL */}
      {showQrModal && (
        <div className="nav-drawer-overlay" onClick={() => setShowQrModal(false)}>
          <div className="glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '360px', margin: 'auto', padding: '28px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Career Passport QR</h3>
              <button onClick={() => setShowQrModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            
            <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', display: 'inline-block', marginBottom: '16px' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(passportUrl)}`}
                alt="QR Code" 
                style={{ width: '180px', height: '180px', display: 'block' }}
              />
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Scan to verify developer credentials on mobile device.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
