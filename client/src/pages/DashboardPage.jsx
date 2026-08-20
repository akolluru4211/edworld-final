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
  Kanban
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

  return (
    <div className="dashboard-page">
      {/* 1. COMMAND CENTER HEADER */}
      <div className="hero-banner" style={{ padding: '36px 32px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.18)', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '4px 12px', borderRadius: 'var(--radius-full)', marginBottom: '10px' }}>
              <Sparkles size={14} color="var(--emerald)" />
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#6ee7b7', textTransform: 'uppercase' }}>
                Career Status: {readiness.readinessLevel}
              </span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '6px' }}>
              Welcome back, {userProfile?.displayName?.split(' ')[0] || 'Developer'} 👋
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px' }}>
              Targeting: <strong style={{ color: '#fff' }}>{userProfile?.careerGoal || 'Full Stack Software Engineer'}</strong> at {userProfile?.college || 'University'}.
            </p>
          </div>

          {/* Quick Passport Widget */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid var(--border-glow)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                Career Score
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)' }}>
                {readiness.score}<span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>/100</span>
              </div>
            </div>
            <div style={{ width: '1px', height: '40px', background: 'var(--border-subtle)' }} />
            <Link to="/career" className="btn btn-primary btn-sm">
              <Compass size={14} /> Passport
            </Link>
          </div>
        </div>
      </div>

      {/* 2. READINESS ROADMAP ALERT & COPILOT RECOMMENDATION */}
      {readiness.recommendations.length > 0 && (
        <div className="glass-card" style={{ marginBottom: '28px', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: 'var(--primary)', fontWeight: '700', fontSize: '0.92rem' }}>
                <TrendingUp size={18} />
                <span>Next Career Move (Score {readiness.score} → {readiness.score + 10})</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '4px' }}>
                {readiness.recommendations[0].title}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                {readiness.recommendations[0].description}
              </p>
            </div>
            <Link to={readiness.recommendations[0].actionUrl} className="btn btn-primary btn-sm">
              <span>Complete Action</span> <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* 3. PLATFORM LAUNCHPAD CARDS */}
      <div className="grid-3" style={{ marginBottom: '32px' }}>
        <Link to="/studio" className="glass-card glass-card-interactive" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
              <FolderGit2 size={20} />
            </div>
            <span className="badge badge-secondary">{projects.length} Active</span>
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px' }}>Project Studio</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Build projects with Kanban tasks, live code scratchpad, and Git verification.
          </p>
        </Link>

        <Link to="/resume" className="glass-card glass-card-interactive" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--emerald)' }}>
              <FileText size={20} />
            </div>
            <span className="badge badge-emerald">{resumes.length} Resumes</span>
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px' }}>ATS Resume Studio</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Run JD keyword match analysis and export recruiter-ready ATS resumes.
          </p>
        </Link>

        <Link to="/interview" className="glass-card glass-card-interactive" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(192, 132, 252, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
              <Bot size={20} />
            </div>
            <span className="badge badge-primary">{interviews.length} Sessions</span>
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px' }}>AI Interview Simulator</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Practice technical & behavioral questions with real-time scorecards.
          </p>
        </Link>
      </div>

      {/* 4. MAIN DASHBOARD CONTENT (2 COLUMN GRID) */}
      <div className="grid-2">
        {/* Left Column: Active Projects & Applications Pipeline */}
        <div>
          {/* Active Projects Showcase */}
          <div className="glass-card" style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderGit2 size={20} color="var(--secondary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Proof of Work Projects</h3>
              </div>
              <Link to="/studio" className="btn btn-outline btn-sm">
                <Plus size={14} /> New Project
              </Link>
            </div>

            {projects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}>No projects created yet. Add your first project to boost your score.</p>
                <Link to="/studio" className="btn btn-primary btn-sm">Launch Project Studio</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {projects.slice(0, 3).map(p => (
                  <div key={p.id} style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h4 style={{ fontWeight: '700', fontSize: '0.98rem' }}>{p.title}</h4>
                        {p.verificationStatus === 'verified' && (
                          <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>✓ Verified</span>
                        )}
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '8px' }}>{p.tagline || p.description?.slice(0, 60)}</p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {p.techStack?.slice(0, 3).map((t, idx) => (
                          <span key={idx} className="badge badge-primary" style={{ fontSize: '0.68rem' }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <Link to="/studio" className="btn btn-secondary btn-sm">
                      Open
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Applications Pipeline Quick View */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Kanban size={20} color="var(--amber)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Application Pipeline</h3>
              </div>
              <Link to="/applications" className="btn btn-outline btn-sm">
                View Full Pipeline
              </Link>
            </div>

            {applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}>Track jobs, interviews, and offers in one organized board.</p>
                <Link to="/jobs" className="btn btn-primary btn-sm">Find Opportunities to Apply</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {applications.slice(0, 4).map(app => (
                  <div key={app.id} style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>{app.role}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{app.company} · {app.location}</div>
                    </div>
                    <span className={`badge ${
                      app.stage === 'Offer' ? 'badge-emerald' : 
                      app.stage === 'Interview' ? 'badge-primary' : 
                      app.stage === 'Applied' ? 'badge-secondary' : 'badge-amber'
                    }`}>
                      {app.stage}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Matched Opportunities & Peer Requests */}
        <div>
          {/* Matched Opportunities */}
          <div className="glass-card" style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Matched For You</h3>
              </div>
              <Link to="/jobs" style={{ fontSize: '0.82rem', color: 'var(--secondary)', textDecoration: 'none' }}>
                Explore All
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {jobs.map(job => (
                <div key={job.id} style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <h4 style={{ fontWeight: '700', fontSize: '0.95rem' }}>{job.title}</h4>
                    <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>92% Match</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    {job.company} · {job.type} {job.remote ? '(Remote)' : ''}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--emerald)', fontWeight: '700' }}>
                      {job.stipendSalary || 'Competitive'}
                    </span>
                    <Link to={`/jobs`} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                      Apply <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Peer Community Connection */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="var(--secondary)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Peer Network</h3>
              </div>
              <Link to="/networking" style={{ fontSize: '0.82rem', color: 'var(--secondary)', textDecoration: 'none' }}>
                Discover Peers
              </Link>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px', lineHeight: '1.5' }}>
              Connect with fellow developers for hackathon teams, mock interviews, and peer code reviews.
            </p>
            <Link to="/networking" className="btn btn-outline btn-sm" style={{ width: '100%' }}>
              <Users size={14} /> Open Peer Directory
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
