// assets/js/firebase-config.js
// Konfiguracija i inicijalizacija Firebase-a

// Firebase konfiguracija
const firebaseConfig = {
  apiKey: "AIzaSyCbEb6Ydq65X2G0_z0_G1djaucHM1Oo5r0",
  authDomain: "zanimljivageografija-3f742.firebaseapp.com",
  databaseURL: "https://zanimljivageografija-3f742-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "zanimljivageografija-3f742",
  storageBucket: "zanimljivageografija-3f742.appspot.com",
  messagingSenderId: "535952181132",
  appId: "1:535952181132:web:cd30dba0bda24a981638a9",
  measurementId: "G-HYEKVM53S7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Authentication
const auth = firebase.auth();

// Initialize Anonymous Authentication
function initAnonymousAuth() {
  auth.signInAnonymously()
    .then(() => {
      console.log('Signed in anonymously');
    })
    .catch((error) => {
      console.error('Error signing in anonymously:', error);
    });
}

// Listen for authentication state changes
auth.onAuthStateChanged((user) => {
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
