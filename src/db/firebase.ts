import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// All values can be overridden via Vite env vars (recommended for Vercel deploys).
// Firebase client config is not a secret (it's shipped to the browser), but using
// env vars still makes it easy to swap projects between dev/staging/prod.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDe0joNu3XQ2qjNQxPIfUA22gJjSGCe19w",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "eas-science-edu.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "eas-science-edu",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "eas-science-edu.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "883615020488",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:883615020488:web:cce88c6b3a8b4a25337cfd",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-MH8EF5MTMW",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
