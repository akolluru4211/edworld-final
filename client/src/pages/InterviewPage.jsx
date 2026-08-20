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
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  getInterviewQuestions, 
  evaluateInterviewResponse 
} from '../services/aiService';
import { 
  getUserInterviews, 
  saveInterviewSession, 
  getUserProjects 
} from '../services/firestoreService';

export default function InterviewPage() {
  const { user, userProfile } = useAuth();
  const { showToast } = useNotification();

  // Session State: 'setup' | 'active' | 'report'
  const [sessionState, setSessionState] = useState('setup');
  const [track, setTrack] = useState('Technical'); // 'Technical' | 'Behavioral' | 'HR' | 'System Design' | 'Project-Specific'
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [interviewsHistory, setInterviewsHistory] = useState([]);
  const [projects, setProjects] = useState([]);

  // Active Session State
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [transcriptHistory, setTranscriptHistory] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [finalReport, setFinalReport] = useState(null);

  const recognitionRef = useRef(null);

  useEffect(() => {
    async function loadHistory() {
      if (!user) return;
      try {
        const [hist, pList] = await Promise.all([
          getUserInterviews(user.uid),
          getUserProjects(user.uid)
        ]);
        setInterviewsHistory(hist);
        setProjects(pList);
      } catch (err) {
        console.warn('Error loading interview history:', err);
      }
    }
    loadHistory();
  }, [user]);

  // Speech Recognition Setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentAnswer(prev => prev + ' ' + transcript);
      };

      recognitionRef.current.onerror = (err) => {
        console.warn('Speech recognition error:', err);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  // Timer Tick
  useEffect(() => {
    let interval = null;
    if (sessionState === 'active' && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionState, timerSeconds]);

  const speakQuestion = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStartInterview = () => {
    const qList = getInterviewQuestions(track, userProfile || {}, projects);
    setQuestions(qList);
    setCurrentQIndex(0);
    setTranscriptHistory([]);
    setCurrentAnswer('');
    setTimerSeconds(120);
    setSessionState('active');
    speakQuestion(qList[0]);
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      showToast('Speech recognition not supported in this browser. Please type your response.', 'info');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      showToast('Please provide an answer before submitting.', 'info');
      return;
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    const currentQ = questions[currentQIndex];
    const evaluation = evaluateInterviewResponse(currentQ, currentAnswer);

    const stepData = {
      question: currentQ,
      answer: currentAnswer,
      score: evaluation.score,
      evaluation
    };

    const updatedHistory = [...transcriptHistory, stepData];
    setTranscriptHistory(updatedHistory);
    setCurrentAnswer('');

    if (currentQIndex + 1 < questions.length) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      setTimerSeconds(120);
      speakQuestion(questions[nextIdx]);
    } else {
      // Complete Session & Compute Final Report
      const avgOverall = Math.round(updatedHistory.reduce((acc, h) => acc + h.score, 0) / updatedHistory.length);
      const avgTech = Math.round(updatedHistory.reduce((acc, h) => acc + h.evaluation.scores.technical, 0) / updatedHistory.length);
      const avgComm = Math.round(updatedHistory.reduce((acc, h) => acc + h.evaluation.scores.communication, 0) / updatedHistory.length);
      const avgProblem = Math.round(updatedHistory.reduce((acc, h) => acc + h.evaluation.scores.problemSolving, 0) / updatedHistory.length);

      const reportPayload = {
        userId: user.uid,
        role: userProfile?.careerGoal || 'Software Engineer',
        track,
        difficulty,
        transcript: updatedHistory,
        scores: {
          overall: avgOverall,
          technical: avgTech,
          communication: avgComm,
          problemSolving: avgProblem
        },
        strengths: [
          'Effective clarity in technical articulation',
          'Good demonstration of software engineering principles'
        ],
        recommendations: [
          'Incorporate more quantitative impact metrics in behavioral responses',
          'Elaborate on architectural edge-cases and error handling'
        ]
      };

      try {
        await saveInterviewSession(reportPayload);
        setFinalReport(reportPayload);
        setInterviewsHistory(prev => [reportPayload, ...prev]);
        setSessionState('report');
        showToast('🎉 Interview session completed and evaluated!');
      } catch (err) {
        showToast('Error saving interview report', 'error');
        setFinalReport(reportPayload);
        setSessionState('report');
      }
    }
  };

  return (
    <div className="interview-page">
      {/* 1. SETUP VIEW */}
      {sessionState === 'setup' && (
        <>
          <div className="hero-banner" style={{ padding: '36px 32px', marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(192, 132, 252, 0.18)', border: '1px solid rgba(192, 132, 252, 0.35)', padding: '4px 12px', borderRadius: 'var(--radius-full)', marginBottom: '10px' }}>
                  <Bot size={14} color="#c084fc" />
                  <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#e9d5ff', textTransform: 'uppercase' }}>
                    AI Career Simulator
                  </span>
                </div>
                <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '6px' }}>
                  AI Technical Interview Simulator
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '640px' }}>
                  Simulate realistic mock interviews tailored to your actual skills, projects, and target role with instant AI feedback.
                </p>
              </div>
            </div>
          </div>

          <div className="grid-2">
            {/* Setup Controls */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                Interview Configuration
              </h3>

              <div className="form-group">
                <label className="form-label">Interview Track</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                  {['Technical', 'Behavioral', 'HR', 'System Design', 'Project-Specific'].map(t => (
                    <button 
                      key={t}
                      type="button"
                      onClick={() => setTrack(t)}
                      className={`btn btn-sm ${track === t ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '10px', fontSize: '0.85rem' }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Difficulty Level</label>
                <select 
                  className="select-field"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="Entry Level (Intern/Graduate)">Entry Level (Intern/Graduate)</option>
                  <option value="Intermediate">Intermediate (1-2 yrs experience)</option>
                  <option value="Advanced / FAANG">Advanced / FAANG Standard</option>
                </select>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <div style={{ fontWeight: '700', color: '#fff', marginBottom: '4px' }}>AI Context Linkage:</div>
                Questions will reference your target goal (<strong style={{ color: 'var(--secondary)' }}>{userProfile?.careerGoal}</strong>) and your {projects.length} verified projects.
              </div>

              <button onClick={handleStartInterview} className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
                <Play size={16} /> Enter Interview Room
              </button>
            </div>

            {/* Past Interview History */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                Performance History ({interviewsHistory.length})
              </h3>

              {interviewsHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                  <Award size={36} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '0.88rem' }}>No past mock interviews. Complete your first session to establish your score baseline.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {interviewsHistory.slice(0, 4).map((h, idx) => (
                    <div key={idx} style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>{h.track} Interview</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{h.difficulty} · {h.transcript?.length || 3} questions</div>
                      </div>
                      <span className="badge badge-emerald" style={{ fontSize: '0.85rem', fontWeight: '800' }}>
                        {h.scores?.overall || 78} / 100
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* 2. ACTIVE INTERVIEW ROOM VIEW */}
      {sessionState === 'active' && questions.length > 0 && (
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          {/* Status Bar */}
          <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '16px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Bot size={24} color="var(--primary)" />
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>{track} Interview Simulator</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Question {currentQIndex + 1} of {questions.length}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: timerSeconds < 30 ? 'var(--rose)' : 'var(--emerald)', fontWeight: '700', fontSize: '0.95rem' }}>
                <Clock size={16} />
                <span>{Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}</span>
              </div>

              <button onClick={() => setSessionState('setup')} className="btn btn-secondary btn-sm">
                Exit
              </button>
            </div>
          </div>

          {/* AI Question Box */}
          <div className="glass-card" style={{
            background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: '1px solid var(--border-glow)',
            padding: '32px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span className="badge badge-primary">Interviewer Prompt</span>
              <button onClick={() => speakQuestion(questions[currentQIndex])} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                <Volume2 size={13} /> Replay Audio
              </button>
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: '700', lineHeight: '1.5' }}>
              "{questions[currentQIndex]}"
            </h2>
          </div>

          {/* Candidate Response Editor */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Your Response</label>
              <button 
                onClick={toggleRecording} 
                className={`btn btn-sm ${isRecording ? 'btn-danger' : 'btn-outline'}`}
              >
                {isRecording ? <><MicOff size={14} /> Stop Recording</> : <><Mic size={14} /> Speak Answer</>}
              </button>
            </div>

            <textarea 
              className="textarea-field" 
              rows={6}
              placeholder="Type or speak your structured answer here (mention technologies, trade-offs, and outcomes)..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                {currentAnswer.trim().split(/\s+/).filter(Boolean).length} words
              </span>

              <button onClick={handleSubmitAnswer} className="btn btn-primary">
                <span>{currentQIndex + 1 === questions.length ? 'Submit Final & Finish' : 'Next Question'}</span>
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. POST-INTERVIEW COMPREHENSIVE REPORT VIEW */}
      {sessionState === 'report' && finalReport && (
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div className="glass-card" style={{
            background: 'linear-gradient(135deg, rgba(18, 26, 44, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
            border: '1px solid var(--border-glow)',
            padding: '36px',
            marginBottom: '24px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '28px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '20px' }}>
              <span className="badge badge-emerald" style={{ marginBottom: '10px' }}>✓ Evaluation Complete</span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '6px' }}>Interview Scorecard</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Track: {finalReport.track} · Role: {finalReport.role}
              </p>
              <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--emerald)', marginTop: '10px' }}>
                {finalReport.scores.overall} <span style={{ fontSize: '1.2rem', color: 'var(--text-dim)' }}>/ 100</span>
              </div>
            </div>

            {/* Score Dimensions Breakdown */}
            <div className="grid-3" style={{ marginBottom: '28px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Technical Depth</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary)', marginTop: '4px' }}>
                  {finalReport.scores.technical}/100
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Communication</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--secondary)', marginTop: '4px' }}>
                  {finalReport.scores.communication}/100
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Problem Solving</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--emerald)', marginTop: '4px' }}>
                  {finalReport.scores.problemSolving}/100
                </div>
              </div>
            </div>

            {/* Strengths & Recommendations */}
            <div className="grid-2-even" style={{ gap: '16px', marginBottom: '28px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '18px', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--emerald)', marginBottom: '10px' }}>
                  ✓ Demonstrated Strengths
                </h4>
                <ul style={{ paddingLeft: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {finalReport.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '18px', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--amber)', marginBottom: '10px' }}>
                  🎯 Improvement Recommendations
                </h4>
                <ul style={{ paddingLeft: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {finalReport.recommendations.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
              <button onClick={() => setSessionState('setup')} className="btn btn-secondary">
                <RotateCcw size={15} /> Practice Another Track
              </button>
              <button onClick={() => window.print()} className="btn btn-primary">
                <FileText size={15} /> Download Scorecard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
