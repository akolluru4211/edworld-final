import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  enableIndexedDbPersistence 
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB62LkbevQVixmoJrqYKmK0VbjBsu9Uxvw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "edworld-co1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "edworld-co1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "edworld-co1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "262824037240",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:262824037240:web:b42b1d47a82b43eba5568d",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-EVSR8DJSMR"
};

// Initialize single Firebase instance
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const db = getFirestore(app);
export const storage = getStorage(app);

// Authentication helper exports
export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
};

export default app;
