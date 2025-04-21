// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Use hardcoded values for testing
const firebaseConfig = {
  apiKey: "test-api-key",
  authDomain: "test-project-id.firebaseapp.com",
  projectId: "test-project-id",
  storageBucket: "test-project-id.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000000000"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);