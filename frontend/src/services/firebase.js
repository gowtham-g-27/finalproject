// Optional Firebase client configuration
// Will initialize if env variables are provided; otherwise app works via backend API fallback.
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForCollegeEventHub2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "college-event-hub.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "college-event-hub",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "college-event-hub.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef"
};

let app = null;
let auth = null;
let firestore = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  firestore = getFirestore(app);
} catch (e) {
  // Silent fallback to backend API
}

export { app, auth, firestore };

