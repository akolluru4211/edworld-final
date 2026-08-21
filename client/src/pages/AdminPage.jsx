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
  Lock,
  ExternalLink,
  Bot
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
  updateProject 
} from '../services/firestoreService';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import UserAvatar from '../components/common/UserAvatar';
import { PageHeader, Modal, StatCard, EmptyState } from '../components/common/UIComponents';

export default function AdminPage() {
  const { firebaseUser, profile, isAdmin } = useAuth();
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
  const [jobSkills, setJobSkills] = useState('React, TypeScript, Node.js');
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

      setStats(s || {});
      setUserList(u || []);
      setJobsList(j || []);
      setAuditLogs(a || []);
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

      await logAuditEvent(firebaseUser, 'CREATE_OPPORTUNITY', 'job', newJob.id, { title: jobTitle, company: jobCompany });
      setJobsList(prev => [newJob, ...prev]);
      setShowJobModal(false);
      setJobTitle('');
      setJobCompany('');
      setJobDesc('');
      setJobApplyUrl('');
      showToast(`Published opportunity: "${jobTitle}" at ${jobCompany}`);
      loadAdminData();
    } catch (err) {
      showToast('Failed to publish opportunity', 'error');
    }
  };

  const handleDeleteJob = async (jobId, title) => {
    try {
      await deleteJob(jobId);
      await logAuditEvent(firebaseUser, 'DELETE_OPPORTUNITY', 'job', jobId, { title });
      setJobsList(prev => prev.filter(j => j.id !== jobId));
      showToast('Opportunity removed from marketplace.');
    } catch (err) {
      showToast('Failed to delete job', 'error');
    }
  };

  const handleVerifyProject = async (projId, currentStatus) => {
    const nextStatus = currentStatus === 'verified' ? 'unverified' : 'verified';
    try {
      await updateProject(projId, {
        verificationStatus: nextStatus,
        verificationScore: nextStatus === 'verified' ? 95 : 0
      });
      await logAuditEvent(firebaseUser, 'VERIFY_PROJECT', 'project', projId, { newStatus: nextStatus });
      setPendingProjects(prev => prev.map(p => p.id === projId ? { ...p, verificationStatus: nextStatus, verificationScore: nextStatus === 'verified' ? 95 : 0 } : p));
      showToast(`Project marked as ${nextStatus}! 🛡️`);
    } catch (err) {
      showToast('Failed to update project status', 'error');
    }
  };

  return (
    <div className="admin-page" style={{ paddingBottom: '60px' }}>
      
      {/* 1. HEADER */}
      <PageHeader 
        badge="Enterprise Control"
        title="Admin Command Center"
        description="System telemetry, verified user directory, opportunity publisher, and evidence audit log."
        action={
          <button 
            onClick={() => setShowJobModal(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus size={14} /> Publish Opportunity
          </button>
        }
      />

      {/* 2. ADMIN TABS */}
      <div style={{ marginBottom: '24px' }}>
        <div className="nav-tabs">
          {[
            { key: 'analytics', label: 'Overview', icon: Activity },
            { key: 'users', label: `Users (${userList.length})`, icon: Users },
            { key: 'jobs', label: `Jobs (${jobsList.length})`, icon: Briefcase },
            { key: 'reviews', label: `Projects (${pendingProjects.length})`, icon: FolderGit2 },
            { key: 'audit', label: 'Audit Logs', icon: ShieldCheck }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`nav-tab ${activeTab === t.key ? 'active' : ''}`}
              >
                <Icon size={14} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TAB 1: ANALYTICS & TELEMETRY */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="grid-4">
            <StatCard title="Active Engineers" value={stats.totalUsers || userList.length} subtitle="Registered Students" icon={Users} color="var(--primary)" />
            <StatCard title="Engineering Projects" value={stats.totalProjects || pendingProjects.length} subtitle="Proof-of-work workspaces" icon={FolderGit2} color="var(--secondary)" />
            <StatCard title="Open Roles" value={stats.totalJobs || jobsList.length} subtitle="Published in Marketplace" icon={Briefcase} color="var(--emerald)" />
            <StatCard title="Interview Loops" value={stats.totalInterviews || 0} subtitle="AI evaluated sessions" icon={Bot} color="var(--amber)" />
          </div>
        </div>
      )}

      {/* TAB 2: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>Registered Students & Engineers</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {userList.map(u => (
              <div key={u.id || u.uid} style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '14px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <UserAvatar name={u.displayName} photoURL={u.photoURL} size={42} />
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#fff' }}>{u.displayName}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>@{u.username} · {u.college || 'Institution'}</div>
                  </div>
                </div>
                <Link to={`/u/${u.username || ''}`} className="btn btn-secondary btn-sm">
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: JOBS MANAGEMENT */}
      {activeTab === 'jobs' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Active Marketplace Opportunities</h3>
            <button onClick={() => setShowJobModal(true)} className="btn btn-primary btn-sm">
              <Plus size={14} /> Add Role
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {jobsList.map(j => (
              <div key={j.id} style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '14px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#fff' }}>{j.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>{j.company} · {j.location} · {j.type}</div>
                </div>
                <button onClick={() => handleDeleteJob(j.id, j.title)} className="btn btn-danger btn-sm">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PROJECTS VERIFICATION */}
      {activeTab === 'reviews' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>Project Verification Queue</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingProjects.map(p => (
              <div key={p.id} style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '800', fontSize: '0.95rem', color: '#fff' }}>{p.title}</span>
                    <span className={`badge ${p.verificationStatus === 'verified' ? 'badge-success' : 'badge-neutral'}`}>
                      {p.verificationStatus || 'unverified'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {p.techStack?.join(', ')} · Owner: {p.ownerName || p.ownerId}
                  </div>
                </div>
                <button 
                  onClick={() => handleVerifyProject(p.id, p.verificationStatus)}
                  className={`btn btn-sm ${p.verificationStatus === 'verified' ? 'btn-outline' : 'btn-primary'}`}
                >
                  {p.verificationStatus === 'verified' ? 'Revoke Verification' : 'Verify Project'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>Security Audit Trail</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {auditLogs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No audit events logged yet.</p>
            ) : (
              auditLogs.map(log => (
                <div key={log.id} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ color: 'var(--primary)' }}>{log.action}</strong> by {log.actorEmail || log.actorUid}
                  </div>
                  <span style={{ color: 'var(--text-dim)' }}>
                    {log.targetType}: {log.targetId}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* JOB CREATION MODAL */}
      <Modal 
        isOpen={showJobModal} 
        onClose={() => setShowJobModal(false)}
        title="Publish Opportunity to Marketplace"
      >
        <form onSubmit={handleCreateOpportunity}>
          <div className="form-group">
            <label className="form-label">Role Title *</label>
            <input 
              type="text"
              className="form-input"
              required
              placeholder="e.g. Software Engineer Intern"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Company Name *</label>
            <input 
              type="text"
              className="form-input"
              required
              placeholder="e.g. Stripe"
              value={jobCompany}
              onChange={(e) => setJobCompany(e.target.value)}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={jobType} onChange={(e) => setJobType(e.target.value)}>
                <option value="Internship">Internship</option>
                <option value="Full-time">Full-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input type="text" className="form-input" placeholder="e.g. Remote" value={jobLocation} onChange={(e) => setJobLocation(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Skills Required (comma separated)</label>
            <input type="text" className="form-input" value={jobSkills} onChange={(e) => setJobSkills(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Application URL</label>
            <input type="url" className="form-input" placeholder="https://company.com/apply" value={jobApplyUrl} onChange={(e) => setJobApplyUrl(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows={3} value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            Publish Role
          </button>
        </form>
      </Modal>

    </div>
  );
}
