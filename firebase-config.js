// Firebase Configuration - Load from environment variables
// NEVER commit actual credentials to version control

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || window.__FIREBASE_CONFIG__?.apiKey,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || window.__FIREBASE_CONFIG__?.authDomain,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || window.__FIREBASE_CONFIG__?.projectId,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || window.__FIREBASE_CONFIG__?.storageBucket,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || window.__FIREBASE_CONFIG__?.messagingSenderId,
    appId: process.env.REACT_APP_FIREBASE_APP_ID || window.__FIREBASE_CONFIG__?.appId
};

// Validate that credentials are provided
if (!firebaseConfig.apiKey) {
    console.error('Firebase API Key is missing. Please configure environment variables.');
}

export default firebaseConfig;
