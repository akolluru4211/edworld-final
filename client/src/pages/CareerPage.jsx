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
        setProjects(p);
        setResumes(r);
        setInterviews(i);
        setApplications(a);
      } catch (err) {
        console.warn('Error loading career data:', err);
      }
    }
    loadData();
  }, [user]);

  const readiness = calculateCareerReadiness(userProfile, projects, resumes, interviews, applications);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    const skill = newSkillInput.trim();
    const currentSkills = userProfile?.skills || [];
    if (currentSkills.includes(skill)) {
      showToast('Skill already in your profile!', 'info');
      setNewSkillInput('');
      return;
    }
    const updated = [...currentSkills, skill];
    try {
      await updateProfileData({ skills: updated });
      showToast(`Added ${skill} to verified skill intelligence!`);
      setNewSkillInput('');
    } catch (err) {
      showToast('Failed to add skill', 'error');
    }
  };

  const handleSharePassport = () => {
    const url = `${window.location.origin}/u/${userProfile?.username || 'user'}`;
    if (navigator.share) {
      navigator.share({
        title: `${userProfile?.displayName || 'Developer'} — EdWorld Career Passport`,
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

  const passportUrl = `${window.location.origin}/u/${userProfile?.username || 'dev'}`;

  return (
    <div className="career-page">
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
              {userProfile?.displayName || 'Developer'}'s Career Passport
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
              <img 
                src={userProfile?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${userProfile?.username || 'dev'}`} 
                alt={userProfile?.displayName} 
                style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--primary)', flexShrink: 0 }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {userProfile?.displayName || 'Developer'}
                </h2>
                <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', fontWeight: '700' }}>
                  @{userProfile?.username || 'user'}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
                  {userProfile?.headline || 'Software Engineer'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Target Career</div>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff' }}>{userProfile?.careerGoal || 'Full Stack'}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Institution</div>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff' }}>{userProfile?.college || 'University'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to={`/u/${userProfile?.username}`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                <ExternalLink size={14} /> View Public Passport
              </Link>
              <Link to="/settings" className="btn btn-secondary btn-sm">
                Edit
              </Link>
            </div>
          </div>

          {/* Right Column: Readiness Breakdown */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} color="var(--emerald)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>Readiness Breakdown</h3>
              </div>
              <span className="badge badge-emerald">{readiness.score}/100</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {readiness.breakdown && Object.entries(readiness.breakdown).map(([k, v]) => (
                <div key={k}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                    <span style={{ textTransform: 'capitalize', color: 'var(--text-muted)' }}>{k.replace(/([A-Z])/g, ' $1')}</span>
                    <span style={{ fontWeight: '700', color: '#fff' }}>{v}/100</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: `${v}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary) 0%, var(--emerald) 100%)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: SKILLS */}
      {activeTab === 'skills' && (
        <div>
          {/* Add Skill Form */}
          <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
            <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Add skill (e.g. Next.js, Kubernetes, Redis)..."
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                style={{ flex: 1, minWidth: '220px' }}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0 20px' }}>
                <Plus size={16} /> Add Skill
              </button>
            </form>
          </div>

          {/* Mobile-Optimized Skill Cards */}
          <div className="responsive-grid-2">
            {(userProfile?.skills || ['JavaScript', 'React', 'Node.js', 'Python']).map((skill) => {
              const isExpanded = expandedSkill === skill;
              return (
                <div key={skill} className="glass-card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.98rem' }}>{skill}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--emerald)', fontWeight: '700', marginTop: '2px' }}>
                        ✓ VERIFIED SKILL INTELLIGENCE
                      </div>
                    </div>
                    <button 
                      onClick={() => setExpandedSkill(isExpanded ? null : skill)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Evidence
                    </button>
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span>Project Proofs:</span>
                        <strong style={{ color: '#fff' }}>{projects.filter(p => p.techStack?.includes(skill)).length} projects</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Interview Evaluations:</span>
                        <strong style={{ color: '#fff' }}>{interviews.length} sessions</strong>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: PROJECTS */}
      {activeTab === 'projects' && (
        <div className="responsive-grid-2">
          {projects.length === 0 ? (
            <div className="glass-card" style={{ padding: '32px', textAlign: 'center', gridColumn: '1 / -1' }}>
              <FolderGit2 size={36} color="var(--text-dim)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>No verified projects yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                Add your code projects to generate verifiable proof of work credentials.
              </p>
              <Link to="/studio" className="btn btn-primary btn-sm">Open Project Studio</Link>
            </div>
          ) : (
            projects.map(p => (
              <div key={p.id} className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h4 style={{ fontWeight: '800', fontSize: '1rem', margin: 0 }}>{p.title}</h4>
                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>✓ Verified</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '12px' }}>
                  {p.tagline || p.description}
                </p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {p.techStack?.map((t, idx) => (
                    <span key={idx} className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{t}</span>
                  ))}
                </div>
                <Link to="/studio" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  View in Studio
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB: CREDENTIALS & READINESS */}
      {activeTab === 'credentials' && (
        <div className="responsive-grid-2">
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <ShieldCheck size={20} color="var(--emerald)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Verified Identity Seal</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Your profile is cryptographically verified against your unique handle <strong>@{userProfile?.username}</strong>.
            </p>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Public Passport URL</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--secondary)', wordBreak: 'break-all', marginTop: '4px' }}>
                {passportUrl}
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Sparkles size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>AI Scoring Milestones</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: projects.length >= 2 ? 'var(--emerald)' : 'var(--text-muted)' }}>
                <CheckCircle size={16} /> 2+ Verified Projects ({projects.length}/2)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: resumes.length >= 1 ? 'var(--emerald)' : 'var(--text-muted)' }}>
                <CheckCircle size={16} /> ATS Tailored Resume ({resumes.length}/1)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: interviews.length >= 1 ? 'var(--emerald)' : 'var(--text-muted)' }}>
                <CheckCircle size={16} /> AI Voice Mock Interview ({interviews.length}/1)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Verification Modal */}
      {showQrModal && (
        <div className="nav-drawer-overlay" onClick={() => setShowQrModal(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="glass-card" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '380px', padding: '28px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>Career Passport QR</h3>
              <button onClick={() => setShowQrModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* QR Code SVG Visual */}
            <div style={{
              width: '180px',
              height: '180px',
              margin: '0 auto 20px',
              background: '#ffffff',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
            }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(passportUrl)}`} 
                alt="QR Code" 
                style={{ width: '100%', height: '100%' }}
              />
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Scan to view @{userProfile?.username}'s verified public profile and credentials.
            </p>

            <button onClick={handleSharePassport} className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
              Copy Passport Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
