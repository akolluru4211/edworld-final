import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  GraduationCap, 
  Target, 
  Code2, 
  BookOpen, 
  Layers, 
  Briefcase,
  AlertCircle
} from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';
import AuthLoadingScreen from '../components/common/AuthLoadingScreen';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { checkUsernameAvailable } from '../services/firestoreService';

const SUGGESTED_SKILLS = [
  'React', 'JavaScript', 'TypeScript', 'Node.js', 'Python',
  'Firebase', 'Tailwind CSS', 'Next.js', 'PostgreSQL', 'MongoDB',
  'Docker', 'AWS', 'System Design', 'Data Structures & Algorithms',
  'Git', 'REST APIs', 'GraphQL', 'Express', 'Java', 'C++'
];

const CAREER_GOALS = [
  'Full Stack Software Engineer',
  'Frontend Specialist',
  'Backend & Distributed Systems',
  'AI / Machine Learning Engineer',
  'Cloud & DevOps Engineer',
  'Mobile App Developer (React Native / Flutter)',
  'Data Engineer & Analytics',
  'Cybersecurity Specialist'
];

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

  // Form State
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [headline, setHeadline] = useState('');
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('B.Tech / B.E.');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [gradYear, setGradYear] = useState('2026');
  const [careerGoal, setCareerGoal] = useState('Full Stack Software Engineer');
  const [skills, setSkills] = useState(['React', 'JavaScript', 'Node.js']);
  const [customSkill, setCustomSkill] = useState('');
  const [bio, setBio] = useState('');
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
      setHeadline('Aspiring Software Engineer & Problem Solver');
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
    }, 400);

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

  const handleAddSkill = (skill) => {
    if (!skills.includes(skill) && skills.length < 12) {
      setSkills([...skills, skill]);
    }
  };

  const handleRemoveSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    if (customSkill.trim() && !skills.includes(customSkill.trim()) && skills.length < 12) {
      setSkills([...skills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!displayName.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!username.trim() || username.length < 3) {
      setError('Username must be at least 3 alphanumeric characters.');
      return;
    }
    if (usernameStatus === 'taken') {
      setError(`Username @${username} is already taken. Please choose another.`);
      return;
    }
    if (!college.trim()) {
      setError('Please provide your College or University name.');
      return;
    }
    if (skills.length === 0) {
      setError('Please select at least 2 technical skills.');
      return;
    }

    setSubmitting(true);
    try {
      await completeOnboarding({
        displayName: displayName.trim(),
        username: username.toLowerCase().trim(),
        headline: headline.trim() || 'Software Engineer',
        college: college.trim(),
        degree,
        branch,
        gradYear,
        careerGoal,
        skills,
        bio: bio.trim(),
        photoURL: photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
        careerScore: 68
      });

      showToast('🎉 Welcome to EdWorld Co.! Your Career Identity is activated.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Onboarding submission error:', err);
      setError(err.message || 'Failed to complete profile setup. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '90vh', padding: '40px 16px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '780px' }}>
        
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ display: 'inline-block', marginBottom: '14px' }}>
            <BrandLogo size="md" />
          </div>
          <div className="badge badge-primary" style={{ display: 'inline-flex', gap: '6px', marginBottom: '12px' }}>
            <Sparkles size={14} /> STEP 1 OF 1: ACTIVATE CAREER IDENTITY
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>
            Complete your EdWorld Career Profile
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '540px', margin: '0 auto' }}>
            Set up your verified developer identity, career passport, and technical skills matrix.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            color: '#fda4af',
            padding: '14px 18px',
            borderRadius: '12px',
            fontSize: '0.9rem',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Onboarding Card */}
        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '36px' }}>
          
          {/* Section 1: Developer Identity */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <User size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0 }}>1. Developer Identity</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required
                  placeholder="e.g. Adarsh Kolluru"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Claim Unique Handle (@username) *
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)', fontWeight: '700' }}>@</span>
                  <input 
                    type="text" 
                    className="input-field" 
                    style={{ paddingLeft: '32px', paddingRight: '40px' }}
                    required
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  />
                  <div style={{ position: 'absolute', right: '12px', top: '14px' }}>
                    {usernameStatus === 'checking' && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>checking...</span>
                    )}
                    {usernameStatus === 'available' && (
                      <CheckCircle2 size={18} color="var(--success)" />
                    )}
                    {usernameStatus === 'taken' && (
                      <XCircle size={18} color="var(--danger)" />
                    )}
                  </div>
                </div>
                {usernameStatus === 'available' && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--success)', marginTop: '4px' }}>
                    ✓ Handle @{username} is available
                  </div>
                )}
                {usernameStatus === 'taken' && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--danger)', marginTop: '4px' }}>
                    ✕ Handle @{username} is already reserved
                  </div>
                )}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Professional Headline *</label>
              <input 
                type="text" 
                className="input-field" 
                required
                placeholder="e.g. Full Stack Developer & Open Source Contributor"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
            </div>
          </div>

          {/* Section 2: Education & Academic Focus */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <GraduationCap size={20} color="var(--secondary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0 }}>2. Education & Institution</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">College / University Name *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required
                  placeholder="e.g. Indian Institute of Technology / Stanford University"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Degree *</label>
                <select 
                  className="input-field"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                >
                  {DEGREES.map(d => (
                    <option key={d} value={d} style={{ background: '#0f172a', color: '#fff' }}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '16px' }}>
              <div className="form-group">
                <label className="form-label">Branch / Major</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Computer Science & Engineering"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expected Graduation Year</label>
                <select 
                  className="input-field"
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                >
                  {['2024', '2025', '2026', '2027', '2028'].map(yr => (
                    <option key={yr} value={yr} style={{ background: '#0f172a', color: '#fff' }}>{yr}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Target Career & Tech Stack */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <Target size={20} color="var(--accent)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0 }}>3. Target Career & Technical Skills</h3>
            </div>

            <div className="form-group">
              <label className="form-label">Primary Career Goal *</label>
              <select 
                className="input-field"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
              >
                {CAREER_GOALS.map(cg => (
                  <option key={cg} value={cg} style={{ background: '#0f172a', color: '#fff' }}>{cg}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">
                Technical Skills ({skills.length}/12 selected) *
              </label>

              {/* Active Skill Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                {skills.map(skill => (
                  <span 
                    key={skill} 
                    className="badge badge-primary"
                    style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    {skill}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSkill(skill)}
                      style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, fontSize: '0.9rem', lineHeight: 1 }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Quick Suggestion Pills */}
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Click to add popular skills:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                {SUGGESTED_SKILLS.filter(s => !skills.includes(s)).slice(0, 10).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAddSkill(s)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-muted)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    + {s}
                  </button>
                ))}
              </div>

              {/* Add Custom Skill Input */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Type another skill (e.g. Next.js, Redis, Rust)"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button 
                  type="button" 
                  onClick={handleAddCustomSkill}
                  className="btn btn-secondary"
                  style={{ padding: '0 18px', fontSize: '0.88rem' }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Short Bio */}
          <div style={{ marginBottom: '32px' }}>
            <div className="form-group">
              <label className="form-label">Bio / Career Pitch</label>
              <textarea 
                className="input-field" 
                rows="3"
                placeholder="Briefly describe what you are building, your engineering interests, or what roles you are pursuing..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={submitting}
            className="btn btn-primary" 
            style={{ width: '100%', padding: '16px', fontSize: '1.05rem', fontWeight: '700', display: 'flex', justifyContent: 'center', gap: '10px' }}
          >
            {submitting ? 'Creating Career Identity...' : 'Activate Career Identity & Enter Dashboard'} <ArrowRight size={18} />
          </button>
        </form>

      </div>
    </div>
  );
}
