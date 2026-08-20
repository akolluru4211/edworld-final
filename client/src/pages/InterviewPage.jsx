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
  ShieldCheck
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
  const [track, setTrack] = useState('Technical'); // 'Technical' | 'Behavioral' | 'HR' | 'System Design'
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
  const [micSupported, setMicSupported] = useState(true);

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
      try {
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
      } catch (e) {
        setMicSupported(false);
      }
    } else {
      setMicSupported(false);
    }
  }, []);

  // Timer Tick
  useEffect(() => {
    let interval = null;
    if (sessionState === 'active' && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    } else if (timerSeconds === 0 && sessionState === 'active') {
      handleSubmitAnswer();
    }
    return () => clearInterval(interval);
  }, [sessionState, timerSeconds]);

  const speakQuestion = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStartSession = () => {
    const qList = getInterviewQuestions(track, difficulty, userProfile?.careerGoal);
    setQuestions(qList);
    setCurrentQIndex(0);
    setTranscriptHistory([]);
    setCurrentAnswer('');
    setTimerSeconds(120);
    setSessionState('active');
    speakQuestion(qList[0]?.question || 'Welcome to your AI interview.');
    showToast(`Interview Session Started: ${track} (${difficulty})`);
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      showToast('Microphone speech-to-text not supported in this browser. Please type your answer.', 'info');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        showToast('🎙 AI is listening to your answer...');
      } catch (err) {
        console.warn('Mic start error:', err);
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    const currentQ = questions[currentQIndex];
    const userAns = currentAnswer.trim() || 'No answer provided.';
    const evalData = evaluateInterviewResponse(currentQ?.question, userAns, track);

    const stepResult = {
      question: currentQ?.question,
      userAnswer: userAns,
      evaluation: evalData
    };

    const updatedHistory = [...transcriptHistory, stepResult];
    setTranscriptHistory(updatedHistory);
    setCurrentAnswer('');

    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex(prev => prev + 1);
      setTimerSeconds(120);
      speakQuestion(questions[currentQIndex + 1]?.question);
    } else {
      // Complete Session
      const totalScore = Math.round(
        updatedHistory.reduce((acc, curr) => acc + curr.evaluation.overallScore, 0) / updatedHistory.length
      );

      const reportData = {
        userId: user.uid,
        track,
        difficulty,
        overallScore: totalScore,
        technicalScore: Math.min(100, totalScore + 3),
        communicationScore: Math.min(100, totalScore - 2),
        problemSolvingScore: Math.min(100, totalScore + 1),
        clarityScore: Math.min(100, totalScore - 1),
        transcriptHistory: updatedHistory,
        date: new Date().toISOString()
      };

      setFinalReport(reportData);
      setSessionState('report');
      await saveInterviewSession(user.uid, reportData);
      showToast(`🎉 Interview Completed! Overall Score: ${totalScore}/100`);
    }
  };

  return (
    <div className="interview-page" style={{ paddingBottom: '60px' }}>
      
      {/* 1. STATE: SETUP SCREEN */}
      {sessionState === 'setup' && (
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          
          {/* Header */}
          <div className="glass-card" style={{ padding: '28px 24px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(18, 26, 44, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.18)', border: '1px solid rgba(99, 102, 241, 0.35)', padding: '4px 10px', borderRadius: 'var(--radius-full)', marginBottom: '8px' }}>
              <Bot size={13} color="var(--primary)" />
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#a5b4fc', textTransform: 'uppercase' }}>
                AI Voice Interview Simulator
              </span>
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: '800', marginBottom: '4px' }}>
              Real-Time AI Technical Interview
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              Voice speech simulation, real-time feedback, and dimensional ATS scoring.
            </p>
          </div>

          {/* Setup Config Card */}
          <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
              <label className="form-label">Select Interview Track</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                {['Technical', 'Behavioral', 'System Design', 'HR & Culture'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTrack(t)}
                    className={`btn ${track === t ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.88rem', padding: '12px 10px', textAlign: 'center' }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="form-label">Target Difficulty</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['Junior / Entry', 'Intermediate', 'Senior / Staff'].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`segment-tab-btn ${difficulty === d ? 'active' : ''}`}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Device Readiness */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mic size={20} color="var(--emerald)" />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>Microphone & Audio</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {micSupported ? 'Speech synthesis & voice input ready' : 'Text input mode available'}
                  </div>
                </div>
              </div>
              <span className="badge badge-emerald">✓ Ready</span>
            </div>

            {/* Launch Button */}
            <button 
              onClick={handleStartSession}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Play size={18} /> Start AI Interview Session
            </button>
          </div>
        </div>
      )}

      {/* 2. STATE: ACTIVE INTERVIEW SCREEN */}
      {sessionState === 'active' && questions[currentQIndex] && (
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          
          {/* Active Top Bar */}
          <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={20} color="var(--primary)" />
              <span style={{ fontWeight: '800', fontSize: '0.92rem' }}>
                Question {currentQIndex + 1} of {questions.length}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: timerSeconds < 30 ? 'var(--rose)' : 'var(--emerald)', fontWeight: '800', fontSize: '0.95rem' }}>
              <Clock size={16} />
              <span>{Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>

          {/* AI Question Box */}
          <div className="glass-card" style={{ padding: '32px 24px', textAlign: 'center', marginBottom: '20px', borderTop: '4px solid var(--primary)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99, 102, 241, 0.15)', padding: '6px 14px', borderRadius: 'var(--radius-full)', marginBottom: '16px' }}>
              <Volume2 size={16} color="var(--primary)" />
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#a5b4fc' }}>AI INTERVIEWER ASKS:</span>
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: '800', lineHeight: '1.4', marginBottom: '16px', color: '#fff' }}>
              "{questions[currentQIndex].question}"
            </h2>

            <button 
              onClick={() => speakQuestion(questions[currentQIndex].question)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', gap: '6px' }}
            >
              <RotateCcw size={14} /> Repeat Question
            </button>
          </div>

          {/* User Answer Area */}
          <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label className="form-label" style={{ margin: 0 }}>Your Answer (Voice or Typed):</label>
              {isRecording && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--rose)', fontSize: '0.8rem', fontWeight: '700' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--rose)', animation: 'pulse 1s infinite' }} />
                  Listening...
                </div>
              )}
            </div>

            <textarea 
              className="input-field" 
              rows="5"
              placeholder="Speak aloud using the mic below or type your technical response here..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              style={{ marginBottom: '16px' }}
            />

            {/* Mobile Touch Voice Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button 
                type="button" 
                onClick={toggleRecording}
                className={`btn ${isRecording ? 'btn-danger' : 'btn-secondary'}`}
                style={{ padding: '14px', justifyContent: 'center' }}
              >
                {isRecording ? <><MicOff size={18} /> Stop Listening</> : <><Mic size={18} /> Speak Answer</>}
              </button>

              <button 
                type="button" 
                onClick={handleSubmitAnswer}
                className="btn btn-primary"
                style={{ padding: '14px', justifyContent: 'center' }}
              >
                <span>Submit Answer</span> <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. STATE: SCORECARD REPORT SCREEN */}
      {sessionState === 'report' && finalReport && (
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          
          <div className="glass-card" style={{ padding: '32px 24px', textAlign: 'center', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(18, 26, 44, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', border: '2px solid var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--emerald)' }}>
              <Award size={32} />
            </div>
            
            <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '6px' }}>
              Interview Performance Report
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '20px' }}>
              {finalReport.track} Track • {finalReport.difficulty} Level
            </p>

            <div style={{
              display: 'inline-block',
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid var(--border-glow)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px 36px',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Overall Score</div>
              <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--primary)', lineHeight: 1 }}>
                {finalReport.overallScore}<span style={{ fontSize: '1.2rem', color: 'var(--text-dim)' }}>/100</span>
              </div>
            </div>
          </div>

          {/* Stacked Dimensional Scorecards */}
          <div className="responsive-grid-2" style={{ marginBottom: '24px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700' }}>Technical Precision</span>
                <span style={{ fontWeight: '800', color: 'var(--emerald)' }}>{finalReport.technicalScore}/100</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: `${finalReport.technicalScore}%`, height: '100%', background: 'var(--emerald)' }} />
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700' }}>Communication Clarity</span>
                <span style={{ fontWeight: '800', color: 'var(--secondary)' }}>{finalReport.communicationScore}/100</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: `${finalReport.communicationScore}%`, height: '100%', background: 'var(--secondary)' }} />
              </div>
            </div>
          </div>

          {/* Detailed Question Reviews */}
          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              Question-by-Question AI Critique
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {finalReport.transcriptHistory.map((item, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '8px', color: '#fff' }}>
                    Q{idx + 1}: {item.question}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px', fontStyle: 'italic' }}>
                    "{item.userAnswer}"
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#6ee7b7', background: 'rgba(16, 185, 129, 0.1)', padding: '8px 12px', borderRadius: '6px' }}>
                    💡 <strong>Feedback:</strong> {item.evaluation.feedback}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Retake / Dashboard Button */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => setSessionState('setup')}
              className="btn btn-secondary btn-lg"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <RotateCcw size={16} /> Retake / Practice More
            </button>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="btn btn-primary btn-lg"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
