import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  LayoutDashboard, 
  Compass, 
  FolderGit2, 
  Briefcase, 
  FileText, 
  Bot, 
  Users, 
  Sparkles, 
  Settings, 
  X,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function CommandSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { profile } = useAuth();

  const allItems = [
    { title: 'Dashboard', desc: 'Home overview and next best actions', link: '/dashboard', icon: LayoutDashboard, category: 'Navigation' },
    { title: 'Career Passport', desc: 'Verified skills, readiness score, timeline', link: '/career', icon: Compass, category: 'Career OS' },
    { title: 'Project Studio', desc: '10-stage engineering workspace & Kanban', link: '/studio', icon: FolderGit2, category: 'Engineering' },
    { title: 'Opportunity Marketplace', desc: 'Internships, jobs & hackathons', link: '/jobs', icon: Briefcase, category: 'Opportunities' },
    { title: 'Application Pipeline', desc: 'Application command center & tracker', link: '/applications', icon: Briefcase, category: 'Opportunities' },
    { title: 'ATS Resume Studio', desc: 'Resume editor with ATS match analysis', link: '/resume', icon: FileText, category: 'Career OS' },
    { title: 'AI Interview Simulator', desc: 'Practice role-specific mock interviews', link: '/interview', icon: Bot, category: 'AI Tools' },
    { title: 'Developer Portfolio', desc: 'Customize your public showcase', link: '/portfolio', icon: Sparkles, category: 'Career OS' },
    { title: 'Peer Network', desc: 'Discover and connect with tech peers', link: '/networking', icon: Users, category: 'Community' },
    { title: 'My Profile & Controls', desc: 'Personal hub and credentials', link: '/profile', icon: Settings, category: 'Settings' },
    { title: 'Settings & Privacy', desc: 'Account security and preferences', link: '/settings', icon: Settings, category: 'Settings' }
  ];

  const filtered = query.trim() === '' 
    ? allItems 
    : allItems.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.desc.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(true); // toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (link) => {
    navigate(link);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ alignItems: 'flex-start', paddingTop: '80px' }}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '580px', padding: '0', overflow: 'hidden', border: '1px solid var(--border-glow)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(15, 23, 42, 0.95)' }}>
          <Search size={20} color="var(--primary)" style={{ marginRight: '12px', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Type a command, page, or feature... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '1rem',
              outline: 'none',
              fontFamily: 'var(--font-sans)'
            }}
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '10px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No matches found for "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(item.link)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                    gap: '12px'
                  }}
                  className="nav-link-item"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(99, 102, 241, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)'
                    }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.92rem', color: '#fff' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div style={{
          padding: '10px 18px',
          background: 'rgba(9, 13, 22, 0.8)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-dim)'
        }}>
          <div>Quick Jump to Feature</div>
          <div>Press <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>Esc</kbd> to close</div>
        </div>
      </div>
    </div>
  );
}
