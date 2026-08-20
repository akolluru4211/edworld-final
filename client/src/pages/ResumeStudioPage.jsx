import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Download, 
  Plus, 
  Check, 
  AlertCircle, 
  Copy, 
  Printer, 
  Eye, 
  Edit3, 
  Save,
  Trash2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getUserResumes, saveResume, deleteResume, getUserProjects } from '../services/firestoreService';
import { optimizeResumeBullet } from '../services/aiService';

export default function ResumeStudioPage() {
  const { user, userProfile } = useAuth();
  const { showToast } = useNotification();
  
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview' | 'matcher'
  const [projectsList, setProjectsList] = useState([]);

  // Form Fields
  const [title, setTitle] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [summary, setSummary] = useState('');
  const [experienceText, setExperienceText] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [projectsText, setProjectsText] = useState('');
  const [educationText, setEducationText] = useState('');

  // AI JD Matcher State
  const [jobDescription, setJobDescription] = useState('');
  const [atsAnalysis, setAtsAnalysis] = useState(null);
  const [analyzingAts, setAnalyzingAts] = useState(false);
  const [rawBullet, setRawBullet] = useState('');
  const [enhancedBullet, setEnhancedBullet] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setLoading(true);
      try {
        const [rList, pList] = await Promise.all([
          getUserResumes(user.uid),
          getUserProjects(user.uid)
        ]);

        setProjectsList(pList || []);
        if (rList && rList.length > 0) {
          setResumes(rList);
          loadResumeIntoForm(rList[0]);
        } else {
          setResumes([]);
          setSelectedResume(null);
        }
      } catch (err) {
        console.warn('Error loading resumes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const loadResumeIntoForm = (r) => {
    setSelectedResume(r);
    setTitle(r.title || 'Technical Resume');
    setTargetRole(r.targetRole || userProfile?.careerGoal || '');
    setSummary(r.summary || '');
    setExperienceText(r.experienceText || '');
    setSkillsText(r.skillsText || '');
    setProjectsText(r.projectsText || '');
    setEducationText(r.educationText || '');
  };

  const handleCreateNewResume = () => {
    // Generate initial text purely from user's real Firestore profile data
    const pText = projectsList.map(p => 
      `${p.title} (${p.techStack?.join(', ') || 'Tech Stack'})\n- ${p.tagline || p.description || ''}${p.githubRepo ? `\n- Repository: ${p.githubRepo}` : ''}`
    ).join('\n\n');

    const eduText = userProfile?.college ? 
      `${userProfile?.degree || 'Degree'} in ${userProfile?.branch || 'Major'}\n${userProfile?.college} (Class of ${userProfile?.gradYear || ''})` : '';

    const newRes = {
      id: '',
      title: `${userProfile?.careerGoal || 'Software Engineer'} Resume`,
      targetRole: userProfile?.careerGoal || '',
      summary: userProfile?.bio || '',
      experienceText: '',
      skillsText: userProfile?.skills?.join(', ') || '',
      projectsText: pText,
      educationText: eduText
    };

    setSelectedResume(newRes);
    loadResumeIntoForm(newRes);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const resumeData = {
        title: title || 'Technical Resume',
        targetRole,
        summary,
        experienceText,
        skillsText,
        projectsText,
        educationText,
        updatedAt: new Date().toISOString()
      };

      const saved = await saveResume(user.uid, resumeData, selectedResume?.id || null);
      showToast('Resume saved successfully! 💾');
      
      const updatedList = await getUserResumes(user.uid);
      setResumes(updatedList);
      const found = updatedList.find(r => r.id === saved.id) || updatedList[0];
      setSelectedResume(found);
    } catch (err) {
      showToast('Failed to save resume.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await deleteResume(id);
      showToast('Resume removed.');
      const updatedList = await getUserResumes(user.uid);
      setResumes(updatedList);
      if (updatedList.length > 0) {
        loadResumeIntoForm(updatedList[0]);
      } else {
        setSelectedResume(null);
      }
    } catch (err) {
      showToast('Failed to delete resume.', 'error');
    }
  };

  const handleAnalyzeJD = () => {
    if (!jobDescription) {
      showToast('Please paste a job description first.', 'info');
      return;
    }
    setAnalyzingAts(true);
    setTimeout(() => {
      const jdWords = jobDescription.toLowerCase();
      const resumeContent = `${summary} ${skillsText} ${projectsText} ${experienceText}`.toLowerCase();
      
      const keywords = ['react', 'javascript', 'typescript', 'node.js', 'python', 'sql', 'docker', 'aws', 'api', 'git', 'system design', 'testing', 'ci/cd', 'frontend', 'backend'];
      const present = keywords.filter(k => jdWords.includes(k) && resumeContent.includes(k));
      const missing = keywords.filter(k => jdWords.includes(k) && !resumeContent.includes(k));
      const score = Math.min(95, Math.max(30, Math.round((present.length / (present.length + missing.length || 1)) * 100)));

      setAtsAnalysis({
        score,
        matchedKeywords: present,
        missingKeywords: missing,
        suggestions: missing.length > 0 
          ? [`Add proof of work or skills relating to: ${missing.slice(0, 3).join(', ')}`, 'Quantify project impact with benchmarks and user count metrics.']
          : ['Great alignment! Your resume covers the primary technical keywords.']
      });
      setAnalyzingAts(false);
    }, 600);
  };

  const handleEnhanceBullet = async () => {
    if (!rawBullet) return;
    const enhanced = await optimizeResumeBullet(rawBullet, targetRole);
    setEnhancedBullet(enhanced);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="brand-logo-icon" style={{ width: '40px', height: '40px', margin: '0 auto 12px', fontSize: '1.2rem' }}>E</div>
        <div style={{ color: 'var(--text-muted)' }}>Loading Resume Studio...</div>
      </div>
    );
  }

  return (
    <div className="resume-studio-page" style={{ paddingBottom: '60px' }}>
      {/* 1. HERO HEADER */}
      <div className="glass-card" style={{ padding: '28px 24px', marginBottom: '20px', background: 'linear-gradient(135deg, rgba(18, 26, 44, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '4px 10px', borderRadius: 'var(--radius-full)', marginBottom: '8px' }}>
              <FileText size={13} color="var(--primary)" />
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#c7d2fe', textTransform: 'uppercase' }}>
                ATS Engineering Resume
              </span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '4px' }}>
              ATS Resume Studio
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
              Build ATS-optimized technical resumes backed by your verified GitHub projects and skill matrix.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={handleCreateNewResume} className="btn btn-secondary btn-sm">
              <Plus size={14} /> New Resume
            </button>
            {selectedResume && (
              <>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm">
                  <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={handlePrint} className="btn btn-outline btn-sm">
                  <Printer size={14} /> Print / PDF
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {!selectedResume && resumes.length === 0 ? (
        /* Empty State */
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <FileText size={48} color="var(--text-dim)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px' }}>No resume created yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 24px' }}>
            Generate your first ATS-ready technical resume pre-filled with your verified projects and skills.
          </p>
          <button onClick={handleCreateNewResume} className="btn btn-primary">
            <Plus size={16} /> Create Your Resume
          </button>
        </div>
      ) : (
        <>
          {/* 2. MOBILE WORKSPACE SEGMENT TABS */}
          <div className="hide-on-desktop" style={{ marginBottom: '20px' }}>
            <div className="segment-tabs-container">
              <button 
                onClick={() => setActiveTab('edit')} 
                className={`segment-tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
              >
                <Edit3 size={15} /> Resume Editor
              </button>
              <button 
                onClick={() => setActiveTab('preview')} 
                className={`segment-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
              >
                <Eye size={15} /> Live Preview
              </button>
              <button 
                onClick={() => setActiveTab('matcher')} 
                className={`segment-tab-btn ${activeTab === 'matcher' ? 'active' : ''}`}
              >
                <Sparkles size={15} /> ATS Matcher
              </button>
            </div>
          </div>

          {/* 3. DESKTOP 2-COLUMN WORKSPACE */}
          <div className="grid-2-even" style={{ gap: '24px', alignItems: 'start' }}>
            
            {/* LEFT COLUMN: EDITORS */}
            <div className={activeTab === 'preview' ? 'hide-on-mobile' : ''} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Resume Selector */}
              {resumes.length > 1 && (
                <div className="glass-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '700' }}>Version:</span>
                  <select 
                    value={selectedResume?.id || ''} 
                    onChange={(e) => {
                      const r = resumes.find(item => item.id === e.target.value);
                      if (r) loadResumeIntoForm(r);
                    }}
                    className="input-field" 
                    style={{ padding: '6px 12px', fontSize: '0.85rem', flex: 1 }}
                  >
                    {resumes.map(r => (
                      <option key={r.id} value={r.id}>{r.title} ({r.targetRole || 'General'})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Document Meta */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Resume Title</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. Frontend Engineer ATS Resume"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Target Role</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. Full Stack Software Engineer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Professional Summary</label>
                  <textarea 
                    className="input-field" 
                    rows={3}
                    placeholder="Describe your technical background, engineering focus, and core competencies..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                  />
                </div>
              </div>

              {/* Skills & Experience */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Technical Skills (Comma separated)</label>
                  <textarea 
                    className="input-field" 
                    rows={2}
                    placeholder="React, TypeScript, Node.js, Python, PostgreSQL, Docker, Git"
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Experience & Contributions</label>
                  <textarea 
                    className="input-field" 
                    rows={4}
                    placeholder="Company | Role | Dates&#10;- Key achievement with metric impact&#10;- Technical responsibility"
                    value={experienceText}
                    onChange={(e) => setExperienceText(e.target.value)}
                  />
                </div>
              </div>

              {/* Projects & Education */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Proof of Work Projects</label>
                  <textarea 
                    className="input-field" 
                    rows={5}
                    placeholder="Project Name (Tech Stack)&#10;- Architecture and problem solved&#10;- Live Demo / GitHub link"
                    value={projectsText}
                    onChange={(e) => setProjectsText(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Education</label>
                  <textarea 
                    className="input-field" 
                    rows={2}
                    placeholder="Degree in Major&#10;College / University (Graduation Year)"
                    value={educationText}
                    onChange={(e) => setEducationText(e.target.value)}
                  />
                </div>
              </div>

              {/* AI Bullet Enhancer */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="var(--primary)" /> AI Resume Bullet Optimizer
                </h4>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Paste a rough bullet point (e.g. built api in nodejs)..."
                  value={rawBullet}
                  onChange={(e) => setRawBullet(e.target.value)}
                />
                <button onClick={handleEnhanceBullet} className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '10px', justifyContent: 'center' }}>
                  Optimize with Action Verbs & Metrics
                </button>
                {enhancedBullet && (
                  <div style={{ marginTop: '12px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--secondary)', fontWeight: '700', marginBottom: '4px' }}>SUGGESTED BULLET:</div>
                    <div>{enhancedBullet}</div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: LIVE ATS PREVIEW & MATCHER */}
            <div className={activeTab === 'edit' ? 'hide-on-mobile' : ''} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* ATS PREVIEW SHEET */}
              <div style={{
                background: '#ffffff',
                color: '#0f172a',
                borderRadius: '8px',
                padding: '32px 28px',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: '0.85rem',
                lineHeight: '1.5',
                boxShadow: '0 8px 30px rgba(0,0,0,0.6)'
              }}>
                {/* Resume Header */}
                <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a' }}>
                    {userProfile?.displayName || 'YOUR NAME'}
                  </h2>
                  <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#4338ca', marginTop: '2px' }}>
                    {targetRole || 'Software Engineer'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '4px' }}>
                    {userProfile?.email || ''} {userProfile?.college ? `• ${userProfile.college}` : ''} {userProfile?.username ? `• @${userProfile.username}` : ''}
                  </div>
                </div>

                {/* Summary */}
                {summary && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px', marginBottom: '6px', color: '#0f172a' }}>
                      Professional Summary
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155' }}>{summary}</p>
                  </div>
                )}

                {/* Technical Skills */}
                {skillsText && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px', marginBottom: '6px', color: '#0f172a' }}>
                      Technical Skills Matrix
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155' }}>{skillsText}</p>
                  </div>
                )}

                {/* Work Experience */}
                {experienceText && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px', marginBottom: '6px', color: '#0f172a' }}>
                      Experience & Contributions
                    </div>
                    <div style={{ whiteSpace: 'pre-line', fontSize: '0.82rem', color: '#334155' }}>{experienceText}</div>
                  </div>
                )}

                {/* Projects */}
                {projectsText && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px', marginBottom: '6px', color: '#0f172a' }}>
                      Proof of Work Projects
                    </div>
                    <div style={{ whiteSpace: 'pre-line', fontSize: '0.82rem', color: '#334155' }}>{projectsText}</div>
                  </div>
                )}

                {/* Education */}
                {educationText && (
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px', marginBottom: '6px', color: '#0f172a' }}>
                      Education
                    </div>
                    <div style={{ whiteSpace: 'pre-line', fontSize: '0.82rem', color: '#334155' }}>{educationText}</div>
                  </div>
                )}
              </div>

              {/* JD MATCHER */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="var(--secondary)" /> Job Description Matcher
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Paste a target Job Description to analyze ATS keyword coverage against this resume.
                </p>

                <textarea 
                  className="input-field" 
                  rows={3} 
                  placeholder="Paste job description requirements..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />

                <button 
                  onClick={handleAnalyzeJD}
                  disabled={analyzingAts}
                  className="btn btn-primary btn-sm" 
                  style={{ width: '100%', marginTop: '10px', justifyContent: 'center' }}
                >
                  {analyzingAts ? 'Analyzing ATS Alignment...' : 'Analyze Match Score'}
                </button>

                {atsAnalysis && (
                  <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', padding: '14px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Calculated ATS Match:</span>
                      <span className="badge badge-emerald" style={{ fontSize: '0.85rem' }}>{atsAnalysis.score}%</span>
                    </div>

                    {atsAnalysis.matchedKeywords.length > 0 && (
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--emerald)', fontWeight: '700' }}>MATCHED KEYWORDS:</div>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                          {atsAnalysis.matchedKeywords.map((k, i) => (
                            <span key={i} className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>✓ {k}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {atsAnalysis.missingKeywords.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--rose)', fontWeight: '700' }}>MISSING KEYWORDS:</div>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                          {atsAnalysis.missingKeywords.map((k, i) => (
                            <span key={i} className="badge badge-rose" style={{ fontSize: '0.65rem' }}>+ {k}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

          </div>
        </>
      )}
    </div>
  );
}
