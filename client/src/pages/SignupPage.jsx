import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AtSign, Briefcase, GraduationCap, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { checkUsernameAvailable } from '../services/firestoreService';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [careerGoal, setCareerGoal] = useState('Full Stack Software Engineer');
  const [college, setCollege] = useState('');
  const [skillsInput, setSkillsInput] = useState('React, JavaScript, Node.js');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signupWithEmail, loginWithGoogle } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !username) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      const isAvailable = await checkUsernameAvailable(cleanUsername);
      if (!isAvailable) {
        setError(`Username @${cleanUsername} is already taken. Please choose another.`);
        setLoading(false);
        return;
      }

      const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);

      await signupWithEmail(email, password, name, {
        username: cleanUsername,
        headline: `${careerGoal} Candidate`,
        college: college || 'Engineering College',
        careerGoal,
        skills: skills.length ? skills : ['React', 'JavaScript', 'Node.js']
      });

      showToast('🎉 Welcome to EdWorld Co.! Your Career Passport is ready.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message?.replace('Firebase: ', '') || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      showToast('Welcome to EdWorld Co.! Signed up with Google.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message?.replace('Firebase: ', '') || 'Google sign-up failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px 16px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '520px', padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-block', marginBottom: '10px' }}>
            <BrandLogo size="md" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '6px' }}>Create your Career Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Start building proof of work and your digital career passport.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            color: '#fda4af',
            padding: '12px 14px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Google Signup Button */}
        <button 
          onClick={handleGoogleSignup}
          disabled={loading}
          className="btn btn-secondary"
          style={{ width: '100%', marginBottom: '20px', padding: '12px', display: 'flex', justifyContent: 'center', gap: '10px', fontSize: '0.92rem' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Sign up with Google</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          <span>OR REGISTER WITH DETAILS</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        </div>

        <form onSubmit={handleSignup}>
          <div className="grid-2-even" style={{ gap: '14px', marginBottom: '14px' }}>
            <div>
              <label className="form-label">Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                <input 
                  type="text" 
                  className="input-field" 
                  style={{ paddingLeft: '40px' }}
                  required
                  placeholder="Adarsh Kolluru"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!username) {
                      setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                    }
                  }}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Username *</label>
              <div style={{ position: 'relative' }}>
                <AtSign size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                <input 
                  type="text" 
                  className="input-field" 
                  style={{ paddingLeft: '40px' }}
                  required
                  placeholder="adarshk"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input 
                type="email" 
                className="input-field" 
                style={{ paddingLeft: '40px' }}
                required
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password * (6+ chars)</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input 
                type="password" 
                className="input-field" 
                style={{ paddingLeft: '40px' }}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="grid-2-even" style={{ gap: '14px', marginBottom: '14px' }}>
            <div>
              <label className="form-label">Career Target</label>
              <select 
                className="select-field"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
              >
                <option value="Full Stack Software Engineer">Full Stack Engineer</option>
                <option value="Frontend Engineer">Frontend Engineer</option>
                <option value="Backend & Cloud Engineer">Backend Engineer</option>
                <option value="AI / ML Engineer">AI / ML Engineer</option>
                <option value="DevOps & Cloud Architect">DevOps Engineer</option>
                <option value="Mobile App Developer">Mobile App Developer</option>
              </select>
            </div>

            <div>
              <label className="form-label">College / University</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. GITAM University"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Core Skills (comma separated)</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. React, Node.js, TypeScript, Python"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '10px', padding: '12px' }}
          >
            {loading ? 'Creating Career Passport...' : 'Create Account'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
