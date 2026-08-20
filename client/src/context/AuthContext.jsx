import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
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

  // Diagnostic helper (development only)
  const logAuth = (stage, details = {}) => {
    if (import.meta.env.DEV) {
      console.log(`🔐 [Auth Flow] ${stage}`, details);
    }
  };

  const fetchProfile = async (firebaseUser) => {
    if (!firebaseUser) {
      setUserProfile(null);
      return null;
    }
    logAuth('Profile lookup started', { uid: firebaseUser.uid, email: firebaseUser.email });
    try {
      const profile = await getUserProfile(firebaseUser.uid);
      if (profile && profile.profileCompleted !== false) {
        logAuth('Profile exists and completed', { username: profile.username });
        setUserProfile(profile);
        return profile;
      } else if (profile) {
        logAuth('Profile document found but onboarding incomplete', { profile });
        setUserProfile(profile);
        return profile;
      } else {
        logAuth('Profile missing in Firestore (new user)');
        setUserProfile(null);
        return null;
      }
    } catch (err) {
      console.warn('Firestore profile lookup error:', err);
      setUserProfile(null);
      return null;
    }
  };

  useEffect(() => {
    logAuth('Auth state listener attached');
    
    // Check if user is returning from a redirect auth flow (mobile fallback)
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        logAuth('Redirect sign-in resolved', { uid: result.user.uid });
        setUser(result.user);
        await fetchProfile(result.user);
      }
    }).catch((err) => {
      console.warn('Redirect auth result check:', err);
    });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      logAuth('Auth state changed', { user: currentUser ? currentUser.uid : 'null' });
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

  const formatAuthError = (err) => {
    const code = err.code || '';
    switch (code) {
      case 'auth/popup-closed-by-user':
        return 'Google sign-in popup was closed before completing.';
      case 'auth/popup-blocked':
        return 'Google sign-in popup was blocked by your browser. Please allow popups for this site.';
      case 'auth/cancelled-popup-request':
        return 'Sign-in request was cancelled.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with this email using another sign-in method.';
      case 'auth/unauthorized-domain':
        return 'This domain is not authorized in Firebase Console for OAuth. Please check Firebase authorized domains.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection and try again.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Invalid email or password. Please verify your credentials.';
      case 'auth/email-already-in-use':
        return 'An account with this email address already exists. Please sign in instead.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      default:
        return err.message?.replace('Firebase: ', '') || 'Authentication failed. Please try again.';
    }
  };

  const loginWithGoogle = async () => {
    setAuthError(null);
    logAuth('Google OAuth started');
    try {
      let result;
      try {
        result = await signInWithPopup(auth, googleProvider);
      } catch (popupErr) {
        // If popup was blocked by browser, attempt redirect fallback
        if (popupErr.code === 'auth/popup-blocked') {
          logAuth('Popup blocked, falling back to signInWithRedirect');
          await signInWithRedirect(auth, googleProvider);
          return { user: null, profile: null, isNewUser: true };
        }
        throw popupErr;
      }

      logAuth('Google OAuth completed', { uid: result.user.uid, email: result.user.email });
      setUser(result.user);
      const profile = await fetchProfile(result.user);
      const isNewUser = !profile || !profile.profileCompleted;
      logAuth('Route decision after Google login', { isNewUser, destination: isNewUser ? '/onboarding' : '/dashboard' });
      return { user: result.user, profile, isNewUser };
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      const friendlyError = formatAuthError(err);
      setAuthError(friendlyError);
      throw new Error(friendlyError);
    }
  };

  const loginWithEmail = async (email, password) => {
    setAuthError(null);
    logAuth('Email login started', { email });
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      logAuth('Email login completed', { uid: result.user.uid });
      setUser(result.user);
      const profile = await fetchProfile(result.user);
      const isNewUser = !profile || !profile.profileCompleted;
      return { user: result.user, profile, isNewUser };
    } catch (err) {
      console.error('Email Sign-In Error:', err);
      const friendlyError = formatAuthError(err);
      setAuthError(friendlyError);
      throw new Error(friendlyError);
    }
  };

  const signupWithEmail = async (email, password, displayName) => {
    setAuthError(null);
    logAuth('Email signup started', { email, displayName });
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      setUser(result.user);
      setUserProfile(null);
      logAuth('Email signup completed, pending onboarding', { uid: result.user.uid });
      return { user: result.user, profile: null, isNewUser: true };
    } catch (err) {
      console.error('Email Sign-Up Error:', err);
      const friendlyError = formatAuthError(err);
      setAuthError(friendlyError);
      throw new Error(friendlyError);
    }
  };

  const completeOnboarding = async (profileData) => {
    if (!user) {
      throw new Error('No authenticated user session found.');
    }
    logAuth('Completing onboarding profile', { uid: user.uid, username: profileData.username });
    try {
      const fullProfileData = {
        ...profileData,
        email: user.email || profileData.email || '',
        photoURL: profileData.photoURL || user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${profileData.username}`,
        profileCompleted: true,
        networkVisibility: true
      };
      const createdProfile = await claimUsernameAndCreateProfile(user.uid, fullProfileData);
      setUserProfile(createdProfile);
      logAuth('Onboarding profile created and active', { profile: createdProfile });
      return createdProfile;
    } catch (err) {
      console.error('Onboarding profile creation error:', err);
      throw err;
    }
  };

  const logout = async () => {
    logAuth('Signing out');
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setAuthError(null);
      logAuth('Signed out successfully');
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
      const friendly = formatAuthError(err);
      setAuthError(friendly);
      throw new Error(friendly);
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
      username: newUsername,
      profileCompleted: true
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
    firebaseUser: user,
    userProfile,
    loading,
    authError,
    isAuthenticated: Boolean(user),
    profileCompleted: Boolean(userProfile && userProfile.profileCompleted),
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    completeOnboarding,
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
