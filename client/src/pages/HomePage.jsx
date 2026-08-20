import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  FolderGit2, 
  FileText, 
  Briefcase, 
  Bot, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Terminal, 
  Layers, 
  Zap,
  Star,
  Award,
  Globe
} from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user, profileCompleted } = useAuth();

  return (
    <div className="homepage" style={{ paddingBottom: '60px' }}>
      {/* 1. HERO SECTION */}
      <section className="hero-banner" style={{ marginTop: '20px', padding: '64px 48px', position: 'relative' }}>
        <div style={{ maxWidth: '820px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99, 102, 241, 0.18)', border: '1px solid rgba(99, 102, 241, 0.35)', padding: '6px 14px', borderRadius: 'var(--radius-full)', marginBottom: '20px' }}>
            <Sparkles size={16} color="var(--primary)" />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              The AI-Powered Student Career Operating System
            </span>
          </div>

          <h1 style={{ fontSize: '3.4rem', fontWeight: '800', letterSpacing: '-0.03em', lineHeight: '1.15', marginBottom: '20px' }}>
            Build the career <br />
            <span style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 50%, #10b981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              you're ready for.
            </span>
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', lineHeight: '1.6', marginBottom: '32px', maxWidth: '720px' }}>
            Build real projects, prove your skills, create your professional identity, discover opportunities, and prepare for interviews — all in one connected platform.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link to={user ? (profileCompleted ? '/dashboard' : '/onboarding') : '/signup'} className="btn btn-primary btn-lg">
              <span>{user ? (profileCompleted ? 'Open Your Dashboard' : 'Complete Your Profile') : 'Start Your Career Journey'}</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/career" className="btn btn-secondary btn-lg">
              Explore Career OS
            </Link>
          </div>

          <div style={{ display: 'flex', gap: '28px', marginTop: '36px', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <CheckCircle size={16} color="var(--emerald)" /> Verified Proof of Work
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <CheckCircle size={16} color="var(--secondary)" /> ATS Resume Intelligence
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <CheckCircle size={16} color="var(--primary)" /> AI Interview Practice
            </div>
          </div>
        </div>
      </section>

      {/* 2. CAREER OPERATING SYSTEM WORKFLOW */}
      <section style={{ marginBottom: '64px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="badge badge-secondary" style={{ marginBottom: '10px' }}>Career Architecture</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '12px' }}>
            One Connected Career Operating System
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '640px', margin: '0 auto' }}>
            From building your first project to negotiating your tech offer, every milestone feeds into your verifiable career passport.
          </p>
        </div>

        {/* Workflow Timeline Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
          background: 'rgba(15, 23, 42, 0.7)',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)'
        }}>
          {[
            { step: '01', title: 'BUILD', subtitle: 'Project Studio', color: 'var(--primary)' },
            { step: '02', title: 'PROVE', subtitle: 'Skill Matrix', color: 'var(--secondary)' },
            { step: '03', title: 'SHOWCASE', subtitle: 'Portfolio OS', color: 'var(--emerald)' },
            { step: '04', title: 'CONNECT', subtitle: 'Peer Network', color: '#818cf8' },
            { step: '05', title: 'DISCOVER', subtitle: 'Opportunities', color: 'var(--amber)' },
            { step: '06', title: 'APPLY', subtitle: 'ATS Pipeline', color: '#38bdf8' },
            { step: '07', title: 'PREPARE', subtitle: 'AI Simulator', color: '#c084fc' },
            { step: '08', title: 'GET HIRED', subtitle: 'Career Growth', color: 'var(--emerald)' }
          ].map((item, idx) => (
            <div key={idx} style={{
              background: 'rgba(255, 255, 255, 0.02)',
              padding: '16px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center',
              position: 'relative'
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: item.color, marginBottom: '4px' }}>
                STAGE {item.step}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: '#fff', marginBottom: '2px' }}>
                {item.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                {item.subtitle}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CORE MODULE SHOWCASE GRID */}
      <section style={{ marginBottom: '64px' }}>
        <div className="grid-3">
          {/* Card 1: Career Passport & Readiness */}
          <div className="glass-card glass-card-interactive" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Compass size={24} />
              </div>
              <span className="badge badge-primary">Career Identity</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '10px' }}>Digital Career Passport</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', flex: 1, lineHeight: '1.5' }}>
              Replace unverified resumes with an evidence-backed Career Passport. Displays a live 0-100 Career Readiness Score with clear action steps to level up.
            </p>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
                <span>Career Readiness Index</span>
                <span style={{ color: 'var(--emerald)' }}>84 / 100</span>
              </div>
              <div className="readiness-meter">
                <div className="readiness-fill" style={{ width: '84%' }} />
              </div>
            </div>
            <Link to="/career" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
              View Career Passport <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 2: Project Studio */}
          <div className="glass-card glass-card-interactive" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                <FolderGit2 size={24} />
              </div>
              <span className="badge badge-secondary">Proof of Work</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '10px' }}>Project Studio Workspace</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', flex: 1, lineHeight: '1.5' }}>
              Build production software with integrated Kanban milestone boards, live JavaScript execution scratchpads, and automated GitHub repository verification.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span className="badge badge-primary">Kanban Milestones</span>
              <span className="badge badge-secondary">Live Sandbox</span>
              <span className="badge badge-emerald">Git Verified</span>
            </div>
            <Link to="/studio" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
              Launch Studio <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 3: ATS Resume Studio */}
          <div className="glass-card glass-card-interactive" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--emerald)' }}>
                <FileText size={24} />
              </div>
              <span className="badge badge-emerald">ATS Intelligence</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '10px' }}>ATS Resume Studio</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', flex: 1, lineHeight: '1.5' }}>
              Optimize resumes against real job descriptions. Analyzes keyword density, detects weak bullet points, and provides instant Google XYZ formula evidence rewrites.
            </p>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--emerald)', fontWeight: '700' }}>✓ 91% Match</span> against Full Stack Engineer JD
            </div>
            <Link to="/resume" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
              Optimize Resume <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 4: Opportunity Board & Pipeline */}
          <div className="glass-card glass-card-interactive" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber)' }}>
                <Briefcase size={24} />
              </div>
              <span className="badge badge-amber">Opportunity Match</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '10px' }}>Opportunities & Pipeline</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', flex: 1, lineHeight: '1.5' }}>
              Discover real internships, hackathons, and software engineering roles matched to your verified skills. Track applications through an 8-stage pipeline.
            </p>
            <Link to="/jobs" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
              Discover Jobs <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 5: AI Interview Simulator */}
          <div className="glass-card glass-card-interactive" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(192, 132, 252, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
                <Bot size={24} />
              </div>
              <span className="badge badge-primary">Voice & Text</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '10px' }}>AI Interview Simulator</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', flex: 1, lineHeight: '1.5' }}>
              Practice realistic technical, coding, behavioral, and project-specific interviews. Receive instant dimensional scorecards and actionable answer suggestions.
            </p>
            <Link to="/interview" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
              Start Interview <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 6: Real Peer Network */}
          <div className="glass-card glass-card-interactive" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                <Users size={24} />
              </div>
              <span className="badge badge-secondary">Peer Community</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '10px' }}>Real Peer Network</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', flex: 1, lineHeight: '1.5' }}>
              Connect with real verified students and developers. Search by skill, college, and career goal to form hackathon teams and conduct peer code reviews.
            </p>
            <Link to="/networking" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
              Explore Network <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. FINAL CALL TO ACTION */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.15) 100%)',
        border: '1px solid var(--border-glow)',
        borderRadius: 'var(--radius-xl)',
        padding: '56px 40px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '2.4rem', fontWeight: '800', marginBottom: '14px' }}>
          Build your next career move with EdWorld.
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 28px', lineHeight: '1.6' }}>
          Join thousands of developers turning project code into verified career proof and landing dream software engineering roles.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to={user ? (profileCompleted ? '/dashboard' : '/onboarding') : '/signup'} className="btn btn-primary btn-lg">
            <span>{user ? (profileCompleted ? 'Go to Dashboard' : 'Complete Your Profile') : 'Get Started for Free'}</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/jobs" className="btn btn-secondary btn-lg">
            Browse Opportunities
          </Link>
        </div>
      </section>
    </div>
  );
}
