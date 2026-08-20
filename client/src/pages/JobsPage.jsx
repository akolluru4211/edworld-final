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
import { getJobs, createApplication, createJob } from '../services/firestoreService';

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

  const seedOpportunities = [
    {
      title: 'Full Stack Software Engineer Intern',
      company: 'Vanguard Cloud Systems',
      type: 'Internship',
      location: 'Bangalore / Remote',
      remote: true,
      stipendSalary: '₹45,000 - ₹60,000 / month',
      deadline: '2026-09-30',
      skillsRequired: ['React', 'Node.js', 'TypeScript', 'Firebase'],
      description: 'Join our cloud infrastructure team to build customer-facing developer dashboards and real-time telemetry systems.',
      applyUrl: 'https://careers.google.com'
    },
    {
      title: 'Global AI & Web3 Hackathon 2026',
      company: 'DevWorld Foundation',
      type: 'Hackathon',
      location: 'Virtual / Online',
      remote: true,
      stipendSalary: '$25,000 in Prizes',
      deadline: '2026-10-15',
      skillsRequired: ['JavaScript', 'Python', 'AI/ML', 'System Design'],
      description: '48-hour global sprint building decentralized applications and autonomous AI agents with mentorship.',
      applyUrl: 'https://devpost.com'
    },
    {
      title: 'Junior Frontend Developer',
      company: 'Pulse UI Labs',
      type: 'Full-Time',
      location: 'Hyderabad / Hybrid',
      remote: false,
      stipendSalary: '₹8,00,000 - ₹12,00,000 / annum',
      deadline: '2026-10-01',
      skillsRequired: ['React', 'CSS Architecture', 'Tailwind', 'JavaScript'],
      description: 'Craft responsive design systems and micro-frontends for our enterprise financial analytics suite.',
      applyUrl: 'https://linkedin.com'
    },
    {
      title: 'Open Source Software Fellow',
      company: 'Linux & Cloud Native Foundation',
      type: 'Fellowship',
      location: 'Remote',
      remote: true,
      stipendSalary: '$6,000 Stipend',
      deadline: '2026-11-01',
      skillsRequired: ['Git', 'Go', 'Docker', 'Node.js'],
      description: 'Full-time 3-month stipend fellowship contributing to cloud-native open source developer tools.',
      applyUrl: 'https://cncf.io'
    }
  ];

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      let list = await getJobs({ search: searchTerm, type: categoryFilter, remoteOnly });
      if (list.length === 0 && !searchTerm && categoryFilter === 'All') {
        for (const opp of seedOpportunities) {
          await createJob(opp);
        }
        list = await getJobs();
      }
      setJobs(list);
    } catch (err) {
      console.warn('Error loading jobs:', err);
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

  const handleTrackApplication = async (job) => {
    if (!user) return;
    try {
      await createApplication(user.uid, {
        jobId: job.id,
        roleTitle: job.title,
        company: job.company,
        stage: 'Applied',
        matchScore: 92,
        notes: `Applied through EdWorld Opportunity Board for ${job.title}.`
      });
      setSavedJobIds(prev => new Set(prev).add(job.id));
      showToast(`Added ${job.title} at ${job.company} to your Application Pipeline! 🚀`);
    } catch (err) {
      showToast('Failed to track application', 'error');
    }
  };

  const categories = ['All', 'Internship', 'Full-Time', 'Hackathon', 'Fellowship'];

  return (
    <div className="jobs-page" style={{ paddingBottom: '60px' }}>
      {/* 1. HERO HEADER */}
      <div className="glass-card" style={{ padding: '28px 24px', marginBottom: '20px', background: 'linear-gradient(135deg, rgba(18, 26, 44, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.18)', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '4px 10px', borderRadius: 'var(--radius-full)', marginBottom: '8px' }}>
              <Briefcase size={13} color="var(--emerald)" />
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#6ee7b7', textTransform: 'uppercase' }}>
                Opportunity Board
              </span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '4px' }}>
              Curated Developer Opportunities
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
              Verified internships, high-impact hackathons, fellowships, and full-time roles.
            </p>
          </div>

          <Link to="/applications" className="btn btn-primary btn-sm" style={{ padding: '8px 14px' }}>
            View Pipeline ({savedJobIds.size} saved)
          </Link>
        </div>
      </div>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
            <input 
              type="text" 
              className="input-field" 
              style={{ paddingLeft: '38px' }}
              placeholder="Search by role, company, or tech stack..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Desktop Filter Pills (≥ 768px) */}
          <div className="hide-on-mobile" style={{ display: 'flex', gap: '6px' }}>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`segment-tab-btn ${categoryFilter === cat ? 'active' : ''}`}
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Mobile Filter Button (< 768px) */}
          <button
            type="button"
            onClick={() => setShowFilterSheet(true)}
            className="btn btn-secondary btn-sm hide-on-desktop"
            style={{ padding: '8px 14px' }}
          >
            <Filter size={15} /> Filters {categoryFilter !== 'All' ? `(${categoryFilter})` : ''}
          </button>

          <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '8px 18px' }}>
            Search
          </button>
        </form>
      </div>

      {/* 3. OPPORTUNITIES FEED (RESPONSIVE GRID) */}
      <div className="responsive-grid-2">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', gridColumn: '1 / -1', color: 'var(--text-muted)' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            Loading curated opportunities...
          </div>
        ) : jobs.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '36px 20px', gridColumn: '1 / -1' }}>
            <Briefcase size={36} color="var(--text-dim)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>No matching opportunities found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Try clearing filters or search terms.</p>
          </div>
        ) : (
          jobs.map(job => {
            const isSaved = savedJobIds.has(job.id);
            return (
              <div key={job.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>{job.type || 'Internship'}</span>
                      {job.remote && (
                        <span className="badge badge-cyan" style={{ fontSize: '0.68rem' }}>Remote</span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: '#fff' }}>
                      {job.title}
                    </h3>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--secondary)', marginTop: '2px' }}>
                      {job.company}
                    </div>
                  </div>

                  <span className="badge badge-emerald" style={{ fontSize: '0.72rem', flexShrink: 0 }}>
                    94% Match
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} /> {job.location}
                  </span>
                  {job.stipendSalary && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--emerald)' }}>
                      <DollarSign size={13} /> {job.stipendSalary}
                    </span>
                  )}
                  {job.deadline && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} /> Deadline: {job.deadline}
                    </span>
                  )}
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: '1.5', marginBottom: '14px', flex: 1 }}>
                  {job.description}
                </p>

                {/* Skills Tags */}
                {job.skillsRequired && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {job.skillsRequired.map((s, idx) => (
                      <span key={idx} className="badge badge-primary" style={{ fontSize: '0.68rem' }}>{s}</span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                  <button 
                    onClick={() => handleTrackApplication(job)}
                    disabled={isSaved}
                    className={`btn ${isSaved ? 'btn-secondary' : 'btn-outline'} btn-sm`}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    {isSaved ? (
                      <><Check size={14} color="var(--emerald)" /> Tracked in Pipeline</>
                    ) : (
                      <><Bookmark size={14} /> Track in Pipeline</>
                    )}
                  </button>

                  <a 
                    href={job.applyUrl || '#'} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn btn-primary btn-sm"
                    style={{ padding: '0 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>Apply</span> <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. MOBILE FILTER BOTTOM SHEET */}
      {showFilterSheet && (
        <div className="bottom-sheet-overlay" onClick={() => setShowFilterSheet(false)}>
          <div className="bottom-sheet-content" onClick={e => e.stopPropagation()}>
            <div className="bottom-sheet-drag-handle" />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>Opportunity Filters</h3>
              <button onClick={() => setShowFilterSheet(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Opportunity Type</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`segment-tab-btn ${categoryFilter === cat ? 'active' : ''}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
              <label className="form-label" style={{ margin: 0 }}>Remote Opportunities Only</label>
              <input 
                type="checkbox" 
                checked={remoteOnly} 
                onChange={(e) => setRemoteOnly(e.target.checked)} 
                style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
              />
            </div>

            <button 
              onClick={() => {
                setShowFilterSheet(false);
                loadOpportunities();
              }}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '20px', justifyContent: 'center' }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
