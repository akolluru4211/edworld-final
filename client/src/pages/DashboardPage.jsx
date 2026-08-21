import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  FolderGit2, 
  FileText, 
  Briefcase, 
  Bot, 
  Users, 
  Sparkles, 
  Clock, 
  Plus, 
  ArrowRight, 
  ChevronRight, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  AlertCircle,
  ExternalLink,
  Target
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
import { EmptyState, ScoreRing, StatCard, SkeletonCard } from '../components/common/UIComponents';

export default function DashboardPage() {
  const { firebaseUser, profile } = useAuth();
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!firebaseUser) return;
      try {
        const [pList, aList, rList, iList, jList, cData] = await Promise.all([
          getUserProjects(firebaseUser.uid),
          getUserApplications(firebaseUser.uid),
          getUserResumes(firebaseUser.uid),
          getUserInterviews(firebaseUser.uid),
          getJobs(),
          getConnectionRequests(firebaseUser.uid)
        ]);

        setProjects(pList || []);
        setApplications(aList || []);
        setResumes(rList || []);
        setInterviews(iList || []);
        setJobs(jList || []);
        setPendingRequests(cData.incoming || []);
      } catch (err) {
        console.warn('Dashboard data fetch warning:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [firebaseUser]);

  const readiness = calculateCareerReadiness(profile || {}, projects, resumes, interviews, applications);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = profile?.displayName || firebaseUser?.displayName || (firebaseUser?.email ? firebaseUser.email.split('@')[0] : 'Engineer');
  const headline = profile?.headline || 'Aspiring Software Engineer & Problem Solver';
  const careerGoal = profile?.careerGoal || 'Software Engineering';

  // Compute prioritized "Your Next Best Actions"
  const getNextBestActions = () => {
    const actions = [];

    // Action 1: Resume optimization
    if (resumes.length === 0) {
      actions.push({
        title: `Build your ATS Resume for ${careerGoal}`,
        desc: 'Generate your proof-backed resume with keyword alignment',
        tag: 'Resume',
        impact: '+8 career progress',
        link: '/resume',
        icon: FileText,
        color: 'var(--secondary)'
      });
    } else {
      actions.push({
        title: `Optimize your resume for ${careerGoal}`,
        desc: '91% opportunity keyword match potential',
        tag: 'Resume Match',
        impact: '+5 career progress',
        link: '/resume',
        icon: FileText,
        color: 'var(--secondary)'
      });
    }

    // Action 2: Project Portfolio
    if (projects.length === 0) {
      actions.push({
        title: 'Create your first Project in Studio',
        desc: 'Document architecture, tasks, and repository proof of work',
        tag: 'Projects',
        impact: '+12 career progress',
        link: '/studio',
        icon: FolderGit2,
        color: 'var(--primary)'
      });
    } else if (projects.length < 2) {
      actions.push({
        title: 'Complete Project Portfolio with 2nd Project',
        desc: 'Top recruiters require at least 2 verified engineering projects',
        tag: 'Portfolio',
        impact: '+6 career progress',
        link: '/studio',
        icon: FolderGit2,
        color: 'var(--primary)'
      });
    }

    // Action 3: AI Interview
    if (interviews.length === 0) {
      actions.push({
        title: `Practice technical interview for ${careerGoal}`,
        desc: 'AI voice simulator assesses technical clarity & problem solving',
        tag: 'Recommended',
        impact: '+8 career progress',
        link: '/interview',
        icon: Bot,
        color: 'var(--emerald)'
      });
    } else {
      actions.push({
        title: 'Practice next level AI Mock Interview',
        desc: 'Improve communication & system design scores',
        tag: 'Practice',
        impact: '+4 career progress',
        link: '/interview',
        icon: Bot,
        color: 'var(--emerald)'
      });
    }

    // Action 4: Opportunities
    if (applications.length === 0 && jobs.length > 0) {
      actions.push({
        title: 'Track your first target opportunity in Pipeline',
        desc: `${jobs.length} verified tech roles currently open`,
        tag: 'Marketplace',
        impact: '+5 career progress',
        link: '/jobs',
        icon: Briefcase,
        color: 'var(--amber)'
      });
    }

    return actions.slice(0, 3);
  };

  const nextActions = getNextBestActions();

  // Filter top matching jobs for user
  const matchingJobs = jobs.slice(0, 3);

  return (
    <div className="dashboard-page">
      {/* 1. TOP HEADER: GREETING + HEADLINE + CAREER READINESS */}
      <div className="hero-banner" style={{ padding: '32px 28px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.16)', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '3px 10px', borderRadius: 'var(--radius-full)', marginBottom: '10px' }}>
              <Sparkles size={13} color="var(--emerald)" />
              <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {readiness.readinessLevel}
              </span>
            </div>

            <h1 style={{ fontSize: '2.1rem', fontWeight: '800', marginBottom: '6px' }}>
              {getGreeting()}, {displayName}
            </h1>

            <p style={{ color: 'var(--text-body)', fontSize: '0.95rem', maxWidth: '640px', margin: 0 }}>
              {headline}
            </p>

            {profile?.college && (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {profile.degree || 'Degree'} · {profile.college}
              </div>
            )}
          </div>

          {/* Career Readiness Score Badge */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.92)',
            border: '1px solid var(--border-glow)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <ScoreRing score={readiness.score} size={68} strokeWidth={6} label="Career Readiness" />
            <div style={{ width: '1px', height: '44px', background: 'var(--border-subtle)' }} />
            <Link to="/career" className="btn btn-primary btn-sm" style={{ padding: '8px 14px' }}>
              <Compass size={14} /> View Passport
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOCUS: YOUR NEXT BEST ACTIONS */}
      <section style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800' }}>
              Your Next Best Actions
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: 0 }}>
              Targeted high-leverage steps to accelerate your career readiness
            </p>
          </div>
          <span className="badge badge-primary hide-on-mobile">
            {nextActions.length} Recommended
          </span>
        </div>

        <div className="grid-3">
          {nextActions.map((act, idx) => {
            const Icon = act.icon;
            return (
              <Link 
                key={idx} 
                to={act.link}
                className="glass-card glass-card-interactive"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  textDecoration: 'none',
                  borderLeft: `4px solid ${act.color}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                    {act.tag}
                  </span>
                  <span style={{ fontSize: '0.74rem', fontWeight: '800', color: 'var(--emerald)' }}>
                    {act.impact}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#fff', marginBottom: '4px', lineHeight: 1.3 }}>
                    {act.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                    {act.desc}
                  </p>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px', color: act.color, fontSize: '0.82rem', fontWeight: '800' }}>
                  <span>Take Action</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. CORE OPERATIONAL TILES (2-COLUMN RESPONSIVE) */}
      <div className="grid-2" style={{ marginBottom: '32px' }}>
        
        {/* Left Column: Recommended Opportunities */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>
                Recommended Opportunities
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Matched against your verified skill matrix
              </p>
            </div>
            <Link to="/jobs" className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>
              Explore All <ChevronRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="skeleton" style={{ height: '180px' }} />
          ) : matchingJobs.length === 0 ? (
            <EmptyState 
              icon={Briefcase}
              title="No open opportunities listed"
              description="New technical internships and graduate roles are published weekly."
              actionText="View Job Marketplace"
              actionLink="/jobs"
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {matchingJobs.map(job => (
                <div 
                  key={job.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#fff' }}>
                      {job.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {job.company} · {job.location || 'Remote'} · <span style={{ color: 'var(--secondary)' }}>{job.type}</span>
                    </div>
                    {job.skillsRequired && (
                      <div style={{ display: 'flex', gap: '5px', marginTop: '6px', flexWrap: 'wrap' }}>
                        {job.skillsRequired.slice(0, 3).map((s, i) => (
                          <span key={i} className="badge badge-neutral" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Link to="/jobs" className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Application Pipeline Status */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>
                Application Pipeline
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                {applications.length} active opportunities tracked
              </p>
            </div>
            <Link to="/applications" className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>
              Command Center <ChevronRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="skeleton" style={{ height: '180px' }} />
          ) : applications.length === 0 ? (
            <EmptyState 
              icon={Briefcase}
              title="No active applications"
              description="Track job applications, interviews, and offers in your Kanban pipeline."
              actionText="Add Application"
              actionLink="/applications"
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {applications.slice(0, 3).map(app => (
                <div 
                  key={app.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#fff' }}>
                      {app.role || app.roleTitle}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {app.company || app.companyName} · {app.location || 'Remote'}
                    </div>
                  </div>
                  <span className="badge badge-primary" style={{ fontSize: '0.72rem', textTransform: 'capitalize' }}>
                    {app.stage || 'Applied'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. ACTIVE PROJECTS & NETWORK ACTIVITY (2-COLUMN RESPONSIVE) */}
      <div className="grid-2">
        
        {/* Active Projects in Studio */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>
                Active Engineering Projects
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Proof of work engineering workspace
              </p>
            </div>
            <Link to="/studio" className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>
              Open Studio <ChevronRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="skeleton" style={{ height: '160px' }} />
          ) : projects.length === 0 ? (
            <EmptyState 
              icon={FolderGit2}
              title="No projects yet"
              description="Build and verify your first engineering project in Project Studio."
              actionText="Create Project"
              actionLink="/studio"
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {projects.slice(0, 3).map(p => (
                <div 
                  key={p.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '800', fontSize: '0.92rem', color: '#fff' }}>{p.title}</span>
                      {p.verificationStatus === 'verified' && (
                        <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>✓ Verified</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {p.techStack?.slice(0, 3).join(', ') || 'Full Stack'} · Stage: <strong style={{ color: 'var(--secondary)' }}>{p.stage || 'Build'}</strong>
                    </div>
                  </div>
                  <Link to="/studio" className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
                    Studio
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Network & Community Activity */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>
                Peer Network Activity
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                {pendingRequests.length} pending connection {pendingRequests.length === 1 ? 'request' : 'requests'}
              </p>
            </div>
            <Link to="/networking" className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>
              Directory <ChevronRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="skeleton" style={{ height: '160px' }} />
          ) : pendingRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Users size={22} />
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#fff', marginBottom: '4px' }}>
                Connect with Fellow Engineers
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '340px', margin: '0 auto 16px' }}>
                Discover verified students across universities to build squads and collaborate.
              </p>
              <Link to="/networking" className="btn btn-primary btn-sm">
                Find Tech Peers
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingRequests.slice(0, 3).map(req => (
                <div 
                  key={req.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#fff' }}>
                      {req.fromUserName}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {req.fromUserHeadline || 'Software Engineer'}
                    </div>
                  </div>
                  <Link to="/networking" className="btn btn-primary btn-sm" style={{ padding: '6px 10px', fontSize: '0.78rem' }}>
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
