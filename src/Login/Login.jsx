// Login.js
import React from "react";
import { auth, googleProvider, db } from "../firebase/firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import HomePage from "../pages/HomePage";

function Login() {
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if the user already exists in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Add new user to Firestore
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        });
      }
      console.log("User signed in:", user);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <button onClick={signInWithGoogle}>Sign in with Google</button>

      <HomePage />
    </div>
  );
}

export default Login;
