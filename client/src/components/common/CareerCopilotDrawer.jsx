import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Bot, 
  X, 
  ArrowRight, 
  FileText, 
  Briefcase, 
  FolderGit2, 
  Compass, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Target
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Drawer } from './UIComponents';

export default function CareerCopilotDrawer({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const path = location.pathname;

  // Generate contextual AI advice based on the active route
  const getContextualAdvice = () => {
    if (path.includes('/resume')) {
      return {
        badge: 'Resume Intelligence',
        title: 'ATS Resume Optimization',
        description: 'Your resume is being evaluated against standard developer applicant tracking systems.',
        suggestions: [
          { text: 'Add quantitative impact metrics to project bullet points (e.g., "reduced latency by 35%").', action: 'Edit Projects', link: '/resume' },
          { text: 'Include keywords matching your target role: React, TypeScript, Git, Automated Testing.', action: 'Review Keywords', link: '/resume' },
          { text: 'Ensure summary statement is crisp and under 3 lines.', action: 'Optimize Summary', link: '/resume' }
        ],
        actionTitle: 'Analyze Against Job',
        actionUrl: '/resume'
      };
    }
    if (path.includes('/jobs')) {
      return {
        badge: 'Marketplace Intelligence',
        title: 'Opportunity Matching',
        description: 'Opportunities are ranked based on verified skills in your Career Passport.',
        suggestions: [
          { text: 'You have high alignment with Frontend Developer and Full Stack roles.', action: 'Explore Jobs', link: '/jobs' },
          { text: 'Logging applications into your pipeline triggers automated stage tracking.', action: 'View Applications', link: '/applications' },
          { text: 'Tailor your ATS resume before applying to boost interview callbacks.', action: 'Open Resume Studio', link: '/resume' }
        ],
        actionTitle: 'Filter High-Match Roles',
        actionUrl: '/jobs'
      };
    }
    if (path.includes('/studio')) {
      return {
        badge: 'Engineering Architecture',
        title: 'Proof-of-Work Verification',
        description: 'Recruiters prioritize projects with verifiable code commits and architectural documentation.',
        suggestions: [
          { text: 'Connect GitHub repository link to enable automated evidence verification.', action: 'Link Repository', link: '/studio' },
          { text: 'Move tasks through the 10 engineering stages from Architecture to Deploy.', action: 'Update Kanban', link: '/studio' },
          { text: 'Publish completed projects to your public Developer Portfolio.', action: 'Sync Portfolio', link: '/portfolio' }
        ],
        actionTitle: 'Verify Current Project',
        actionUrl: '/studio'
      };
    }
    if (path.includes('/interview')) {
      return {
        badge: 'Interview Simulator',
        title: 'AI Practice Coach',
        description: 'AI-evaluated voice and technical mock sessions prepare you for live interviews.',
        suggestions: [
          { text: 'Use the STAR method (Situation, Task, Action, Result) for behavioral questions.', action: 'Start Interview', link: '/interview' },
          { text: 'Explain architectural trade-offs clearly when answering system design questions.', action: 'Practice Design', link: '/interview' },
          { text: 'Review past feedback scores to identify weak communication areas.', action: 'View History', link: '/interview' }
        ],
        actionTitle: 'Start Mock Interview',
        actionUrl: '/interview'
      };
    }
    if (path.includes('/portfolio')) {
      return {
        badge: 'Portfolio Showcase',
        title: 'Developer Branding',
        description: 'Your portfolio at edworld.co.in/u/[username] is your public engineering identity.',
        suggestions: [
          { text: 'Write a compelling headline that states your specialization clearly.', action: 'Edit Headline', link: '/portfolio' },
          { text: 'Ensure GitHub and LinkedIn profile links are connected.', action: 'Add Socials', link: '/portfolio' },
          { text: 'Feature at least 2 proof-of-work projects with live demo URLs.', action: 'Select Projects', link: '/portfolio' }
        ],
        actionTitle: 'Preview Public Passport',
        actionUrl: `/u/${profile?.username || ''}`
      };
    }

    // Default: Dashboard / Career OS overview
    return {
      badge: 'Career Operating System',
      title: 'Career Readiness Intelligence',
      description: 'EdWorld AI continuously evaluates your profile completeness and proof of work.',
      suggestions: [
        { text: 'Targeting: ' + (profile?.careerGoal || 'Full Stack Software Engineer'), action: 'Review Goal', link: '/career' },
        { text: 'Complete Project Studio milestones to increase Career Readiness score by up to +12 pts.', action: 'Go to Studio', link: '/studio' },
        { text: 'Practice an AI Mock Interview to assess technical and behavioral clarity.', action: 'Start Simulator', link: '/interview' }
      ],
      actionTitle: 'Open Career Passport',
      actionUrl: '/career'
    };
  };

  const advice = getContextualAdvice();

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="AI Career Copilot" width="420px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Context Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
          border: '1px solid var(--border-glow)',
          borderRadius: 'var(--radius-md)',
          padding: '16px'
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.25)', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '2px 8px', borderRadius: 'var(--radius-full)', marginBottom: '8px' }}>
            <Sparkles size={12} color="var(--primary)" />
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#a5b4fc', textTransform: 'uppercase' }}>
              {advice.badge}
            </span>
          </div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '6px', color: '#fff' }}>
            {advice.title}
          </h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
            {advice.description}
          </p>
        </div>

        {/* Actionable Suggestions */}
        <div>
          <h5 style={{ fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', letterSpacing: '0.04em' }}>
            Recommended Next Actions
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {advice.suggestions.map((s, idx) => (
              <div 
                key={idx}
                style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  transition: 'var(--transition-fast)'
                }}
              >
                <Zap size={16} color="var(--secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-body)', lineHeight: '1.45', marginBottom: '6px' }}>
                    {s.text}
                  </div>
                  <Link 
                    to={s.link} 
                    onClick={onClose}
                    style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    {s.action} <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Primary CTA */}
        <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
          <button 
            onClick={() => {
              navigate(advice.actionUrl);
              onClose();
            }}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
          >
            <Sparkles size={16} /> {advice.actionTitle}
          </button>
        </div>
      </div>
    </Drawer>
  );
}
