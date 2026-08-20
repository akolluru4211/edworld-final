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
  ChevronRight
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
  'Applied',
  'Assessment',
  'Interview',
  'Offer',
  'Rejected'
];

export default function ApplicationsPage() {
  const { user } = useAuth();
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
    if (!company.trim() || !roleTitle.trim() || !user) return;

    try {
      const newApp = await createApplication(user.uid, {
        company,
        roleTitle,
        location,
        stipendSalary,
        deadline,
        notes,
        stage
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
      showToast(`Moved application to ${newStage}`);
    } catch (err) {
      showToast('Failed to update stage', 'error');
    }
  };

  const handleDelete = async (appId) => {
    if (!window.confirm('Remove this application from pipeline?')) return;
    try {
      await deleteApplication(appId);
      setApplications(prev => prev.filter(a => a.id !== appId));
      showToast('Application removed');
    } catch (err) {
      showToast('Failed to delete application', 'error');
    }
  };

  const filteredApps = activeMobileStage === 'All'
    ? applications
    : applications.filter(a => (a.stage || 'Applied').toLowerCase() === activeMobileStage.toLowerCase());

  return (
    <div className="applications-page" style={{ paddingBottom: '60px' }}>
      {/* 1. HERO HEADER */}
      <div className="glass-card" style={{ padding: '28px 24px', marginBottom: '20px', background: 'linear-gradient(135deg, rgba(18, 26, 44, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.18)', border: '1px solid rgba(99, 102, 241, 0.35)', padding: '4px 10px', borderRadius: 'var(--radius-full)', marginBottom: '8px' }}>
              <Kanban size={13} color="var(--primary)" />
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#a5b4fc', textTransform: 'uppercase' }}>
                Pipeline Tracking
              </span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '4px' }}>
              Application & Interview Pipeline
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
              Track opportunities through interview stages, prepare answers, and close offers.
            </p>
          </div>

          <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm" style={{ padding: '8px 16px' }}>
            <Plus size={15} /> Add Application
          </button>
        </div>
      </div>

      {/* 2. MOBILE STATUS TABS (< 1024px) */}
      <div className="hide-on-desktop" style={{ marginBottom: '18px' }}>
        <div className="segment-tabs-container">
          {['All', ...PIPELINE_STAGES].map(st => {
            const count = st === 'All' ? applications.length : applications.filter(a => a.stage === st).length;
            return (
              <button
                key={st}
                onClick={() => setActiveMobileStage(st)}
                className={`segment-tab-btn ${activeMobileStage === st ? 'active' : ''}`}
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MOBILE LIST VIEW (< 1024px) */}
      <div className="hide-on-desktop">
        {filteredApps.length === 0 ? (
          <div className="glass-card" style={{ padding: '36px 20px', textAlign: 'center' }}>
            <Kanban size={36} color="var(--text-dim)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.05rem', marginBottom: '4px' }}>No applications in {activeMobileStage}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '14px' }}>
              Discover opportunities on the job board or add a custom application.
            </p>
            <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">Add Application</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredApps.map(app => (
              <div key={app.id} className="glass-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h3 style={{ fontWeight: '800', fontSize: '1rem', margin: 0 }}>{app.roleTitle || app.role}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: '700', marginTop: '2px' }}>
                      {app.company}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(app.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--rose)', cursor: 'pointer', padding: '4px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px', flexWrap: 'wrap' }}>
                  {app.location && <span>📍 {app.location}</span>}
                  {app.deadline && <span>⏰ {app.deadline}</span>}
                </div>

                {/* Stage Selector Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Stage:</span>
                  <select 
                    value={app.stage || 'Applied'}
                    onChange={(e) => handleStageChange(app.id, e.target.value)}
                    className="input-field"
                    style={{ padding: '6px 10px', fontSize: '0.82rem', width: 'auto', minHeight: '34px' }}
                  >
                    {PIPELINE_STAGES.map(s => (
                      <option key={s} value={s} style={{ background: '#0f172a', color: '#fff' }}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Quick Action Links */}
                <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                  <Link to="/interview" className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem' }}>
                    <Bot size={13} /> Prepare Interview
                  </Link>
                  <Link to="/resume" className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem' }}>
                    <FileText size={13} /> Tailor Resume
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. DESKTOP/TABLET KANBAN BOARD (≥ 1024px) */}
      <div className="hide-on-mobile" style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${PIPELINE_STAGES.length}, minmax(220px, 1fr))`,
        gap: '14px',
        overflowX: 'auto',
        paddingBottom: '16px'
      }}>
        {PIPELINE_STAGES.map(stageName => {
          const stageApps = applications.filter(a => (a.stage || 'Applied') === stageName);
          return (
            <div 
              key={stageName}
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '400px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                <span style={{ fontWeight: '800', fontSize: '0.85rem' }}>{stageName}</span>
                <span className="badge badge-primary" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>{stageApps.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                {stageApps.map(app => (
                  <div 
                    key={app.id} 
                    className="glass-card" 
                    style={{ padding: '12px', background: 'rgba(26, 38, 64, 0.9)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{app.roleTitle || app.role}</div>
                      <button 
                        onClick={() => handleDelete(app.id)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--secondary)', marginBottom: '8px' }}>{app.company}</div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <select 
                        value={app.stage || 'Applied'}
                        onChange={(e) => handleStageChange(app.id, e.target.value)}
                        style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontSize: '0.72rem', padding: '2px 4px' }}
                      >
                        {PIPELINE_STAGES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. ADD APPLICATION MODAL */}
      {showModal && (
        <div className="nav-drawer-overlay" onClick={() => setShowModal(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="glass-card" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '460px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>Track New Application</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Role Title *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required 
                  placeholder="e.g. Software Engineer Intern"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required 
                  placeholder="e.g. Google / Microsoft / Startup"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Initial Stage</label>
                <select 
                  className="input-field"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                >
                  {PIPELINE_STAGES.map(s => (
                    <option key={s} value={s} style={{ background: '#0f172a', color: '#fff' }}>{s}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px', justifyContent: 'center' }}>
                Save Application to Pipeline
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
