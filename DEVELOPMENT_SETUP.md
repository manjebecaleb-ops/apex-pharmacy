# Development Environment Setup Guide

## Prerequisites

### Required Software
- Node.js 16+ (LTS recommended)
- npm 8+
- Git 2.30+
- Firebase CLI 11+
- Visual Studio Code (recommended)

### Installation

```bash
# 1. Install Node.js from https://nodejs.org/
# Verify installation
node --version  # Should be v16+
npm --version   # Should be 8+

# 2. Install Firebase CLI
npm install -g firebase-tools
firebase --version

# 3. Clone repository
git clone https://github.com/manjebecaleb-ops/apex-pharmacy.git
cd apex-pharmacy

# 4. Install dependencies
npm install
```

---

## Project Structure

```
apex-pharmacy/
├── public/
│   ├── index.html
│   └── sw.js              # Service Worker
├── src/
│   ├── components/        # React components
│   ├── utils/             # Utility functions
│   ├── config/            # Configuration
│   └── App.jsx            # Main component
├── tests/                 # Test files
├── scripts/               # Build scripts
├── .env.example           # Example environment
├── package.json
└── README.md
```

---

## Development Workflow

### 1. Setup Development Environment

```bash
# Copy environment template
cp .env.example .env.local

# Add your Firebase credentials
echo "REACT_APP_FIREBASE_API_KEY=your_key" >> .env.local
echo "REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain" >> .env.local
# ... add remaining vars

# Verify setup
npm run validate-env
```

### 2. Start Development Server

```bash
# Start local development server
npm start

# App will open at http://localhost:3000
# Automatic reload on code changes
```

### 3. Create Feature Branch

```bash
# Create new branch from main
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# Branch naming convention:
# feature/audit-logging
# feature/2fa-implementation
# fix/bug-name
# chore/dependency-update
```

### 4. Make Changes

```bash
# Edit files in src/
# Changes auto-reload in browser

# Run tests
npm test

# Build for production
npm run build
```

### 5. Commit Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: Add audit logging functionality"

# Commit message format:
# feat: Add new feature
# fix: Fix bug
# docs: Update documentation
# style: Format code
# test: Add tests
# chore: Update dependencies
```

### 6. Push and Create PR

```bash
# Push branch to GitHub
git push origin feature/your-feature-name

# Create Pull Request on GitHub
# - Title: Clear description
# - Description: What changed and why
# - Link related issues
# - Request reviewers
```

---

## Local Testing

### Test Offline Functionality

```bash
# 1. Start development server
npm start

# 2. Open DevTools (F12)
# 3. Go to Application > Service Workers
# 4. Verify sw.js is registered
# 5. Go to Network tab
# 6. Simulate offline: Check "Offline" in throttling
# 7. Reload page - should still work
```

### Test with Production Build

```bash
# Build production bundle
npm run build

# Serve locally (install serve first)
npm install -g serve
serve -s build

# Open http://localhost:3000
```

---

## Debugging

### Browser Console Logs

```javascript
// In index.html or src/App.jsx

// Enable Firestore logging
window.db.enableLogging(true);

// Check feature flags
console.log(window.__FEATURE_FLAGS__);

// Monitor app state
console.log('User:', user);
console.log('Data:', data);
```

### VS Code Debugger

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src",
      "sourceMapPathOverride": {
        "webpack:///src/*": "${webspaceRoot}/*"
      }
    }
  ]
}
```

---

## Firebase Setup

### Create Firebase Project

1. Go to https://firebase.google.com/
2. Click "Get Started"
3. Create new project
4. Enable Firestore Database
5. Set security rules (see Phase 1 guide)
6. Get credentials from Project Settings

### Connect to Local Project

```bash
# Initialize Firebase in project
firebase init

# Select:
# - Firestore Database
# - Hosting
# - Cloud Functions (for Phase 3)

# Set project
firebase use --add

# Select your Firebase project
```

---

## Team Collaboration

### Clone Repository

```bash
npm install
cp .env.example .env.local
# Add Firebase credentials
npm start
```

### Sync with Main Branch

```bash
# Before starting work
git checkout main
git pull origin main

# During development (if main updated)
git fetch origin main
git rebase origin/main
# or merge
git merge origin/main
```

### Code Review Process

1. **Create PR** with clear description
2. **Request reviewers** (at least 1)
3. **Address feedback** with new commits
4. **Approval** from reviewer
5. **Merge** to main
6. **Deploy** to staging/production

---

## Deployment

### Staging Deployment

```bash
# Build
npm run build

# Deploy to staging
firebase deploy --only hosting:staging

# Get staging URL
firebase hosting:channel:list
```

### Production Deployment

```bash
# Ensure code is merged to main
git checkout main
git pull origin main

# Build
npm run build

# Deploy to production
firebase deploy

# Verify
firebase open hosting:site
```

---

## Performance Optimization

### Monitor Bundle Size

```bash
# Analyze bundle
npm install -g webpack-bundle-analyzer
npm run build -- --analyze
```

### Lighthouse Audit

```bash
# Chrome DevTools > Lighthouse
# Run audit for:
# - Performance
# - Accessibility
# - Best Practices
# - SEO
```

---

## Useful Commands

```bash
# Start development
npm start

# Run tests
npm test

# Build production
npm run build

# Validate environment
npm run validate-env

# Deploy
firebase deploy

# View logs
firebase functions:log

# Clear cache
firebase emulators:start
```

---

## Troubleshooting

### Port 3000 already in use
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

### Module not found errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Firebase connection issues
```bash
# Verify credentials
echo $REACT_APP_FIREBASE_PROJECT_ID

# Check Firestore rules
firebase firestore:rules:get

# Test connection
firebase firestore:list
```

---

## Resources

- [React Documentation](https://react.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Git Guide](https://git-scm.com/doc)
- [VS Code Tips](https://code.visualstudio.com/docs)
