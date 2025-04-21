// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Use environment variables for Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Log config (without sensitive data) to help debug
console.log("Firebase config loaded. Project ID:", firebaseConfig.projectId ? "✓" : "✗");
console.log("API Key present:", firebaseConfig.apiKey ? "✓" : "✗");

// Initialize a mock DB first as fallback
let db = {
  collection: () => ({
    // Mock implementation
  })
};

try {
  // Initialize real Firebase if we have basic required config
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization error:", error.message);
}

// Export the db (either real or mock)
export { db };