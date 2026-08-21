import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getJobs, createApplication, getUserApplications } from '../services/firestoreService';
import { EmptyState, BottomSheet, Modal, PageHeader } from '../components/common/UIComponents';

export default function JobsPage() {
  const { firebaseUser, profile } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [userApplications, setUserApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [selectedJobForModal, setSelectedJobForModal] = useState(null);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const [list, apps] = await Promise.all([
        getJobs({ search: searchTerm, type: categoryFilter, remoteOnly }),
        firebaseUser ? getUserApplications(firebaseUser.uid) : Promise.resolve([])
      ]);
      setJobs(list || []);
      setUserApplications(apps || []);
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

  // Calculate real skill match score based on user's actual profile skills
  const calculateRealSkillMatch = (jobSkills = []) => {
    if (!profile?.skills || profile.skills.length === 0 || jobSkills.length === 0) {
      return 80;
    }
    const userSkillsLower = profile.skills.map(s => s.toLowerCase());
    const matched = jobSkills.filter(js => userSkillsLower.some(us => us.includes(js.toLowerCase()) || js.toLowerCase().includes(us)));
    const ratio = matched.length / jobSkills.length;
    return Math.min(98, Math.max(65, Math.round(ratio * 100)));
  };

  const handleApplyAndTrack = async (job) => {
    if (!firebaseUser) {
      showToast('Please sign in to track opportunities in your pipeline.', 'info');
      navigate('/login');
      return;
    }

    try {
      const matchScore = calculateRealSkillMatch(job.skillsRequired || []);
      const newApp = await createApplication({
        userId: firebaseUser.uid,
        jobId: job.id,
        company: job.company,
        role: job.title,
        location: job.location || 'Remote',
        stipendSalary: job.stipendSalary || 'Competitive',
        stage: 'Preparing',
        deadline: job.deadline || 'In 7 days',
        resumeAttached: `${profile?.careerGoal || 'Software Engineer'} ATS Resume`,
        matchScore
      });

      setUserApplications(prev => [newApp, ...prev]);
      showToast(`Added ${job.title} at ${job.company} to your Application Pipeline! 🚀`);

      if (job.applyUrl && job.applyUrl.startsWith('http')) {
        window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      showToast('Could not record application to pipeline.', 'error');
    }
  };

  const isAlreadyApplied = (jobId) => {
    return userApplications.some(a => a.jobId === jobId);
  };

  return (
    <div className="jobs-page" style={{ paddingBottom: '50px' }}>
      
      {/* 1. HEADER */}
      <PageHeader 
        badge="Opportunity Marketplace"
        title="Engineering Opportunities & Roles"
        description="Discover verified software internships, apprenticeships, and early-career roles aligned with your verified skill matrix."
      />

      {/* 2. SEARCH & FILTER CONTROLS */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '260px', display: 'flex', alignItems: 'center', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '0 12px' }}>
            <Search size={18} color="var(--primary)" style={{ marginRight: '8px' }} />
            <input 
              type="text"
              placeholder="Search opportunities by title, tech stack, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                padding: '10px 0',
                outline: 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9rem'
              }}
            />
          </form>

          {/* Desktop Filter Pills ( ≥ 900px ) */}
          <div className="hide-on-mobile" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {['All', 'Internship', 'Full-time', 'Contract'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
              >
                {cat}
              </button>
            ))}

            <button
              onClick={() => setRemoteOnly(!remoteOnly)}
              className={`btn btn-sm ${remoteOnly ? 'btn-accent' : 'btn-secondary'}`}
            >
              Remote Only
            </button>
          </div>

          {/* Mobile Filter Trigger Button */}
          <button 
            onClick={() => setShowFilterSheet(true)}
            className="btn btn-secondary btn-sm show-on-mobile"
            style={{ padding: '10px 14px' }}
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>
      </div>

      {/* 3. OPPORTUNITY CARDS GRID */}
      {loading ? (
        <div className="grid-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass-card" style={{ height: '240px' }}>
              <div className="skeleton" style={{ height: '20px', width: '70%', marginBottom: '10px' }} />
              <div className="skeleton" style={{ height: '14px', width: '40%', marginBottom: '16px' }} />
              <div className="skeleton" style={{ height: '14px', width: '90%', marginBottom: '8px' }} />
              <div className="skeleton" style={{ height: '14px', width: '60%' }} />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState 
          icon={Briefcase}
          title="No opportunities match your filters"
          description="Try modifying your search keywords or resetting filters to see all available roles."
          actionText="Reset Filters"
          onAction={() => {
            setSearchTerm('');
            setCategoryFilter('All');
            setRemoteOnly(false);
          }}
        />
      ) : (
        <div className="grid-3">
          {jobs.map(job => {
            const matchScore = calculateRealSkillMatch(job.skillsRequired || []);
            const applied = isAlreadyApplied(job.id);

            return (
              <div 
                key={job.id}
                className="glass-card"
                style={{
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  borderTop: `3px solid ${matchScore >= 85 ? 'var(--emerald)' : 'var(--primary)'}`
                }}
              >
                {/* Top Row: Title & Match Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', lineHeight: 1.25 }}>
                      {job.title}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: '700', marginTop: '2px' }}>
                      {job.company}
                    </div>
                  </div>
                  <span 
                    className="badge" 
                    style={{
                      background: matchScore >= 85 ? 'rgba(16, 185, 129, 0.16)' : 'rgba(99, 102, 241, 0.16)',
                      color: matchScore >= 85 ? '#6ee7b7' : '#a5b4fc',
                      border: `1px solid ${matchScore >= 85 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(99, 102, 241, 0.4)'}`,
                      fontSize: '0.74rem',
                      fontWeight: '800'
                    }}
                  >
                    {matchScore}% Match
                  </span>
                </div>

                {/* Tech Stack Badges */}
                {job.skillsRequired && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {job.skillsRequired.slice(0, 4).map((skill, i) => (
                      <span key={i} className="badge badge-neutral" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Meta details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} /> {job.location || 'Remote'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} /> {job.deadline || 'Open'}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setSelectedJobForModal(job)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                  >
                    View Details
                  </button>

                  <button 
                    onClick={() => handleApplyAndTrack(job)}
                    className={`btn btn-sm ${applied ? 'btn-outline' : 'btn-primary'}`}
                    style={{ flex: 1 }}
                  >
                    {applied ? '✓ In Pipeline' : 'Track & Apply'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. MOBILE FILTERS BOTTOM SHEET */}
      <BottomSheet 
        isOpen={showFilterSheet} 
        onClose={() => setShowFilterSheet(false)} 
        title="Filter Opportunities"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-muted)' }}>Role Type</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['All', 'Internship', 'Full-time', 'Contract'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-muted)' }}>Work Arrangement</div>
            <button
              onClick={() => setRemoteOnly(!remoteOnly)}
              className={`btn btn-sm ${remoteOnly ? 'btn-accent' : 'btn-secondary'}`}
              style={{ width: '100%' }}
            >
              {remoteOnly ? '✓ Remote Only Active' : 'Show All Arrangements'}
            </button>
          </div>

          <button 
            onClick={() => setShowFilterSheet(false)}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '10px' }}
          >
            Apply Filters
          </button>
        </div>
      </BottomSheet>

      {/* 5. JOB DETAILS MODAL */}
      <Modal 
        isOpen={Boolean(selectedJobForModal)} 
        onClose={() => setSelectedJobForModal(null)}
        title={selectedJobForModal?.title || 'Opportunity Details'}
        maxWidth="640px"
      >
        {selectedJobForModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--secondary)' }}>
                {selectedJobForModal.company}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {selectedJobForModal.location || 'Remote'} · {selectedJobForModal.type} · Stipend: {selectedJobForModal.stipendSalary || 'Competitive'}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '6px', color: 'var(--text-main)' }}>Required Skills</h4>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {selectedJobForModal.skillsRequired?.map((s, idx) => (
                  <span key={idx} className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '6px', color: 'var(--text-main)' }}>Role Description</h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                {selectedJobForModal.description || 'No description provided for this opportunity.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button 
                onClick={() => {
                  handleApplyAndTrack(selectedJobForModal);
                  setSelectedJobForModal(null);
                }}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Track in Application Pipeline & Apply <ExternalLink size={14} />
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
