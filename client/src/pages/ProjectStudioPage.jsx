import React, { useState, useEffect } from 'react';
import { 
  FolderGit2, 
  Plus, 
  Columns, 
  Code, 
  ShieldCheck, 
  Play, 
  Terminal, 
  Github, 
  ExternalLink, 
  CheckCircle, 
  ArrowRight, 
  AlertCircle, 
  Trash2,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  getUserProjects, 
  createProject, 
  updateProject, 
  deleteProject 
} from '../services/firestoreService';
import { analyzeProjectEvidence } from '../services/aiService';

export default function ProjectStudioPage() {
  const { user, userProfile } = useAuth();
  const { showToast } = useNotification();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban' | 'scratchpad' | 'verification'
  const [loading, setLoading] = useState(true);

  // New Project Form Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [techStackInput, setTechStackInput] = useState('React, Node.js, Firebase');
  const [githubRepo, setGithubRepo] = useState('');
  const [liveUrl, setLiveUrl] = useState('');

  // Kanban Task Form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('High');

  // Sandbox Code Runner
  const [codeOutput, setCodeOutput] = useState('');

  const loadProjects = async () => {
    if (!user) return;
    try {
      const list = await getUserProjects(user.uid);
      setProjects(list);
      if (list.length > 0 && !selectedProject) {
        setSelectedProject(list[0]);
      } else if (selectedProject) {
        const refreshed = list.find(p => p.id === selectedProject.id);
        if (refreshed) setSelectedProject(refreshed);
      }
    } catch (err) {
      console.warn('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [user]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    try {
      const techStack = techStackInput.split(',').map(s => s.trim()).filter(Boolean);
      const newProj = await createProject({
        ownerId: user.uid,
        ownerName: userProfile?.displayName || 'Developer',
        ownerAvatar: userProfile?.photoURL || '',
        title,
        tagline,
        description,
        techStack,
        githubRepo,
        liveUrl,
        scratchpad: `// Live JavaScript Code Sandbox for ${title}\nconsole.log("Welcome to ${title} Studio Engine!");\n\nfunction getTechStack() {\n  return ${JSON.stringify(techStack)};\n}\n\nconsole.log("Active Stack:", getTechStack().join(", "));`
      });

      setProjects(prev => [newProj, ...prev]);
      setSelectedProject(newProj);
      setShowCreateModal(false);
      setTitle('');
      setTagline('');
      setDescription('');
      setGithubRepo('');
      setLiveUrl('');
      showToast(`🚀 "${newProj.title}" launched in Project Studio!`);
    } catch (err) {
      showToast('Failed to create project.', 'error');
    }
  };

  const handleMoveTask = async (task, fromCol, toCol) => {
    if (!selectedProject) return;
    const newKanban = { ...selectedProject.kanban };
    newKanban[fromCol] = (newKanban[fromCol] || []).filter(t => t.id !== task.id);
    if (!newKanban[toCol]) newKanban[toCol] = [];
    newKanban[toCol].push(task);

    setSelectedProject(prev => ({ ...prev, kanban: newKanban }));
    setProjects(prev => prev.map(p => p.id === selectedProject.id ? { ...p, kanban: newKanban } : p));

    try {
      await updateProject(selectedProject.id, { kanban: newKanban });
    } catch (err) {
      showToast('Failed to sync Kanban task state', 'error');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim() || !selectedProject) return;

    const newTask = {
      id: 'k-' + Date.now(),
      title: taskTitle,
      priority: taskPriority,
      assignee: userProfile?.displayName?.split(' ')[0] || 'You'
    };

    const newKanban = { ...selectedProject.kanban };
    if (!newKanban.todo) newKanban.todo = [];
    newKanban.todo.push(newTask);

    setSelectedProject(prev => ({ ...prev, kanban: newKanban }));
    setProjects(prev => prev.map(p => p.id === selectedProject.id ? { ...p, kanban: newKanban } : p));
    setTaskTitle('');

    try {
      await updateProject(selectedProject.id, { kanban: newKanban });
      showToast('Task added to Kanban To-Do list.');
    } catch (err) {
      showToast('Failed to save task', 'error');
    }
  };

  const handleRunScratchpad = () => {
    if (!selectedProject?.scratchpad) return;
    try {
      let logs = [];
      const customConsole = {
        log: (...args) => logs.push(args.join(' ')),
        warn: (...args) => logs.push('Warning: ' + args.join(' ')),
        error: (...args) => logs.push('Error: ' + args.join(' '))
      };
      const runner = new Function('console', selectedProject.scratchpad);
      runner(customConsole);
      setCodeOutput(logs.length ? logs.join('\n') : 'Code executed cleanly with no output.');
    } catch (err) {
      setCodeOutput('Execution Error: ' + err.message);
    }
  };

  const handleSaveScratchpad = async (val) => {
    setSelectedProject(prev => ({ ...prev, scratchpad: val }));
    setProjects(prev => prev.map(p => p.id === selectedProject.id ? { ...p, scratchpad: val } : p));
    try {
      await updateProject(selectedProject.id, { scratchpad: val });
    } catch (err) {
      console.warn('Scratchpad save error:', err);
    }
  };

  const handleRunVerification = async () => {
    if (!selectedProject) return;
    const analysis = analyzeProjectEvidence(selectedProject);
    try {
      await updateProject(selectedProject.id, {
        verificationStatus: analysis.status,
        verificationScore: analysis.score,
        verificationEvidence: analysis
      });
      setSelectedProject(prev => ({
        ...prev,
        verificationStatus: analysis.status,
        verificationScore: analysis.score,
        verificationEvidence: analysis
      }));
      setProjects(prev => prev.map(p => p.id === selectedProject.id ? {
        ...p,
        verificationStatus: analysis.status,
        verificationScore: analysis.score,
        verificationEvidence: analysis
      } : p));
      showToast(analysis.status === 'verified' ? '✓ Project successfully verified!' : 'Project analysis completed.', analysis.status === 'verified' ? 'success' : 'info');
    } catch (err) {
      showToast('Verification check failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      setSelectedProject(projects.find(p => p.id !== id) || null);
      showToast('Project removed.');
    } catch (err) {
      showToast('Failed to delete project', 'error');
    }
  };

  return (
    <div className="project-studio-page">
      {/* 1. STUDIO HEADER */}
      <div className="hero-banner" style={{ padding: '36px 32px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(6, 182, 212, 0.18)', border: '1px solid rgba(6, 182, 212, 0.35)', padding: '4px 12px', borderRadius: 'var(--radius-full)', marginBottom: '10px' }}>
              <FolderGit2 size={14} color="var(--secondary)" />
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#67e8f9', textTransform: 'uppercase' }}>
                Engineering Proof Workspace
              </span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '6px' }}>
              Project Studio
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '640px' }}>
              Manage engineering milestones, run live code sandboxes, and turn software into verified career evidence.
            </p>
          </div>

          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <Plus size={16} /> New Studio Project
          </button>
        </div>
      </div>

      {/* 2. PROJECT SELECTOR TABS */}
      {projects.length > 0 && (
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '14px', marginBottom: '24px' }}>
          {projects.map(p => (
            <div
              key={p.id}
              onClick={() => setSelectedProject(p)}
              className="glass-card"
              style={{
                minWidth: '260px',
                cursor: 'pointer',
                border: selectedProject?.id === p.id ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                background: selectedProject?.id === p.id ? 'rgba(99, 102, 241, 0.18)' : 'var(--bg-card)',
                padding: '14px 18px',
                transition: 'var(--transition)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <h4 style={{ fontWeight: '700', fontSize: '0.95rem' }}>{p.title}</h4>
                {p.verificationStatus === 'verified' && (
                  <span className="badge badge-emerald" style={{ fontSize: '0.62rem', padding: '2px 6px' }}>✓ Verified</span>
                )}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {p.tagline || p.description || 'Engineering project'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 3. ACTIVE PROJECT WORKSPACE */}
      {selectedProject ? (
        <div className="glass-card">
          {/* Project Details Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>{selectedProject.title}</h2>
                <span className={`badge ${selectedProject.verificationStatus === 'verified' ? 'badge-emerald' : 'badge-amber'}`}>
                  {selectedProject.verificationStatus === 'verified' ? '✓ Verified Proof' : 'Unverified Draft'}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                {selectedProject.description || selectedProject.tagline}
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                {selectedProject.githubRepo && (
                  <a href={selectedProject.githubRepo} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Github size={13} /> {selectedProject.githubRepo.replace('https://github.com/', '')}
                  </a>
                )}
                {selectedProject.liveUrl && (
                  <a href={selectedProject.liveUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--emerald)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ExternalLink size={13} /> Live Deployment
                  </a>
                )}
              </div>
            </div>

            {/* Sub-nav Tabs */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div className="nav-tabs">
                <button 
                  className={`nav-tab ${activeTab === 'kanban' ? 'active' : ''}`}
                  onClick={() => setActiveTab('kanban')}
                >
                  <Columns size={15} /> Kanban Board
                </button>
                <button 
                  className={`nav-tab ${activeTab === 'scratchpad' ? 'active' : ''}`}
                  onClick={() => setActiveTab('scratchpad')}
                >
                  <Code size={15} /> Sandbox Editor
                </button>
                <button 
                  className={`nav-tab ${activeTab === 'verification' ? 'active' : ''}`}
                  onClick={() => setActiveTab('verification')}
                >
                  <ShieldCheck size={15} /> Git Verification
                </button>
              </div>

              <button onClick={() => handleDelete(selectedProject.id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--rose)', padding: '8px' }}>
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* TAB 1: KANBAN BOARD */}
          {activeTab === 'kanban' && (
            <div>
              {/* Add Task Form */}
              <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input 
                  type="text"
                  className="input-field"
                  style={{ flex: 1, minWidth: '220px' }}
                  placeholder="Enter a new milestone task (e.g. Implement OAuth JWT token refresh)..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
                <select 
                  className="select-field" 
                  style={{ width: '130px' }}
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <button type="submit" className="btn btn-primary btn-sm">
                  <Plus size={14} /> Add Task
                </button>
              </form>

              {/* 3 Column Board */}
              <div className="kanban-board">
                {/* To Do */}
                <div className="kanban-column">
                  <div className="kanban-header">
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-muted)' }}>To-Do</h4>
                    <span className="badge badge-primary">{selectedProject.kanban?.todo?.length || 0}</span>
                  </div>
                  {(selectedProject.kanban?.todo || []).map(task => (
                    <div key={task.id} className="kanban-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span className={`badge ${task.priority === 'High' ? 'badge-rose' : 'badge-secondary'}`} style={{ fontSize: '0.65rem' }}>{task.priority}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{task.assignee}</span>
                      </div>
                      <p style={{ fontSize: '0.88rem', fontWeight: '600', marginBottom: '10px' }}>{task.title}</p>
                      <button className="btn btn-secondary btn-sm" style={{ width: '100%', fontSize: '0.75rem', padding: '4px' }} onClick={() => handleMoveTask(task, 'todo', 'in_progress')}>
                        Start Task <ArrowRight size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* In Progress */}
                <div className="kanban-column">
                  <div className="kanban-header">
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--secondary)' }}>In Progress</h4>
                    <span className="badge badge-secondary">{selectedProject.kanban?.in_progress?.length || 0}</span>
                  </div>
                  {(selectedProject.kanban?.in_progress || []).map(task => (
                    <div key={task.id} className="kanban-card" style={{ borderColor: 'var(--secondary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>{task.priority}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{task.assignee}</span>
                      </div>
                      <p style={{ fontSize: '0.88rem', fontWeight: '600', marginBottom: '10px' }}>{task.title}</p>
                      <button className="btn btn-primary btn-sm" style={{ width: '100%', fontSize: '0.75rem', padding: '4px' }} onClick={() => handleMoveTask(task, 'in_progress', 'done')}>
                        Complete <CheckCircle size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Done */}
                <div className="kanban-column">
                  <div className="kanban-header">
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--emerald)' }}>Completed</h4>
                    <span className="badge badge-emerald">{selectedProject.kanban?.done?.length || 0}</span>
                  </div>
                  {(selectedProject.kanban?.done || []).map(task => (
                    <div key={task.id} className="kanban-card" style={{ borderColor: 'var(--emerald)', opacity: 0.85 }}>
                      <span className="badge badge-emerald" style={{ fontSize: '0.65rem', marginBottom: '6px' }}>✓ Done</span>
                      <p style={{ fontSize: '0.88rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>{task.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CODE SCRATCHPAD */}
          {activeTab === 'scratchpad' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Live JavaScript Sandbox Engine (Client-side execution)</span>
                <button className="btn btn-primary btn-sm" onClick={handleRunScratchpad}>
                  <Play size={14} /> Execute Code
                </button>
              </div>

              <textarea 
                className="code-editor"
                rows={12}
                value={selectedProject.scratchpad || ''}
                onChange={(e) => handleSaveScratchpad(e.target.value)}
              />

              {codeOutput && (
                <div style={{ marginTop: '16px', background: '#000', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--emerald)' }}>
                    <Terminal size={16} />
                    <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>Terminal Output</span>
                  </div>
                  <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#34d399', whiteSpace: 'pre-wrap' }}>
                    {codeOutput}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROJECT VERIFICATION ENGINE */}
          {activeTab === 'verification' && (
            <div style={{ maxWidth: '700px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Automated Verification Checker</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Evaluates code repository proof, live deployment, architecture documentation, and milestone completion.
                  </p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={handleRunVerification}>
                  <ShieldCheck size={15} /> Run Evidence Audit
                </button>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Verification Quality Score</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: '800', color: selectedProject.verificationScore >= 70 ? 'var(--emerald)' : 'var(--amber)' }}>
                    {selectedProject.verificationScore || 0} / 100
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { label: 'Valid GitHub Repository URL', valid: Boolean(selectedProject.githubRepo?.startsWith('http')) },
                    { label: 'Multi-Technology Stack Declared', valid: Boolean(selectedProject.techStack?.length >= 2) },
                    { label: 'Technical Architecture & Description Documented', valid: Boolean(selectedProject.description?.length > 40) },
                    { label: 'Live Deployment Link Available', valid: Boolean(selectedProject.liveUrl?.startsWith('http')) },
                    { label: 'Completed Studio Milestones', valid: Boolean(selectedProject.kanban?.done?.length >= 1) }
                  ].map((chk, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: chk.valid ? 'var(--emerald)' : 'var(--text-dim)' }}>
                      {chk.valid ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                      <span>{chk.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <FolderGit2 size={48} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '8px' }}>No Studio Projects Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '480px', margin: '0 auto 24px' }}>
            Build your first project in Studio to generate verified career proof for recruiters and peers.
          </p>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <Plus size={16} /> Launch New Project
          </button>
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '16px' }}>Launch Studio Project</h3>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label className="form-label">Project Title *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required 
                  placeholder="e.g. Real-Time Collaborative Canvas"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Short Tagline</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="One line summary of what this project accomplishes"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Architecture & Description</label>
                <textarea 
                  className="textarea-field" 
                  rows={3}
                  placeholder="Explain the architectural pattern, state management, and key features..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tech Stack (comma separated)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. React, Node.js, WebSockets, Firebase"
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                />
              </div>

              <div className="grid-2-even" style={{ gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label className="form-label">GitHub Repository URL</label>
                  <input 
                    type="url" 
                    className="input-field" 
                    placeholder="https://github.com/user/repo"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Live Deployment URL</label>
                  <input 
                    type="url" 
                    className="input-field" 
                    placeholder="https://my-project.vercel.app"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Studio Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
