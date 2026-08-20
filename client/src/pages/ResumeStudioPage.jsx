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
  Download
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
    const payload = {
      id: selectedResume?.id || `res-${Date.now()}`,
      userId: user.uid,
      title,
      targetRole,
      summary,
      experienceText,
      skillsText,
      projectsText,
      educationText,
      matchScore: analysisResult?.matchScore || 85
    };

    try {
      await saveResume(payload);
      setSelectedResume(payload);
      setResumes(prev => {
        const existing = prev.find(r => r.id === payload.id);
        if (existing) return prev.map(r => r.id === payload.id ? payload : r);
        return [payload, ...prev];
      });
      showToast('ATS Resume saved and updated! 📄');
    } catch (err) {
      showToast('Failed to save resume', 'error');
    }
  };

  const handleRunJdAnalysis = () => {
    const fullResumeText = `${summary} ${experienceText} ${skillsText} ${projectsText} ${educationText}`;
    const skillsList = skillsText.split(',').map(s => s.trim()).filter(Boolean);
    const result = analyzeResumeAgainstJob(fullResumeText, jobDescription, skillsList);
    setAnalysisResult(result);
    showToast(`JD Analysis complete! ATS Match Score: ${result.matchScore}%`, 'success');
  };

  const handleEnhanceBullet = () => {
    if (!rawBullet.trim()) return;
    const enhanced = enhanceResumeBullet(rawBullet);
    setEnhancedBullet(enhanced);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCreateNew = () => {
    const newR = {
      id: `res-${Date.now()}`,
      userId: user.uid,
      title: `Customized Resume (${targetRole})`,
      targetRole: targetRole,
      summary: summary,
      experienceText: experienceText,
      skillsText: skillsText,
      projectsText: projectsText,
      educationText: educationText,
      matchScore: 82
    };
    setSelectedResume(newR);
    setResumes(prev => [newR, ...prev]);
    showToast('New resume version created.');
  };

  return (
    <div className="resume-studio-page">
      {/* 1. HEADER (HIDDEN IN PRINT) */}
      <div className="hero-banner no-print" style={{ padding: '36px 32px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.18)', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '4px 12px', borderRadius: 'var(--radius-full)', marginBottom: '10px' }}>
              <FileText size={14} color="var(--emerald)" />
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#6ee7b7', textTransform: 'uppercase' }}>
                ATS Intelligence Studio
              </span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '6px' }}>
              Resume Studio
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '640px' }}>
              Tailor ATS-compliant resumes with keyword density matching and Google XYZ formula bullet enhancements.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={handleCreateNew} className="btn btn-secondary btn-sm">
              <Plus size={14} /> New Version
            </button>
            <button onClick={handleSave} className="btn btn-secondary btn-sm">
              <Save size={14} /> Save Resume
            </button>
            <button onClick={handlePrint} className="btn btn-primary btn-sm">
              <Printer size={14} /> Print / Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* 2. JD ANALYZER ACCORDION (NO PRINT) */}
      <div className="glass-card no-print" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--secondary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Job Description (JD) Keyword Matcher</h3>
          </div>
          {analysisResult && (
            <span className="badge badge-emerald" style={{ fontSize: '0.85rem' }}>
              {analysisResult.matchScore}% Match
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
          <textarea 
            className="textarea-field" 
            rows={3}
            placeholder="Paste target Job Description (JD) here to calculate keyword match density..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={handleRunJdAnalysis} className="btn btn-primary btn-sm">
            <Sparkles size={14} /> Analyze Match & Missing Keywords
          </button>
        </div>

        {/* Analysis Output */}
        {analysisResult && (
          <div style={{ marginTop: '16px', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div className="grid-2-even" style={{ gap: '16px', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--emerald)', fontWeight: '700', textTransform: 'uppercase' }}>
                  ✓ Matched Keywords ({analysisResult.matchedKeywords.length})
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {analysisResult.matchedKeywords.map((kw, i) => (
                    <span key={i} className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>{kw}</span>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--amber)', fontWeight: '700', textTransform: 'uppercase' }}>
                  ⚠️ Missing JD Keywords ({analysisResult.missingKeywords.length})
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {analysisResult.missingKeywords.map((kw, i) => (
                    <span key={i} className="badge badge-amber" style={{ fontSize: '0.7rem' }}>{kw}</span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <strong>ATS Tips:</strong> {analysisResult.atsSuggestions.join(' · ')}
            </div>
          </div>
        )}
      </div>

      {/* 3. MAIN RESUME WORKSPACE (2 COLS IN APP, FULL IN PRINT) */}
      <div className="grid-2">
        {/* Left Column: Form Editor (no-print) */}
        <div className="glass-card no-print">
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            Resume Content Editor
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
            <label className="form-label">Target Role Headline</label>
            <input 
              type="text" 
              className="input-field" 
              value={targetRole} 
              onChange={(e) => setTargetRole(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Professional Summary</label>
            <textarea 
              className="textarea-field" 
              rows={3} 
              value={summary} 
              onChange={(e) => setSummary(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Technical Skills (comma separated)</label>
            <textarea 
              className="textarea-field" 
              rows={2} 
              value={skillsText} 
              onChange={(e) => setSkillsText(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Work Experience & Fellowships</label>
            <textarea 
              className="textarea-field" 
              rows={5} 
              value={experienceText} 
              onChange={(e) => setExperienceText(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Featured Projects</label>
            <textarea 
              className="textarea-field" 
              rows={5} 
              value={projectsText} 
              onChange={(e) => setProjectsText(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Education</label>
            <textarea 
              className="textarea-field" 
              rows={3} 
              value={educationText} 
              onChange={(e) => setEducationText(e.target.value)} 
            />
          </div>

          {/* AI Bullet Enhancer Tool */}
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)', marginTop: '20px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--secondary)', textTransform: 'uppercase' }}>
              ✨ Google XYZ Bullet Enhancer
            </span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', marginBottom: '8px' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Paste weak bullet: 'built react app with node'..."
                value={rawBullet}
                onChange={(e) => setRawBullet(e.target.value)}
              />
              <button onClick={handleEnhanceBullet} className="btn btn-secondary btn-sm">
                Enhance
              </button>
            </div>
            {enhancedBullet && (
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px 12px', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--emerald)' }}>
                {enhancedBullet}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Clean ATS Resume Preview (Printable) */}
        <div style={{
          background: '#ffffff',
          color: '#111827',
          padding: '40px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          fontFamily: 'var(--font-sans)',
          minHeight: '800px',
          lineHeight: '1.5'
        }}>
          {/* Resume Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #111827', paddingBottom: '16px', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0, color: '#111827' }}>
              {userProfile?.displayName || 'Developer Name'}
            </h1>
            <div style={{ fontSize: '1rem', fontWeight: '600', color: '#4f46e5', marginTop: '4px' }}>
              {targetRole}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#4b5563', marginTop: '4px' }}>
              {userProfile?.email} · {userProfile?.location || 'Remote, Worldwide'} · edworld.co.in/u/{userProfile?.username || 'user'}
            </div>
          </div>

          {/* Summary */}
          {summary && (
            <div style={{ marginBottom: '18px' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: '800', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb', paddingBottom: '3px', marginBottom: '6px', color: '#111827' }}>
                Professional Summary
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#374151' }}>
                {summary}
              </p>
            </div>
          )}

          {/* Technical Skills */}
          {skillsText && (
            <div style={{ marginBottom: '18px' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: '800', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb', paddingBottom: '3px', marginBottom: '6px', color: '#111827' }}>
                Technical Skills
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#374151' }}>
                {skillsText}
              </p>
            </div>
          )}

          {/* Experience */}
          {experienceText && (
            <div style={{ marginBottom: '18px' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: '800', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb', paddingBottom: '3px', marginBottom: '6px', color: '#111827' }}>
                Experience & Fellowships
              </h2>
              <div style={{ fontSize: '0.88rem', color: '#374151', whiteSpace: 'pre-line' }}>
                {experienceText}
              </div>
            </div>
          )}

          {/* Featured Projects */}
          {projectsText && (
            <div style={{ marginBottom: '18px' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: '800', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb', paddingBottom: '3px', marginBottom: '6px', color: '#111827' }}>
                Engineering Projects
              </h2>
              <div style={{ fontSize: '0.88rem', color: '#374151', whiteSpace: 'pre-line' }}>
                {projectsText}
              </div>
            </div>
          )}

          {/* Education */}
          {educationText && (
            <div style={{ marginBottom: '18px' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: '800', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb', paddingBottom: '3px', marginBottom: '6px', color: '#111827' }}>
                Education
              </h2>
              <div style={{ fontSize: '0.88rem', color: '#374151', whiteSpace: 'pre-line' }}>
                {educationText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
