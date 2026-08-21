import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  Share2, 
  Download, 
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
  Layers,
  Briefcase,
  Calendar,
  Clock,
  Edit3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { calculateCareerReadiness } from '../services/aiService';
import { getUserProjects, getUserResumes, getUserInterviews, getUserApplications } from '../services/firestoreService';
import UserAvatar from '../components/common/UserAvatar';
import { ScoreRing, EmptyState, SkillBadge } from '../components/common/UIComponents';

export default function CareerPage() {
  const { firebaseUser, profile, updateProfileData } = useAuth();
  const { showToast } = useNotification();
  const [projects, setProjects] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'skills' | 'projects' | 'experience' | 'credentials' | 'timeline'
  const [expandedSkill, setExpandedSkill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!firebaseUser) return;
      try {
        const [p, r, i, a] = await Promise.all([
          getUserProjects(firebaseUser.uid),
          getUserResumes(firebaseUser.uid),
          getUserInterviews(firebaseUser.uid),
          getUserApplications(firebaseUser.uid)
        ]);
        setProjects(p || []);
        setResumes(r || []);
        setInterviews(i || []);
        setApplications(a || []);
      } catch (err) {
        console.warn('Career data loading error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [firebaseUser]);

  const readiness = calculateCareerReadiness(profile || {}, projects, resumes, interviews, applications);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    const current = profile?.skills || [];
    if (current.includes(newSkillInput.trim())) {
      showToast('Skill already exists in your matrix.', 'info');
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
    const url = `${window.location.origin}/u/${profile?.username || ''}`;
    if (navigator.share) {
      navigator.share({
        title: `${profile?.displayName || ''} — EdWorld Career Passport`,
        text: `Check out my verified developer passport and proof-of-work on EdWorld Co.`,
        url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      showToast('Public Career Passport URL copied to clipboard! 📋');
    }
  };

  const displayName = profile?.displayName || firebaseUser?.displayName || 'Engineer';
  const headline = profile?.headline || 'Aspiring Software Engineer & Problem Solver';
  const careerGoal = profile?.careerGoal || 'Full Stack Software Engineer';
  const userSkills = profile?.skills || [];
  const experienceList = profile?.experience || [];
  const credentialsList = profile?.credentials || [
    { title: 'EdWorld Algorithmic Verification', issuer: 'EdWorld Co.', date: 'Verified Active', badge: 'Verified' }
  ];

  return (
    <div className="career-page" style={{ paddingBottom: '40px' }}>
      
      {/* 1. PREMIUM CAREER PASSPORT HEADER */}
      <div className="hero-banner" style={{ padding: '32px 28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          
          {/* Identity Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <UserAvatar 
              name={displayName} 
              photoURL={profile?.photoURL} 
              size={80} 
            />
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.18)', border: '1px solid rgba(99, 102, 241, 0.35)', padding: '2px 10px', borderRadius: 'var(--radius-full)', marginBottom: '6px' }}>
                <Compass size={13} color="var(--primary)" />
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Career Passport
                </span>
              </div>

              <h1 style={{ fontSize: '1.9rem', fontWeight: '800', marginBottom: '4px' }}>
                {displayName}
              </h1>

              <p style={{ color: 'var(--text-body)', fontSize: '0.92rem', maxWidth: '540px', margin: 0 }}>
                {headline}
              </p>

              <div style={{ display: 'flex', gap: '14px', marginTop: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                <div>
                  Career Goal: <strong style={{ color: '#fff' }}>{careerGoal}</strong>
                </div>
                {profile?.college && (
                  <div>
                    · {profile.college}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Actions & Career Readiness */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.92)',
              border: '1px solid var(--border-glow)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}>
              <ScoreRing score={readiness.score} size={58} strokeWidth={5} label="Readiness" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={handleSharePassport}
                className="btn btn-primary btn-sm"
                style={{ padding: '8px 14px' }}
              >
                <Share2 size={14} /> Share Passport
              </button>
              <Link 
                to="/profile"
                className="btn btn-secondary btn-sm"
                style={{ padding: '8px 14px' }}
              >
                <Edit3 size={14} /> Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CAREER TABS */}
      <div style={{ marginBottom: '24px' }}>
        <div className="nav-tabs">
          {[
            { key: 'overview', label: 'Overview', icon: Compass },
            { key: 'skills', label: `Skills (${userSkills.length})`, icon: Code },
            { key: 'projects', label: `Projects (${projects.length})`, icon: FolderGit2 },
            { key: 'experience', label: 'Experience', icon: Briefcase },
            { key: 'credentials', label: 'Credentials', icon: Award },
            { key: 'timeline', label: 'Timeline', icon: Clock }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`nav-tab ${activeTab === tab.key ? 'active' : ''}`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TAB CONTENT */}
      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Readiness Score Breakdown */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '6px' }}>
              Readiness Score Breakdown
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Algorithmic index evaluating your proof-of-work, skill breadth, resume alignment, and interview consistency.
            </p>

            <div className="grid-4" style={{ marginBottom: '20px' }}>
              <div className="glass-panel">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Projects Proof</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary)', marginTop: '4px' }}>
                  {readiness.breakdown.projects}<span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>/20</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>{projects.length} recorded</div>
              </div>

              <div className="glass-panel">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Skills Breadth</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--secondary)', marginTop: '4px' }}>
                  {readiness.breakdown.skills}<span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>/15</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>{userSkills.length} matrix skills</div>
              </div>

              <div className="glass-panel">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>ATS Resume Match</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--emerald)', marginTop: '4px' }}>
                  {readiness.breakdown.resume}<span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>/15</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>{resumes.length} ATS resumes</div>
              </div>

              <div className="glass-panel">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Interview Readiness</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--amber)', marginTop: '4px' }}>
                  {readiness.breakdown.interview}<span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>/15</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>{interviews.length} mock sessions</div>
              </div>
            </div>

            {/* Recommendations */}
            {readiness.recommendations?.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Score Improvement Roadmap
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {readiness.recommendations.map((rec, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.5)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#fff' }}>{rec.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rec.description}</div>
                      </div>
                      <Link to={rec.actionUrl} className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
                        {rec.impact}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Summary Grid */}
          <div className="grid-2">
            {/* Top Verified Skills */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '800' }}>Verified Skill Matrix</h4>
                <button onClick={() => setActiveTab('skills')} className="btn btn-ghost btn-sm">View All</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {userSkills.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No skills added yet.</p>
                ) : (
                  userSkills.slice(0, 8).map((s, i) => (
                    <span key={i} className="badge badge-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                      <CheckCircle size={12} color="var(--emerald)" /> {s}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Featured Projects */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '800' }}>Proof of Work</h4>
                <button onClick={() => setActiveTab('projects')} className="btn btn-ghost btn-sm">View All</button>
              </div>
              {projects.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No engineering projects recorded yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {projects.slice(0, 2).map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.5)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#fff' }}>{p.title}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{p.techStack?.slice(0, 3).join(', ')}</div>
                      </div>
                      <Link to="/studio" className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                        Studio
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SKILLS EXPERIENCE */}
      {activeTab === 'skills' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Add Skill Bar */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input 
                type="text"
                className="form-input"
                placeholder="Add new verified technical skill (e.g. React, TypeScript, Docker, GraphQL)..."
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                style={{ flex: 1, minWidth: '220px' }}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '10px 20px' }}>
                <Plus size={16} /> Add Skill
              </button>
            </form>
          </div>

          {/* Interactive Skill Matrix */}
          {userSkills.length === 0 ? (
            <EmptyState 
              icon={Code}
              title="Your Skill Matrix is Empty"
              description="Add technical languages, frameworks, and tools to construct your verified skill graph."
            />
          ) : (
            <div className="grid-3">
              {userSkills.map((skill, index) => {
                const isExpanded = expandedSkill === skill;
                const relatedProjects = projects.filter(p => p.techStack && p.techStack.some(t => t.toLowerCase().includes(skill.toLowerCase())));
                
                return (
                  <div 
                    key={index}
                    className="glass-card"
                    style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: '800', fontSize: '1.05rem', color: '#fff' }}>{skill}</span>
                          <CheckCircle size={14} color="var(--emerald)" />
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Advanced · {relatedProjects.length} Related {relatedProjects.length === 1 ? 'Project' : 'Projects'}
                        </div>
                      </div>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                        Verified
                      </span>
                    </div>

                    <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--text-body)' }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px' }}>Evidence Sources:</div>
                      <div>• Repository commits and Studio verification</div>
                      <div>• Mock interview evaluation alignment</div>
                    </div>

                    <button 
                      onClick={() => setExpandedSkill(isExpanded ? null : skill)}
                      className="btn btn-ghost btn-sm"
                      style={{ marginTop: 'auto', padding: '6px 0', justifyContent: 'space-between', color: 'var(--primary)', fontSize: '0.8rem' }}
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View Related Proof'}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {isExpanded && (
                      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', animation: 'fadeIn 0.2s ease-out' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Related Projects:</div>
                        {relatedProjects.length === 0 ? (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>No projects tagged with {skill} yet.</div>
                        ) : (
                          relatedProjects.map(rp => (
                            <div key={rp.id} style={{ fontSize: '0.8rem', color: '#fff', padding: '4px 0' }}>
                              • <Link to="/studio" style={{ color: 'var(--secondary)' }}>{rp.title}</Link>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PROJECTS */}
      {activeTab === 'projects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Proof of Work Projects</h3>
            <Link to="/studio" className="btn btn-primary btn-sm">
              <Plus size={14} /> Open Project Studio
            </Link>
          </div>

          {projects.length === 0 ? (
            <EmptyState 
              icon={FolderGit2}
              title="No projects added to Career Passport"
              description="Build real engineering projects in Project Studio to link them directly to your verified credentials."
              actionText="Create First Project"
              actionLink="/studio"
            />
          ) : (
            <div className="grid-2">
              {projects.map(proj => (
                <div key={proj.id} className="glass-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>{proj.title}</h4>
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>{proj.tagline || proj.description}</p>
                    </div>
                    {proj.verificationStatus === 'verified' && (
                      <span className="badge badge-success">✓ Verified</span>
                    )}
                  </div>

                  {proj.techStack && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {proj.techStack.map((tech, i) => (
                        <span key={i} className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>{tech}</span>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Stage: <strong style={{ color: 'var(--secondary)' }}>{proj.stage || 'Build'}</strong>
                    </span>
                    <Link to="/studio" className="btn btn-secondary btn-sm">
                      Studio Workspace
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: EXPERIENCE */}
      {activeTab === 'experience' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Work & Internship Experience</h3>
            <Link to="/profile" className="btn btn-secondary btn-sm">
              <Edit3 size={14} /> Update in Profile Hub
            </Link>
          </div>

          {experienceList.length === 0 ? (
            <EmptyState 
              icon={Briefcase}
              title="No work experience entries recorded"
              description="Add internships, freelance work, open-source contributions, or campus leadership roles in your Profile."
              actionText="Add Experience"
              actionLink="/profile"
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {experienceList.map((exp, idx) => (
                <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '1rem', color: '#fff' }}>{exp.role}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>{exp.company}</div>
                    </div>
                    <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>{exp.duration || 'Present'}</span>
                  </div>
                  {exp.description && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-body)', marginTop: '8px', lineHeight: '1.5' }}>
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CREDENTIALS */}
      {activeTab === 'credentials' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Verified Credentials & Badges</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Cryptographically verifiable skills and assessment certifications</p>
            </div>
          </div>

          <div className="grid-2">
            {credentialsList.map((cred, idx) => (
              <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glow)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Award size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#fff' }}>{cred.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cred.issuer} · {cred.date}</div>
                  <span className="badge badge-success" style={{ marginTop: '6px', fontSize: '0.68rem' }}>
                    ✓ Verified Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="glass-card" style={{ padding: '28px 24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '18px' }}>Career Progression Timeline</h3>
          
          <div style={{ position: 'relative', paddingLeft: '24px', borderLeft: '2px solid var(--border-glow)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-31px', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--emerald)', boxShadow: '0 0 10px var(--emerald)' }} />
              <div style={{ fontSize: '0.75rem', color: 'var(--emerald)', fontWeight: '800', textTransform: 'uppercase' }}>Current Milestone</div>
              <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#fff', marginTop: '2px' }}>Career Readiness: {readiness.score}/100</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>Active in {projects.length} engineering projects and verified skill matrix.</p>
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-31px', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)' }} />
              <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase' }}>Academic Timeline</div>
              <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#fff', marginTop: '2px' }}>{profile?.degree || 'Degree'} at {profile?.college || 'University'}</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>Class of {profile?.gradYear || '2026'}</p>
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-31px', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--secondary)' }} />
              <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Identity Inception</div>
              <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#fff', marginTop: '2px' }}>Registered EdWorld Co. Career Operating System</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>Initiated verified developer passport.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
