// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
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
