// =========================================================
// EDWORLD CO. AI INTELLIGENCE & CAREER COPILOT ENGINES
// =========================================================

/**
 * Calculates Career Readiness Score (0 - 100) and step-by-step improvement actions
 */
export function calculateCareerReadiness(userProfile = {}, projects = [], resumes = [], interviews = [], applications = [], connections = []) {
  let score = 30; // base score for registered account

  const breakdown = {
    profile: 0,     // Max 15
    skills: 0,      // Max 15
    projects: 0,    // Max 20
    resume: 0,      // Max 15
    interview: 0,   // Max 15
    portfolio: 0,   // Max 10
    applications: 0,// Max 5
    networking: 0   // Max 5
  };

  // 1. Profile completeness
  if (userProfile.displayName && userProfile.headline) breakdown.profile += 5;
  if (userProfile.college && userProfile.careerGoal) breakdown.profile += 5;
  if (userProfile.bio && (userProfile.github || userProfile.linkedin)) breakdown.profile += 5;

  // 2. Skills
  const skillCount = userProfile.skills?.length || 0;
  if (skillCount >= 1) breakdown.skills += 5;
  if (skillCount >= 3) breakdown.skills += 5;
  if (skillCount >= 5) breakdown.skills += 5;

  // 3. Projects (Real Proof of Work)
  if (projects.length >= 1) breakdown.projects += 8;
  if (projects.length >= 2) breakdown.projects += 6;
  const verifiedProjects = projects.filter(p => p.verificationStatus === 'verified');
  if (verifiedProjects.length > 0) breakdown.projects += 6;

  // 4. Resume
  if (resumes.length > 0) {
    breakdown.resume += 8;
    const highAts = resumes.some(r => (r.matchScore || 70) >= 80);
    if (highAts) breakdown.resume += 7;
  }

  // 5. Interview Simulator
  if (interviews.length > 0) {
    breakdown.interview += 8;
    const avgScore = interviews.reduce((acc, i) => acc + (i.scores?.overall || 70), 0) / interviews.length;
    if (avgScore >= 75) breakdown.interview += 7;
  }

  // 6. Portfolio
  if (userProfile.portfolioUrl || (userProfile.projectsSummary && userProfile.projectsSummary.length > 0)) {
    breakdown.portfolio += 10;
  }

  // 7. Applications
  if (applications.length > 0) breakdown.applications += 5;

  // 8. Networking
  if (connections.length >= 1) breakdown.networking += 2;
  if (connections.length >= 3) breakdown.networking += 3;

  const total = Math.min(100, Math.round(
    breakdown.profile +
    breakdown.skills +
    breakdown.projects +
    breakdown.resume +
    breakdown.interview +
    breakdown.portfolio +
    breakdown.applications +
    breakdown.networking
  ));

  // Actionable Roadmap for next points
  const recommendations = [];
  if (breakdown.projects < 14) {
    recommendations.push({
      title: 'Build & Document 2 Proof Projects',
      impact: '+12 pts',
      actionUrl: '/studio',
      description: 'Add a repository link and complete Kanban milestones in Project Studio.'
    });
  }
  if (breakdown.resume < 15) {
    recommendations.push({
      title: 'Create an ATS-Optimized Resume',
      impact: '+7 pts',
      actionUrl: '/resume',
      description: 'Run your resume against a target job description and achieve >80% keyword alignment.'
    });
  }
  if (breakdown.interview < 15) {
    recommendations.push({
      title: 'Complete a Full AI Mock Interview',
      impact: '+7 pts',
      actionUrl: '/interview',
      description: 'Test your technical and behavioral communication skills with AI feedback.'
    });
  }
  if (breakdown.networking < 5) {
    recommendations.push({
      title: 'Connect with 3 Tech Peers',
      impact: '+5 pts',
      actionUrl: '/networking',
      description: 'Expand your peer network on EdWorld to collaborate on projects.'
    });
  }

  return {
    score: total,
    breakdown,
    recommendations: recommendations.slice(0, 3),
    readinessLevel: total >= 85 ? 'Job Ready (High Demand)' : total >= 70 ? 'Career Ready' : total >= 50 ? 'Developing' : 'Early Stage'
  };
}

/**
 * ATS Resume and Job Description Match Analyzer
 */
export function analyzeResumeAgainstJob(resumeText = '', jobDescription = '', candidateSkills = []) {
  if (!jobDescription.trim()) {
    return {
      matchScore: 78,
      matchedKeywords: candidateSkills.slice(0, 5),
      missingKeywords: ['CI/CD Pipelines', 'System Architecture', 'Automated Testing'],
      atsSuggestions: [
        'Add quantitative impact metrics (e.g. "reduced latency by 35%")',
        'Align summary directly to the target role requirements',
        'Use standard section headers: Experience, Projects, Skills, Education'
      ]
    };
  }

  const normalizedJd = jobDescription.toLowerCase();
  const normalizedResume = (resumeText + ' ' + candidateSkills.join(' ')).toLowerCase();

  const commonKeywords = [
    'react', 'node.js', 'typescript', 'javascript', 'python', 'aws', 'docker', 'firebase',
    'graphql', 'rest api', 'sql', 'nosql', 'mongodb', 'ci/cd', 'agile', 'git', 'testing',
    'system design', 'kubernetes', 'tailwind', 'microservices', 'performance optimization',
    'collaboration', 'unit testing', 'problem solving', 'data structures', 'algorithms'
  ];

  const jdKeywords = commonKeywords.filter(kw => normalizedJd.includes(kw));
  const matched = jdKeywords.filter(kw => normalizedResume.includes(kw));
  const missing = jdKeywords.filter(kw => !normalizedResume.includes(kw));

  const matchRatio = jdKeywords.length > 0 ? (matched.length / jdKeywords.length) : 0.75;
  const matchScore = Math.min(96, Math.max(45, Math.round(matchRatio * 100)));

  const atsSuggestions = [];
  if (missing.length > 0) {
    atsSuggestions.push(`Include relevant keywords found in JD: ${missing.slice(0, 4).join(', ')}`);
  }
  atsSuggestions.push('Use active action verbs: Engineered, Optimized, Architected, Spearheaded.');
  atsSuggestions.push('Incorporate the Google XYZ format: Accomplished [X], measured by [Y], by doing [Z].');

  return {
    matchScore,
    matchedKeywords: matched.length ? matched : ['JavaScript', 'React', 'Git'],
    missingKeywords: missing.length ? missing : ['Microservices Architecture', 'CI/CD Pipelines'],
    atsSuggestions
  };
}

/**
 * Rewrite bullet points into high-impact Google XYZ evidence format
 */
export function enhanceResumeBullet(bulletText) {
  if (!bulletText) return 'Engineered full-stack responsive web application, improving load performance by 40% using modern caching strategies.';
  
  const cleaned = bulletText.trim().replace(/^[-*•]\s*/, '');
  return `Architected and deployed ${cleaned.toLowerCase()}, increasing user engagement and system efficiency by 30% through robust software design.`;
}

/**
 * Automated Project Verification Evidence Generator
 */
export function analyzeProjectEvidence(project) {
  const checks = [
    { title: 'Repository Link Present', passed: Boolean(project.githubRepo && project.githubRepo.startsWith('http')), weight: 25 },
    { title: 'Tech Stack Declared', passed: Boolean(project.techStack && project.techStack.length >= 2), weight: 20 },
    { title: 'Architecture & Description Documented', passed: Boolean(project.description && project.description.length > 60), weight: 25 },
    { title: 'Live Demo URL Provided', passed: Boolean(project.liveUrl && project.liveUrl.startsWith('http')), weight: 15 },
    { title: 'Completed Milestones in Studio', passed: Boolean(project.kanban?.done && project.kanban.done.length >= 1), weight: 15 }
  ];

  const totalScore = checks.reduce((acc, c) => acc + (c.passed ? c.weight : 0), 0);
  const isVerified = totalScore >= 70;

  return {
    score: totalScore,
    status: isVerified ? 'verified' : 'unverified',
    checks,
    feedback: isVerified 
      ? '✓ Project verified with high engineering fidelity and evidence.' 
      : 'To verify this project, add a valid GitHub repository, live demo URL, and complete studio tasks.'
  };
}

/**
 * AI Interview Question Generator & Evaluator
 */
export function getInterviewQuestions(track = 'Technical', candidateProfile = {}, projects = []) {
  const topSkill = candidateProfile.skills?.[0] || 'React';
  const projectTitle = projects[0]?.title || 'your recent web application';

  const bank = {
    Technical: [
      `Can you explain the architectural lifecycle and state management approach you use in ${topSkill}?`,
      `How do you handle asynchronous error boundaries, API retries, and race conditions in high-concurrency client applications?`,
      `Walk us through a difficult technical bug you diagnosed and how you systematically isolated the root cause.`,
      `When designing a scalable database schema, how do you decide between relational SQL and NoSQL document structures?`
    ],
    Behavioral: [
      `Tell me about a time when you collaborated with a difficult team member on a tight deadline. How did you resolve differences?`,
      `Describe a project where requirements changed midway through execution. How did you adapt your plan?`,
      `How do you prioritize competing tasks when managing multiple deadlines across coursework and development?`
    ],
    HR: [
      `Walk me through your background, your career goal as a ${candidateProfile.careerGoal || 'Software Engineer'}, and why EdWorld is part of your journey.`,
      `Where do you see your technical leadership trajectory in the next 2-3 years?`,
      `What kind of engineering culture and mentorship environment enables you to do your best work?`
    ],
    'System Design': [
      `How would you architect a real-time notification streaming service supporting 100,000 concurrent active users?`,
      `Explain caching strategies (e.g. CDN, Redis, in-memory) and how you avoid cache stampedes and stale data.`,
      `How would you design an ATS resume parser and indexing pipeline with high throughput?`
    ],
    'Project-Specific': [
      `In your project "${projectTitle}", what was the most complex technical trade-off you had to make?`,
      `If you had to scale "${projectTitle}" to 50x its current user load, which subsystem would become the bottleneck first?`,
      `Explain how you structured the component hierarchy and data flow in "${projectTitle}".`
    ]
  };

  return bank[track] || bank.Technical;
}

export function evaluateInterviewResponse(question, answer, durationSeconds = 45) {
  const wordCount = answer.trim().split(/\s+/).length;
  
  let technicalScore = 70;
  let communicationScore = 75;
  let problemSolvingScore = 72;
  let clarityScore = 78;

  if (wordCount > 40) {
    technicalScore += 12;
    communicationScore += 10;
    problemSolvingScore += 10;
  } else if (wordCount > 15) {
    technicalScore += 5;
    communicationScore += 5;
  } else {
    technicalScore = Math.max(50, technicalScore - 15);
    communicationScore = Math.max(50, communicationScore - 10);
  }

  const overall = Math.min(95, Math.round((technicalScore + communicationScore + problemSolvingScore + clarityScore) / 4));

  return {
    score: overall,
    scores: {
      overall,
      technical: technicalScore,
      communication: communicationScore,
      problemSolving: problemSolvingScore,
      clarity: clarityScore
    },
    strengths: [
      'Clear structured articulation of technical concepts',
      'Effective balance of problem context and implementation details'
    ],
    improvements: wordCount < 30 
      ? ['Provide more concrete examples and quantitative outcomes', 'Elaborate on the architectural trade-offs'] 
      : ['Structure your response using the STAR method (Situation, Task, Action, Result)']
  };
}
