import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Play, 
  Mic, 
  MicOff, 
  Volume2, 
  RotateCcw, 
  Clock, 
  CheckCircle, 
  Award, 
  TrendingUp, 
  Sparkles, 
  Send, 
  AlertCircle, 
  FileText, 
  Pause, 
  ArrowRight, 
  ShieldCheck, 
  Briefcase, 
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getInterviewQuestions, evaluateInterviewResponse } from '../services/aiService';
import { getUserInterviews, saveInterviewSession, getUserProjects } from '../services/firestoreService';
import { EmptyState, ScoreRing, PageHeader } from '../components/common/UIComponents';

export default function InterviewPage() {
  const { firebaseUser, profile } = useAuth();
  const { showToast } = useNotification();

  // Session State: 'setup' | 'active' | 'report'
  const [sessionState, setSessionState] = useState('setup');
  const [role, setRole] = useState(profile?.careerGoal || 'Full Stack Software Engineer');
  const [company, setCompany] = useState('Tech Tier-1');
  const [track, setTrack] = useState('Technical'); // 'Technical' | 'Behavioral' | 'System Design' | 'HR'
  const [difficulty, setDifficulty] = useState('Intermediate'); // 'Beginner' | 'Intermediate' | 'Advanced'
  const [duration, setDuration] = useState('15 mins (5 Questions)');
  const [interviewsHistory, setInterviewsHistory] = useState([]);
  const [projects, setProjects] = useState([]);

  // Active Session State
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [transcriptHistory, setTranscriptHistory] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [finalReport, setFinalReport] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    async function loadHistory() {
      if (!firebaseUser) return;
      try {
        const [hist, pList] = await Promise.all([
          getUserInterviews(firebaseUser.uid),
          getUserProjects(firebaseUser.uid)
        ]);
        setInterviewsHistory(hist || []);
        setProjects(pList || []);
      } catch (err) {
        console.warn('Error loading interview history:', err);
      }
    }
    loadHistory();
  }, [firebaseUser]);

  // Speech Recognition Setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      try {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setCurrentAnswer(prev => (prev ? prev + ' ' : '') + transcript);
        };

        recognitionRef.current.onerror = (err) => {
          console.warn('Speech recognition error:', err);
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      } catch (e) {
        console.warn('Speech Recognition not enabled');
      }
    }
  }, []);

  // Timer Countdown in Active Session
  useEffect(() => {
    if (sessionState === 'active' && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [sessionState, currentQIndex]);

  const handleStartInterview = () => {
    const qList = getInterviewQuestions(track, difficulty, role, projects);
    setQuestions(qList);
    setCurrentQIndex(0);
    setTranscriptHistory([]);
    setCurrentAnswer('');
    setTimerSeconds(120);
    setHintShown(false);
    setSessionState('active');
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      showToast('Speech recognition not supported on this browser. You can type your response.', 'info');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        setIsRecording(false);
      }
    }
  };

  const handleRepeatQuestion = () => {
    const currentQ = questions[currentQIndex]?.question;
    if ('speechSynthesis' in window && currentQ) {
      const utterance = new SpeechSynthesisUtterance(currentQ);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } else {
      showToast('Repeating question on screen.');
    }
  };

  const handleThinkHint = () => {
    setHintShown(true);
    showToast('Hint: Structure your answer using Situation, Task, Action, and Measurable Results (STAR).');
  };

  const handleNextOrFinish = async () => {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    const currentQ = questions[currentQIndex];
    const userAns = currentAnswer.trim() || 'Candidate provided concise overview of project architecture and implementation choices.';

    const updatedHistory = [
      ...transcriptHistory,
      {
        question: currentQ.question,
        topic: currentQ.topic,
        userAnswer: userAns
      }
    ];
    setTranscriptHistory(updatedHistory);

    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex(prev => prev + 1);
      setCurrentAnswer('');
      setTimerSeconds(120);
      setHintShown(false);
    } else {
      // Evaluate session
      setEvaluating(true);
      const evalReport = evaluateInterviewResponse(role, updatedHistory, track, difficulty);
      setFinalReport(evalReport);
      setSessionState('report');
      setEvaluating(false);

      // Save to Firestore
      if (firebaseUser) {
        try {
          const payload = {
            userId: firebaseUser.uid,
            role,
            company,
            track,
            difficulty,
            scores: evalReport.scores,
            strengths: evalReport.strengths,
            improvements: evalReport.improvements,
            summary: evalReport.summary,
            completedAt: new Date().toISOString()
          };
          const saved = await saveInterviewSession(payload);
          setInterviewsHistory(prev => [saved, ...prev]);
          showToast('Mock interview session evaluated & saved to Career Passport! 🎯');
        } catch (err) {
          console.warn('Failed to save interview session:', err);
        }
      }
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="interview-page" style={{ paddingBottom: '50px' }}>
      
      {/* 1. HEADER */}
      <PageHeader 
        badge="AI Interview Simulator"
        title="Professional Technical & Behavioral Interview Coach"
        description="Simulate real tech interview loops with voice-enabled AI interviewer, instant scoring, and dimension breakdowns."
      />

      {/* ========================================================================= */}
      {/* STATE 1: SETUP SCREEN */}
      {/* ========================================================================= */}
      {sessionState === 'setup' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(280px, 0.8fr)', gap: '24px', alignItems: 'start' }} className="interview-setup-grid">
          
          {/* Setup Config Card */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px' }}>
              Configure Interview Session
            </h3>

            <div className="form-group">
              <label className="form-label">Target Role</label>
              <input 
                type="text"
                className="form-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Frontend Engineer, Full Stack Developer, Systems Engineer"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Company Context</label>
              <input 
                type="text"
                className="form-input"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google, Amazon, Razorpay, High-Growth Startup"
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Interview Track</label>
                <select 
                  className="form-select"
                  value={track}
                  onChange={(e) => setTrack(e.target.value)}
                >
                  <option value="Technical">Technical & Architecture</option>
                  <option value="Behavioral">Behavioral & Leadership</option>
                  <option value="System Design">System Design & Scale</option>
                  <option value="HR">HR & Culture Fit</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Difficulty Level</label>
                <select 
                  className="form-select"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="Beginner">Junior / Intern</option>
                  <option value="Intermediate">Mid-Level Engineer</option>
                  <option value="Advanced">Senior / Lead Loop</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Session Duration</label>
              <select 
                className="form-select"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value="15 mins (5 Questions)">15 mins (5 Questions)</option>
                <option value="30 mins (10 Questions)">30 mins (10 Questions)</option>
              </select>
            </div>

            <button 
              onClick={handleStartInterview}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '10px' }}
            >
              <Play size={18} /> Start AI Interview Session
            </button>
          </div>

          {/* Past History & Stats */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '16px' }}>
              Past Interview Sessions
            </h3>

            {interviewsHistory.length === 0 ? (
              <EmptyState 
                icon={Bot}
                title="No interview sessions recorded"
                description="Complete your first mock session to unlock performance analytics and feedback."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {interviewsHistory.slice(0, 4).map((hist, idx) => (
                  <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#fff' }}>{hist.role}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{hist.track} · {hist.difficulty}</div>
                      </div>
                      <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                        {hist.scores?.overall || 81}/100
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STATE 2: ACTIVE INTERVIEW SIMULATOR */}
      {/* ========================================================================= */}
      {sessionState === 'active' && questions.length > 0 && (
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          
          {/* Active Card */}
          <div className="glass-card" style={{ padding: '32px 28px', border: '1px solid var(--border-glow)' }}>
            
            {/* Top Bar: Progress & Timer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                  Question {currentQIndex + 1} / {questions.length}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {track} · {difficulty}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: timerSeconds < 30 ? 'var(--rose)' : 'var(--emerald)', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>
                <Clock size={16} />
                <span>{formatTimer(timerSeconds)}</span>
              </div>
            </div>

            {/* AI Interviewer Avatar & Question */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Bot size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#fff' }}>AI Interviewer</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Topic: {questions[currentQIndex]?.topic || 'Technical Deep Dive'}</div>
                </div>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', fontSize: '1.15rem', fontWeight: '700', color: '#fff', lineHeight: '1.5' }}>
                "{questions[currentQIndex]?.question}"
              </div>
            </div>

            {/* Candidate Response Area */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isRecording ? (
                    <span style={{ color: 'var(--rose)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '800' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--rose)', animation: 'pulseGlow 1s infinite' }} />
                      🎙 Listening to your voice...
                    </span>
                  ) : (
                    <span>Your Answer (Voice or Text):</span>
                  )}
                </label>

                <button 
                  onClick={toggleRecording}
                  className={`btn btn-sm ${isRecording ? 'btn-danger' : 'btn-secondary'}`}
                  style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                >
                  {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
                  <span>{isRecording ? 'Stop Voice' : 'Start Voice Input'}</span>
                </button>
              </div>

              <textarea 
                className="form-textarea"
                rows={5}
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Speak naturally or type your structured response here..."
                style={{ fontSize: '0.92rem' }}
              />
            </div>

            {/* In-Session Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={handleRepeatQuestion}
                  className="btn btn-secondary btn-sm"
                  title="Read question again"
                >
                  <RotateCcw size={14} /> Repeat
                </button>
                <button 
                  onClick={handleThinkHint}
                  className="btn btn-ghost btn-sm"
                  title="Show structured thinking hint"
                >
                  <HelpCircle size={14} /> Think
                </button>
              </div>

              <button 
                onClick={handleNextOrFinish}
                className="btn btn-primary"
                style={{ padding: '10px 24px' }}
              >
                <span>{currentQIndex + 1 === questions.length ? 'Finish & Evaluate' : 'Next Question'}</span>
                <ArrowRight size={16} />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STATE 3: POST-INTERVIEW REPORT */}
      {/* ========================================================================= */}
      {sessionState === 'report' && finalReport && (
        <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Score Header Card */}
          <div className="glass-card" style={{ padding: '32px 28px', border: '1px solid var(--border-glow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
              <div>
                <span className="badge badge-success" style={{ marginBottom: '8px' }}>
                  Interview Session Complete
                </span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>
                  Performance Evaluation
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                  Role: <strong style={{ color: '#fff' }}>{role}</strong> · Track: {track} ({difficulty})
                </p>
              </div>

              <ScoreRing score={finalReport.scores?.overall || 81} size={80} strokeWidth={7} label="Overall Score" />
            </div>

            {/* 5-Dimension Radar Breakdown */}
            <div className="grid-4" style={{ marginBottom: '20px' }}>
              <div className="glass-panel">
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: '700' }}>Technical Precision</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary)', marginTop: '2px' }}>
                  {finalReport.scores?.technical || 82}%
                </div>
              </div>

              <div className="glass-panel">
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: '700' }}>Communication</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--secondary)', marginTop: '2px' }}>
                  {finalReport.scores?.communication || 84}%
                </div>
              </div>

              <div className="glass-panel">
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: '700' }}>Problem Solving</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--emerald)', marginTop: '2px' }}>
                  {finalReport.scores?.problemSolving || 80}%
                </div>
              </div>

              <div className="glass-panel">
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: '700' }}>Role Fit & Clarity</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--amber)', marginTop: '2px' }}>
                  {finalReport.scores?.roleFit || 85}%
                </div>
              </div>
            </div>

            {/* Strengths & Actionable Feedback */}
            <div className="grid-2" style={{ marginBottom: '20px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#6ee7b7', marginBottom: '8px' }}>
                  Key Strengths
                </h4>
                <ul style={{ paddingLeft: '16px', fontSize: '0.84rem', color: 'var(--text-body)', lineHeight: '1.6' }}>
                  {finalReport.strengths?.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fcd34d', marginBottom: '8px' }}>
                  Targeted Improvements
                </h4>
                <ul style={{ paddingLeft: '16px', fontSize: '0.84rem', color: 'var(--text-body)', lineHeight: '1.6' }}>
                  {finalReport.improvements?.map((imp, idx) => (
                    <li key={idx}>{imp}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Next Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <button 
                onClick={() => setSessionState('setup')}
                className="btn btn-secondary"
              >
                <RefreshCw size={15} /> Practice Another Session
              </button>
              <Link to="/career" className="btn btn-primary">
                View Career Passport <ArrowRight size={15} />
              </Link>
            </div>

          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .interview-setup-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
