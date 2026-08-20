import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  ExternalLink, 
  Bookmark, 
  Check, 
  Sparkles, 
  ArrowRight,
  DollarSign,
  Plus,
  X,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getJobs, createApplication } from '../services/firestoreService';

export default function JobsPage() {
  const { user, userProfile } = useAuth();
  const { showToast } = useNotification();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const list = await getJobs({ search: searchTerm, type: categoryFilter, remoteOnly });
      setJobs(list || []);
    } catch (err) {
      console.warn('Error loading jobs:', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, [categoryFilter, remoteOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOpportunities();
  };

  const handleSaveOpportunity = (jobId) => {
    setSavedJobIds(prev => {
      const updated = new Set(prev);
      if (updated.has(jobId)) {
        updated.delete(jobId);
        showToast('Removed from saved opportunities.');
      } else {
        updated.add(jobId);
        showToast('Saved to your application wishlist! 📌');
      }
      return updated;
    });
  };

  const handleApplyToOpportunity = async (job) => {
    if (!user) {
      showToast('Please sign in to track your job application.', 'info');
      return;
    }

    try {
      await createApplication(user.uid, {
        jobId: job.id,
        roleTitle: job.title,
        companyName: job.company,
        location: job.location,
        type: job.type,
        stipendSalary: job.stipendSalary || 'Undisclosed',
        status: 'applied',
        notes: `Applied via EdWorld Co. direct link on ${new Date().toLocaleDateString()}`
      });

      showToast(`Application logged for ${job.title} at ${job.company}! 🚀`);
      
      if (job.applyUrl) {
        window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      showToast('Could not record application to your pipeline.', 'error');
    }
  };

  // Calculate real skill match score based on user's actual profile skills
  const calculateRealSkillMatch = (jobSkills = []) => {
    if (!userProfile?.skills || userProfile.skills.length === 0 || jobSkills.length === 0) {
      return null;
    }
    const userSkillSet = new Set(userProfile.skills.map(s => s.toLowerCase()));
    const matched = jobSkills.filter(s => userSkillSet.has(s.toLowerCase()));
    return Math.round((matched.length / jobSkills.length) * 100);
  };

  return (
    <div className="jobs-page" style={{ paddingBottom: '60px' }}>
      {/* 1. HERO HEADER */}
      <div className="glass-card" style={{ padding: '28px 24px', marginBottom: '20px', background: 'linear-gradient(135deg, rgba(18, 26, 44, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '4px 10px', borderRadius: 'var(--radius-full)', marginBottom: '8px' }}>
              <Sparkles size={13} color="var(--primary)" />
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#c7d2fe', textTransform: 'uppercase' }}>
                Career Opportunities
              </span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '4px' }}>
              Verified Opportunities Feed
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
              Curated internships, graduate software engineering roles, hackathons, and fellowships.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/applications" className="btn btn-secondary btn-sm" style={{ padding: '8px 14px' }}>
              View Pipeline Kanban
            </Link>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & FILTER BAR */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
            <input 
              type="text" 
              className="input-field" 
              style={{ paddingLeft: '38px' }}
              placeholder="Search by role title, technology, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Desktop Filter Pills */}
          <div className="hide-on-mobile" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {['All', 'Internship', 'Full-Time', 'Hackathon', 'Fellowship'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                {cat}
              </button>
            ))}

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: '6px' }}>
              <input 
                type="checkbox" 
                checked={remoteOnly} 
                onChange={(e) => setRemoteOnly(e.target.checked)} 
              />
              Remote Only
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0 20px' }}>
            Search
          </button>

          {/* Mobile Filter Sheet Trigger */}
          <button 
            type="button"
            className="btn btn-secondary btn-sm hide-on-desktop"
            onClick={() => setShowFilterSheet(true)}
            style={{ padding: '0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Filter size={15} /> Filters
          </button>
        </form>
      </div>

      {/* 3. OPPORTUNITIES LIST */}
      {loading ? (
        <div className="glass-card" style={{ padding: '48px 20px', textAlign: 'center' }}>
          <div className="brand-logo-icon" style={{ width: '40px', height: '40px', margin: '0 auto 12px', fontSize: '1.2rem' }}>E</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Loading opportunities from Firestore...</div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-card" style={{ padding: '56px 20px', textAlign: 'center' }}>
          <Briefcase size={44} color="var(--text-dim)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '6px' }}>No opportunities available right now</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 20px' }}>
            {searchTerm || categoryFilter !== 'All' 
              ? 'No listings match your search criteria. Try adjusting your filter parameters.' 
              : 'Opportunities created by administrators and verified hiring partners will appear here.'}
          </p>
          {(searchTerm || categoryFilter !== 'All' || remoteOnly) && (
            <button 
              onClick={() => { setSearchTerm(''); setCategoryFilter('All'); setRemoteOnly(false); }}
              className="btn btn-secondary btn-sm"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="responsive-grid-2">
          {jobs.map(job => {
            const isSaved = savedJobIds.has(job.id);
            const matchScore = calculateRealSkillMatch(job.skillsRequired);

            return (
              <div 
                key={job.id} 
                className="glass-card" 
                style={{ 
                  padding: '20px', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'var(--transition)',
                  border: isSaved ? '1px solid var(--border-glow)' : '1px solid var(--border-subtle)'
                }}
              >
                {/* Header: Title & Company */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>
                        {job.type}
                      </span>
                      {job.remote && (
                        <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>
                          Remote
                        </span>
                      )}
                      {matchScore !== null && (
                        <span className="badge badge-cyan" style={{ fontSize: '0.68rem' }}>
                          {matchScore}% Skill Match
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: '4px 0 2px' }}>
                      {job.title}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: '700' }}>
                      {job.company}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSaveOpportunity(job.id)}
                    style={{
                      background: isSaved ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '8px',
                      color: isSaved ? 'var(--primary)' : 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                    aria-label={isSaved ? 'Remove from wishlist' : 'Save opportunity'}
                  >
                    <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Metadata Row */}
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {job.location || 'Remote'}
                  </span>
                  {job.stipendSalary && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontWeight: '700' }}>
                      <DollarSign size={12} /> {job.stipendSalary}
                    </span>
                  )}
                  {job.deadline && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> Deadline: {job.deadline}
                    </span>
                  )}
                </div>

                {/* Description */}
                {job.description && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '14px', display: '-webkit-box', WebKitLineClamp: 2, WebKitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {job.description}
                  </p>
                )}

                {/* Skills Tags */}
                {job.skillsRequired && job.skillsRequired.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {job.skillsRequired.map((skill, idx) => (
                      <span key={idx} className="badge badge-secondary" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                  <button 
                    onClick={() => handleApplyToOpportunity(job)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Apply & Log Pipeline <ExternalLink size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. MOBILE FILTER BOTTOM SHEET */}
      {showFilterSheet && (
        <div className="bottom-sheet-overlay" onClick={() => setShowFilterSheet(false)}>
          <div className="bottom-sheet-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Filter Opportunities</h3>
              <button 
                onClick={() => setShowFilterSheet(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">Opportunity Type</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['All', 'Internship', 'Full-Time', 'Hackathon', 'Fellowship'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={remoteOnly} 
                  onChange={(e) => setRemoteOnly(e.target.checked)} 
                  style={{ width: '18px', height: '18px' }}
                />
                Remote Only Listings
              </label>
            </div>

            <button 
              onClick={() => { setShowFilterSheet(false); loadOpportunities(); }}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px' }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
