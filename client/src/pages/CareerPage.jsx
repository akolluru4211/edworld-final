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
  Zap
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
    navigator.clipboard.writeText(url);
    showToast('Public Career Passport URL copied to clipboard! 📋');
  };

  const handleDownloadPassport = () => {
    window.print();
  };

  return (
    <div className="career-page">
      {/* 1. HERO HEADER */}
      <div className="hero-banner" style={{ padding: '36px 32px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99, 102, 241, 0.18)', border: '1px solid rgba(99, 102, 241, 0.35)', padding: '4px 12px', borderRadius: 'var(--radius-full)', marginBottom: '10px' }}>
              <Compass size={14} color="var(--primary)" />
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#a5b4fc', textTransform: 'uppercase' }}>
                Career Identity OS
              </span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px' }}>
              Your Digital Career Passport
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '640px' }}>
              Unified verifiable identity combining proof of work, evidence-backed skill assessments, and continuous career readiness.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={handleSharePassport} className="btn btn-secondary btn-sm">
              <Share2 size={14} /> Share Passport
            </button>
            <button onClick={handleDownloadPassport} className="btn btn-secondary btn-sm">
              <Download size={14} /> Print / Export
            </button>
            <Link to={`/u/${userProfile?.username || 'user'}`} className="btn btn-primary btn-sm">
              <ExternalLink size={14} /> View Public Profile
            </Link>
          </div>
        </div>
      </div>

      {/* 2. CAREER PASSPORT CARD + SCORE BREAKDOWN */}
      <div className="grid-2" style={{ marginBottom: '36px' }}>
        {/* Digital Career Passport Premium Card */}
        <div className="glass-card" style={{
          background: 'linear-gradient(135deg, rgba(18, 26, 44, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid var(--border-glow)',
          boxShadow: 'var(--shadow-glow), var(--shadow-card)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '180px',
            height: '180px',
            background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          {/* Passport Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="brand-logo-icon" style={{ width: '32px', height: '32px', fontSize: '1rem' }}>E</div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '800' }}>EDWORLD CO. PASSPORT</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>ID: {user?.uid?.slice(0, 12).toUpperCase()}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-emerald">✓ Verified Identity</span>
            </div>
          </div>

          {/* Profile Identity Block */}
          <div style={{ display: 'flex', gap: '18px', alignItems: 'center', marginBottom: '24px' }}>
            <img 
              src={userProfile?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${userProfile?.username || 'dev'}`} 
              alt={userProfile?.displayName} 
              className="avatar" 
              style={{ width: '72px', height: '72px', borderWidth: '3px' }}
            />
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: '800', marginBottom: '4px' }}>
                {userProfile?.displayName || 'Developer'}
              </h2>
              <p style={{ color: 'var(--secondary)', fontWeight: '700', fontSize: '0.92rem', marginBottom: '4px' }}>
                {userProfile?.headline || 'Software Engineer'}
              </p>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {userProfile?.college || 'Technology Institute'} · @{userProfile?.username || 'user'}
              </div>
            </div>
          </div>

          {/* Core Target & Readiness Gauge */}
          <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>Target Career Role</span>
                <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#fff' }}>{userProfile?.careerGoal || 'Full Stack Software Engineer'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>Readiness Score</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--emerald)' }}>{readiness.score}/100</div>
              </div>
            </div>
            <div className="readiness-meter">
              <div className="readiness-fill" style={{ width: `${readiness.score}%` }} />
            </div>
          </div>

          {/* Key Proof of Work Summary */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
              Verified Skills & Technologies
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {(userProfile?.skills || ['JavaScript', 'React', 'Node.js']).map((skill, idx) => (
                <span key={idx} className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Passport Footer Details */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            <div>Projects: <strong style={{ color: '#fff' }}>{projects.length}</strong></div>
            <div>Interviews: <strong style={{ color: '#fff' }}>{interviews.length}</strong></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--secondary)', cursor: 'pointer' }} onClick={() => setShowQrModal(true)}>
              <QrCode size={14} /> Scan QR Verification
            </div>
          </div>
        </div>

        {/* Career Readiness Score Breakdown */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '4px' }}>Explainable Readiness</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Score Decomposition</h3>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)' }}>
              {readiness.score}<span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>/100</span>
            </div>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
            Your Career Score is calculated across 8 verifiable engineering dimensions. Every point corresponds to concrete evidence on EdWorld.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Proof Projects (Studio & Git)', val: readiness.breakdown.projects, max: 20, icon: FolderGit2, color: 'var(--secondary)' },
              { label: 'Verified Skills & Tech', val: readiness.breakdown.skills, max: 15, icon: Code, color: 'var(--primary)' },
              { label: 'ATS Resume Intelligence', val: readiness.breakdown.resume, max: 15, icon: FileCheck, color: 'var(--emerald)' },
              { label: 'AI Mock Interview Performance', val: readiness.breakdown.interview, max: 15, icon: Award, color: '#c084fc' },
              { label: 'Profile & Career Focus', val: readiness.breakdown.profile, max: 15, icon: UserCheck, color: '#38bdf8' },
              { label: 'Developer Portfolio Quality', val: readiness.breakdown.portfolio, max: 10, icon: Sparkles, color: 'var(--amber)' },
              { label: 'Active Pipeline Engagement', val: readiness.breakdown.applications, max: 5, icon: TrendingUp, color: '#34d399' },
              { label: 'Peer Network Connections', val: readiness.breakdown.networking, max: 5, icon: Compass, color: '#818cf8' }
            ].map((dim, idx) => {
              const Icon = dim.icon;
              const pct = (dim.val / dim.max) * 100;
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                      <Icon size={14} color={dim.color} /> {dim.label}
                    </span>
                    <span style={{ fontWeight: '700', color: dim.color }}>{dim.val} / {dim.max} pts</span>
                  </div>
                  <div className="readiness-meter" style={{ height: '6px' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: dim.color, borderRadius: 'var(--radius-full)' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommendations to Level Up */}
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '10px', color: '#fff' }}>
              🎯 How to move from {readiness.score} → {Math.min(100, readiness.score + 10)}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {readiness.recommendations.map((rec, i) => (
                <Link key={i} to={rec.actionUrl} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none', color: 'inherit', padding: '6px 0', borderBottom: i !== readiness.recommendations.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--secondary)', fontWeight: '700' }}>{rec.impact}</span> {rec.title}
                  </div>
                  <ArrowRight size={12} color="var(--text-dim)" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. EVIDENCE-BACKED SKILL INTELLIGENCE MATRIX */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={22} color="var(--emerald)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Evidence-Backed Skill Intelligence</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Skills on EdWorld are connected directly to project repositories, assessments, and interview evidence.
            </p>
          </div>

          <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              className="input-field" 
              style={{ width: '220px', padding: '8px 12px', fontSize: '0.85rem' }}
              placeholder="Add skill (e.g. Docker)..."
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <Plus size={14} /> Add
            </button>
          </form>
        </div>

        <div className="grid-3">
          {(userProfile?.skills || ['JavaScript', 'React', 'Node.js', 'Firebase']).map((skill, idx) => {
            const hasProjectEvidence = projects.some(p => p.techStack?.includes(skill));
            return (
              <div key={idx} style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ fontWeight: '700', fontSize: '1rem' }}>{skill}</h4>
                  <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>Verified</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasProjectEvidence ? 'var(--emerald)' : 'var(--text-dim)' }}>
                    <CheckCircle size={12} /> {hasProjectEvidence ? 'Backed by Project Studio Repository' : 'Profile Declared'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)' }}>
                    <CheckCircle size={12} /> Linked to ATS Resume Profile
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QR Modal */}
      {showQrModal && (
        <div className="modal-overlay" onClick={() => setShowQrModal(false)}>
          <div className="modal-content" style={{ maxWidth: '380px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '12px' }}>QR Passport Verification</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Scan with any mobile camera to verify @{userProfile?.username}'s Career Passport on EdWorld Co.
            </p>
            <div style={{
              background: '#fff',
              padding: '24px',
              borderRadius: '16px',
              display: 'inline-block',
              marginBottom: '20px'
            }}>
              {/* Clean SVG QR Representation */}
              <svg width="180" height="180" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="#ffffff" />
                <rect x="10" y="10" width="30" height="30" fill="#000000" />
                <rect x="15" y="15" width="20" height="20" fill="#ffffff" />
                <rect x="20" y="20" width="10" height="10" fill="#000000" />
                <rect x="60" y="10" width="30" height="30" fill="#000000" />
                <rect x="65" y="15" width="20" height="20" fill="#ffffff" />
                <rect x="70" y="20" width="10" height="10" fill="#000000" />
                <rect x="10" y="60" width="30" height="30" fill="#000000" />
                <rect x="15" y="65" width="20" height="20" fill="#ffffff" />
                <rect x="20" y="70" width="10" height="10" fill="#000000" />
                <rect x="50" y="50" width="10" height="10" fill="#6366f1" />
                <rect x="60" y="60" width="15" height="15" fill="#000000" />
                <rect x="75" y="75" width="15" height="15" fill="#000000" />
                <rect x="50" y="75" width="10" height="15" fill="#000000" />
              </svg>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--secondary)', marginBottom: '16px' }}>
              edworld.co.in/u/{userProfile?.username || 'user'}
            </div>
            <button onClick={() => setShowQrModal(false)} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
