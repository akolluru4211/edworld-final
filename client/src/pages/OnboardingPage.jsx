const fs = require('fs');

const onboardingCode = `import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { 
  User, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ArrowLeft,
  GraduationCap, 
  Target, 
  Code2, 
  BookOpen, 
  Layers, 
  Briefcase,
  AlertCircle,
  Github,
  Linkedin,
  Globe,
  MapPin,
  Eye,
  ShieldCheck,
  Cpu,
  Database,
  Cloud,
  Terminal,
  Check
} from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';
import AuthLoadingScreen from '../components/common/AuthLoadingScreen';
import UserAvatar from '../components/common/UserAvatar';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { checkUsernameAvailable } from '../services/firestoreService';

const ROLE_TRACKS = [
  { id: 'fullstack', label: 'Full Stack Engineer', icon: Layers, desc: 'Web apps, APIs, client-server architectures' },
  { id: 'backend', label: 'Backend & Systems', icon: Database, desc: 'Distributed systems, high-scale services, DBs' },
  { id: 'frontend', label: 'Frontend Specialist', icon: Code2, desc: 'UI architecture, web performance, component systems' },
  { id: 'aiml', label: 'AI / Machine Learning', icon: Cpu, desc: 'LLMs, RAG, PyTorch, model deployment & MLOps' },
  { id: 'cloud', label: 'Cloud & DevOps', icon: Cloud, desc: 'Kubernetes, CI/CD, AWS/GCP, infrastructure as code' }
];

const SKILL_DOMAINS = {
  'Languages & Frameworks': ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Next.js', 'Express', 'Java', 'C++', 'Go'],
  'Databases & Backend': ['PostgreSQL', 'MongoDB', 'Redis', 'Firebase', 'GraphQL', 'REST APIs', 'SQL', 'Prisma'],
  'Architecture & Cloud': ['Docker', 'AWS', 'Kubernetes', 'CI/CD Pipelines', 'System Design', 'Git', 'Linux', 'Microservices'],
  'AI & Data Science': ['PyTorch', 'TensorFlow', 'Vector DBs', 'LLMs', 'LangChain', 'Pandas', 'Data Structures']
};

const DEGREES = [
  'B.Tech / B.E.',
  'B.S. in Computer Science',
  'BCA / MCA',
  'M.S. / M.Tech in CS',
  'B.Sc. Information Technology',
  'Self-Taught / Bootcamp Graduate'
];

export default function OnboardingPage() {
  const { 
    firebaseUser, 
    profile, 
    authLoading, 
    profileLoading, 
    isProfileComplete, 
    completeOnboarding 
  } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  // Wizard Step: 1 | 2 | 3 | 4
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [headline, setHeadline] = useState('Aspiring Software Engineer & Problem Solver');
  const [roleTrack, setRoleTrack] = useState('Full Stack Engineer');
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('B.Tech / B.E.');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [gradYear, setGradYear] = useState('2026');
  const [location, setLocation] = useState('');
  const [careerGoal, setCareerGoal] = useState('Full Stack Software Engineer');
  const [skills, setSkills] = useState(['React', 'JavaScript', 'Node.js']);
  const [customSkill, setCustomSkill] = useState('');
  const [bio, setBio] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [networkVisibility, setNetworkVisibility] = useState(true);
  const [privacy, setPrivacy] = useState('public');
  const [photoURL, setPhotoURL] = useState('');

  // Validation & Loading
  const [usernameStatus, setUsernameStatus] = useState(null); // 'checking' | 'available' | 'taken' | 'invalid'
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Prefill from Firebase Auth session
  useEffect(() => {
    if (firebaseUser) {
      setDisplayName(firebaseUser.displayName || '');
      setPhotoURL(firebaseUser.photoURL || '');
      
      const baseUser = (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'dev')
        .replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 15);
      setUsername(baseUser);
    }
  }, [firebaseUser]);

  // Username validation debounce
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameStatus('invalid');
      return;
    }
    const timer = setTimeout(async () => {
      setUsernameStatus('checking');
      try {
        const isAvailable = await checkUsernameAvailable(username);
        setUsernameStatus(isAvailable ? 'available' : 'taken');
      } catch (err) {
        setUsernameStatus('available');
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username]);

  // Declarative Redirect guards:
  if (authLoading || profileLoading) {
    return <AuthLoadingScreen message="Checking profile status..." />;
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  if (isProfileComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleToggleSkill = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else if (skills.length < 15) {
      setSkills([...skills, skill]);
    }
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    const clean = customSkill.trim();
    if (clean && !skills.includes(clean) && skills.length < 15) {
      setSkills([...skills, clean]);
      setCustomSkill('');
    }
  };

  const validateStep = (step) => {
    setError('');
    if (step === 1) {
      if (!displayName.trim()) {
        setError('Please provide your full legal name.');
        return false;
      }
      if (!username.trim() || username.length < 3) {
        setError('Username must be at least 3 alphanumeric characters.');
        return false;
      }
      if (usernameStatus === 'taken') {
        setError(\`Handle @\${username} is already taken. Please choose another.\`);
        return false;
      }
    }
    if (step === 2) {
      if (!college.trim()) {
        setError('Please enter your University or College name.');
        return false;
      }
    }
    if (step === 3) {
      if (skills.length < 2) {
        setError('Please select at least 2 core technical skills.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(4, prev + 1));
    }
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;

    setSubmitting(true);
    setError('');
    try {
      await completeOnboarding({
        displayName: displayName.trim(),
        username: username.toLowerCase().trim(),
        headline: headline.trim() || \`\${roleTrack} Engineer\`,
        roleTrack,
        college: college.trim(),
        degree,
        branch: branch.trim(),
        gradYear,
        location: location.trim(),
        careerGoal: careerGoal || roleTrack,
        skills,
        bio: bio.trim(),
        github: github.trim().replace(/^https?:\\/\\/github\\.com\\//, ''),
        linkedin: linkedin.trim().replace(/^https?:\\/\\/linkedin\\.com\\/in\\//, ''),
        portfolioUrl: portfolioUrl.trim(),
        networkVisibility,
        privacy,
        photoURL: photoURL || '',
        careerScore: 80
      });

      showToast('🎉 Welcome to EdWorld Co.! Your Executive Career Profile is activated.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Onboarding submission error:', err);
      setError(err.message || 'Failed to complete profile setup. Please verify your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Developer Identity' },
    { num: 2, title: 'Institutional Base' },
    { num: 3, title: 'Technical Matrix' },
    { num: 4, title: 'Career Benchmarks' }
  ];

  return (
    <div style={{ minHeight: '90vh', padding: '40px 16px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '900px' }}>
        
        {/* Top Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-block', marginBottom: '12px' }}>
            <BrandLogo size="md" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '6px' }}>
            Executive Developer Onboarding
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '560px', margin: '0 auto' }}>
            Initialize your proof-of-work career passport, skills matrix, and verified engineering telemetry.
          </p>
        </div>

        {/* Stepper Navigation Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '18px', left: '40px', right: '40px', height: '2px', background: 'var(--border-subtle)', zIndex: 0 }} />
          
          {steps.map(s => {
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <div key={s.num} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: isDone ? 'var(--emerald)' : isCurrent ? 'var(--primary)' : '#0f172a',
                  border: isCurrent ? '2px solid #818cf8' : '2px solid var(--border-medium)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  boxShadow: isCurrent ? '0 0 16px rgba(99,102,241,0.5)' : 'none',
                  transition: 'var(--transition-fast)'
                }}>
                  {isDone ? <Check size={16} /> : s.num}
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: isCurrent ? '800' : '600', color: isCurrent ? '#fff' : 'var(--text-muted)' }}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            color: '#fda4af',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '0.88rem',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Wizard Body with Dual Card Preview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 300px', gap: '24px', alignItems: 'start' }} className="onboarding-grid">
          
          {/* Main Intake Form Card */}
          <div className="glass-card" style={{ padding: '32px' }}>
            
            {/* STEP 1: IDENTITY & UNIQUE HANDLE */}
            {currentStep === 1 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                  <User size={20} color="var(--primary)" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>Step 1: Engineering Identity</h3>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required
                    placeholder="e.g. Adarsh Kolluru"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label className="form-label">Claim Unique Developer Handle (@username) *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)', fontWeight: '700' }}>@</span>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ paddingLeft: '32px', paddingRight: '40px' }}
                      required
                      placeholder="handle"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    />
                    <div style={{ position: 'absolute', right: '12px', top: '14px' }}>
                      {usernameStatus === 'checking' && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>checking...</span>}
                      {usernameStatus === 'available' && <CheckCircle2 size={18} color="var(--emerald)" />}
                      {usernameStatus === 'taken' && <XCircle size={18} color="var(--rose)" />}
                    </div>
                  </div>
                  {usernameStatus === 'available' && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--emerald)', marginTop: '4px' }}>
                      ✓ Unique handle @{username} is available
                    </div>
                  )}
                  {usernameStatus === 'taken' && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--rose)', marginTop: '4px' }}>
                      ✕ Handle @{username} is already claimed
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label className="form-label">Primary Role Track</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                    {ROLE_TRACKS.map(rt => {
                      const Icon = rt.icon;
                      const isSel = roleTrack === rt.label;
                      return (
                        <div 
                          key={rt.id} 
                          onClick={() => { setRoleTrack(rt.label); setCareerGoal(rt.label); }}
                          style={{
                            background: isSel ? 'rgba(99, 102, 241, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                            border: isSel ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            padding: '12px',
                            cursor: 'pointer',
                            transition: 'var(--transition-fast)'
                          }}
                        >
                          <Icon size={18} color={isSel ? 'var(--primary)' : 'var(--text-muted)'} style={{ marginBottom: '6px' }} />
                          <div style={{ fontWeight: '800', fontSize: '0.82rem', color: isSel ? '#fff' : 'var(--text-body)' }}>{rt.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label className="form-label">Professional Headline *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required
                    placeholder="e.g. Full Stack Developer | Distributed Systems Builder"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* STEP 2: INSTITUTIONAL FOUNDATION */}
            {currentStep === 2 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                  <GraduationCap size={20} color="var(--secondary)" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>Step 2: Academic & Institutional Foundation</h3>
                </div>

                <div className="form-group">
                  <label className="form-label">University / College Name *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required
                    placeholder="e.g. Indian Institute of Technology / Stanford University"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                  />
                </div>

                <div className="grid-2" style={{ marginTop: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Degree</label>
                    <select className="form-select" value={degree} onChange={(e) => setDegree(e.target.value)}>
                      {DEGREES.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Graduation Year</label>
                    <select className="form-select" value={gradYear} onChange={(e) => setGradYear(e.target.value)}>
                      {['2024', '2025', '2026', '2027', '2028', '2029'].map(yr => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid-2" style={{ marginTop: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Branch / Major</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Computer Science & Engineering"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Location (City, Country)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Bengaluru, India / San Francisco, CA"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: TECHNICAL COMPETENCY MATRIX */}
            {currentStep === 3 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                  <Code2 size={20} color="var(--emerald)" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>Step 3: Technical Skills Matrix ({skills.length}/15 selected)</h3>
                </div>

                {/* Active Skill Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
                  {skills.map(skill => (
                    <span 
                      key={skill} 
                      className="badge badge-primary"
                      style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      {skill}
                      <button 
                        type="button" 
                        onClick={() => handleToggleSkill(skill)}
                        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                {/* Categorized Domains */}
                {Object.entries(SKILL_DOMAINS).map(([category, catSkills]) => (
                  <div key={category} style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      {category}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {catSkills.map(sk => {
                        const isSelected = skills.includes(sk);
                        return (
                          <button
                            key={sk}
                            type="button"
                            onClick={() => handleToggleSkill(sk)}
                            style={{
                              background: isSelected ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                              border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                              color: isSelected ? '#ffffff' : 'var(--text-body)',
                              padding: '5px 12px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              transition: 'var(--transition-fast)'
                            }}
                          >
                            {isSelected ? '✓ ' : '+ '}{sk}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Add Custom Skill */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Add other technical skill (e.g. Rust, Kafka, Redis)..."
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                  />
                  <button type="button" onClick={handleAddCustomSkill} className="btn btn-secondary btn-sm">
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: CAREER GOALS & PROOF REPOSITORIES */}
            {currentStep === 4 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                  <Target size={20} color="#c084fc" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>Step 4: Goals, Links & Elevator Pitch</h3>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">GitHub Profile</label>
                    <div style={{ position: 'relative' }}>
                      <Github size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                      <input 
                        type="text" 
                        className="form-input" 
                        style={{ paddingLeft: '36px' }}
                        placeholder="github-username"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">LinkedIn Handle / Profile</label>
                    <div style={{ position: 'relative' }}>
                      <Linkedin size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                      <input 
                        type="text" 
                        className="form-input" 
                        style={{ paddingLeft: '36px' }}
                        placeholder="in/username"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label className="form-label">Developer Bio & Executive Pitch</label>
                  <textarea 
                    className="form-textarea"
                    rows={3}
                    placeholder="Describe your engineering focus, high-impact projects, or technical passions..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                <div style={{ marginTop: '18px', background: 'rgba(15, 23, 42, 0.8)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input 
                    type="checkbox" 
                    id="networkVis" 
                    checked={networkVisibility} 
                    onChange={(e) => setNetworkVisibility(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="networkVis" style={{ fontSize: '0.84rem', color: 'var(--text-body)', cursor: 'pointer', margin: 0 }}>
                    Enable discoverability in the <strong>EdWorld Peer Network</strong> directory for squad collaboration.
                  </label>
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
              {currentStep > 1 ? (
                <button type="button" onClick={prevStep} className="btn btn-secondary btn-sm">
                  <ArrowLeft size={16} /> Back
                </button>
              ) : <div />}

              {currentStep < 4 ? (
                <button type="button" onClick={nextStep} className="btn btn-primary">
                  Continue <ArrowRight size={16} />
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={submitting} className="btn btn-primary btn-lg">
                  {submitting ? 'Activating Profile...' : 'Complete Setup & Open Dashboard'} <Sparkles size={16} />
                </button>
              )}
            </div>

          </div>

          {/* Right Live Passport Card Preview */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Live Passport Preview
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <UserAvatar name={displayName || 'Developer'} photoURL={photoURL} size={56} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: '800', fontSize: '1rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {displayName || 'Your Full Name'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '700' }}>
                  @{username || 'handle'}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.84rem', color: 'var(--text-body)', marginTop: '4px' }}>
              {headline || 'Aspiring Software Engineer'}
            </div>

            {college && (
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                🎓 {degree} · {college}
              </div>
            )}

            {skills.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '6px' }}>
                {skills.slice(0, 5).map(sk => (
                  <span key={sk} className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                    {sk}
                  </span>
                ))}
                {skills.length > 5 && (
                  <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                    +{skills.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

      <style>{\`
        @media (max-width: 820px) {
          .onboarding-grid {
            grid-template-columns: 1fr !important;
          }
        }
      \`}</style>
    </div>
  );
}
`;

fs.writeFileSync('E:/edworldco/client/src/pages/OnboardingPage.jsx', onboardingCode, 'utf8');
console.log('OnboardingPage.jsx written successfully!');
`;

fs.writeFileSync('C:/Users/adars/.gemini/antigravity/brain/59af2ed0-1102-48fa-a5f2-e3defb203860/scratch/build_executive_onboarding.js', onboardingCode, 'utf8');
