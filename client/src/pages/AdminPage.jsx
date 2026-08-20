import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  FolderGit2, 
  Briefcase, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Activity,
  Award,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  getPlatformStats, 
  getPublicProfiles, 
  getJobs, 
  createJob, 
  deleteJob, 
  getAuditLogs, 
  logAuditEvent,
  updateProject,
  getDocs,
  collection
} from '../services/firestoreService';
import { db } from '../services/firebase';

export default function AdminPage() {
  const { user, userProfile } = useAuth();
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'users' | 'jobs' | 'reviews' | 'audit'

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalJobs: 0,
    totalApplications: 0,
    totalInterviews: 0,
    verifiedProjects: 0
  });

  const [userList, setUserList] = useState([]);
  const [jobsList, setJobsList] = useState([]);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Job Creator Modal
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [jobType, setJobType] = useState('Internship');
  const [jobLocation, setJobLocation] = useState('Remote');
  const [jobStipend, setJobStipend] = useState('');
  const [jobSkills, setJobSkills] = useState('React, Node.js');
  const [jobDesc, setJobDesc] = useState('');
  const [jobApplyUrl, setJobApplyUrl] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [s, u, j, a, projSnap] = await Promise.all([
        getPlatformStats(),
        getPublicProfiles(),
        getJobs(),
        getAuditLogs(),
        getDocs(collection(db, 'projects'))
      ]);

      setStats(s);
      setUserList(u);
      setJobsList(j);
      setAuditLogs(a);
      setPendingProjects(projSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.warn('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateOpportunity = async (e) => {
    e.preventDefault();
    if (!jobTitle || !jobCompany) return;

    try {
      const skillsRequired = jobSkills.split(',').map(s => s.trim()).filter(Boolean);
      const newJob = await createJob({
        title: jobTitle,
        company: jobCompany,
        type: jobType,
        location: jobLocation,
        remote: jobLocation.toLowerCase().includes('remote'),
        stipendSalary: jobStipend || 'Competitive',
        skillsRequired,
        description: jobDesc,
        applyUrl: jobApplyUrl || 'https://edworld.co'
      });

      await logAuditEvent(user, 'CREATE_OPPORTUNITY', 'job', newJob.id, { title: jobTitle, company: jobCompany });
      setJobsList(prev => [newJob, ...prev]);
      setShowJobModal(false);
      setJobTitle('');
      setJobCompany('');
      setJobDesc('');
      setJobApplyUrl('');
      showToast(`Published opportunity: "${jobTitle}" at ${jobCompany}`);
      loadAdminData();
    } catch (err) {
      showToast('Failed to create opportunity', 'error');
    }
  };

  const handleDeleteJob = async (id, title) => {
    if (!window.confirm(`Delete opportunity "${title}"?`)) return;
    try {
      await deleteJob(id);
      await logAuditEvent(user, 'DELETE_OPPORTUNITY', 'job', id, { title });
      setJobsList(prev => prev.filter(j => j.id !== id));
      showToast('Opportunity removed.');
    } catch (err) {
      showToast('Failed to delete opportunity', 'error');
    }
  };

  const handleVerifyProject = async (project, approve) => {
    try {
      const newStatus = approve ? 'verified' : 'unverified';
      await updateProject(project.id, {
        verificationStatus: newStatus,
        verificationScore: approve ? 95 : 50
      });
      await logAuditEvent(user, approve ? 'APPROVE_PROJECT_VERIFICATION' : 'REJECT_PROJECT_VERIFICATION', 'project', project.id, { title: project.title });
      setPendingProjects(prev => prev.map(p => p.id === project.id ? { ...p, verificationStatus: newStatus } : p));
      showToast(approve ? `Project "${project.title}" verified! ✓` : 'Project marked unverified.');
      loadAdminData();
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  return (
    <div className="admin-page">
      {/* 1. ADMIN HEADER */}
      <div className="hero-banner" style={{ padding: '36px 32px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(245, 158, 11, 0.18)', border: '1px solid rgba(245, 158, 11, 0.35)', padding: '4px 12px', borderRadius: 'var(--radius-full)', marginBottom: '10px' }}>
              <ShieldCheck size={14} color="var(--amber)" />
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#fcd34d', textTransform: 'uppercase' }}>
                Admin Command Console
              </span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '6px' }}>
              Platform Administration
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '640px' }}>
              Real-time analytics, user moderation, opportunity publisher, and project evidence verification.
            </p>
          </div>

          <div className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <Activity size={15} /> Metrics
            </button>
            <button 
              className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <Users size={15} /> Users ({userList.length})
            </button>
            <button 
              className={`nav-tab ${activeTab === 'jobs' ? 'active' : ''}`}
              onClick={() => setActiveTab('jobs')}
            >
              <Briefcase size={15} /> Jobs ({jobsList.length})
            </button>
            <button 
              className={`nav-tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <FolderGit2 size={15} /> Verification Queue
            </button>
            <button 
              className={`nav-tab ${activeTab === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveTab('audit')}
            >
              <FileText size={15} /> Audit Log
            </button>
          </div>
        </div>
      </div>

      {/* 2. ANALYTICS METRICS */}
      {activeTab === 'analytics' && (
        <div>
          <div className="grid-4" style={{ marginBottom: '28px' }}>
            <div className="glass-card">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Registered Users</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)', marginTop: '4px' }}>
                {stats.totalUsers}
              </div>
            </div>

            <div className="glass-card">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Active Projects</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--secondary)', marginTop: '4px' }}>
                {stats.totalProjects}
              </div>
            </div>

            <div className="glass-card">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Verified Proofs</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--emerald)', marginTop: '4px' }}>
                {stats.verifiedProjects}
              </div>
            </div>

            <div className="glass-card">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Live Opportunities</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--amber)', marginTop: '4px' }}>
                {stats.totalJobs}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            Registered Users Directory ({userList.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {userList.map(u => (
              <div key={u.uid} style={{
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '14px 18px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img src={u.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`} alt={u.displayName} className="avatar" style={{ width: '42px', height: '42px' }} />
                  <div>
                    <h4 style={{ fontWeight: '700', fontSize: '0.98rem' }}>{u.displayName} (@{u.username})</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{u.headline} · {u.college}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="badge badge-emerald">Score: {u.careerScore || 70}</span>
                  <span className="badge badge-secondary">{u.role || 'student'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. OPPORTUNITY MANAGEMENT */}
      {activeTab === 'jobs' && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Active Platform Opportunities ({jobsList.length})</h3>
            <button onClick={() => setShowJobModal(true)} className="btn btn-primary btn-sm">
              <Plus size={14} /> Add Opportunity
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {jobsList.map(j => (
              <div key={j.id} style={{
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '14px 18px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ fontWeight: '700', fontSize: '1rem' }}>{j.title}</h4>
                  <p style={{ color: 'var(--secondary)', fontSize: '0.82rem' }}>{j.company} · {j.type} · {j.location}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="badge badge-emerald">{j.stipendSalary}</span>
                  <button onClick={() => handleDeleteJob(j.id, j.title)} className="btn btn-secondary btn-sm" style={{ color: 'var(--rose)', padding: '6px' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. PROJECT VERIFICATION REVIEW QUEUE */}
      {activeTab === 'reviews' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            Project Evidence Verification Queue ({pendingProjects.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {pendingProjects.map(p => (
              <div key={p.id} style={{
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '18px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h4 style={{ fontWeight: '700', fontSize: '1.05rem' }}>{p.title}</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--secondary)' }}>Owner: {p.ownerName || 'Developer'}</p>
                  </div>
                  <span className={`badge ${p.verificationStatus === 'verified' ? 'badge-emerald' : 'badge-amber'}`}>
                    {p.verificationStatus}
                  </span>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '12px' }}>
                  {p.description || p.tagline}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    Stack: {p.techStack?.join(', ') || 'N/A'}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleVerifyProject(p, true)} className="btn btn-primary btn-sm">
                      <CheckCircle size={13} /> Approve Badge
                    </button>
                    <button onClick={() => handleVerifyProject(p, false)} className="btn btn-secondary btn-sm" style={{ color: 'var(--rose)' }}>
                      Revoke
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. IMMUTABLE AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            System Audit Trail ({auditLogs.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {auditLogs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No audit logs recorded yet.</p>
            ) : (
              auditLogs.map(log => (
                <div key={log.id} style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem'
                }}>
                  <div>
                    <span style={{ color: 'var(--secondary)', fontWeight: '700' }}>{log.actorEmail}:</span>{' '}
                    <strong style={{ color: '#fff' }}>{log.action}</strong> on {log.targetType} ({log.targetId?.slice(0, 8)})
                  </div>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                    {log.timestamp ? new Date(log.timestamp.toDate ? log.timestamp.toDate() : Date.now()).toLocaleTimeString() : 'Just now'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CREATE OPPORTUNITY MODAL */}
      {showJobModal && (
        <div className="modal-overlay" onClick={() => setShowJobModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '16px' }}>Publish Opportunity</h3>
            <form onSubmit={handleCreateOpportunity}>
              <div className="grid-2-even" style={{ gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">Job / Challenge Title *</label>
                  <input type="text" className="input-field" required value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Cloud Backend Intern" />
                </div>
                <div>
                  <label className="form-label">Company / Organization *</label>
                  <input type="text" className="input-field" required value={jobCompany} onChange={e => setJobCompany(e.target.value)} placeholder="e.g. Acme Cloud Corp" />
                </div>
              </div>

              <div className="grid-2-even" style={{ gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">Type</label>
                  <select className="select-field" value={jobType} onChange={e => setJobType(e.target.value)}>
                    <option value="Internship">Internship</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Fellowship">Fellowship</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Location</label>
                  <input type="text" className="input-field" value={jobLocation} onChange={e => setJobLocation(e.target.value)} placeholder="e.g. Remote or Bangalore" />
                </div>
              </div>

              <div className="grid-2-even" style={{ gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">Stipend / Salary / Prize</label>
                  <input type="text" className="input-field" value={jobStipend} onChange={e => setJobStipend(e.target.value)} placeholder="e.g. ₹50,000 / mo" />
                </div>
                <div>
                  <label className="form-label">Required Skills (comma separated)</label>
                  <input type="text" className="input-field" value={jobSkills} onChange={e => setJobSkills(e.target.value)} placeholder="React, Node.js" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description & Eligibility</label>
                <textarea className="textarea-field" rows={3} value={jobDesc} onChange={e => setJobDesc(e.target.value)} placeholder="Role requirements..." />
              </div>

              <div className="form-group">
                <label className="form-label">Application URL</label>
                <input type="url" className="input-field" value={jobApplyUrl} onChange={e => setJobApplyUrl(e.target.value)} placeholder="https://company.com/apply" />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowJobModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Opportunity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
