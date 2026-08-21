import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  getOrCreateUserProfile, 
  claimUsernameAndCreateProfile, 
  updateUserProfile, 
  checkUsernameAvailable, 
  resolveUserRoute 
} from '../services/firestoreService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // 1. Core Authentication & Profile States
  const [authLoading, setAuthLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [authError, setAuthError] = useState(null);
  const fetchingProfileUid = useRef(null);

  // Diagnostic logger (development only)
  const logAuth = (stage, details = {}) => {
    if (import.meta.env.DEV) {
      console.log(`🔐 [Auth State Machine] ${stage}`, details);
    }
  };

  // Safe fetch/create profile from Firestore with deduplication
  const fetchAndSetProfile = async (fbUser) => {
    if (!fbUser || !fbUser.uid) {
      setProfile(null);
      setProfileLoading(false);
      return null;
    }

    if (fetchingProfileUid.current === fbUser.uid) {
      return profile;
    }

    fetchingProfileUid.current = fbUser.uid;
    setProfileLoading(true);
    logAuth('Fetching Firestore profile for UID:', { uid: fbUser.uid });
    try {
      const userProfileDoc = await getOrCreateUserProfile(fbUser);
      setProfile(userProfileDoc);
      logAuth('Profile resolved:', {
        uid: userProfileDoc?.uid,
        username: userProfileDoc?.username,
        profileCompleted: userProfileDoc?.profileCompleted
      });
      return userProfileDoc;
    } catch (err) {
      console.error('Error in fetchAndSetProfile:', err);
      setProfile(null);
      return null;
    } finally {
      fetchingProfileUid.current = null;
      setProfileLoading(false);
    }
  };

  // Global Auth Observer
  useEffect(() => {
    logAuth('Subscribing to onAuthStateChanged & checking redirect result');
    
    // Check for redirect auth results (mobile browsers & redirect fallbacks)
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        logAuth('Redirect sign-in resolved', { uid: result.user.uid });
        setFirebaseUser(result.user);
        await fetchAndSetProfile(result.user);
      }
    }).catch((err) => {
      console.warn('Redirect auth result check:', err);
    });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      logAuth('onAuthStateChanged event:', { uid: currentUser ? currentUser.uid : null });
      setFirebaseUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        await fetchAndSetProfile(currentUser);
      } else {
        setProfile(null);
        setProfileLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const formatAuthError = (err) => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/popup-closed-by-user':
        return 'Google sign-in popup was closed before completing. Please try again.';
      case 'auth/popup-blocked':
        return 'Google sign-in popup was blocked by your browser. Please allow popups or use redirect.';
      case 'auth/cancelled-popup-request':
        return 'Sign-in request was cancelled.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with this email using another sign-in method.';
      case 'auth/unauthorized-domain':
        return 'This domain is not authorized in Firebase Console. Please add ' + (typeof window !== 'undefined' ? window.location.hostname : 'domain') + ' to Firebase authorized domains.';
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
        return err?.message?.replace('Firebase: ', '') || 'Authentication failed. Please try again.';
    }
  };

  /**
   * Google Sign-In Handler
   * Resilient implementation: Uses popup on desktop with automatic redirect fallback,
   * and direct redirect on mobile/tablets to prevent popup blocker failures.
   */
  const loginWithGoogle = async () => {
    setAuthError(null);
    logAuth('Google OAuth initiated');
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    try {
      let result;
      if (isMobile) {
        logAuth('Mobile detected, initiating signInWithRedirect');
        await signInWithRedirect(auth, googleProvider);
        return { firebaseUser: null, profile: null, destination: '/onboarding', isNewUser: true };
      }

      try {
        result = await signInWithPopup(auth, googleProvider);
      } catch (popupErr) {
        if (
          popupErr.code === 'auth/popup-blocked' || 
          popupErr.code === 'auth/popup-closed-by-user' ||
          popupErr.code === 'auth/cancelled-popup-request' ||
          popupErr.code === 'auth/internal-error'
        ) {
          logAuth('Popup failed or blocked, falling back to signInWithRedirect', { code: popupErr.code });
          await signInWithRedirect(auth, googleProvider);
          return { firebaseUser: null, profile: null, destination: '/onboarding', isNewUser: true };
        }
        throw popupErr;
      }

      const fbUser = result.user;
      setFirebaseUser(fbUser);
      const userProf = await fetchAndSetProfile(fbUser);
      const destination = resolveUserRoute(fbUser, userProf);
      const isNewUser = !userProf || userProf.profileCompleted !== true;

      logAuth('Google OAuth finished successfully:', {
        uid: fbUser.uid,
        isNewUser,
        destination
      });

      return {
        firebaseUser: fbUser,
        profile: userProf,
        destination,
        isNewUser
      };
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      const friendlyError = formatAuthError(err);
      setAuthError(friendlyError);
      throw new Error(friendlyError);
    }
  };

  /**
   * Email Login Handler
   */
  const loginWithEmail = async (email, password) => {
    setAuthError(null);
    logAuth('Email login initiated', { email });
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = result.user;
      setFirebaseUser(fbUser);
      const userProf = await fetchAndSetProfile(fbUser);
      const destination = resolveUserRoute(fbUser, userProf);
      const isNewUser = !userProf || userProf.profileCompleted !== true;

      return {
        firebaseUser: fbUser,
        profile: userProf,
        destination,
        isNewUser
      };
    } catch (err) {
      console.error('Email Sign-In Error:', err);
      const friendlyError = formatAuthError(err);
      setAuthError(friendlyError);
      throw new Error(friendlyError);
    }
  };

  /**
   * Email Signup Handler
   */
  const signupWithEmail = async (email, password, displayName) => {
    setAuthError(null);
    logAuth('Email signup initiated', { email, displayName });
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = result.user;
      if (displayName) {
        await updateProfile(fbUser, { displayName });
      }
      setFirebaseUser(fbUser);
      const userProf = await fetchAndSetProfile(fbUser);

      return {
        firebaseUser: fbUser,
        profile: userProf,
        destination: '/onboarding',
        isNewUser: true
      };
    } catch (err) {
      console.error('Email Sign-Up Error:', err);
      const friendlyError = formatAuthError(err);
      setAuthError(friendlyError);
      throw new Error(friendlyError);
    }
  };

  /**
   * Complete Onboarding Profile
   */
  const completeOnboarding = async (profileData) => {
    if (!firebaseUser) {
      throw new Error('No authenticated user session found. Please sign in first.');
    }
    setProfileLoading(true);
    logAuth('Completing onboarding profile for UID:', { uid: firebaseUser.uid, username: profileData.username });
    try {
      const fullProfileData = {
        ...profileData,
        email: firebaseUser.email || profileData.email || '',
        photoURL: profileData.photoURL || firebaseUser.photoURL || '',
        profileCompleted: true,
        networkVisibility: profileData.networkVisibility !== false
      };

      const createdProfile = await claimUsernameAndCreateProfile(firebaseUser.uid, fullProfileData);
      setProfile(createdProfile);
      setProfileLoading(false);
      logAuth('Onboarding profile created and active in context:', { profile: createdProfile });
      return createdProfile;
    } catch (err) {
      setProfileLoading(false);
      console.error('Onboarding profile creation error:', err);
      throw err;
    }
  };

  /**
   * Sign Out — Clears all cached user and profile states cleanly
   */
  const logout = async () => {
    logAuth('Signing out user');
    try {
      await signOut(auth);
      setFirebaseUser(null);
      setProfile(null);
      setAuthError(null);
      setAuthLoading(false);
      setProfileLoading(false);
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
    if (!firebaseUser) return;
    try {
      await updateUserProfile(firebaseUser.uid, updates);
      setProfile(prev => ({ ...prev, ...updates }));
    } catch (err) {
      console.error('Profile update failed:', err);
      throw err;
    }
  };

  const refreshProfile = async () => {
    if (firebaseUser) {
      await fetchAndSetProfile(firebaseUser);
    }
  };

  const isProfileComplete = Boolean(profile && profile.profileCompleted === true);
  const isAuthenticated = Boolean(firebaseUser);
  const loading = authLoading || profileLoading;

  const value = {
    authLoading,
    firebaseUser,
    profileLoading,
    profile,
    isAuthenticated,
    isProfileComplete,
    isNewUser: Boolean(firebaseUser && !isProfileComplete),
    authError,
    user: firebaseUser,
    userProfile: profile,
    loading,
    profileCompleted: isProfileComplete,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    completeOnboarding,
    logout,
    resetPassword,
    updateProfileData,
    refreshProfile,
    resolveUserRoute,
    isAdmin: profile?.role === 'admin' || profile?.email?.endsWith('@edworld.co')
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

export function useCurrentUserProfile() {
  const { firebaseUser, profile, loading, authError } = useAuth();
  return {
    firebaseUser,
    profile,
    loading,
    error: authError
  };
}
