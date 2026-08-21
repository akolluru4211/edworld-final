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
import UserAvatar from '../components/common/UserAvatar';
import { ScoreRing, EmptyState } from '../components/common/UIComponents';

export default function PublicProfilePage() {
  const { username } = useParams();
  const { firebaseUser, profile: currentUserProfile } = useAuth();
  const { showToast } = useNotification();
  const [targetProfile, setTargetProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!username) return;
      setLoading(true);
      try {
        const data = await getPublicProfileByUsername(username);
        setTargetProfile(data);
      } catch (err) {
        console.warn('Error loading public profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [username]);

  const handleConnect = async () => {
    if (!firebaseUser) {
      showToast('Please sign in to connect with peers.', 'info');
      return;
    }
    if (!targetProfile) return;
    try {
      await sendConnectionRequest(
        { uid: firebaseUser.uid, displayName: currentUserProfile?.displayName, headline: currentUserProfile?.headline, photoURL: currentUserProfile?.photoURL },
        { uid: targetProfile.uid, displayName: targetProfile.displayName, photoURL: targetProfile.photoURL }
      );
      setRequested(true);
      showToast(`Connection request sent to ${targetProfile.displayName}! 🎉`);
    } catch (err) {
      showToast('Failed to send connection request.', 'error');
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${targetProfile?.displayName} — EdWorld Career Passport`,
        text: `View @${targetProfile?.username}'s verified developer passport on EdWorld Co.`,
        url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      showToast('Profile link copied to clipboard! 📋');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '28px', height: '28px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!targetProfile) {
    return (
      <div style={{ maxWidth: '540px', margin: '60px auto', textAlign: 'center' }}>
        <EmptyState 
          icon={Compass}
          title="Career Passport Not Found"
          description={`The public profile for @${username} does not exist or has been made private.`}
          actionText="Back to Community"
          actionLink="/networking"
        />
      </div>
    );
  }

  return (
    <div className="public-profile-page" style={{ maxWidth: '980px', margin: '0 auto', paddingBottom: '60px' }}>
      
      {/* 1. HERO PASSPORT BANNER */}
      <div className="hero-banner" style={{ padding: '36px 32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <UserAvatar 
              name={targetProfile.displayName} 
              photoURL={targetProfile.photoURL} 
              size={84} 
            />
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.16)', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '2px 10px', borderRadius: 'var(--radius-full)', marginBottom: '6px' }}>
                <ShieldCheck size={13} color="var(--emerald)" />
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#6ee7b7', textTransform: 'uppercase' }}>
                  Verified Developer
                </span>
              </div>

              <h1 style={{ fontSize: '2.1rem', fontWeight: '800', marginBottom: '4px' }}>
                {targetProfile.displayName}
              </h1>

              <p style={{ color: 'var(--text-body)', fontSize: '0.95rem', maxWidth: '520px', margin: 0 }}>
                {targetProfile.headline || 'Software Engineer'}
              </p>

              <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <span>@{targetProfile.username}</span>
                {targetProfile.college && <span>· {targetProfile.college}</span>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {firebaseUser && firebaseUser.uid !== targetProfile.uid && (
              <button 
                onClick={handleConnect}
                disabled={requested}
                className={`btn ${requested ? 'btn-outline' : 'btn-primary'}`}
              >
                <UserPlus size={15} /> {requested ? 'Request Sent' : 'Connect'}
              </button>
            )}

            <button onClick={handleShare} className="btn btn-secondary btn-icon" title="Share Passport">
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. PROFILE DETAILS GRID */}
      <div className="grid-2">
        
        {/* Left: Bio & Skills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '10px' }}>
              About
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: '1.6', margin: 0 }}>
              {targetProfile.bio || 'No bio provided.'}
            </p>

            {/* Social Links */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
              {targetProfile.github && (
                <a href={`https://github.com/${targetProfile.github}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                  <Github size={14} /> GitHub
                </a>
              )}
              {targetProfile.linkedin && (
                <a href={`https://linkedin.com/in/${targetProfile.linkedin}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                  <Linkedin size={14} /> LinkedIn
                </a>
              )}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '12px' }}>
              Verified Skills
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {targetProfile.skills?.map((s, i) => (
                <span key={i} className="badge badge-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  ✓ {s}
                </span>
              )) || <span style={{ color: 'var(--text-muted)' }}>No skills listed</span>}
            </div>
          </div>
        </div>

        {/* Right: Proof of Work Projects */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '14px' }}>
            Proof of Work Projects ({targetProfile.projects?.length || 0})
          </h3>

          {!targetProfile.projects || targetProfile.projects.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No projects showcased yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {targetProfile.projects.map(proj => (
                <div key={proj.id} style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#fff' }}>{proj.title}</div>
                    {proj.verificationStatus === 'verified' && <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>✓ Verified</span>}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 8px' }}>
                    {proj.tagline || proj.description}
                  </p>
                  {proj.githubRepo && (
                    <a href={proj.githubRepo} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: 'var(--secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Github size={12} /> View Code
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
