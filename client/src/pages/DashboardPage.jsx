const fs = require('fs');

const dashboardCode = `import React, { useState, useEffect } from 'react';
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
  Target,
  Zap,
  ShieldCheck,
  Cpu,
  BarChart3,
  Calendar,
  Kanban
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { calculateCareerReadiness, generateExecutiveAiBriefing } from '../services/aiService';
import { 
  getUserProjects, 
  getUserApplications, 
  getUserResumes, 
  getUserInterviews, 
  getJobs,
  getConnectionRequests,
  getConnectedUsers
} from '../services/firestoreService';
import { EmptyState, ScoreRing, StatCard, SkeletonCard } from '../components/common/UIComponents';
import UserAvatar from '../components/common/UserAvatar';

export default function DashboardPage() {
  const { firebaseUser, profile } = useAuth();
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!firebaseUser) return;
      try {
        const [pList, aList, rList, iList, jList, cData, connUsers] = await Promise.all([
          getUserProjects(firebaseUser.uid),
          getUserApplications(firebaseUser.uid),
          getUserResumes(firebaseUser.uid),
          getUserInterviews(firebaseUser.uid),
          getJobs(),
          getConnectionRequests(firebaseUser.uid),
          getConnectedUsers(firebaseUser.uid)
        ]);

        setProjects(pList || []);
        setApplications(aList || []);
        setResumes(rList || []);
        setInterviews(iList || []);
        setJobs(jList || []);
        setPendingRequests(cData.incoming || []);
        setConnections(connUsers || []);
      } catch (err) {
        console.warn('Dashboard data fetch warning:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [firebaseUser]);

  const readiness = calculateCareerReadiness(profile || {}, projects, resumes, interviews, applications, connections);
  const aiBriefing = generateExecutiveAiBriefing(profile || {}, projects, resumes, interviews, applications);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = profile?.displayName || firebaseUser?.displayName || (firebaseUser?.email ? firebaseUser.email.split('@')[0] : 'Engineer');
  const headline = profile?.headline || 'Aspiring Software Engineer & Problem Solver';
  const careerGoal = profile?.careerGoal || profile?.roleTrack || 'Full Stack Software Engineer';
  const college = profile?.college || '';
  const degree = profile?.degree || 'Degree';
  const username = profile?.username || '';
  const skills = profile?.skills || [];
  const verifiedProjects = projects.filter(p => p.verificationStatus === 'verified');

  return (
    <div className="dashboard-page" style={{ paddingBottom: '60px' }}>
      
      {/* 1. TOP EXECUTIVE COCKPIT HEADER */}
      <div className="hero-banner" style={{ padding: '32px 28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '22px', flexWrap: 'wrap' }}>
            <UserAvatar name={displayName} photoURL={profile?.photoURL} size={76} />

            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.16)', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '3px 10px', borderRadius: 'var(--radius-full)', marginBottom: '8px' }}>
                <Sparkles size={13} color="var(--emerald)" />
                <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {readiness.readinessLevel}
                </span>
              </div>

              <h1 style={{ fontSize: '2.1rem', fontWeight: '800', marginBottom: '4px' }}>
                {getGreeting()}, {displayName}
              </h1>

              <p style={{ color: 'var(--text-body)', fontSize: '0.94rem', maxWidth: '620px', margin: 0 }}>
                {headline}
              </p>

              <div style={{ display: 'flex', gap: '14px', marginTop: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {college && <span>🎓 {degree} · {college}</span>}
                {username && <span>· @{username}</span>}
              </div>
            </div>
          </div>

          {/* Score Ring Widget */}
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
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target Bench</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--primary)' }}>{aiBriefing.readinessBenchmark}%</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>Role Hiring Index: {aiBriefing.hiringIndex}/100</div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. EXECUTIVE 4-METRIC KPI TELEMETRY STRIP */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <BarChart3 size={22} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Readiness Score</div>
            <div style={{ fontSize: '1.45rem', fontWeight: '900', color: '#fff', marginTop: '2px' }}>{readiness.score}<span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>/100</span></div>
            <div style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>+4 pts this week</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(6, 182, 212, 0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
            <FolderGit2 size={22} color="var(--secondary)" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Proof-of-Work Projects</div>
            <div style={{ fontSize: '1.45rem', fontWeight: '900', color: '#fff', marginTop: '2px' }}>{projects.length} <span style={{ fontSize: '0.8rem', color: 'var(--emerald)' }}>({verifiedProjects.length} verified)</span></div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Studio Repositories</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <Kanban size={22} color="var(--amber)" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Applications Velocity</div>
            <div style={{ fontSize: '1.45rem', fontWeight: '900', color: '#fff', marginTop: '2px' }}>{applications.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Active Pipeline Roles</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(168, 85, 247, 0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
            <Users size={22} color="#c084fc" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Peer Squad Gravity</div>
            <div style={{ fontSize: '1.45rem', fontWeight: '900', color: '#fff', marginTop: '2px' }}>{connections.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{pendingRequests.length} incoming requests</div>
          </div>
        </div>

      </div>

      {/* 3. AI INTELLIGENCE & RAG EXECUTIVE BRIEFING PANEL */}
      <div className="glass-card" style={{ padding: '26px', marginBottom: '24px', border: '1px solid rgba(99, 102, 241, 0.35)', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.5) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#fff' }}>
                AI Intelligence & RAG Career Briefing
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Synthesized market telemetry for <strong>{careerGoal}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
              Market Velocity: {aiBriefing.marketVelocity}
            </span>
          </div>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: '1.6', marginBottom: '18px' }}>
          {aiBriefing.executiveSummary}
        </p>

        {/* 3 High-Impact Strategic Actions */}
        <div className="grid-3">
          {aiBriefing.strategicActions.map((action, idx) => (
            <Link
              key={idx}
              to={action.actionUrl}
              style={{
                textDecoration: 'none',
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                transition: 'var(--transition-fast)'
              }}
              className="action-card-hover"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge ${action.priority === 'CRITICAL' ? 'badge-danger' : action.priority === 'HIGH' ? 'badge-primary' : 'badge-neutral'}`} style={{ fontSize: '0.7rem' }}>
                  {action.priority} · {action.category}
                </span>
                <span style={{ fontSize: '0.76rem', fontWeight: '800', color: 'var(--emerald)' }}>
                  {action.impact}
                </span>
              </div>

              <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#fff', marginTop: '2px' }}>
                {action.title}
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                {action.rationale}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '700' }}>
                Execute in {action.timeEstimate} <ChevronRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 4. MAIN COCKPIT WORKSPACE GRID: PROJECTS, APPLICATIONS, JOBS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) minmax(320px, 400px)', gap: '24px', alignItems: 'start' }} className="dashboard-grid">
        
        {/* LEFT COLUMN: ACTIVE PROJECTS STUDIO & APPLICATIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Active Projects Widget */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderGit2 size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Proof-of-Work Projects ({projects.length})</h3>
              </div>
              <Link to="/studio" className="btn btn-secondary btn-sm">
                <Plus size={14} /> New Project
              </Link>
            </div>

            {loading ? (
              <SkeletonCard count={2} />
            ) : projects.length === 0 ? (
              <EmptyState 
                icon={FolderGit2}
                title="No engineering projects yet"
                description="Create your first proof project in Studio to document architecture, tasks, and repository evidence."
                actionText="Create in Project Studio"
                actionLink="/studio"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {projects.slice(0, 3).map(p => (
                  <div key={p.id} className="glass-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#fff' }}>{p.title}</div>
                        {p.verificationStatus === 'verified' && (
                          <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>✓ Verified</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Stage: <strong style={{ color: 'var(--secondary)' }}>{p.stage || 'Build'}</strong> · {p.techStack?.slice(0, 3).join(', ')}
                      </div>
                    </div>

                    <Link to="/studio" className="btn btn-secondary btn-sm">
                      Open Studio
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Applications Pipeline Snapshot */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={18} color="var(--amber)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Applications Pipeline ({applications.length})</h3>
              </div>
              <Link to="/applications" className="btn btn-secondary btn-sm">
                View Kanban
              </Link>
            </div>

            {applications.length === 0 ? (
              <EmptyState 
                icon={Briefcase}
                title="Pipeline is clear"
                description="Browse the Opportunity Marketplace to track target roles across Saved, Applied, and Interview stages."
                actionText="Browse Marketplace"
                actionLink="/jobs"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {applications.slice(0, 3).map(app => (
                  <div key={app.id} className="glass-card" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#fff' }}>{app.role}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{app.company} · <span style={{ color: 'var(--primary)' }}>{app.stage}</span></div>
                    </div>
                    <Link to="/interview" className="btn btn-secondary btn-sm" style={{ padding: '6px 12px' }}>
                      Prep Role
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: RADAR OPPORTUNITIES & QUICK TOOLS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Quick Action Suite */}
          <div className="glass-card" style={{ padding: '22px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '14px' }}>
              Engineering Action Suite
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/resume" className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: '10px', padding: '12px' }}>
                <FileText size={16} color="var(--secondary)" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: '800' }}>ATS Resume Studio</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Scan & optimize against target JDs</div>
                </div>
              </Link>

              <Link to="/interview" className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: '10px', padding: '12px' }}>
                <Bot size={16} color="var(--emerald)" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: '800' }}>Voice Interview Simulator</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>AI technical & system design mock session</div>
                </div>
              </Link>

              <Link to="/portfolio" className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: '10px', padding: '12px' }}>
                <Sparkles size={16} color="#c084fc" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: '800' }}>Developer Portfolio</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Publish custom case studies & repos</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Matching Opportunities Feed */}
          <div className="glass-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Opportunity Radar
              </div>
              <Link to="/jobs" style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>
                View All →
              </Link>
            </div>

            {jobs.length === 0 ? (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                No active job listings. Check back shortly.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {jobs.slice(0, 3).map(j => (
                  <div key={j.id} style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: '800', fontSize: '0.88rem', color: '#fff' }}>{j.title}</div>
                      <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>92% Match</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {j.company} · {j.location || 'Remote'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      <style>{\`
        @media (max-width: 900px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
      \`}</style>
    </div>
  );
}
`;

fs.writeFileSync('E:/edworldco/client/src/pages/DashboardPage.jsx', dashboardCode, 'utf8');
console.log('DashboardPage.jsx written successfully!');
`;

fs.writeFileSync('C:/Users/adars/.gemini/antigravity/brain/59af2ed0-1102-48fa-a5f2-e3defb203860/scratch/build_executive_dashboard.js', dashboardCode, 'utf8');
