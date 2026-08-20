import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import { Github, Linkedin, Twitter, Sparkles, Shield, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer" style={{
      borderTop: '1px solid var(--border-subtle)',
      background: 'rgba(9, 13, 22, 0.95)',
      padding: '48px 24px 28px',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1380px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '40px',
        marginBottom: '40px'
      }}>
        {/* Col 1: Brand */}
        <div>
          <BrandLogo size="md" />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '14px', lineHeight: '1.6' }}>
            The AI-powered student career operating system. Build real projects, prove skills, discover opportunities, and get hired.
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ padding: '8px' }}>
              <Github size={16} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ padding: '8px' }}>
              <Linkedin size={16} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ padding: '8px' }}>
              <Twitter size={16} />
            </a>
          </div>
        </div>

        {/* Col 2: Career OS */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '16px', color: 'var(--text-main)' }}>Platform</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            <li><Link to="/career" style={{ color: 'inherit', textDecoration: 'none' }}>Career Passport</Link></li>
            <li><Link to="/studio" style={{ color: 'inherit', textDecoration: 'none' }}>Project Studio</Link></li>
            <li><Link to="/resume" style={{ color: 'inherit', textDecoration: 'none' }}>ATS Resume Builder</Link></li>
            <li><Link to="/portfolio" style={{ color: 'inherit', textDecoration: 'none' }}>Developer Portfolio</Link></li>
            <li><Link to="/interview" style={{ color: 'inherit', textDecoration: 'none' }}>AI Interview Simulator</Link></li>
          </ul>
        </div>

        {/* Col 3: Opportunities */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '16px', color: 'var(--text-main)' }}>Opportunities</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            <li><Link to="/jobs" style={{ color: 'inherit', textDecoration: 'none' }}>Software Internships</Link></li>
            <li><Link to="/jobs" style={{ color: 'inherit', textDecoration: 'none' }}>Hackathons & Challenges</Link></li>
            <li><Link to="/jobs" style={{ color: 'inherit', textDecoration: 'none' }}>Graduate Roles</Link></li>
            <li><Link to="/networking" style={{ color: 'inherit', textDecoration: 'none' }}>Peer Community</Link></li>
          </ul>
        </div>

        {/* Col 4: Trust & Verification */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '16px', color: 'var(--text-main)' }}>Enterprise Trust</h4>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: 'var(--emerald)', fontWeight: '700', fontSize: '0.85rem' }}>
              <Shield size={16} /> Evidence-Based Verification
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Projects and skill assessments are cryptographically tied to verified repository commits.
            </p>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1380px',
        margin: '0 auto',
        paddingTop: '20px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        fontSize: '0.82rem',
        color: 'var(--text-dim)'
      }}>
        <div>
          © {new Date().getFullYear()} EdWorld Co. All rights reserved. Built for engineering excellence.
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Security Standard</span>
        </div>
      </div>
    </footer>
  );
}
