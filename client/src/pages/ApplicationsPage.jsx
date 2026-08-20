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
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  getUserApplications, 
  createApplication, 
  updateApplicationStage, 
  deleteApplication 
} from '../services/firestoreService';

const PIPELINE_STAGES = [
  'Saved',
  'Preparing',
  'Applied',
  'Assessment',
  'Shortlisted',
  'Interview',
  'Offer',
  'Rejected'
];

export default function ApplicationsPage() {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Application Modal
  const [showModal, setShowModal] = useState(false);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('Remote');
  const [stipendSalary, setStipendSalary] = useState('');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [stage, setStage] = useState('Applied');

  const loadApplications = async () => {
    if (!user) return;
    try {
      const list = await getUserApplications(user.uid);
      setApplications(list);
    } catch (err) {
      console.warn('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!company.trim() || !role.trim() || !user) return;

    try {
      const newApp = await createApplication({
        userId: user.uid,
        company,
        role,
        location,
        stipendSalary,
        deadline,
        notes,
        stage
      });

      setApplications(prev => [newApp, ...prev]);
      setShowModal(false);
      setCompany('');
      setRole('');
      setDeadline('');
      setNotes('');
      showToast(`Added ${role} at ${company} to ${stage} stage.`);
    } catch (err) {
      showToast('Failed to add application', 'error');
    }
  };

  const handleStageChange = async (appId, newStage) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, stage: newStage } : a));
    try {
      await updateApplicationStage(appId, newStage);
      showToast(`Moved application to "${newStage}" stage.`);
    } catch (err) {
      showToast('Failed to update stage', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application from tracker?')) return;
    try {
      await deleteApplication(id);
      setApplications(prev => prev.filter(a => a.id !== id));
      showToast('Application deleted.');
    } catch (err) {
      showToast('Failed to delete application', 'error');
    }
  };

  return (
    <div className="applications-page">
      {/* 1. HEADER */}
      <div className="hero-banner" style={{ padding: '36px 32px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(56, 189, 248, 0.18)', border: '1px solid rgba(56, 189, 248, 0.35)', padding: '4px 12px', borderRadius: 'var(--radius-full)', marginBottom: '10px' }}>
              <Kanban size={14} color="#38bdf8" />
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#7dd3fc', textTransform: 'uppercase' }}>
                Career Pipeline Engine
              </span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '6px' }}>
              Application Pipeline
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '640px' }}>
              Track recruitment lifecycles from application to technical interview and offer.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/jobs" className="btn btn-secondary btn-sm">
              <Briefcase size={14} /> Browse Opportunities
            </Link>
            <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
              <Plus size={14} /> Add Application
            </button>
          </div>
        </div>
      </div>

      {/* 2. PIPELINE KANBAN COLUMNS */}
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '24px' }}>
        {PIPELINE_STAGES.map(colStage => {
          const colApps = applications.filter(a => a.stage === colStage);

          return (
            <div 
              key={colStage}
              style={{
                minWidth: '280px',
                width: '280px',
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Column Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                <div style={{ fontWeight: '700', fontSize: '0.95rem', color: colStage === 'Offer' ? 'var(--emerald)' : colStage === 'Interview' ? 'var(--primary)' : '#fff' }}>
                  {colStage}
                </div>
                <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                  {colApps.length}
                </span>
              </div>

              {/* Cards in Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, minHeight: '300px' }}>
                {colApps.map(app => (
                  <div 
                    key={app.id}
                    className="glass-card"
                    style={{ padding: '14px', background: 'rgba(30, 41, 59, 0.7)', border: '1px solid var(--border-subtle)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <h4 style={{ fontWeight: '700', fontSize: '0.95rem' }}>{app.role}</h4>
                      <button onClick={() => handleDelete(app.id)} style={{ background: 'transparent', border: 'none', color: 'var(--rose)', cursor: 'pointer', padding: '2px' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div style={{ color: 'var(--secondary)', fontWeight: '600', fontSize: '0.82rem', marginBottom: '8px' }}>
                      {app.company}
                    </div>

                    {app.deadline && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                        <Calendar size={11} /> Deadline: {app.deadline}
                      </div>
                    )}

                    {app.notes && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px', background: 'rgba(0,0,0,0.2)', padding: '6px 8px', borderRadius: '6px' }}>
                        {app.notes}
                      </p>
                    )}

                    {/* Quick Move Dropdown */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                      <select 
                        className="select-field"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', width: '130px' }}
                        value={app.stage}
                        onChange={(e) => handleStageChange(app.id, e.target.value)}
                      >
                        {PIPELINE_STAGES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>

                      {app.stage === 'Interview' && (
                        <Link to="/interview" className="btn btn-primary btn-sm" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>
                          <Bot size={11} /> Prep AI
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE APPLICATION MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '16px' }}>Track New Opportunity</h3>
            <form onSubmit={handleCreate}>
              <div className="grid-2-even" style={{ gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">Company Name *</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required 
                    placeholder="e.g. Google, Microsoft, Startup"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">Role Title *</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required 
                    placeholder="e.g. Software Engineer Intern"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid-2-even" style={{ gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">Pipeline Stage</label>
                  <select 
                    className="select-field"
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                  >
                    {PIPELINE_STAGES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Application Deadline</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Application Notes / Contact Info</label>
                <textarea 
                  className="textarea-field" 
                  rows={3}
                  placeholder="Referral names, recruiter email, interview schedule notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Track in Pipeline</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
