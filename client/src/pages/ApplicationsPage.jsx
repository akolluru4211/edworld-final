import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Kanban, 
  Plus, 
  Trash2, 
  ExternalLink, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Briefcase, 
  Bot, 
  FileText, 
  Calendar, 
  AlertCircle, 
  X, 
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  getUserApplications, 
  createApplication, 
  updateApplicationStage, 
  deleteApplication 
} from '../services/firestoreService';
import { EmptyState, Modal, PageHeader } from '../components/common/UIComponents';

const PIPELINE_STAGES = [
  'Saved',
  'Preparing',
  'Applied',
  'Interview',
  'Offer'
];

export default function ApplicationsPage() {
  const { firebaseUser, profile } = useAuth();
  const { showToast } = useNotification();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMobileStage, setActiveMobileStage] = useState('All');

  // New Application Modal
  const [showModal, setShowModal] = useState(false);
  const [company, setCompany] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [location, setLocation] = useState('Remote');
  const [stipendSalary, setStipendSalary] = useState('');
  const [deadline, setDeadline] = useState('');
  const [stage, setStage] = useState('Saved');
  const [notes, setNotes] = useState('');

  const loadApplications = async () => {
    if (!firebaseUser) return;
    try {
      const list = await getUserApplications(firebaseUser.uid);
      setApplications(list || []);
    } catch (err) {
      console.warn('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [firebaseUser]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!company.trim() || !roleTitle.trim() || !firebaseUser) return;

    try {
      const newApp = await createApplication({
        userId: firebaseUser.uid,
        company,
        role: roleTitle,
        location,
        stipendSalary,
        deadline: deadline || 'In 14 days',
        stage,
        notes,
        resumeAttached: `${profile?.careerGoal || 'Software Engineer'} ATS Resume`,
        matchScore: 88
      });

      setApplications(prev => [newApp, ...prev]);
      setShowModal(false);
      setCompany('');
      setRoleTitle('');
      setDeadline('');
      setNotes('');
      showToast(`Added ${roleTitle} at ${company} to ${stage} stage.`);
    } catch (err) {
      showToast('Failed to add application', 'error');
    }
  };

  const handleStageChange = async (appId, newStage) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, stage: newStage } : a));
    try {
      await updateApplicationStage(appId, newStage);
      showToast(`Application moved to ${newStage} stage.`);
    } catch (err) {
      showToast('Failed to update stage', 'error');
    }
  };

  const handleDelete = async (appId) => {
    setApplications(prev => prev.filter(a => a.id !== appId));
    try {
      await deleteApplication(appId);
      showToast('Application removed from tracker.');
    } catch (err) {
      showToast('Failed to delete application', 'error');
    }
  };

  return (
    <div className="applications-page" style={{ paddingBottom: '50px' }}>
      
      {/* 1. HEADER */}
      <PageHeader 
        badge="Application Command Center"
        title="Application Pipeline"
        description="Track your active engineering opportunities through each lifecycle stage from Saved to Offer."
        action={
          <button 
            onClick={() => setShowModal(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus size={15} /> Add Application
          </button>
        }
      />

      {/* 2. MOBILE STAGE SELECTOR ( < 1024px ) */}
      <div className="show-on-mobile" style={{ marginBottom: '20px' }}>
        <div className="nav-tabs">
          {['All', ...PIPELINE_STAGES].map(st => (
            <button
              key={st}
              onClick={() => setActiveMobileStage(st)}
              className={`nav-tab ${activeMobileStage === st ? 'active' : ''}`}
            >
              {st} ({st === 'All' ? applications.length : applications.filter(a => (a.stage || 'Saved') === st).length})
            </button>
          ))}
        </div>
      </div>

      {/* 3. PIPELINE STAGE COLUMNS (DESKTOP KANBAN / MOBILE FILTERED) */}
      {loading ? (
        <div className="grid-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card" style={{ height: '280px' }}>
              <div className="skeleton" style={{ height: '24px', width: '50%', marginBottom: '14px' }} />
              <div className="skeleton" style={{ height: '80px', width: '100%' }} />
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState 
          icon={Kanban}
          title="No applications in your pipeline"
          description="Log and track companies you are preparing, applying, or interviewing for."
          actionText="Add Application"
          onAction={() => setShowModal(true)}
          secondaryActionText="Browse Opportunities"
          secondaryActionLink="/jobs"
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '16px',
          alignItems: 'start'
        }} className="pipeline-columns-container">
          {PIPELINE_STAGES.map(stageName => {
            const stageApps = applications.filter(a => (a.stage || 'Saved') === stageName);
            const isVisibleOnMobile = activeMobileStage === 'All' || activeMobileStage === stageName;

            return (
              <div 
                key={stageName}
                className="pipeline-column"
                style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  display: isVisibleOnMobile ? 'flex' : 'none',
                  flexDirection: 'column',
                  gap: '12px',
                  minHeight: '400px'
                }}
              >
                {/* Column Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    {stageName}
                  </span>
                  <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                    {stageApps.length}
                  </span>
                </div>

                {/* Cards List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  {stageApps.length === 0 ? (
                    <div style={{ padding: '24px 10px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
                      No {stageName.toLowerCase()} roles
                    </div>
                  ) : (
                    stageApps.map(app => (
                      <div 
                        key={app.id}
                        className="glass-card"
                        style={{
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          background: 'rgba(18, 26, 44, 0.95)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#fff' }}>
                              {app.role || app.roleTitle}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--secondary)', fontWeight: '700' }}>
                              {app.company}
                            </div>
                          </div>

                          <button 
                            onClick={() => handleDelete(app.id)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
                            title="Delete application"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Metadata */}
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div>Deadline: <strong style={{ color: 'var(--text-body)' }}>{app.deadline || 'Open'}</strong></div>
                          <div>Resume: <span style={{ color: 'var(--primary)' }}>{app.resumeAttached || 'Master ATS Resume'}</span></div>
                        </div>

                        {/* Stage Selector */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                          <select 
                            value={app.stage || 'Saved'}
                            onChange={(e) => handleStageChange(app.id, e.target.value)}
                            style={{
                              background: 'rgba(15, 23, 42, 0.9)',
                              border: '1px solid var(--border-medium)',
                              color: '#fff',
                              borderRadius: 'var(--radius-xs)',
                              padding: '4px 6px',
                              fontSize: '0.72rem',
                              fontWeight: '700'
                            }}
                          >
                            {PIPELINE_STAGES.map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>

                          <Link 
                            to="/interview" 
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '2px 6px', fontSize: '0.72rem', color: 'var(--emerald)' }}
                            title="Practice interview for this role"
                          >
                            <Bot size={12} /> Prep
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. NEW APPLICATION MODAL */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title="Add Application to Pipeline"
      >
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Company Name *</label>
            <input 
              type="text"
              className="form-input"
              required
              placeholder="e.g. Stripe, Razorpay, Google"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role Title *</label>
            <input 
              type="text"
              className="form-input"
              required
              placeholder="e.g. Frontend Engineer Intern"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Initial Stage</label>
              <select 
                className="form-select"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
              >
                {PIPELINE_STAGES.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input 
                type="text"
                className="form-input"
                placeholder="e.g. In 7 days"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes & Preparation Plan</label>
            <textarea 
              className="form-textarea"
              rows={3}
              placeholder="Recruiter contact, interview rounds, referral status..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            Add Application to Pipeline
          </button>
        </form>
      </Modal>

      {/* Style for Kanban Columns on Smaller Screens */}
      <style>{`
        @media (max-width: 1024px) {
          .pipeline-columns-container {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
