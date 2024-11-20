// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBTYAapwmm_O58SHVotNLC-sWDfe5iwijg",
  authDomain: "news-app-586a0.firebaseapp.com",
  projectId: "news-app-586a0",
  storageBucket: "news-app-586a0.appspot.com", // Updated storage bucket format
  messagingSenderId: "364146933600",
  appId: "1:364146933600:web:bfa5ebb69e2e478de4a805",
  measurementId: "G-JFXTTDX3V3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, googleProvider, db };
