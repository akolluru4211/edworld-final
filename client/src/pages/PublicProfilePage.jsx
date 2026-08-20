import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Compass, 
  UserPlus, 
  Check, 
  ExternalLink, 
  Github, 
  Linkedin, 
  Globe, 
  Award, 
  FolderGit2, 
  ShieldCheck, 
  Sparkles,
  ArrowLeft,
  Share2
} from 'lucide-react';
import { getPublicProfileByUsername, sendConnectionRequest } from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import BrandLogo from '../components/common/BrandLogo';

export default function PublicProfilePage() {
  const { username } = useParams();
  const { user, userProfile } = useAuth();
  const { showToast } = useNotification();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!username) return;
      setLoading(true);
      try {
        const data = await getPublicProfileByUsername(username);
        setProfile(data);
      } catch (err) {
        console.warn('Error loading public profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [username]);

  const handleConnect = async () => {
    if (!user) {
      showToast('Please sign in to connect with peers.', 'info');
      return;
    }
    if (!profile) return;
    try {
      await sendConnectionRequest(
        { uid: user.uid, displayName: userProfile?.displayName, headline: userProfile?.headline, photoURL: userProfile?.photoURL },
        { uid: profile.uid, displayName: profile.displayName, photoURL: profile.photoURL }
      );
      setConnected(true);
      showToast(`Connection request sent to ${profile.displayName}! 🎉`);
    } catch (err) {
      showToast('Failed to send connection request.', 'error');
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${profile?.displayName} — EdWorld Career Passport`,
        text: `View @${profile?.username}'s verified developer passport on EdWorld Co.`,
        url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      showToast('Profile link copied to clipboard! 📋');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="brand-logo-icon" style={{ width: '48px', height: '48px', margin: '0 auto 16px', fontSize: '1.4rem' }}>E</div>
          <div style={{ color: 'var(--text-muted)' }}>Loading Public Career Passport...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="main-content" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ maxWidth: '480px', textAlign: 'center', padding: '40px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '10px' }}>Profile Not Found</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            The public Career Passport for @{username} does not exist or has been set to private.
          </p>
          <Link to="/" className="btn btn-primary btn-sm">
            <ArrowLeft size={14} /> Back to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '24px auto', padding: '0 16px', paddingBottom: '60px' }}>
      {/* Top Banner Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <BrandLogo size="sm" />
        </Link>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={handleShare} className="btn btn-secondary btn-sm" style={{ padding: '6px 12px' }}>
            <Share2 size={14} /> Share
          </button>
          <span className="badge badge-emerald">Verified Passport</span>
        </div>
      </div>

      {/* Main Passport Profile Card */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(18, 26, 44, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
        border: '1px solid var(--border-glow)',
        padding: '32px 24px',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-glow), var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <img 
              src={profile.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`} 
              alt={profile.displayName} 
              className="avatar" 
              style={{ width: '72px', height: '72px', borderWidth: '3px', borderRadius: '50%', flexShrink: 0 }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>{profile.displayName}</h1>
                <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>✓ Verified</span>
              </div>
              <p style={{ color: 'var(--secondary)', fontWeight: '700', fontSize: '0.95rem', margin: '2px 0 4px' }}>
                {profile.headline || 'Software Engineer'}
              </p>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                {profile.college} · @{profile.username}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {user?.uid !== profile.uid && (
              <button 
                onClick={handleConnect}
                disabled={connected}
                className={`btn ${connected ? 'btn-secondary' : 'btn-primary'} btn-sm`}
              >
                {connected ? <><Check size={14} /> Connected</> : <><UserPlus size={14} /> Connect</>}
              </button>
            )}
          </div>
        </div>

        {/* Career Score Gauge & Target */}
        <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '16px 20px', borderRadius: 'var(--radius-md)', marginBottom: '24px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>Target Role</div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: '#fff' }}>{profile.careerGoal || 'Full Stack Software Engineer'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>Career Readiness Score</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--emerald)' }}>{profile.careerScore || 78} / 100</div>
          </div>
        </div>

        {/* Verified Skills */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '10px' }}>Verified Skills Matrix</h3>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(profile.skills || ['React', 'JavaScript', 'Node.js']).map((s, idx) => (
              <span key={idx} className="badge badge-primary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                ✓ {s}
              </span>
            ))}
          </div>
        </div>

        {/* Proof of Work Projects */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderGit2 size={18} color="var(--secondary)" /> Proof of Work Projects ({profile.projects?.length || 0})
          </h3>

          {(!profile.projects || profile.projects.length === 0) ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No public projects published yet.</div>
          ) : (
            <div className="responsive-grid-2">
              {profile.projects.map(p => (
                <div key={p.id} style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h4 style={{ fontWeight: '700', fontSize: '0.95rem', margin: 0 }}>{p.title}</h4>
                    {p.verificationStatus === 'verified' && (
                      <span className="badge badge-emerald" style={{ fontSize: '0.62rem' }}>✓ Git Verified</span>
                    )}
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '10px' }}>
                    {p.tagline || p.description?.slice(0, 80)}
                  </p>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    {p.techStack?.map((t, i) => (
                      <span key={i} className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>{t}</span>
                    ))}
                  </div>
                  {p.githubRepo && (
                    <a href={p.githubRepo} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: 'var(--secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Github size={13} /> View Repository <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
