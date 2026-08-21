import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Sparkles, 
  Download, 
  Plus, 
  Check, 
  AlertCircle, 
  Printer, 
  Eye, 
  Edit3, 
  Save, 
  Trash2, 
  Zap, 
  ArrowRight, 
  Briefcase, 
  GraduationCap, 
  Code, 
  FolderGit2,
  Sliders
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getUserResumes, saveResume, deleteResume, getUserProjects } from '../services/firestoreService';
import { analyzeResumeAgainstJob, optimizeResumeBullet } from '../services/aiService';
import { Drawer, EmptyState, ScoreRing } from '../components/common/UIComponents';

export default function ResumeStudioPage() {
  const { firebaseUser, profile } = useAuth();
  const { showToast } = useNotification();
  
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Responsive Layout Mode for Mobile & Tablet
  // 'data' | 'preview' | 'ai'
  const [mobileTab, setMobileTab] = useState('preview');
  const [tabletAiDrawerOpen, setTabletAiDrawerOpen] = useState(false);

  // Form Fields (Live Data)
  const [title, setTitle] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [summary, setSummary] = useState('');
  const [experienceText, setExperienceText] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [projectsText, setProjectsText] = useState('');
  const [educationText, setEducationText] = useState('');

  // AI JD Analysis State
  const [targetJd, setTargetJd] = useState('');
  const [atsAnalysis, setAtsAnalysis] = useState(null);
  const [analyzingAts, setAnalyzingAts] = useState(false);
  const [bulletToOptimize, setBulletToOptimize] = useState('');
  const [optimizedBullet, setOptimizedBullet] = useState('');

  const resumePrintRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      if (!firebaseUser) return;
      setLoading(true);
      try {
        const [rList, pList] = await Promise.all([
          getUserResumes(firebaseUser.uid),
          getUserProjects(firebaseUser.uid)
        ]);

        setProjectsList(pList || []);
        if (rList && rList.length > 0) {
          setResumes(rList);
          loadResumeIntoState(rList[0]);
        } else {
          // Initialize fresh resume using real Firestore profile data
          initializeDefaultResume(pList || []);
        }
      } catch (err) {
        console.warn('Error loading resumes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [firebaseUser]);

  const initializeDefaultResume = (projs) => {
    const pText = projs.map(p => 
      `${p.title} (${p.techStack?.join(', ') || 'Full Stack'})
• ${p.tagline || p.description || 'Engineered proof-of-work solution with robust architecture.'}${p.githubRepo ? `
• Repository: ${p.githubRepo}` : ''}`
    ).join('

');

    const eduText = profile?.college ? 
      `${profile?.degree || 'Bachelor of Technology'} in ${profile?.branch || 'Computer Science'}
${profile?.college} (Class of ${profile?.gradYear || '2026'})` : '';

    const newRes = {
      id: '',
      title: `${profile?.careerGoal || 'Software Engineer'} ATS Resume`,
      targetRole: profile?.careerGoal || 'Full Stack Software Engineer',
      summary: profile?.bio || 'Driven software engineer with a track record of building verifiable applications, participating in engineering sprints, and solving complex algorithmic challenges.',
      experienceText: profile?.experience?.map(e => `${e.role} at ${e.company} (${e.duration || '2025 - Present'})
• ${e.description || 'Designed and delivered scalable technical components.'}`).join('

') || '',
      skillsText: profile?.skills?.join(', ') || 'React, TypeScript, Node.js, Firebase, Git, REST APIs',
      projectsText: pText,
      educationText: eduText,
      matchScore: 82
    };

    setSelectedResume(newRes);
    loadResumeIntoState(newRes);
  };

  const loadResumeIntoState = (r) => {
    setSelectedResume(r);
    setTitle(r.title || 'Technical Resume');
    setTargetRole(r.targetRole || profile?.careerGoal || 'Software Engineer');
    setSummary(r.summary || '');
    setExperienceText(r.experienceText || '');
    setSkillsText(r.skillsText || '');
    setProjectsText(r.projectsText || '');
    setEducationText(r.educationText || '');

    // Default ATS Analysis
    runAtsCheck(r.summary + ' ' + r.skillsText + ' ' + r.projectsText, targetJd);
  };

  const runAtsCheck = (resumeContent, jd) => {
    const analysis = analyzeResumeAgainstJob(resumeContent, jd, profile?.skills || []);
    setAtsAnalysis(analysis);
  };

  const handleSave = async () => {
    if (!firebaseUser) return;
    setSaving(true);
    try {
      const payload = {
        id: selectedResume?.id || '',
        userId: firebaseUser.uid,
        title: title || 'Technical ATS Resume',
        targetRole,
        summary,
        experienceText,
        skillsText,
        projectsText,
        educationText,
        matchScore: atsAnalysis?.matchScore || 85
      };

      const saved = await saveResume(payload);
      setSelectedResume(saved);
      setResumes(prev => {
        const idx = prev.findIndex(r => r.id === saved.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = saved;
          return copy;
        }
        return [saved, ...prev];
      });
      showToast('Resume saved and synchronized! 📄✨');
    } catch (err) {
      showToast('Failed to save resume', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOptimizeBullet = () => {
    if (!bulletToOptimize.trim()) return;
    const res = optimizeResumeBullet(bulletToOptimize, targetRole);
    setOptimizedBullet(res.optimized);
    showToast('AI bullet point optimized with action verbs & metrics! ⚡');
  };

  return (
    <div className="resume-studio-page" style={{ paddingBottom: '50px' }}>
      
      {/* 1. STUDIO HEADER */}
      <div className="hero-banner" style={{ padding: '24px 28px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.18)', border: '1px solid rgba(99, 102, 241, 0.35)', padding: '2px 10px', borderRadius: 'var(--radius-full)', marginBottom: '6px' }}>
              <FileText size={13} color="var(--primary)" />
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#a5b4fc', textTransform: 'uppercase' }}>
                ATS Resume Studio
              </span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '2px' }}>
              Resume Studio
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', margin: 0 }}>
              Live real-time preview, ATS scanner, and profile-synchronized builder.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              onClick={handlePrint}
              className="btn btn-secondary btn-sm"
              title="Print or Save as PDF"
            >
              <Printer size={15} /> Export PDF
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary btn-sm"
            >
              <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. RESPONSIVE CONTROLS */}
      {/* Mobile Segmented Controller ( < 1024px ) */}
      <div className="show-on-mobile" style={{ marginBottom: '18px' }}>
        <div className="nav-tabs" style={{ width: '100%', justifyContent: 'space-around' }}>
          <button 
            onClick={() => setMobileTab('data')}
            className={`nav-tab ${mobileTab === 'data' ? 'active' : ''}`}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Edit3 size={14} /> Profile Data
          </button>
          <button 
            onClick={() => setMobileTab('preview')}
            className={`nav-tab ${mobileTab === 'preview' ? 'active' : ''}`}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Eye size={14} /> Live Resume
          </button>
          <button 
            onClick={() => setMobileTab('ai')}
            className={`nav-tab ${mobileTab === 'ai' ? 'active' : ''}`}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Sparkles size={14} /> AI Analysis
          </button>
        </div>
      </div>

      {/* 3. 3-COLUMN DESKTOP GRID / RESPONSIVE SECTIONS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 1fr) minmax(420px, 1.3fr) minmax(280px, 0.9fr)',
        gap: '20px',
        alignItems: 'start'
      }} className="resume-grid-container">
        
        {/* ========================================================================= */}
        {/* COLUMN 1: PROFILE DATA EDITOR */}
        {/* ========================================================================= */}
        <div 
          className="glass-card resume-col-data" 
          style={{ 
            padding: '20px', 
            display: (mobileTab === 'data' || window.innerWidth >= 1024) ? 'block' : 'none',
            maxHeight: 'calc(100vh - 180px)',
            overflowY: 'auto'
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit3 size={16} color="var(--primary)" /> Profile Data
          </h3>

          <div className="form-group">
            <label className="form-label">Resume Title</label>
            <input 
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Frontend Engineer ATS Resume"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Role</label>
            <input 
              type="text"
              className="form-input"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Full Stack Developer"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Professional Summary</label>
            <textarea 
              className="form-textarea"
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief 2-3 sentence overview highlighting your core strengths..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Experience</label>
            <textarea 
              className="form-textarea"
              rows={4}
              value={experienceText}
              onChange={(e) => setExperienceText(e.target.value)}
              placeholder="Internships, technical roles, or freelance work..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Proof of Work Projects</label>
            <textarea 
              className="form-textarea"
              rows={5}
              value={projectsText}
              onChange={(e) => setProjectsText(e.target.value)}
              placeholder="Project title, tech stack, and impact bullet points..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Technical Skills</label>
            <textarea 
              className="form-textarea"
              rows={3}
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="Languages, frameworks, developer tools..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Education</label>
            <textarea 
              className="form-textarea"
              rows={3}
              value={educationText}
              onChange={(e) => setEducationText(e.target.value)}
              placeholder="Degree, university, graduation year..."
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLUMN 2: LIVE ATS RESUME PREVIEW */}
        {/* ========================================================================= */}
        <div 
          className="resume-col-preview"
          style={{
            display: (mobileTab === 'preview' || window.innerWidth >= 1024) ? 'block' : 'none'
          }}
        >
          {/* Printable White ATS Document Sheet */}
          <div 
            ref={resumePrintRef}
            className="ats-resume-sheet"
            style={{
              background: '#ffffff',
              color: '#0f172a',
              padding: '36px 40px',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
              fontFamily: '"Plus Jakarta Sans", -apple-system, sans-serif',
              minHeight: '750px',
              lineHeight: 1.5
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #1e293b', paddingBottom: '14px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                {profile?.displayName || firebaseUser?.displayName || 'CANDIDATE NAME'}
              </h2>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#4338ca', marginBottom: '4px' }}>
                {targetRole || 'Software Engineer'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <span>{profile?.email || firebaseUser?.email}</span>
                {profile?.github && <span>github.com/{profile.github}</span>}
                {profile?.linkedin && <span>linkedin.com/in/{profile.linkedin}</span>}
                {profile?.username && <span>edworld.co.in/u/{profile.username}</span>}
              </div>
            </div>

            {/* Summary */}
            {summary && (
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', marginBottom: '6px' }}>
                  Professional Summary
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#334155', margin: 0 }}>
                  {summary}
                </p>
              </div>
            )}

            {/* Technical Skills */}
            {skillsText && (
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', marginBottom: '6px' }}>
                  Technical Skills
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#334155', margin: 0 }}>
                  {skillsText}
                </p>
              </div>
            )}

            {/* Proof of Work Projects */}
            {projectsText && (
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', marginBottom: '6px' }}>
                  Engineering Projects & Proof of Work
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#334155', whiteSpace: 'pre-line' }}>
                  {projectsText}
                </div>
              </div>
            )}

            {/* Experience */}
            {experienceText && (
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', marginBottom: '6px' }}>
                  Experience
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#334155', whiteSpace: 'pre-line' }}>
                  {experienceText}
                </div>
              </div>
            )}

            {/* Education */}
            {educationText && (
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', marginBottom: '6px' }}>
                  Education
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#334155', whiteSpace: 'pre-line' }}>
                  {educationText}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLUMN 3: AI ANALYSIS & ATS MATCHER */}
        {/* ========================================================================= */}
        <div 
          className="glass-card resume-col-ai"
          style={{ 
            padding: '20px', 
            display: (mobileTab === 'ai' || window.innerWidth >= 1024) ? 'block' : 'none',
            maxHeight: 'calc(100vh - 180px)',
            overflowY: 'auto'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="var(--emerald)" /> AI Analysis
            </h3>
            <span className="badge badge-success">
              ATS Scanner Active
            </span>
          </div>

          {/* ATS Score Tile */}
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <ScoreRing score={atsAnalysis?.matchScore || 82} size={54} strokeWidth={5} label="ATS Score" />
            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Target Alignment</div>
              <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#fff' }}>
                {targetRole || 'Software Role'}
              </div>
            </div>
          </div>

          {/* Job Matcher Input */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Paste Target Job Description</label>
            <textarea 
              className="form-textarea"
              rows={3}
              placeholder="Paste job description to calculate keyword match & gaps..."
              value={targetJd}
              onChange={(e) => {
                setTargetJd(e.target.value);
                runAtsCheck(summary + ' ' + skillsText + ' ' + projectsText, e.target.value);
              }}
              style={{ fontSize: '0.82rem' }}
            />
          </div>

          {/* Keyword Gaps */}
          {atsAnalysis && (
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Matched Keywords ({atsAnalysis.matchedKeywords?.length || 0})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {atsAnalysis.matchedKeywords?.map((kw, i) => (
                  <span key={i} className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                    ✓ {kw}
                  </span>
                ))}
              </div>

              {atsAnalysis.missingKeywords?.length > 0 && (
                <>
                  <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--amber)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Missing Keywords ({atsAnalysis.missingKeywords.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {atsAnalysis.missingKeywords.map((kw, i) => (
                      <span key={i} className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                        + {kw}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* AI Bullet Point Enhancer */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} /> AI Bullet Point Optimizer
            </h4>
            <input 
              type="text"
              className="form-input"
              placeholder="e.g. Worked on the website frontend..."
              value={bulletToOptimize}
              onChange={(e) => setBulletToOptimize(e.target.value)}
              style={{ fontSize: '0.82rem', marginBottom: '8px' }}
            />
            <button 
              onClick={handleOptimizeBullet}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', padding: '6px', fontSize: '0.78rem' }}
            >
              Optimize with Metrics
            </button>

            {optimizedBullet && (
              <div style={{ marginTop: '10px', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: 'var(--radius-sm)', padding: '10px', fontSize: '0.8rem', color: '#c7d2fe' }}>
                <strong>Enhanced Bullet:</strong>
                <div style={{ marginTop: '4px' }}>{optimizedBullet}</div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Style for Responsive 3-Column Studio */}
      <style>{`
        @media (max-width: 1024px) {
          .resume-grid-container {
            grid-template-columns: 1fr !important;
          }
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .ats-resume-sheet, .ats-resume-sheet * {
            visibility: visible;
          }
          .ats-resume-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
