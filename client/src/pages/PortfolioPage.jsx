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
  Eye,
  Edit3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getUserProjects } from '../services/firestoreService';
import { PageHeader } from '../components/common/UIComponents';
import UserAvatar from '../components/common/UserAvatar';

export default function PortfolioPage() {
  const { firebaseUser, profile, updateProfileData } = useAuth();
  const { showToast } = useNotification();
  const [projects, setProjects] = useState([]);
  const [bio, setBio] = useState('');
  const [headline, setHeadline] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Mobile segmented tab: 'editor' | 'preview'
  const [mobileTab, setMobileTab] = useState('editor');

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || '');
      setHeadline(profile.headline || '');
      setGithub(profile.github || '');
      setLinkedin(profile.linkedin || '');
      setPortfolioUrl(profile.portfolioUrl || '');
    }
    if (firebaseUser) {
      getUserProjects(firebaseUser.uid).then(p => setProjects(p || []));
    }
  }, [firebaseUser, profile]);

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

  const username = profile?.username || 'user';
  const publicUrl = `/u/${username}`;

  return (
    <div className="portfolio-page" style={{ paddingBottom: '50px' }}>
      
      {/* 1. HEADER */}
      <PageHeader 
        badge="Developer Portfolio Builder"
        title="Developer Portfolio & Public Showcase"
        description={`Customize your verified public developer passport at edworld.co.in/u/${username}`}
        action={
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to={publicUrl} target="_blank" className="btn btn-secondary btn-sm">
              <Eye size={14} /> View Live Profile
            </Link>
          </div>
        }
      />

      {/* 2. MOBILE TAB SELECTOR */}
      <div className="show-on-mobile" style={{ marginBottom: '18px' }}>
        <div className="nav-tabs" style={{ width: '100%', justifyContent: 'space-around' }}>
          <button 
            onClick={() => setMobileTab('editor')}
            className={`nav-tab ${mobileTab === 'editor' ? 'active' : ''}`}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Edit3 size={14} /> Content Editor
          </button>
          <button 
            onClick={() => setMobileTab('preview')}
            className={`nav-tab ${mobileTab === 'preview' ? 'active' : ''}`}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Eye size={14} /> Live Preview
          </button>
        </div>
      </div>

      {/* 3. SPLIT WORKSPACE: EDITOR (LEFT) | LIVE PREVIEW (RIGHT) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1fr) minmax(420px, 1.2fr)',
        gap: '24px',
        alignItems: 'start'
      }} className="portfolio-split-grid">
        
        {/* LEFT COLUMN: PORTFOLIO CONFIG EDITOR */}
        <div 
          className="glass-card" 
          style={{ 
            padding: '24px',
            display: (mobileTab === 'editor' || window.innerWidth >= 1024) ? 'block' : 'none'
          }}
        >
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '18px' }}>
            Showcase Content
          </h3>

          <form onSubmit={handleSavePortfolio}>
            <div className="form-group">
              <label className="form-label">Professional Headline</label>
              <input 
                type="text"
                className="form-input"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Full Stack Developer | Distributed Systems & React"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Developer Bio & Story</label>
              <textarea 
                className="form-textarea"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your engineering focus, passion projects, and technical journey..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">GitHub Username</label>
              <input 
                type="text"
                className="form-input"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="e.g. octocat"
              />
            </div>

            <div className="form-group">
              <label className="form-label">LinkedIn Username / URL</label>
              <input 
                type="text"
                className="form-input"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="e.g. in/username"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Custom External Domain / Website</label>
              <input 
                type="url"
                className="form-input"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://mysite.com"
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              <Save size={15} /> {loading ? 'Saving...' : 'Save & Publish Portfolio'}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: LIVE INTERACTIVE PREVIEW */}
        <div 
          className="glass-card" 
          style={{ 
            padding: '28px',
            display: (mobileTab === 'preview' || window.innerWidth >= 1024) ? 'block' : 'none',
            background: 'linear-gradient(180deg, rgba(18, 26, 44, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
            border: '1px solid var(--border-glow)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
              ● Live Preview at edworld.co.in/u/{username}
            </span>
            <Link to={publicUrl} target="_blank" className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: '0.78rem' }}>
              Open <ExternalLink size={13} />
            </Link>
          </div>

          {/* Profile Header Preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '20px' }}>
            <UserAvatar 
              name={profile?.displayName} 
              photoURL={profile?.photoURL} 
              size={68} 
            />
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff' }}>
                {profile?.displayName || 'Your Name'}
              </h2>
              <div style={{ fontSize: '0.88rem', color: 'var(--secondary)', fontWeight: '700' }}>
                {headline || 'Aspiring Software Engineer'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {profile?.college || 'Institution'}
              </div>
            </div>
          </div>

          {/* Bio Preview */}
          {bio && (
            <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: '1.6', marginBottom: '20px' }}>
              {bio}
            </p>
          )}

          {/* Skills Badges */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Verified Skills Matrix
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {profile?.skills?.map((s, i) => (
                <span key={i} className="badge badge-primary" style={{ fontSize: '0.74rem' }}>
                  ✓ {s}
                </span>
              )) || <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>No skills added</span>}
            </div>
          </div>

          {/* Projects Preview */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
              Proof of Work Showcase ({projects.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {projects.slice(0, 3).map(p => (
                <div key={p.id} style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#fff' }}>{p.title}</div>
                    {p.verificationStatus === 'verified' && <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>✓ Verified</span>}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {p.techStack?.join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 1024px) {
          .portfolio-split-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
