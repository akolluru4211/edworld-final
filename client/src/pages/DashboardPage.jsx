import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  FolderGit2, 
  FileText, 
  Briefcase, 
  Bot, 
  Users, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Plus, 
  ExternalLink,
  Kanban,
  Target,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { calculateCareerReadiness } from '../services/aiService';
import { 
  getUserProjects, 
  getUserApplications, 
  getUserResumes, 
  getUserInterviews, 
  getJobs,
  getConnectionRequests
} from '../services/firestoreService';

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      try {
        const [pList, aList, rList, iList, jList, cData] = await Promise.all([
          getUserProjects(user.uid),
          getUserApplications(user.uid),
          getUserResumes(user.uid),
          getUserInterviews(user.uid),
          getJobs(),
          getConnectionRequests(user.uid)
        ]);

        setProjects(pList);
        setApplications(aList);
        setResumes(rList);
        setInterviews(iList);
        setJobs(jList.slice(0, 3));
        setPendingRequests(cData.incoming || []);
      } catch (err) {
        console.warn('Dashboard data fetch warning:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [user]);

  const readiness = calculateCareerReadiness(userProfile, projects, resumes, interviews, applications);

  // Top action recommendations for mobile & desktop
  const nextActions = [
    {
      title: projects.length < 2 ? 'Add a Proof of Work Project' : 'Verify Project Evidence',
      desc: '+4 Career Readiness Score',
      link: '/studio',
      tag: 'Studio',
      icon: FolderGit2,
      color: 'var(--secondary)'
    },
    {
      title: 'Run AI Mock Technical Interview',
      desc: '+6 Career Readiness Score',
      link: '/interview',
      tag: 'AI Voice',
      icon: Bot,
      color: 'var(--primary)'
    },
    {
      title: 'Analyze Resume for Match',
      desc: 'ATS Keyword Optimization',
      link: '/resume',
      tag: 'Resume',
      icon: FileText,
      color: 'var(--emerald)'
    }
  ];

  return (
    <div className="dashboard-page">
      {/* 1. COMMAND CENTER HEADER */}
      <div className="glass-card" style={{ padding: '28px 24px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(18, 26, 44, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.18)', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '4px 10px', borderRadius: 'var(--radius-full)', marginBottom: '8px' }}>
              <Sparkles size={13} color="var(--emerald)" />
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#6ee7b7', textTransform: 'uppercase' }}>
                Status: {readiness.readinessLevel}
              </span>
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: '800', marginBottom: '4px' }}>
              Welcome{userProfile?.displayName ? `, ${userProfile.displayName.split(' ')[0]}` : ''} 👋
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '580px', margin: 0 }}>
              Targeting <strong style={{ color: '#fff' }}>{userProfile?.careerGoal || 'Full Stack Software Engineer'}</strong> at {userProfile?.college || 'Institution'}.
            </p>
          </div>

          {/* Quick Passport / Score Badge */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid var(--border-glow)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                Career Score
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--primary)', lineHeight: 1.1 }}>
                {readiness.score}<span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>/100</span>
              </div>
            </div>
            <div style={{ width: '1px', height: '36px', background: 'var(--border-subtle)' }} />
            <Link to="/career" className="btn btn-primary btn-sm" style={{ padding: '8px 12px' }}>
              <Compass size={14} /> Passport
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MOBILE-FIRST "WHAT SHOULD I DO NEXT?" PRIORITY FEED */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} color="var(--primary)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>Your Next Best Actions</h2>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Action-Driven</span>
        </div>

        <div className="responsive-grid-3">
          {nextActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link 
                key={idx}
                to={action.link} 
                className="glass-card" 
                style={{
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  textDecoration: 'none',
                  color: 'inherit',
                  borderLeft: `4px solid ${action.color}`
                }}
              >
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: action.color,
                  flexShrink: 0
                }}>
                  <Icon size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {action.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--emerald)', fontWeight: '600' }}>
                    {action.desc}
                  </div>
                </div>
                <ChevronRight size={16} color="var(--text-dim)" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3. PLATFORM LAUNCHPAD CARDS */}
      <div className="responsive-grid-3" style={{ marginBottom: '28px' }}>
        <Link to="/studio" className="glass-card" style={{ textDecoration: 'none', color: 'inherit', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
              <FolderGit2 size={20} />
            </div>
            <span className="badge badge-cyan">{projects.length} Active</span>
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '4px' }}>Project Studio</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
            Build projects with Kanban tasks, code runner, and Git verification.
          </p>
        </Link>

        <Link to="/resume" className="glass-card" style={{ textDecoration: 'none', color: 'inherit', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--emerald)' }}>
              <FileText size={20} />
            </div>
            <span className="badge badge-emerald">{resumes.length} Resumes</span>
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '4px' }}>ATS Resume Studio</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
            Run JD keyword match analysis and export recruiter-ready PDF resumes.
          </p>
        </Link>

        <Link to="/interview" className="glass-card" style={{ textDecoration: 'none', color: 'inherit', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Bot size={20} />
            </div>
            <span className="badge badge-primary">{interviews.length} Sessions</span>
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '4px' }}>AI Interview Simulator</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
            Practice technical & behavioral questions with real-time scorecards.
          </p>
        </Link>
      </div>

      {/* 4. MAIN DASHBOARD CONTENT (2 COLUMN GRID) */}
      <div className="responsive-grid-2">
        {/* Left Column: Active Projects & Applications Pipeline */}
        <div>
          {/* Active Projects Showcase */}
          <div className="glass-card" style={{ marginBottom: '24px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderGit2 size={18} color="var(--secondary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Proof of Work Projects</h3>
              </div>
              <Link to="/studio" className="btn btn-outline btn-sm">
                <Plus size={14} /> New
              </Link>
            </div>

            {projects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '0.88rem', marginBottom: '12px' }}>No projects added yet. Build your first project to prove your skills.</p>
                <Link to="/studio" className="btn btn-primary btn-sm">Launch Studio</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {projects.slice(0, 3).map(p => (
                  <div key={p.id} style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                        <h4 style={{ fontWeight: '700', fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</h4>
                        {p.verificationStatus === 'verified' && (
                          <span className="badge badge-emerald" style={{ fontSize: '0.62rem', flexShrink: 0 }}>✓ Verified</span>
                        )}
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.tagline || p.description}
                      </p>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {p.techStack?.slice(0, 3).map((t, idx) => (
                          <span key={idx} className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <Link to="/studio" className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
                      Open
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Applications Pipeline Quick View */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Kanban size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Applications Pipeline</h3>
              </div>
              <Link to="/applications" className="btn btn-outline btn-sm">
                View All ({applications.length})
              </Link>
            </div>

            {applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '0.88rem', marginBottom: '12px' }}>No tracked applications. Discover jobs and add them to your pipeline.</p>
                <Link to="/jobs" className="btn btn-primary btn-sm">Browse Opportunities</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {applications.slice(0, 4).map(app => (
                  <div key={app.id} style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.roleTitle}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{app.company}</div>
                    </div>
                    <span className="badge badge-cyan" style={{ fontSize: '0.7rem', flexShrink: 0 }}>
                      {app.stage || 'Applied'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recommended Opportunities & Network */}
        <div>
          {/* Curated Opportunities */}
          <div className="glass-card" style={{ marginBottom: '24px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={18} color="var(--emerald)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Recommended Jobs</h3>
              </div>
              <Link to="/jobs" className="btn btn-outline btn-sm">
                Explore All
              </Link>
            </div>

            {jobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '0.88rem' }}>No current open listings.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {jobs.map(j => (
                  <div key={j.id} style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                        <h4 style={{ fontWeight: '700', fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{j.title}</h4>
                        <span className="badge badge-emerald" style={{ fontSize: '0.62rem', flexShrink: 0 }}>
                          {j.matchScore || 92}% Match
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                        {j.company} • {j.location} • {j.stipend || j.salary}
                      </div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {j.requiredSkills?.slice(0, 3).map((s, idx) => (
                          <span key={idx} className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                    <Link to="/jobs" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Peer Requests & Network */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#c084fc" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Peer Network</h3>
              </div>
              <Link to="/networking" className="btn btn-outline btn-sm">
                Directory
              </Link>
            </div>

            {pendingRequests.length > 0 ? (
              <div style={{ marginBottom: '14px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#a5b4fc', marginBottom: '4px' }}>
                  {pendingRequests.length} Pending Connection Request{pendingRequests.length > 1 ? 's' : ''}
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Peers want to connect with your developer profile.
                </p>
                <Link to="/networking" className="btn btn-primary btn-sm" style={{ padding: '6px 12px' }}>
                  Review Requests
                </Link>
              </div>
            ) : null}

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Discover fellow student engineers, exchange verified project feedback, and build your engineering circle.
            </p>
            <div style={{ marginTop: '12px' }}>
              <Link to="/networking" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                <Users size={14} /> Open Network Directory
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
