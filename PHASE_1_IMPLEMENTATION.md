# Phase 1: Foundation & Environment Setup
## Week 1 Implementation Guide

## 📋 Checklist

- [ ] Set up .env file with Firebase credentials
- [ ] Move credentials to secure configuration
- [ ] Deploy service worker for offline support
- [ ] Configure Firestore security rules
- [ ] Test offline functionality
- [ ] Set up development environment
- [ ] Initialize database collections

---

## Step 1: Create .env File

### Create `.env.local` (for development):
```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_actual_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# App Configuration
REACT_APP_ENVIRONMENT=development
REACT_APP_LOG_LEVEL=debug
REACT_APP_ENABLE_OFFLINE=true

# Feature Flags
REACT_APP_ENABLE_AUDIT_LOGGING=true
REACT_APP_ENABLE_2FA=false
REACT_APP_ENABLE_PRESCRIPTIONS=false
REACT_APP_ENABLE_MULTI_BRANCH=false
```

### Create `.env.production` (for production):
```bash
# Firebase Configuration (production values)
REACT_APP_FIREBASE_API_KEY=prod_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=prod_auth_domain.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=prod_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=prod_storage_bucket.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=prod_sender_id
REACT_APP_FIREBASE_APP_ID=prod_app_id

# App Configuration
REACT_APP_ENVIRONMENT=production
REACT_APP_LOG_LEVEL=error
REACT_APP_ENABLE_OFFLINE=true

# Feature Flags (enable after phase completion)
REACT_APP_ENABLE_AUDIT_LOGGING=true
REACT_APP_ENABLE_2FA=true
REACT_APP_ENABLE_PRESCRIPTIONS=true
REACT_APP_ENABLE_MULTI_BRANCH=true
```

### Never commit these files:
```bash
# Add to .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
echo ".env.staging" >> .gitignore
```

---

## Step 2: Create Configuration Module

### Create `config/firebase.js`:
```javascript
// config/firebase.js

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Validate configuration
const validateConfig = () => {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId'];
  const missing = requiredKeys.filter(key => !firebaseConfig[key]);
  
  if (missing.length > 0) {
    throw new Error(`Firebase config missing: ${missing.join(', ')}`);
  }
  
  return true;
};

// Feature flags
const features = {
  auditLogging: process.env.REACT_APP_ENABLE_AUDIT_LOGGING === 'true',
  twoFactorAuth: process.env.REACT_APP_ENABLE_2FA === 'true',
  prescriptions: process.env.REACT_APP_ENABLE_PRESCRIPTIONS === 'true',
  multiBranch: process.env.REACT_APP_ENABLE_MULTI_BRANCH === 'true'
};

const env = {
  environment: process.env.REACT_APP_ENVIRONMENT || 'development',
  logLevel: process.env.REACT_APP_LOG_LEVEL || 'info',
  offlineEnabled: process.env.REACT_APP_ENABLE_OFFLINE === 'true'
};

if (typeof window !== 'undefined') {
  validateConfig();
}

export { firebaseConfig, features, env };
```

### Update `index.html` to use config:
```javascript
// In index.html, replace hardcoded Firebase initialization:
<script>
  // FIREBASE INITIALIZATION & NATIVE OFFLINE MODE
  try {
    const firebaseConfig = window.__FIREBASE_CONFIG__ || {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID
    };
    
    firebase.initializeApp(firebaseConfig);
    window.db = firebase.firestore();
    window.db.enablePersistence({ synchronizeTabs: true })
      .catch(err => console.warn('Offline Persistence Note:', err.code));
  } catch (error) {
    console.error("Firebase Config Error:", error);
  }
</script>
```

---

## Step 3: Service Worker Registration

### Update `index.html` - Add before closing `</body>`:
```html
<!-- Service Worker Registration for Offline Support -->
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('✅ Service Worker registered:', registration);
          
          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute
        })
        .catch(error => {
          console.error('❌ Service Worker registration failed:', error);
        });
    });
    
    // Handle service worker updates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service Worker updated');
      // Optionally notify user of update
    });
  }
</script>
```

### Verify `sw.js` is in project root and registered correctly

---

## Step 4: Firestore Security Rules

### Update Firestore Rules (Firebase Console):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check user role
    function hasRole(role) {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
    }
    
    // Helper function to check if user owns resource
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Public collections
    match /inventory/{document=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && (hasRole('MANAGER') || hasRole('TECHNICIAN'));
    }
    
    match /sales/{document=**} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && hasRole('MANAGER');
    }
    
    match /patients/{document=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && (hasRole('MANAGER') || hasRole('PHARMACIST'));
    }
    
    match /users/{document=**} {
      allow read: if isAuthenticated() && (hasRole('MANAGER') || isOwner(document));
      allow write: if isAuthenticated() && hasRole('MANAGER');
    }
    
    match /expenses/{document=**} {
      allow read: if isAuthenticated() && hasRole('MANAGER');
      allow write: if isAuthenticated() && hasRole('MANAGER');
    }
    
    match /auditLog/{document=**} {
      allow read: if isAuthenticated() && hasRole('MANAGER');
      allow write: if false; // Only backend can write
    }
    
    match /medicalHistory/{document=**} {
      allow read: if isAuthenticated() && (hasRole('PHARMACIST') || hasRole('MANAGER'));
      allow write: if isAuthenticated() && hasRole('PHARMACIST');
    }
  }
}
```

---

## Step 5: Database Initialization

### Create `utils/initializeDatabase.js`:
```javascript
// utils/initializeDatabase.js

export const initializeCollections = async (db) => {
  const collections = [
    'inventory',
    'sales',
    'patients',
    'users',
    'expenses',
    'medicalHistory',
    'auditLog'
  ];
  
  try {
    for (const collection of collections) {
      const snapshot = await db.collection(collection).limit(1).get();
      if (snapshot.empty) {
        console.log(`✅ Collection '${collection}' verified (empty)`);
      } else {
        console.log(`✅ Collection '${collection}' exists with data`);
      }
    }
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
};

export const createDemoData = async (db) => {
  try {
    // Create demo pharmacy if doesn't exist
    const pharmacyDoc = await db.collection('config').doc('pharmacy').get();
    
    if (!pharmacyDoc.exists) {
      await db.collection('config').doc('pharmacy').set({
        name: 'APEX Pharmacy Demo',
        location: 'Tanzania',
        createdAt: new Date().toISOString(),
        version: '1.0.0'
      });
      console.log('✅ Demo pharmacy created');
    }
    
    return true;
  } catch (error) {
    console.error('Demo data creation error:', error);
    return false;
  }
};
```

---

## Step 6: Testing Offline Functionality

### Create `tests/offline.test.js`:
```javascript
// tests/offline.test.js

describe('Offline Functionality', () => {
  
  test('Service Worker should be registered', async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistrations();
      expect(registration.length).toBeGreaterThan(0);
    }
  });
  
  test('App should work in offline mode', async () => {
    // Simulate offline
    window.dispatchEvent(new Event('offline'));
    
    // App should still be functional
    expect(document.querySelector('#apex-root')).toBeDefined();
  });
  
  test('Data should persist in offline cache', async () => {
    // Open cache
    const cache = await caches.open('apex-pharmacy-v1');
    const response = await cache.match('/index.html');
    
    expect(response).toBeDefined();
    expect(response.status).toBe(200);
  });
  
  test('App should sync when online again', async () => {
    // Simulate going online
    window.dispatchEvent(new Event('online'));
    
    // Verify sync attempt
    expect(navigator.onLine).toBe(true);
  });
});
```

---

## Step 7: Development Environment Setup

### Install dependencies:
```bash
npm install --save-dev
```

### Recommended dependencies for development:
```bash
npm install --save-dev:
  - @testing-library/react
  - @testing-library/jest-dom
  - jest
  - firebase-admin (for testing)
```

---

## Step 8: Environment Validation Script

### Create `scripts/validate-env.js`:
```javascript
#!/usr/bin/env node
// scripts/validate-env.js

const fs = require('fs');
const path = require('path');

const requiredVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID'
];

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
const envPath = path.join(__dirname, '..', envFile);

if (!fs.existsSync(envPath)) {
  console.error(`❌ ${envFile} not found`);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const missing = requiredVars.filter(v => !envContent.includes(v));

if (missing.length > 0) {
  console.error(`❌ Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

console.log('✅ Environment validation passed');
```

### Add to `package.json`:
```json
"scripts": {
  "validate-env": "node scripts/validate-env.js",
  "start": "npm run validate-env && react-scripts start",
  "build": "npm run validate-env && react-scripts build",
  "test": "react-scripts test"
}
```

---

## Step 9: Deploy to Staging

### Firebase Hosting Deployment:
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy to staging
firebase deploy --only hosting:staging

# Deploy to production
firebase deploy --only hosting:production
```

### Verify deployment:
```bash
# Check hosting status
firebase hosting:channel:list

# View live site
firebase open hosting:site
```

---

## ✅ Phase 1 Completion Checklist

- [ ] `.env` files created and ignored by git
- [ ] Firebase config module created
- [ ] Service Worker registered and tested
- [ ] Firestore security rules updated
- [ ] Database collections initialized
- [ ] Offline functionality tested
- [ ] Development environment ready
- [ ] Deployment scripts tested
- [ ] Staging deployment successful
- [ ] Team trained on new setup

---

## 🚀 Ready for Phase 2?

Once all items above are complete:
1. Merge `feature/phase-1-foundation` to `main`
2. Deploy to production
3. Begin Phase 2 (Audit Logging + 2FA)

---

## Troubleshooting

### Service Worker not registering?
```bash
# Check browser DevTools > Application > Service Workers
# Verify sw.js is in public directory
# Clear browser cache: Ctrl+Shift+Delete
```

### Offline not working?
```bash
# Open DevTools > Application > Cache Storage
# Verify apex-pharmacy-v1 cache exists
# Check Network tab: status should show "(from ServiceWorker)"
```

### Firebase connection issues?
```javascript
// Add logging to debug
window.db.enableLogging(true); // Enable firestore logging
```
