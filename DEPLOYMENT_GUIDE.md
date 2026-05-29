# Sierra Blu Realty - Deployment & Configuration Guide

## 📋 Table of Contents
1. [Environment Setup](#environment-setup)
2. [Firebase Configuration](#firebase-configuration)
3. [Data Seeding](#data-seeding)
4. [Local Development](#local-development)
5. [Production Deployment](#production-deployment)
6. [Verification & Testing](#verification--testing)

---

## Environment Setup

### Step 1: Install Dependencies
```bash
cd /home/user/i-sierra-2027
pnpm install
```

### Step 2: Create `.env.local`
```bash
# Copy the example env file
cp apps/web/.env.local.example apps/web/.env.local

# Edit with your Firebase credentials
nano apps/web/.env.local
```

### Step 3: Verify Setup
```bash
cd apps/web
pnpm run type-check  # Should pass with 0 errors
pnpm run lint        # Should run with strict rules
pnpm run test        # Should pass all 40 tests
```

---

## Firebase Configuration

### 1. Create Firebase Project
- Go to https://console.firebase.google.com
- Click "Create Project"
- Enable Firestore Database, Cloud Storage, and Authentication

### 2. Get Web SDK Config
1. Firebase Console → Project Settings → Your Apps → Web
2. Copy configuration and add to `.env.local`

### 3. Set Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /properties/{document=**} {
      allow read: if true;
      allow write: if request.auth.uid != null;
    }
    match /leads/{document=**} {
      allow read, write: if request.auth.uid != null;
    }
    match /users/{document=**} {
      allow read, write: if request.auth.uid != null;
    }
  }
}
```

---

## Data Seeding

### Using Script
```bash
# First, download service account from Firebase Console
# Save to: apps/web/firebase-service-account.json

cd apps/web
node scripts/seed-firestore.mjs
```

### Manual Seeding (Firebase Console)
1. Firestore → Create Collection "properties"
2. Add sample documents with structure from seed script
3. Repeat for "leads" and "users" collections

---

## Local Development

### Start Server
```bash
cd apps/web
pnpm run dev
# Visit http://localhost:3000
```

### Verify Features
- [ ] Landing page loads
- [ ] Theme switcher works
- [ ] Language switcher works (EN/AR)
- [ ] Admin dashboard loads
- [ ] No console errors

---

## Production Deployment

### Option 1: Vercel (Recommended)
```bash
vercel deploy
# Add environment variables during setup
```

### Option 2: Firebase Hosting
```bash
firebase init hosting
firebase deploy
```

### Option 3: Self-Hosted
```bash
pnpm run build
pnpm run start
```

---

## Pre-Deployment Checklist
- [ ] `.env.local` configured with Firebase credentials
- [ ] Firebase project created and Firestore enabled
- [ ] Firestore rules deployed
- [ ] Sample data seeded (if needed)
- [ ] Tests pass: `pnpm run test`
- [ ] Build succeeds: `pnpm run build`
- [ ] Local verification: `pnpm run start`
- [ ] No TypeScript errors
- [ ] No ESLint errors

---

## Quick Commands
```bash
pnpm install          # Install deps
pnpm run dev         # Dev server
pnpm run build       # Production build
pnpm run test        # Run tests
pnpm run type-check  # TypeScript check
pnpm run lint        # ESLint check
```

**Status:** Repository is code-complete and ready for deployment with Firebase configuration.
