const fs = require('fs');

const adminCode = `import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Bot,
  Mail,
  GraduationCap,
  Target
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  getPlatformStats, 
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
    totalInterviews: 0
  });

  const [userList, setUserList] = useState([]);
  const [jobsList, setJobsList] = useState([]);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearchTerm, setUserSearchTerm] = useState('');

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
      const [s, uSnap, j, a, projSnap] = await Promise.all([
        getPlatformStats(),
        getDocs(collection(db, 'users')),
        getJobs(),
        getAuditLogs(),
        getDocs(collection(db, 'projects'))
      ]);

      const allUsers = uSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      setStats({
        ...s,
        totalUsers: allUsers.length
      });
      setUserList(allUsers);
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
      showToast(\`Published opportunity: "\${jobTitle}" at \${jobCompany}\`);
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
      await updateProject(projId, { verificationStatus: nextStatus });
      await logAuditEvent(firebaseUser, 'VERIFY_PROJECT', 'project', projId, { newStatus: nextStatus });
      setPendingProjects(prev => prev.map(p => p.id === projId ? { ...p, verificationStatus: nextStatus } : p));
      showToast(\`Project marked as \${nextStatus}.\`);
    } catch (err) {
      showToast('Failed to update project status', 'error');
    }
  };

  const filteredUsers = userList.filter(u => {
    if (!userSearchTerm) return true;
    const term = userSearchTerm.toLowerCase();
    return (
      (u.displayName && u.displayName.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.username && u.username.toLowerCase().includes(term)) ||
      (u.college && u.college.toLowerCase().includes(term)) ||
      (u.careerGoal && u.careerGoal.toLowerCase().includes(term))
    );
  });

  return (
    <div className="admin-operations-page" style={{ paddingBottom: '60px' }}>
      
      {/* 1. HEADER */}
      <PageHeader 
        badge="Executive Console"
        title="Admin & Operations Command"
        description="Platform-wide telemetry, user directory, project verification, and opportunity dispatch."
      />

      {/* 2. NAVIGATION TABS */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div className="nav-tabs">
          {[
            { key: 'analytics', label: 'Telemetry & Analytics', icon: Activity },
            { key: 'users', label: `Registered Engineers (${userList.length})`, icon: Users },
            { key: 'jobs', label: `Opportunities (${jobsList.length})`, icon: Briefcase },
            { key: 'reviews', label: `Project Verification (${pendingProjects.length})`, icon: FolderGit2 },
            { key: 'audit', label: 'Security Audit Log', icon: ShieldCheck }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`nav-tab ${activeTab === t.key ? 'active' : ''}`}
              >
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: TELEMETRY & STATS */}
      {activeTab === 'analytics' && (
        <div>
          <div className="grid-4" style={{ marginBottom: '24px' }}>
            <StatCard title="Active Engineers" value={stats.totalUsers || userList.length} subtitle="Firestore Users" icon={Users} color="var(--primary)" />
            <StatCard title="Engineering Projects" value={stats.totalProjects || pendingProjects.length} subtitle="Proof Workspaces" icon={FolderGit2} color="var(--secondary)" />
            <StatCard title="Open Roles" value={stats.totalJobs || jobsList.length} subtitle="In Marketplace" icon={Briefcase} color="var(--emerald)" />
            <StatCard title="Interview Sessions" value={stats.totalInterviews || 0} subtitle="AI Evaluated" icon={Bot} color="var(--amber)" />
          </div>
        </div>
      )}

      {/* TAB 2: FULL USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>
                Registered Students & Engineers ({filteredUsers.length})
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Real data stored in Firestore from user onboarding and profile updates.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '0 12px', width: '280px' }}>
              <Search size={16} color="var(--text-muted)" style={{ marginRight: '8px' }} />
              <input 
                type="text"
                placeholder="Search by name, email, handle, college..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', padding: '8px 0', outline: 'none', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredUsers.map(u => (
              <div key={u.id || u.uid} className="glass-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <UserAvatar name={u.displayName} photoURL={u.photoURL} size={46} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '800', fontSize: '0.98rem', color: '#fff' }}>{u.displayName || 'Unnamed User'}</span>
                      {u.username && <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '700' }}>@{u.username}</span>}
                      {u.profileCompleted ? (
                        <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>Onboarded</span>
                      ) : (
                        <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>Pending Onboarding</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-body)', marginTop: '2px' }}>
                      {u.email} · {u.college || 'Institution not specified'} · <strong style={{ color: 'var(--secondary)' }}>{u.careerGoal || 'Engineer'}</strong>
                    </div>
                    {u.skills && u.skills.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                        {u.skills.slice(0, 5).map(sk => (
                          <span key={sk} className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>{sk}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {u.username && (
                  <Link to={`/u/${u.username}`} target="_blank" className="btn btn-secondary btn-sm">
                    <ExternalLink size={13} /> View Passport
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: JOBS MANAGEMENT */}
      {activeTab === 'jobs' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Active Marketplace Opportunities ({jobsList.length})</h3>
            <button onClick={() => setShowJobModal(true)} className="btn btn-primary btn-sm">
              <Plus size={14} /> Publish Role
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {jobsList.map(j => (
              <div key={j.id} style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '14px 18px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#fff' }}>{j.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '2px' }}>{j.company} · {j.location} · {j.type}</div>
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
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>Project Verification Queue ({pendingProjects.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingProjects.map(proj => (
              <div key={proj.id} style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '800', fontSize: '0.98rem', color: '#fff' }}>{proj.title}</span>
                    <span className={`badge ${proj.verificationStatus === 'verified' ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.7rem' }}>
                      {proj.verificationStatus === 'verified' ? '✓ Verified' : 'Unverified'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Stack: {proj.techStack?.join(', ')} · Repo: {proj.githubRepo || 'No repo'}
                  </div>
                </div>

                <button 
                  onClick={() => handleVerifyProject(proj.id, proj.verificationStatus)}
                  className={`btn btn-sm ${proj.verificationStatus === 'verified' ? 'btn-outline' : 'btn-primary'}`}
                >
                  {proj.verificationStatus === 'verified' ? 'Revoke Verification' : 'Verify Project Evidence'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SECURITY AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>Security Audit Trail</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {auditLogs.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recent audit events.</div>
            ) : (
              auditLogs.map(l => (
                <div key={l.id} style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span><strong style={{ color: 'var(--primary)' }}>{l.action}</strong>: {l.actorEmail || 'System'} modified {l.targetType}</span>
                  <span style={{ color: 'var(--text-dim)' }}>{l.createdAt?.toDate ? l.createdAt.toDate().toLocaleTimeString() : 'Recent'}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* OPPORTUNITY CREATION MODAL */}
      <Modal
        isOpen={showJobModal}
        onClose={() => setShowJobModal(false)}
        title="Publish Marketplace Opportunity"
      >
        <form onSubmit={handleCreateOpportunity}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Role Title *</label>
              <input type="text" className="form-input" required placeholder="e.g. Full Stack Engineer" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input type="text" className="form-input" required placeholder="e.g. Stripe / Razorpay" value={jobCompany} onChange={(e) => setJobCompany(e.target.value)} />
            </div>
          </div>

          <div className="grid-2" style={{ marginTop: '14px' }}>
            <div className="form-group">
              <label className="form-label">Opportunity Type</label>
              <select className="form-select" value={jobType} onChange={(e) => setJobType(e.target.value)}>
                <option value="Internship">Internship</option>
                <option value="Full-time">Full-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input type="text" className="form-input" placeholder="e.g. Remote / Bengaluru" value={jobLocation} onChange={(e) => setJobLocation(e.target.value)} />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '14px' }}>
            <label className="form-label">Skills Required (Comma separated)</label>
            <input type="text" className="form-input" placeholder="React, TypeScript, Node.js, PostgreSQL" value={jobSkills} onChange={(e) => setJobSkills(e.target.value)} />
          </div>

          <div className="form-group" style={{ marginTop: '14px' }}>
            <label className="form-label">Application URL</label>
            <input type="url" className="form-input" placeholder="https://company.com/careers/job" value={jobApplyUrl} onChange={(e) => setJobApplyUrl(e.target.value)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={() => setShowJobModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Publish Role</button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
`;

fs.writeFileSync('E:/edworldco/client/src/pages/AdminPage.jsx', adminCode, 'utf8');
console.log('AdminPage.jsx updated successfully!');
`;

fs.writeFileSync('C:/Users/adars/.gemini/antigravity/brain/59af2ed0-1102-48fa-a5f2-e3defb203860/scratch/build_enhanced_admin.js', adminCode, 'utf8');
