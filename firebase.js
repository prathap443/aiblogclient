// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Use environment variables for Firebase configuration
// This approach works with Vite and Vercel
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase only if environment variables are available
// This prevents build errors when variables aren't set
let app;
let db;

try {
  // Check if we have the minimal required config
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } else {
    console.warn("Firebase configuration is incomplete. Some features will be disabled.");
    // Create mock db for development without env vars
    db = {
      collection: () => ({
        // Mock implementation to prevent runtime errors
      })
    };
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
  // Create fallback db object to prevent app crashes
  db = {
    collection: () => ({
      // Mock implementation to prevent runtime errors
    })
  };
}

export { db };