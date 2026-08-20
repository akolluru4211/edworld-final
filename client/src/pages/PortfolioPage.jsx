import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ExternalLink, 
  Globe, 
  Github, 
  Linkedin, 
  Save, 
  CheckCircle, 
  Layers, 
  Award, 
  FolderGit2, 
  Code,
  Share2,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getUserProjects } from '../services/firestoreService';

export default function PortfolioPage() {
  const { user, userProfile, updateProfileData } = useAuth();
  const { showToast } = useNotification();
  const [projects, setProjects] = useState([]);
  const [bio, setBio] = useState('');
  const [headline, setHeadline] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setBio(userProfile.bio || '');
      setHeadline(userProfile.headline || '');
      setGithub(userProfile.github || '');
      setLinkedin(userProfile.linkedin || '');
      setPortfolioUrl(userProfile.portfolioUrl || '');
    }
    if (user) {
      getUserProjects(user.uid).then(p => setProjects(p));
    }
  }, [user, userProfile]);

  // Calculate Portfolio Quality Index (0 - 100)
  const calculatePQI = () => {
    let pqi = 40;
    if (headline) pqi += 15;
    if (bio && bio.length > 50) pqi += 15;
    if (github && linkedin) pqi += 15;
    if (projects.length >= 1) pqi += 15;
    return Math.min(100, pqi);
  };

  const pqiScore = calculatePQI();

  const handleSavePortfolio = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfileData({
        headline,
        bio,
        github,
        linkedin,
        portfolioUrl
      });
      showToast('Portfolio configuration updated and published! ✨');
    } catch (err) {
      showToast('Failed to save portfolio configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portfolio-page">
      {/* 1. HEADER */}
      <div className="hero-banner" style={{ padding: '36px 32px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99, 102, 241, 0.18)', border: '1px solid rgba(99, 102, 241, 0.35)', padding: '4px 12px', borderRadius: 'var(--radius-full)', marginBottom: '10px' }}>
              <Sparkles size={14} color="var(--primary)" />
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#a5b4fc', textTransform: 'uppercase' }}>
                Developer Showcase OS
              </span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '6px' }}>
              Portfolio Builder
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '640px' }}>
              Customize your public engineering showcase at <strong style={{ color: '#fff' }}>edworld.co.in/u/{userProfile?.username || 'user'}</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to={`/u/${userProfile?.username || 'user'}`} target="_blank" className="btn btn-secondary btn-sm">
              <Eye size={14} /> Live Preview
            </Link>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Left Column: Configuration Form */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            Portfolio Profile Information
          </h3>

          <form onSubmit={handleSavePortfolio}>
            <div className="form-group">
              <label className="form-label">Professional Headline</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Full Stack Developer | Building Scalable Cloud Apps"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bio & Engineering Philosophy</label>
              <textarea 
                className="textarea-field" 
                rows={4}
                placeholder="Share your technical interests, favorite stacks, and what drives your engineering curiosity..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div className="grid-2-even" style={{ gap: '14px', marginBottom: '16px' }}>
              <div>
                <label className="form-label">GitHub URL</label>
                <input 
                  type="url" 
                  className="input-field" 
                  placeholder="https://github.com/yourusername"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">LinkedIn URL</label>
                <input 
                  type="url" 
                  className="input-field" 
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Personal Domain / Website URL (Optional)</label>
              <input 
                type="url" 
                className="input-field" 
                placeholder="https://yourportfolio.dev"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              <Save size={16} /> {loading ? 'Saving...' : 'Save & Publish Portfolio'}
            </button>
          </form>
        </div>

        {/* Right Column: Portfolio Quality Index & Featured Case Studies */}
        <div>
          {/* Quality Index Card */}
          <div className="glass-card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Portfolio Quality Index</h3>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--emerald)' }}>
                {pqiScore} / 100
              </span>
            </div>

            <div className="readiness-meter" style={{ marginBottom: '16px' }}>
              <div className="readiness-fill" style={{ width: `${pqiScore}%` }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: headline ? 'var(--emerald)' : 'var(--text-dim)' }}>
                <CheckCircle size={14} /> Clear Professional Headline (+15)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: bio ? 'var(--emerald)' : 'var(--text-dim)' }}>
                <CheckCircle size={14} /> Comprehensive Engineering Bio (+15)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: github && linkedin ? 'var(--emerald)' : 'var(--text-dim)' }}>
                <CheckCircle size={14} /> GitHub & LinkedIn Verification Links (+15)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: projects.length > 0 ? 'var(--emerald)' : 'var(--text-dim)' }}>
                <CheckCircle size={14} /> Studio Projects Linked (+15)
              </div>
            </div>
          </div>

          {/* Linked Studio Projects */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <h4 style={{ fontWeight: '700', fontSize: '0.98rem' }}>Showcased Projects ({projects.length})</h4>
              <Link to="/studio" className="btn btn-outline btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                Add in Studio
              </Link>
            </div>

            {projects.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                No projects linked yet. Add projects in Studio to feature them in your portfolio.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {projects.slice(0, 3).map(p => (
                  <div key={p.id} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{p.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.tagline}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
