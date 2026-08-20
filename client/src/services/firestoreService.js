import { 
  db 
} from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp, 
  runTransaction,
  onSnapshot,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

// ==========================================
// USER & PROFILE MANAGEMENT & ROUTE RESOLVER
// ==========================================

export function resolveUserRoute(firebaseUser, profile) {
  if (!firebaseUser) {
    return '/login';
  }
  if (!profile || profile.profileCompleted !== true) {
    return '/onboarding';
  }
  return '/dashboard';
}

export async function getUserProfile(uid) {
  if (!uid) return null;
  try {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return null;
  } catch (err) {
    console.error('Error fetching user profile:', err);
    throw err;
  }
}

export async function getOrCreateUserProfile(firebaseUser) {
  if (!firebaseUser || !firebaseUser.uid) return null;
  const uid = firebaseUser.uid;
  try {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    // Document does not exist: create minimal uncompleted profile
    const initialData = {
      uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || '',
      photoURL: firebaseUser.photoURL || '',
      profileCompleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(docRef, initialData, { merge: true });
    return { id: uid, ...initialData };
  } catch (err) {
    console.error('Error in getOrCreateUserProfile:', err);
    throw err;
  }
}

export async function checkUsernameAvailable(username) {
  if (!username) return false;
  const clean = username.toLowerCase().trim();
  try {
    const docRef = doc(db, 'usernames', clean);
    const snap = await getDoc(docRef);
    return !snap.exists();
  } catch (err) {
    console.error('Error checking username:', err);
    return false;
  }
}

export async function claimUsernameAndCreateProfile(uid, profileData) {
  const username = profileData.username.toLowerCase().trim();
  const userRef = doc(db, 'users', uid);
  const usernameRef = doc(db, 'usernames', username);
  const publicProfileRef = doc(db, 'publicProfiles', uid);

  return await runTransaction(db, async (transaction) => {
    const usernameDoc = await transaction.get(usernameRef);
    if (usernameDoc.exists() && usernameDoc.data().uid !== uid) {
      throw new Error(`Username @${username} is already taken.`);
    }

    const baseData = {
      uid,
      username,
      displayName: profileData.displayName || '',
      email: profileData.email || '',
      photoURL: profileData.photoURL || '',
      headline: profileData.headline || '',
      bio: profileData.bio || '',
      college: profileData.college || '',
      degree: profileData.degree || '',
      branch: profileData.branch || '',
      gradYear: profileData.gradYear || '',
      location: profileData.location || '',
      careerGoal: profileData.careerGoal || '',
      skills: profileData.skills || [],
      experience: profileData.experience || [],
      education: profileData.education || [],
      github: profileData.github || '',
      linkedin: profileData.linkedin || '',
      portfolioUrl: profileData.portfolioUrl || '',
      careerScore: profileData.careerScore !== undefined ? profileData.careerScore : null,
      role: profileData.role || 'student',
      status: 'active',
      privacy: profileData.privacy || 'public',
      profileCompleted: true,
      updatedAt: serverTimestamp()
    };

    // 1. Reserve username
    transaction.set(usernameRef, { uid, username, createdAt: serverTimestamp() });

    // 2. Write full private profile
    transaction.set(userRef, { ...baseData, createdAt: serverTimestamp() }, { merge: true });

    // 3. Write discoverable public profile
    transaction.set(publicProfileRef, {
      uid,
      username,
      displayName: baseData.displayName,
      photoURL: baseData.photoURL,
      headline: baseData.headline,
      college: baseData.college,
      careerGoal: baseData.careerGoal,
      skills: baseData.skills,
      careerScore: baseData.careerScore,
      github: baseData.github,
      linkedin: baseData.linkedin,
      privacy: baseData.privacy,
      status: baseData.status,
      updatedAt: serverTimestamp()
    }, { merge: true });

    return baseData;
  });
}

export async function updateUserProfile(uid, updates) {
  if (!uid) return;
  const userRef = doc(db, 'users', uid);
  const publicProfileRef = doc(db, 'publicProfiles', uid);

  const cleanUpdates = {
    ...updates,
    updatedAt: serverTimestamp()
  };

  await updateDoc(userRef, cleanUpdates);

  // Sync to public profile if public fields changed
  const publicFields = ['displayName', 'photoURL', 'headline', 'college', 'careerGoal', 'skills', 'careerScore', 'github', 'linkedin', 'privacy', 'status'];
  const publicUpdates = {};
  publicFields.forEach(f => {
    if (updates[f] !== undefined) publicUpdates[f] = updates[f];
  });

  if (Object.keys(publicUpdates).length > 0) {
    publicUpdates.updatedAt = serverTimestamp();
    await setDoc(publicProfileRef, publicUpdates, { merge: true });
  }
}

export async function getPublicProfileByUsername(username) {
  if (!username) return null;
  const clean = username.toLowerCase().trim();
  try {
    const q = query(collection(db, 'publicProfiles'), where('username', '==', clean), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docData = snap.docs[0].data();
      // Fetch public projects for this user
      const projectsQ = query(collection(db, 'projects'), where('ownerId', '==', docData.uid), limit(6));
      const projSnap = await getDocs(projectsQ);
      const projects = projSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      return { ...docData, projects };
    }
    return null;
  } catch (err) {
    console.error('Error fetching public profile:', err);
    return null;
  }
}

export async function getPublicProfiles(currentUid, filters = {}) {
  try {
    const q = query(
      collection(db, 'publicProfiles'),
      where('privacy', 'in', ['public', 'network']),
      limit(50)
    );
    const snap = await getDocs(q);
    let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Exclude current user
    if (currentUid) {
      list = list.filter(u => u.uid !== currentUid);
    }

    // Filter by query if provided
    if (filters.search) {
      const term = filters.search.toLowerCase();
      list = list.filter(u => 
        (u.displayName && u.displayName.toLowerCase().includes(term)) ||
        (u.headline && u.headline.toLowerCase().includes(term)) ||
        (u.college && u.college.toLowerCase().includes(term)) ||
        (u.careerGoal && u.careerGoal.toLowerCase().includes(term)) ||
        (u.skills && u.skills.some(s => s.toLowerCase().includes(term)))
      );
    }

    if (filters.skill) {
      const sTerm = filters.skill.toLowerCase();
      list = list.filter(u => u.skills && u.skills.some(s => s.toLowerCase().includes(sTerm)));
    }

    return list;
  } catch (err) {
    console.error('Error fetching public profiles:', err);
    return [];
  }
}

// ==========================================
// PROJECTS & PROJECT STUDIO
// ==========================================

export async function getUserProjects(uid) {
  if (!uid) return [];
  try {
    const q = query(
      collection(db, 'projects'),
      where('ownerId', '==', uid)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Error fetching user projects:', err);
    return [];
  }
}

export async function createProject(uid, projectData) {
  const newRef = doc(collection(db, 'projects'));
  const payload = {
    id: newRef.id,
    ownerId: uid,
    ownerName: projectData.ownerName || '',
    ownerAvatar: projectData.ownerAvatar || '',
    title: projectData.title || '',
    tagline: projectData.tagline || '',
    description: projectData.description || '',
    techStack: projectData.techStack || [],
    githubRepo: projectData.githubRepo || '',
    liveUrl: projectData.liveUrl || '',
    lookingFor: projectData.lookingFor || [],
    stage: projectData.stage || 'Build',
    verificationStatus: 'unverified',
    verificationScore: 0,
    verificationEvidence: null,
    kanban: projectData.kanban || {
      todo: [],
      inProgress: [],
      done: []
    },
    scratchpad: projectData.scratchpad || `// Project Sandbox for ${projectData.title}`,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(newRef, payload);
  return payload;
}

export async function updateProject(id, updates) {
  const projectRef = doc(db, 'projects', id);
  await updateDoc(projectRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

export async function deleteProject(id) {
  await deleteDoc(doc(db, 'projects', id));
}

// ==========================================
// ATS RESUMES
// ==========================================

export async function getUserResumes(uid) {
  if (!uid) return [];
  try {
    const q = query(
      collection(db, 'resumes'),
      where('userId', '==', uid)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Error fetching resumes:', err);
    return [];
  }
}

export async function saveResume(resumeData) {
  const id = resumeData.id || doc(collection(db, 'resumes')).id;
  const resumeRef = doc(db, 'resumes', id);

  const payload = {
    ...resumeData,
    id,
    updatedAt: serverTimestamp()
  };

  if (!resumeData.createdAt) {
    payload.createdAt = serverTimestamp();
  }

  await setDoc(resumeRef, payload, { merge: true });
  return payload;
}

export async function deleteResume(id) {
  await deleteDoc(doc(db, 'resumes', id));
}

// ==========================================
// OPPORTUNITIES & JOBS
// ==========================================

export async function getJobs(filters = {}) {
  try {
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    let jobsList = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Apply in-memory filters for flexibility
    if (filters.type && filters.type !== 'All') {
      jobsList = jobsList.filter(j => j.type === filters.type);
    }
    if (filters.search) {
      const term = filters.search.toLowerCase();
      jobsList = jobsList.filter(j => 
        j.title.toLowerCase().includes(term) ||
        j.company.toLowerCase().includes(term) ||
        (j.skillsRequired && j.skillsRequired.some(s => s.toLowerCase().includes(term)))
      );
    }
    if (filters.remoteOnly) {
      jobsList = jobsList.filter(j => j.remote);
    }

    return jobsList;
  } catch (err) {
    console.error('Error fetching jobs:', err);
    return [];
  }
}

export async function getJobById(id) {
  if (!id) return null;
  try {
    const snap = await getDoc(doc(db, 'jobs', id));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return null;
  } catch (err) {
    console.error('Error fetching job details:', err);
    return null;
  }
}

export async function createJob(jobData) {
  const newRef = doc(collection(db, 'jobs'));
  const payload = {
    id: newRef.id,
    ...jobData,
    published: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  await setDoc(newRef, payload);
  return payload;
}

export async function updateJob(id, updates) {
  await updateDoc(doc(db, 'jobs', id), {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

export async function deleteJob(id) {
  await deleteDoc(doc(db, 'jobs', id));
}

// ==========================================
// APPLICATION PIPELINE TRACKER
// ==========================================

export async function getUserApplications(uid) {
  if (!uid) return [];
  try {
    const q = query(
      collection(db, 'applications'),
      where('userId', '==', uid)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Error fetching user applications:', err);
    return [];
  }
}

export async function createApplication(appData) {
  const newRef = doc(collection(db, 'applications'));
  const payload = {
    id: newRef.id,
    userId: appData.userId,
    jobId: appData.jobId || '',
    company: appData.company,
    role: appData.role,
    location: appData.location || 'Remote',
    stipendSalary: appData.stipendSalary || '',
    stage: appData.stage || 'Saved', // Saved -> Preparing -> Applied -> Assessment -> Shortlisted -> Interview -> Offer -> Rejected
    appliedDate: appData.appliedDate || new Date().toISOString().split('T')[0],
    deadline: appData.deadline || '',
    notes: appData.notes || '',
    resumeAttached: appData.resumeAttached || 'Master Profile',
    matchScore: appData.matchScore || 85,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  await setDoc(newRef, payload);
  return payload;
}

export async function updateApplicationStage(id, stage) {
  await updateDoc(doc(db, 'applications', id), {
    stage,
    updatedAt: serverTimestamp()
  });
}

export async function updateApplication(id, updates) {
  await updateDoc(doc(db, 'applications', id), {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

export async function deleteApplication(id) {
  await deleteDoc(doc(db, 'applications', id));
}

// ==========================================
// AI INTERVIEW SESSIONS
// ==========================================

export async function getUserInterviews(uid) {
  if (!uid) return [];
  try {
    const q = query(
      collection(db, 'interviews'),
      where('userId', '==', uid)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Error fetching user interviews:', err);
    return [];
  }
}

export async function saveInterviewSession(interviewData) {
  const newRef = doc(collection(db, 'interviews'));
  const payload = {
    id: newRef.id,
    ...interviewData,
    completedAt: serverTimestamp()
  };
  await setDoc(newRef, payload);
  return payload;
}

// ==========================================
// PEER NETWORKING & CONNECTIONS
// ==========================================

export async function getConnectionRequests(uid) {
  if (!uid) return { incoming: [], outgoing: [] };
  try {
    const incomingQ = query(
      collection(db, 'connectionRequests'),
      where('toUserId', '==', uid),
      where('status', '==', 'pending')
    );
    const outgoingQ = query(
      collection(db, 'connectionRequests'),
      where('fromUserId', '==', uid),
      where('status', '==', 'pending')
    );

    const [incSnap, outSnap] = await Promise.all([getDocs(incomingQ), getDocs(outgoingQ)]);

    return {
      incoming: incSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      outgoing: outSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    };
  } catch (err) {
    console.error('Error fetching connection requests:', err);
    return { incoming: [], outgoing: [] };
  }
}

export async function sendConnectionRequest(fromUser, toUser) {
  const requestId = `${fromUser.uid}_${toUser.uid}`;
  const requestRef = doc(db, 'connectionRequests', requestId);

  const payload = {
    id: requestId,
    fromUserId: fromUser.uid,
    fromUserName: fromUser.displayName,
    fromUserHeadline: fromUser.headline || '',
    fromUserAvatar: fromUser.photoURL || '',
    toUserId: toUser.uid,
    toUserName: toUser.displayName,
    toUserAvatar: toUser.photoURL || '',
    status: 'pending',
    createdAt: serverTimestamp()
  };

  await setDoc(requestRef, payload);

  // Notify recipient
  await createNotification({
    userId: toUser.uid,
    title: 'New Connection Request',
    message: `${fromUser.displayName} sent you a connection request.`,
    type: 'connection_request',
    link: '/networking'
  });

  return payload;
}

export async function respondConnectionRequest(requestId, accept, fromUid, toUid, toUserObj, fromUserObj) {
  const requestRef = doc(db, 'connectionRequests', requestId);

  if (!accept) {
    await updateDoc(requestRef, {
      status: 'declined',
      updatedAt: serverTimestamp()
    });
    return;
  }

  const connId = [fromUid, toUid].sort().join('_');
  const connRef = doc(db, 'connections', connId);

  await runTransaction(db, async (transaction) => {
    transaction.update(requestRef, {
      status: 'accepted',
      updatedAt: serverTimestamp()
    });

    transaction.set(connRef, {
      id: connId,
      users: [fromUid, toUid],
      createdAt: serverTimestamp()
    });
  });

  // Notify sender of acceptance
  if (fromUid) {
    await createNotification({
      userId: fromUid,
      title: 'Connection Accepted! 🎉',
      message: `${toUserObj?.displayName || 'A peer'} accepted your connection request.`,
      type: 'connection_accepted',
      link: '/networking'
    });
  }
}

export async function getConnectedUsers(uid) {
  if (!uid) return [];
  try {
    const q = query(
      collection(db, 'connections'),
      where('users', 'array-contains', uid)
    );
    const snap = await getDocs(q);
    const peerUids = [];

    snap.docs.forEach(docSnap => {
      const data = docSnap.data();
      const peerId = data.users.find(u => u !== uid);
      if (peerId) peerUids.push(peerId);
    });

    if (peerUids.length === 0) return [];

    // Fetch peer profiles in batches
    const peerProfiles = [];
    for (const pUid of peerUids.slice(0, 30)) {
      const pDoc = await getDoc(doc(db, 'publicProfiles', pUid));
      if (pDoc.exists()) {
        peerProfiles.push({ id: pDoc.id, ...pDoc.data() });
      }
    }
    return peerProfiles;
  } catch (err) {
    console.error('Error fetching connected users:', err);
    return [];
  }
}

// ==========================================
// NOTIFICATIONS
// ==========================================

export async function getUserNotifications(uid) {
  if (!uid) return [];
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', uid),
      limit(30)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Error fetching notifications:', err);
    return [];
  }
}

export async function createNotification(notifData) {
  try {
    const newRef = doc(collection(db, 'notifications'));
    const payload = {
      id: newRef.id,
      userId: notifData.userId,
      title: notifData.title,
      message: notifData.message,
      type: notifData.type || 'info',
      link: notifData.link || '/dashboard',
      read: false,
      createdAt: serverTimestamp()
    };
    await setDoc(newRef, payload);
    return payload;
  } catch (err) {
    console.warn('Failed to send notification:', err);
  }
}

export async function markNotificationAsRead(id) {
  await updateDoc(doc(db, 'notifications', id), {
    read: true
  });
}

// ==========================================
// ADMIN DASHBOARD & AUDIT LOGS
// ==========================================

export async function getPlatformStats() {
  try {
    const [usersSnap, projSnap, jobsSnap, appsSnap, intSnap] = await Promise.all([
      getDocs(collection(db, 'publicProfiles')),
      getDocs(collection(db, 'projects')),
      getDocs(collection(db, 'jobs')),
      getDocs(collection(db, 'applications')),
      getDocs(collection(db, 'interviews'))
    ]);

    return {
      totalUsers: usersSnap.size,
      totalProjects: projSnap.size,
      totalJobs: jobsSnap.size,
      totalApplications: appsSnap.size,
      totalInterviews: intSnap.size,
      verifiedProjects: projSnap.docs.filter(d => d.data().verificationStatus === 'verified').length
    };
  } catch (err) {
    console.error('Error getting platform stats:', err);
    return {
      totalUsers: 0,
      totalProjects: 0,
      totalJobs: 0,
      totalApplications: 0,
      totalInterviews: 0,
      verifiedProjects: 0
    };
  }
}

export async function logAuditEvent(actor, action, targetType, targetId, details = {}) {
  try {
    const newRef = doc(collection(db, 'auditLogs'));
    await setDoc(newRef, {
      id: newRef.id,
      actorUid: actor?.uid || 'system',
      actorEmail: actor?.email || 'admin@edworld.co',
      action,
      targetType,
      targetId,
      details,
      timestamp: serverTimestamp()
    });
  } catch (err) {
    console.warn('Could not record audit log:', err);
  }
}

export async function getAuditLogs() {
  try {
    const q = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    return [];
  }
}
