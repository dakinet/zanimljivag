// assets/js/firebase-config.js
// Konfiguracija i inicijalizacija Firebase-a

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCbEb6Ydq65X2G0_z0_G1djaucHM1Oo5r0",
  authDomain: "zanimljivageografija-3f742.firebaseapp.com",
  databaseURL: "https://zanimljivageografija-3f742-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "zanimljivageografija-3f742",
  storageBucket: "zanimljivageografija-3f742.firebasestorage.app",
  messagingSenderId: "535952181132",
  appId: "1:535952181132:web:e3bd0bb690c82e131638a9",
  measurementId: "G-CDDZX2P5R6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);

// Initialize Anonymous Authentication
function initAnonymousAuth() {
  signInAnonymously(auth)
    .then(() => {
      console.log('Signed in anonymously');
    })
    .catch((error) => {
      console.error('Error signing in anonymously:', error);
    });
}

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    console.log('User is signed in with UID:', user.uid);
  } else {
    // User is signed out
    console.log('User is signed out');
    // Auto sign in anonymously
    initAnonymousAuth();
  }
});

// Call to initialize anonymous auth when page loads
document.addEventListener('DOMContentLoaded', () => {
  initAnonymousAuth();
});

// Export Firebase instances to make them available to other files
export { app, auth, database };
