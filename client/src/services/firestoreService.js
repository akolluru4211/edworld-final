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

// =========================================================================
// 1. ROUTE RESOLVER & AUTH-FIRESTORE STATE COUPLING
// =========================================================================

export function resolveUserRoute(firebaseUser, profile) {
  if (!firebaseUser) {
    return '/login';
  }
  if (!profile || profile.profileCompleted !== true) {
    return '/onboarding';
  }
  return '/dashboard';
}

// =========================================================================
// 2. USER PROFILE MANAGEMENT
// =========================================================================

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
    console.error('Error in getUserProfile:', err);
    throw err;
  }
}

/**
 * Initializes minimal user document in /users/{uid} upon first authentication.
 * Immediately verifies write persistence.
 */
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
      networkVisibility: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(docRef, initialData, { merge: true });

    // Verify write persisted
    const verifySnap = await getDoc(docRef);
    if (!verifySnap.exists()) {
      throw new Error('Firestore document write could not be verified.');
    }

    return { id: uid, ...initialData };
  } catch (err) {
    console.error('Error in getOrCreateUserProfile:', err);
    throw err;
  }
}

/**
 * Check if a username is available in /usernames/{username}
 */
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

/**
 * Atomically reserves username in /usernames/{username}, writes /users/{uid},
 * and creates /publicProfiles/{uid} for network discovery.
 */
export async function claimUsernameAndCreateProfile(uid, profileData) {
  if (!uid) throw new Error('UID is required for profile activation.');
  const username = profileData.username.toLowerCase().trim();
  const userRef = doc(db, 'users', uid);
  const usernameRef = doc(db, 'usernames', username);
  const publicProfileRef = doc(db, 'publicProfiles', uid);

  // Execute atomic transaction
  await runTransaction(db, async (transaction) => {
    const usernameDoc = await transaction.get(usernameRef);
    if (usernameDoc.exists() && usernameDoc.data().uid !== uid) {
      throw new Error(`Username @${username} is already taken. Please choose another.`);
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
      careerScore: profileData.careerScore !== undefined ? profileData.careerScore : 80,
      role: profileData.role || 'student',
      status: 'active',
      privacy: profileData.privacy || 'public',
      networkVisibility: profileData.networkVisibility !== false,
      profileCompleted: true,
      updatedAt: serverTimestamp()
    };

    // 1. Reserve username
    transaction.set(usernameRef, { uid, username, createdAt: serverTimestamp() });

    // 2. Write full private profile
    transaction.set(userRef, { ...baseData, createdAt: serverTimestamp() }, { merge: true });

    // 3. Write discoverable public profile with safe non-sensitive attributes
    transaction.set(publicProfileRef, {
      uid,
      username,
      displayName: baseData.displayName,
      photoURL: baseData.photoURL,
      headline: baseData.headline,
      bio: baseData.bio,
      college: baseData.college,
      degree: baseData.degree,
      branch: baseData.branch,
      gradYear: baseData.gradYear,
      location: baseData.location,
      careerGoal: baseData.careerGoal,
      skills: baseData.skills,
      careerScore: baseData.careerScore,
      github: baseData.github,
      linkedin: baseData.linkedin,
      privacy: baseData.privacy,
      networkVisibility: baseData.networkVisibility,
      status: baseData.status,
      updatedAt: serverTimestamp()
    }, { merge: true });
  });

  // Verify write succeeded
  const verifySnap = await getDoc(userRef);
  if (!verifySnap.exists() || verifySnap.data().profileCompleted !== true) {
    throw new Error('Failed to verify profile creation in database.');
  }

  return { id: uid, ...verifySnap.data() };
}

/**
 * Updates user profile and synchronizes safe fields to publicProfiles
 */
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
  const publicFields = [
    'displayName', 'photoURL', 'headline', 'bio', 'college', 'degree', 
    'branch', 'gradYear', 'location', 'careerGoal', 'skills', 'careerScore', 
    'github', 'linkedin', 'privacy', 'networkVisibility', 'status'
  ];
  const publicUpdates = {};
  publicFields.forEach(f => {
    if (updates[f] !== undefined) publicUpdates[f] = updates[f];
  });

  if (Object.keys(publicUpdates).length > 0) {
    publicUpdates.updatedAt = serverTimestamp();
    await setDoc(publicProfileRef, publicUpdates, { merge: true });
  }
}

// =========================================================================
// 3. PUBLIC DIRECTORY & NETWORK QUERIES
// =========================================================================

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

/**
 * Queries real registered EdWorld users from /publicProfiles.
 * Excludes the current authenticated user and filters for visible profiles.
 */
export async function getPublicProfiles(currentUid, filters = {}) {
  try {
    const q = query(
      collection(db, 'publicProfiles'),
      limit(50)
    );
    const snap = await getDocs(q);
    let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Exclude current user and filter out non-visible profiles
    list = list.filter(u => {
      if (currentUid && u.uid === currentUid) return false;
      if (u.networkVisibility === false || u.privacy === 'private') return false;
      return true;
    });

    // Filter by search query if provided
    if (filters.search) {
      const term = filters.search.toLowerCase().trim();
      list = list.filter(u => 
        (u.displayName && u.displayName.toLowerCase().includes(term)) ||
        (u.username && u.username.toLowerCase().includes(term)) ||
        (u.headline && u.headline.toLowerCase().includes(term)) ||
        (u.college && u.college.toLowerCase().includes(term)) ||
        (u.careerGoal && u.careerGoal.toLowerCase().includes(term)) ||
        (u.skills && u.skills.some(s => s.toLowerCase().includes(term)))
      );
    }

    if (filters.skill) {
      const sTerm = filters.skill.toLowerCase().trim();
      list = list.filter(u => u.skills && u.skills.some(s => s.toLowerCase().includes(sTerm)));
    }

    return list;
  } catch (err) {
    console.error('Error fetching public profiles from Firestore:', err);
    return [];
  }
}

// =========================================================================
// 4. PROJECTS & PROJECT STUDIO
// =========================================================================

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
    console.error('Error fetching projects:', err);
    return [];
  }
}

export async function createProject(uid, projectData) {
  if (!uid) throw new Error('User ID is required to create a project');
  try {
    const docRef = doc(collection(db, 'projects'));
    const payload = {
      id: docRef.id,
      ownerId: uid,
      title: projectData.title || 'Untitled Project',
      tagline: projectData.tagline || '',
      description: projectData.description || '',
      techStack: projectData.techStack || [],
      stage: projectData.stage || 'Build',
      verificationStatus: 'unverified',
      verificationScore: 0,
      githubRepo: projectData.githubRepo || '',
      liveUrl: projectData.liveUrl || '',
      kanban: projectData.kanban || { todo: [], inProgress: [], done: [] },
      scratchpad: projectData.scratchpad || '// Project sandbox',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(docRef, payload);
    return payload;
  } catch (err) {
    console.error('Error creating project:', err);
    throw err;
  }
}

export async function updateProject(projectId, updates) {
  if (!projectId) return;
  try {
    const docRef = doc(db, 'projects', projectId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    console.error('Error updating project:', err);
    throw err;
  }
}

export async function deleteProject(projectId) {
  if (!projectId) return;
  try {
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (err) {
    console.error('Error deleting project:', err);
    throw err;
  }
}

// =========================================================================
// 5. RESUMES & RESUME STUDIO
// =========================================================================

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
  const resumeId = resumeData.id || doc(collection(db, 'resumes')).id;
  const docRef = doc(db, 'resumes', resumeId);
  const payload = {
    ...resumeData,
    id: resumeId,
    updatedAt: serverTimestamp()
  };
  if (!resumeData.id) {
    payload.createdAt = serverTimestamp();
  }
  await setDoc(docRef, payload, { merge: true });
  return payload;
}

export async function deleteResume(resumeId) {
  if (!resumeId) return;
  await deleteDoc(doc(db, 'resumes', resumeId));
}

// =========================================================================
// 6. JOBS & OPPORTUNITIES
// =========================================================================

export async function getJobs(filters = {}) {
  try {
    const snap = await getDocs(collection(db, 'jobs'));
    let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (filters.search) {
      const term = filters.search.toLowerCase().trim();
      list = list.filter(j => 
        (j.title && j.title.toLowerCase().includes(term)) ||
        (j.company && j.company.toLowerCase().includes(term)) ||
        (j.skillsRequired && j.skillsRequired.some(s => s.toLowerCase().includes(term)))
      );
    }

    if (filters.type && filters.type !== 'All') {
      list = list.filter(j => j.type === filters.type);
    }

    if (filters.remoteOnly) {
      list = list.filter(j => j.remote === true || (j.location && j.location.toLowerCase().includes('remote')));
    }

    return list;
  } catch (err) {
    console.error('Error fetching jobs:', err);
    return [];
  }
}

export async function createJob(jobData) {
  const docRef = doc(collection(db, 'jobs'));
  const payload = {
    id: docRef.id,
    ...jobData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  await setDoc(docRef, payload);
  return payload;
}

export async function deleteJob(jobId) {
  if (!jobId) return;
  await deleteDoc(doc(db, 'jobs', jobId));
}

// =========================================================================
// 7. APPLICATIONS PIPELINE
// =========================================================================

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
    console.error('Error fetching applications:', err);
    return [];
  }
}

export async function createApplication(appData) {
  const docRef = doc(collection(db, 'applications'));
  const payload = {
    id: docRef.id,
    ...appData,
    stage: appData.stage || 'Saved',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  await setDoc(docRef, payload);
  return payload;
}

export async function updateApplicationStage(applicationId, newStage) {
  if (!applicationId) return;
  const docRef = doc(db, 'applications', applicationId);
  await updateDoc(docRef, {
    stage: newStage,
    updatedAt: serverTimestamp()
  });
}

export async function deleteApplication(applicationId) {
  if (!applicationId) return;
  await deleteDoc(doc(db, 'applications', applicationId));
}

// =========================================================================
// 8. INTERVIEW SESSIONS
// =========================================================================

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
    console.error('Error fetching interviews:', err);
    return [];
  }
}

export async function saveInterviewSession(sessionData) {
  const docRef = doc(collection(db, 'interviews'));
  const payload = {
    id: docRef.id,
    ...sessionData,
    createdAt: serverTimestamp()
  };
  await setDoc(docRef, payload);
  return payload;
}

// =========================================================================
// 9. CONNECTION REQUESTS & CONNECTIONS
// =========================================================================

export async function getConnectionRequests(uid) {
  if (!uid) return { incoming: [], outgoing: [] };
  try {
    const [incomingSnap, outgoingSnap] = await Promise.all([
      getDocs(query(collection(db, 'connectionRequests'), where('toUserId', '==', uid), where('status', '==', 'pending'))),
      getDocs(query(collection(db, 'connectionRequests'), where('fromUserId', '==', uid), where('status', '==', 'pending')))
    ]);

    return {
      incoming: incomingSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      outgoing: outgoingSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    };
  } catch (err) {
    console.error('Error fetching connection requests:', err);
    return { incoming: [], outgoing: [] };
  }
}

export async function sendConnectionRequest(fromUser, toUser) {
  if (!fromUser?.uid || !toUser?.uid) return;
  const requestId = `${fromUser.uid}_${toUser.uid}`;
  const docRef = doc(db, 'connectionRequests', requestId);

  const payload = {
    id: requestId,
    fromUserId: fromUser.uid,
    fromUserName: fromUser.displayName || 'Peer Developer',
    fromUserHeadline: fromUser.headline || 'Software Engineer',
    fromUserAvatar: fromUser.photoURL || '',
    toUserId: toUser.uid,
    toUserName: toUser.displayName || 'Peer Developer',
    toUserAvatar: toUser.photoURL || '',
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(docRef, payload, { merge: true });

  // Dispatch real-time notification to receiver
  await createNotification({
    userId: toUser.uid,
    type: 'connection_request',
    title: 'New Connection Request',
    message: `${fromUser.displayName || 'A peer'} requested to connect with you.`,
    link: '/networking'
  });

  return payload;
}

export async function respondConnectionRequest(requestId, accept, fromUserId, toUserId, toUserData = {}, fromUserData = {}) {
  const reqRef = doc(db, 'connectionRequests', requestId);
  const status = accept ? 'accepted' : 'declined';

  await updateDoc(reqRef, {
    status,
    updatedAt: serverTimestamp()
  });

  if (accept) {
    const connId = [fromUserId, toUserId].sort().join('_');
    const connRef = doc(db, 'connections', connId);
    await setDoc(connRef, {
      id: connId,
      users: [fromUserId, toUserId],
      createdAt: serverTimestamp()
    }, { merge: true });

    // Notify sender that their request was accepted
    await createNotification({
      userId: fromUserId,
      type: 'connection_accepted',
      title: 'Connection Accepted! 🤝',
      message: `${toUserData.displayName || 'Your peer'} accepted your connection request.`,
      link: '/networking'
    });
  }
}

export async function getConnectedUsers(currentUid) {
  if (!currentUid) return [];
  try {
    const q = query(
      collection(db, 'connections'),
      where('users', 'array-contains', currentUid)
    );
    const snap = await getDocs(q);
    const partnerUids = [];

    snap.docs.forEach(d => {
      const users = d.data().users || [];
      const partner = users.find(u => u !== currentUid);
      if (partner) partnerUids.push(partner);
    });

    if (partnerUids.length === 0) return [];

    // Fetch public profile docs for all connected partners
    const profiles = await Promise.all(
      partnerUids.map(async (uid) => {
        const snap = await getDoc(doc(db, 'publicProfiles', uid));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
      })
    );

    return profiles.filter(Boolean);
  } catch (err) {
    console.error('Error fetching connected users:', err);
    return [];
  }
}

// =========================================================================
// 10. NOTIFICATIONS
// =========================================================================

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
    const docRef = doc(collection(db, 'notifications'));
    const payload = {
      id: docRef.id,
      ...notifData,
      read: false,
      createdAt: serverTimestamp()
    };
    await setDoc(docRef, payload);
    return payload;
  } catch (err) {
    console.error('Error creating notification:', err);
  }
}

export async function markNotificationRead(notificationId) {
  if (!notificationId) return;
  try {
    const docRef = doc(db, 'notifications', notificationId);
    await updateDoc(docRef, { read: true });
  } catch (err) {
    console.error('Error marking notification read:', err);
  }
}

// =========================================================================
// 11. AUDIT LOGS & PLATFORM TELEMETRY (ADMIN)
// =========================================================================

export async function getPlatformStats() {
  try {
    const [uSnap, pSnap, jSnap, aSnap, iSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'projects')),
      getDocs(collection(db, 'jobs')),
      getDocs(collection(db, 'applications')),
      getDocs(collection(db, 'interviews'))
    ]);

    return {
      totalUsers: uSnap.size,
      totalProjects: pSnap.size,
      totalJobs: jSnap.size,
      totalApplications: aSnap.size,
      totalInterviews: iSnap.size
    };
  } catch (err) {
    console.error('Error calculating platform stats:', err);
    return {
      totalUsers: 0,
      totalProjects: 0,
      totalJobs: 0,
      totalApplications: 0,
      totalInterviews: 0
    };
  }
}

export async function getAuditLogs() {
  try {
    const q = query(
      collection(db, 'auditLogs'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    return [];
  }
}

export async function logAuditEvent(actorUser, action, targetType, targetId, details = {}) {
  try {
    const docRef = doc(collection(db, 'auditLogs'));
    await setDoc(docRef, {
      id: docRef.id,
      actorUid: actorUser?.uid || 'system',
      actorEmail: actorUser?.email || '',
      action,
      targetType,
      targetId,
      details,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.error('Error logging audit event:', err);
  }
}
