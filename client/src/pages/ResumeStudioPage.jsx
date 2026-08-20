import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Save, 
  Printer, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  Copy, 
  ArrowRight,
  Code,
  Download,
  Eye,
  Edit3,
  Bot
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  getUserResumes, 
  saveResume, 
  deleteResume,
  getUserProjects 
} from '../services/firestoreService';
import { analyzeResumeAgainstJob, enhanceResumeBullet } from '../services/aiService';

export default function ResumeStudioPage() {
  const { user, userProfile } = useAuth();
  const { showToast } = useNotification();
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Mobile Workspace Tab ('edit' | 'preview' | 'ai')
  const [activeTab, setActiveTab] = useState('edit');

  // Resume Form Data
  const [title, setTitle] = useState('Full Stack Engineer Resume');
  const [targetRole, setTargetRole] = useState('Full Stack Software Engineer');
  const [summary, setSummary] = useState('');
  const [experienceText, setExperienceText] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [projectsText, setProjectsText] = useState('');
  const [educationText, setEducationText] = useState('');

  // JD Analyzer state
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Bullet point enhancer state
  const [rawBullet, setRawBullet] = useState('');
  const [enhancedBullet, setEnhancedBullet] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [rList, pList] = await Promise.all([
          getUserResumes(user.uid),
          getUserProjects(user.uid)
        ]);

        if (rList.length > 0) {
          setResumes(rList);
          loadResumeIntoForm(rList[0]);
        } else {
          // Initialize default master resume from profile and projects
          const defaultResume = {
            id: 'master-resume',
            userId: user.uid,
            title: 'Master Technical Resume',
            targetRole: userProfile?.careerGoal || 'Software Engineer',
            summary: userProfile?.bio || `Motivated ${userProfile?.careerGoal || 'Software Engineer'} with hands-on experience building full-stack web applications and scalable cloud backends.`,
            experienceText: `Software Engineer Fellow | Open Source & EdWorld Studio\n- Architected high-performance web applications using ${userProfile?.skills?.slice(0, 3).join(', ') || 'React, Node.js'}.\n- Integrated real-time Firestore database and OAuth authentication workflows.\n- Optimized API endpoints and front-end rendering performance.`,
            skillsText: userProfile?.skills?.join(', ') || 'React, Node.js, JavaScript, TypeScript, Firebase, Git, Problem Solving',
            projectsText: pList.map(p => `${p.title} (${p.techStack?.join(', ') || 'Tech'})\n- ${p.description || p.tagline}\n- Live Demo: ${p.liveUrl || 'Available'} | GitHub: ${p.githubRepo || 'Available'}`).join('\n\n') || 'Project Nexus Hub\n- Built full-stack collaborative developer workspace with real-time Kanban and code sandbox.',
            educationText: `${userProfile?.degree || 'Bachelor of Technology'} in ${userProfile?.branch || 'Computer Science'}\n${userProfile?.college || 'Technology Institute'} (Graduation: ${userProfile?.gradYear || '2026'})`,
            matchScore: 88
          };
          setResumes([defaultResume]);
          loadResumeIntoForm(defaultResume);
        }
      } catch (err) {
        console.warn('Error loading resumes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, userProfile]);

  const loadResumeIntoForm = (r) => {
    setSelectedResume(r);
    setTitle(r.title || 'Technical Resume');
    setTargetRole(r.targetRole || 'Software Engineer');
    setSummary(r.summary || '');
    setExperienceText(r.experienceText || '');
    setSkillsText(r.skillsText || '');
    setProjectsText(r.projectsText || '');
    setEducationText(r.educationText || '');
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const resumeData = {
        title,
        targetRole,
        summary,
        experienceText,
        skillsText,
        projectsText,
        educationText,
        updatedAt: new Date().toISOString()
      };
      const res = await saveResume(user.uid, resumeData, selectedResume?.id !== 'master-resume' ? selectedResume?.id : null);
      setSelectedResume({ ...resumeData, id: res.id });
      showToast('Resume saved successfully!');
    } catch (err) {
      showToast('Failed to save resume', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyzeJD = () => {
    if (!jobDescription.trim()) {
      showToast('Please paste a Job Description to analyze.', 'warning');
      return;
    }
    setAnalyzing(true);
    const resumeText = `${summary} ${experienceText} ${projectsText} ${skillsText}`;
    const result = analyzeResumeAgainstJob(resumeText, jobDescription);
    setAnalysisResult(result);
    setAnalyzing(false);
    showToast(`ATS Match Score: ${result.matchScore}% 🎯`);
  };

  const handleEnhanceBullet = () => {
    if (!rawBullet.trim()) return;
    const enhanced = enhanceResumeBullet(rawBullet);
    setEnhancedBullet(enhanced);
    showToast('Bullet point enhanced with action verbs & metrics!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="resume-page" style={{ paddingBottom: '70px' }}>
      {/* 1. HEADER (HIDDEN ON PRINT) */}
      <div className="glass-card no-print" style={{ padding: '24px', marginBottom: '20px', background: 'linear-gradient(135deg, rgba(18, 26, 44, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.18)', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '4px 10px', borderRadius: 'var(--radius-full)', marginBottom: '8px' }}>
              <FileText size={13} color="var(--emerald)" />
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#6ee7b7', textTransform: 'uppercase' }}>
                ATS Resume Studio
              </span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '4px' }}>
              Recruiter-Ready Resume Studio
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
              Live ATS keyword matching, AI bullet enhancer, and PDF export.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleSave} disabled={saving} className="btn btn-secondary btn-sm" style={{ padding: '8px 14px' }}>
              <Save size={14} /> {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={handlePrint} className="btn btn-primary btn-sm" style={{ padding: '8px 14px' }}>
              <Printer size={14} /> Print / Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* 2. MOBILE TAB SELECTOR (HIDDEN ON DESKTOP & PRINT) */}
      <div className="no-print" style={{ marginBottom: '18px' }}>
        <div className="segment-tabs-container">
          <button
            onClick={() => setActiveTab('edit')}
            className={`segment-tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
          >
            <Edit3 size={15} /> Resume Data
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`segment-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
          >
            <Eye size={15} /> Live Preview
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`segment-tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
          >
            <Bot size={15} /> AI ATS Matcher
          </button>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE */}
      <div className="responsive-grid-2">
        
        {/* LEFT COLUMN: RESUME DATA EDITOR (Visible on 'edit' on mobile, always on desktop) */}
        <div className={activeTab !== 'edit' ? 'hide-on-mobile' : ''} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              Resume Header & Target
            </h3>
            <div className="form-group">
              <label className="form-label">Resume Title</label>
              <input 
                type="text" 
                className="input-field" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Target Role</label>
              <input 
                type="text" 
                className="input-field" 
                value={targetRole} 
                onChange={(e) => setTargetRole(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Executive Summary</label>
              <textarea 
                className="input-field" 
                rows="3" 
                value={summary} 
                onChange={(e) => setSummary(e.target.value)} 
              />
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              Experience & Projects
            </h3>
            <div className="form-group">
              <label className="form-label">Work Experience</label>
              <textarea 
                className="input-field" 
                rows="4" 
                value={experienceText} 
                onChange={(e) => setExperienceText(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Key Projects</label>
              <textarea 
                className="input-field" 
                rows="4" 
                value={projectsText} 
                onChange={(e) => setProjectsText(e.target.value)} 
              />
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              Technical Skills & Education
            </h3>
            <div className="form-group">
              <label className="form-label">Skills (Comma-separated)</label>
              <textarea 
                className="input-field" 
                rows="2" 
                value={skillsText} 
                onChange={(e) => setSkillsText(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Education</label>
              <textarea 
                className="input-field" 
                rows="3" 
                value={educationText} 
                onChange={(e) => setEducationText(e.target.value)} 
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN / PREVIEW & AI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* AI ATS MATCHING PANEL (Visible on 'ai' tab on mobile) */}
          <div className={activeTab !== 'ai' ? 'hide-on-mobile' : ''}>
            <div className="glass-card" style={{ padding: '20px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Sparkles size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>ATS Job Description Matcher</h3>
              </div>
              <textarea 
                className="input-field" 
                rows="4" 
                placeholder="Paste target job description here to check ATS match..."
                value={jobDescription} 
                onChange={(e) => setJobDescription(e.target.value)} 
              />
              <button 
                onClick={handleAnalyzeJD} 
                disabled={analyzing} 
                className="btn btn-primary btn-sm" 
                style={{ width: '100%', marginTop: '10px', justifyContent: 'center' }}
              >
                {analyzing ? 'Analyzing JD Keywords...' : 'Calculate ATS Match Score'}
              </button>

              {analysisResult && (
                <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.88rem' }}>ATS Match:</span>
                    <span className="badge badge-emerald" style={{ fontSize: '0.85rem' }}>{analysisResult.matchScore}% Match</span>
                  </div>
                  {analysisResult.missingKeywords?.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--rose)', marginBottom: '4px' }}>Recommended Keywords to Add:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {analysisResult.missingKeywords.map((k, i) => (
                          <span key={i} className="badge badge-rose" style={{ fontSize: '0.68rem' }}>+ {k}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bullet Enhancer */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Code size={18} color="var(--secondary)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>AI Bullet Point Enhancer</h3>
              </div>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. built api in nodejs"
                value={rawBullet}
                onChange={(e) => setRawBullet(e.target.value)}
              />
              <button onClick={handleEnhanceBullet} className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '10px', justifyContent: 'center' }}>
                Enhance with Metrics & Action Verbs
              </button>
              {enhancedBullet && (
                <div style={{ marginTop: '12px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--secondary)', fontWeight: '700', marginBottom: '4px' }}>ENHANCED BULLET:</div>
                  <div>{enhancedBullet}</div>
                </div>
              )}
            </div>
          </div>

          {/* LIVE ATS RESUME PREVIEW (Visible on 'preview' on mobile, always on desktop) */}
          <div className={activeTab !== 'preview' ? 'hide-on-mobile' : ''}>
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
                  {userProfile?.displayName || 'DEVELOPER NAME'}
                </h2>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#4338ca', marginTop: '2px' }}>
                  {targetRole}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '4px' }}>
                  {userProfile?.email || 'email@example.com'} • {userProfile?.college || 'Institution'} • @{userProfile?.username || 'user'}
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
          </div>

        </div>

      </div>
    </div>
  );
}
