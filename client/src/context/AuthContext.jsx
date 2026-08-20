import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged 
} from '../services/firebase';
import { 
  getUserProfile, 
  claimUsernameAndCreateProfile, 
  updateUserProfile,
  checkUsernameAvailable
} from '../services/firestoreService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const fetchProfile = async (firebaseUser) => {
    if (!firebaseUser) {
      setUserProfile(null);
      return null;
    }
    try {
      let profile = await getUserProfile(firebaseUser.uid);
      if (!profile) {
        // Create initial default profile if doesn't exist yet
        const baseUsername = (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'dev')
          .replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 15) || 'user' + Math.floor(Math.random() * 10000);
        
        try {
          profile = await claimUsernameAndCreateProfile(firebaseUser.uid, {
            username: baseUsername,
            displayName: firebaseUser.displayName || 'EdWorld Member',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${baseUsername}`,
            headline: 'Software Engineer & Builder',
            college: 'Tech University',
            careerGoal: 'Full Stack Engineer',
            skills: ['React', 'JavaScript', 'Node.js', 'Problem Solving'],
            careerScore: 70
          });
        } catch (e) {
          // If username was taken, append random digits
          profile = await claimUsernameAndCreateProfile(firebaseUser.uid, {
            username: `${baseUsername}${Math.floor(Math.random() * 1000)}`,
            displayName: firebaseUser.displayName || 'EdWorld Member',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${baseUsername}`,
            headline: 'Software Engineer & Builder',
            college: 'Tech University',
            careerGoal: 'Full Stack Engineer',
            skills: ['React', 'JavaScript', 'Node.js'],
            careerScore: 70
          });
        }
      }
      setUserProfile(profile);
      return profile;
    } catch (err) {
      console.warn('Profile sync fallback:', err);
      const fallback = {
        uid: firebaseUser.uid,
        username: (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'developer').toLowerCase(),
        displayName: firebaseUser.displayName || 'Developer Member',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
        headline: 'Software Engineer',
        college: 'Engineering Institute',
        careerGoal: 'Full Stack Engineer',
        skills: ['React', 'Node.js', 'Firebase'],
        careerScore: 72,
        role: 'student',
        privacy: 'public'
      };
      setUserProfile(fallback);
      return fallback;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      const profile = await fetchProfile(result.user);
      return { user: result.user, profile };
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setAuthError(err.message);
      throw err;
    }
  };

  const loginWithEmail = async (email, password) => {
    setAuthError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
      const profile = await fetchProfile(result.user);
      return { user: result.user, profile };
    } catch (err) {
      console.error('Email Sign-In Error:', err);
      setAuthError(err.message);
      throw err;
    }
  };

  const signupWithEmail = async (email, password, displayName, initialData = {}) => {
    setAuthError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      setUser(result.user);

      const username = initialData.username || email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/gi, '');
      const profile = await claimUsernameAndCreateProfile(result.user.uid, {
        username,
        displayName: displayName || 'EdWorld Member',
        email,
        headline: initialData.headline || 'Aspiring Software Engineer',
        college: initialData.college || '',
        careerGoal: initialData.careerGoal || 'Full Stack Engineer',
        skills: initialData.skills || ['JavaScript', 'React'],
        careerScore: 65
      });
      setUserProfile(profile);
      return { user: result.user, profile };
    } catch (err) {
      console.error('Email Sign-Up Error:', err);
      setAuthError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const resetPassword = async (email) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (err) {
      console.error('Password reset error:', err);
      setAuthError(err.message);
      throw err;
    }
  };

  const updateProfileData = async (updates) => {
    if (!user) return;
    try {
      await updateUserProfile(user.uid, updates);
      setUserProfile(prev => ({ ...prev, ...updates }));
    } catch (err) {
      console.error('Profile update failed:', err);
      throw err;
    }
  };

  const claimCustomUsername = async (newUsername, extraData = {}) => {
    if (!user) return;
    const available = await checkUsernameAvailable(newUsername);
    if (!available) {
      throw new Error(`Username @${newUsername} is already taken.`);
    }
    const profile = await claimUsernameAndCreateProfile(user.uid, {
      ...userProfile,
      ...extraData,
      username: newUsername
    });
    setUserProfile(profile);
    return profile;
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    authError,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    logout,
    resetPassword,
    updateProfileData,
    claimCustomUsername,
    refreshProfile,
    isAdmin: userProfile?.role === 'admin' || userProfile?.email?.endsWith('@edworld.co')
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
