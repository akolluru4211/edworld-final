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
  Plus
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

  // Default seed opportunities if Firestore collection is initially empty
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
        // Seed initial opportunities to Firestore
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

  const calculateJobMatch = (jobSkills = []) => {
    const userSkills = (userProfile?.skills || []).map(s => s.toLowerCase());
    if (jobSkills.length === 0 || userSkills.length === 0) return 80;
    const matches = jobSkills.filter(js => userSkills.includes(js.toLowerCase())).length;
    const ratio = matches / jobSkills.length;
    return Math.min(98, Math.max(65, Math.round(ratio * 40 + 60)));
  };

  const handleSaveToPipeline = async (job) => {
    if (!user) {
      showToast('Please sign in to track opportunities.', 'info');
      return;
    }
    try {
      await createApplication({
        userId: user.uid,
        jobId: job.id,
        company: job.company,
        role: job.title,
        location: job.location,
        stipendSalary: job.stipendSalary,
        stage: 'Saved',
        deadline: job.deadline,
        matchScore: calculateJobMatch(job.skillsRequired)
      });
      setSavedJobIds(prev => new Set(prev).add(job.id));
      showToast(`Saved "${job.title}" at ${job.company} to your Application Pipeline! 📋`);
    } catch (err) {
      showToast('Failed to save to pipeline', 'error');
    }
  };

  return (
    <div className="jobs-page">
      {/* 1. HERO HEADER */}
      <div className="hero-banner" style={{ padding: '36px 32px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(245, 158, 11, 0.18)', border: '1px solid rgba(245, 158, 11, 0.35)', padding: '4px 12px', borderRadius: 'var(--radius-full)', marginBottom: '10px' }}>
              <Briefcase size={14} color="var(--amber)" />
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#fcd34d', textTransform: 'uppercase' }}>
                Opportunity Discovery
              </span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '6px' }}>
              Jobs, Internships & Hackathons
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '640px' }}>
              Real opportunities matched to your verified skills and Career Passport readiness.
            </p>
          </div>

          <Link to="/applications" className="btn btn-primary">
            View Application Pipeline <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* 2. SEARCH & FILTER BAR */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '28px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
            <input 
              type="text" 
              className="input-field" 
              style={{ paddingLeft: '42px' }}
              placeholder="Search by role, company, or skill (e.g. React, Python, Remote)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['All', 'Internship', 'Full-Time', 'Hackathon', 'Fellowship'].map(cat => (
              <button 
                type="button" 
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={remoteOnly} 
              onChange={(e) => setRemoteOnly(e.target.checked)} 
            />
            Remote Only
          </label>
        </form>
      </div>

      {/* 3. OPPORTUNITY LISTINGS GRID */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading Opportunities...</div>
      ) : (
        <div className="grid-3">
          {jobs.map(job => {
            const matchScore = calculateJobMatch(job.skillsRequired);
            const isSaved = savedJobIds.has(job.id);

            return (
              <div key={job.id} className="glass-card glass-card-interactive" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span className={`badge ${
                    job.type === 'Internship' ? 'badge-primary' : 
                    job.type === 'Hackathon' ? 'badge-secondary' : 
                    job.type === 'Fellowship' ? 'badge-emerald' : 'badge-amber'
                  }`}>
                    {job.type}
                  </span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.75rem', fontWeight: '800' }}>
                    {matchScore}% Match
                  </span>
                </div>

                <h3 style={{ fontSize: '1.18rem', fontWeight: '800', marginBottom: '4px' }}>{job.title}</h3>
                <div style={{ color: 'var(--secondary)', fontWeight: '700', fontSize: '0.88rem', marginBottom: '10px' }}>
                  {job.company}
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px', flex: 1, lineHeight: '1.5' }}>
                  {job.description}
                </p>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {(job.skillsRequired || []).map((skill, idx) => (
                    <span key={idx} className="badge badge-primary" style={{ fontSize: '0.68rem' }}>{skill}</span>
                  ))}
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span><MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} /> {job.location}</span>
                  <span style={{ color: 'var(--emerald)', fontWeight: '700' }}>{job.stipendSalary}</span>
                </div>

                <div style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                  <button 
                    onClick={() => handleSaveToPipeline(job)}
                    disabled={isSaved}
                    className={`btn btn-sm ${isSaved ? 'btn-secondary' : 'btn-outline'}`}
                    style={{ flex: 1 }}
                  >
                    {isSaved ? <><Check size={14} /> Saved</> : <><Bookmark size={14} /> Save to Pipeline</>}
                  </button>

                  <a 
                    href={job.applyUrl || '#'} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    Apply <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
