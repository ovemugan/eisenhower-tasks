# Eisenhower Task Manager - Setup & Deployment Guide

A fully synced, real-time task management app with Eisenhower matrix, list view, and status view. Works on mobile + PC with offline support.

## Features

✅ **3 Views**: Matrix (2×2 grid), List (table), Status (Kanban)
✅ **Real-time Sync**: All devices update instantly via Firebase
✅ **Offline Support**: Works offline, syncs when online
✅ **Mobile Responsive**: Full-featured on phone and tablet
✅ **Password Protected**: Secure email/password authentication
✅ **Free Hosting**: Deploy to Vercel (free) + Firebase (free tier)

---

## Step 1: Set Up Firebase (Free)

1. Go to [firebase.google.com](https://firebase.google.com) and click **"Get Started"**
2. Click **"Create a project"**
   - Project name: `eisenhower-tasks` (or your choice)
   - Disable Google Analytics (optional)
   - Click **"Create project"**
3. Wait for the project to be created, then click **"Continue"**
4. In the left sidebar, click **"Build"** → **"Authentication"**
5. Click **"Get started"** → **"Email/Password"**
   - Enable "Email/Password" toggle
   - Click **"Save"**
6. Go to **"Build"** → **"Firestore Database"**
   - Click **"Create database"**
   - Choose **"Start in test mode"** (for dev; switch to production rules later)
   - Choose closest location
   - Click **"Create"**
7. Click the **⚙️ Settings icon** (top-right) → **"Project settings"**
8. Scroll down to **"Your apps"** and click **"Add app"** (web icon `</>`)**
9. Register app name: `eisenhower-web`
10. Copy the Firebase config:
    ```javascript
    {
      apiKey: "...",
      authDomain: "...",
      projectId: "...",
      storageBucket: "...",
      messagingSenderId: "...",
      appId: "..."
    }
    ```

---

## Step 2: Set Up the Code

1. **Clone or download this project** (or create a new folder)
   ```bash
   mkdir eisenhower-tasks && cd eisenhower-tasks
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env.local` file** (copy from `.env.local.example`)
   ```bash
   cp .env.local.example .env.local
   ```

4. **Edit `.env.local`** and paste your Firebase config:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
   ```

5. **Test locally**
   ```bash
   npm run dev
   ```
   - Open `http://localhost:3000` in your browser
   - Sign up with a test email
   - You should see the dashboard
   - Press `Ctrl+C` to stop

---

## Step 3: Deploy to Vercel (Free)

1. **Push to GitHub** (or Vercel can import directly)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/eisenhower-tasks.git
   git push -u origin main
   ```

2. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub
3. Click **"New Project"**
4. Find and select your `eisenhower-tasks` repo
5. Click **"Import"**
6. Under **"Environment Variables"**, add all 6 Firebase keys:
   - `NEXT_PUBLIC_FIREBASE_API_KEY` = your_api_key
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = your_auth_domain
   - (etc. for all 6)
7. Click **"Deploy"**
   - Wait ~2 min for deployment
   - You'll get a live URL like `eisenhower-tasks-xxxxx.vercel.app`

---

## Step 4: Use on Mobile

1. **Open the live URL on your phone** (iOS/Android)
   - On iPhone: Save as a shortcut, or use Safari's "Add to Home Screen" for app-like access
   - On Android: Use "Install app" from Chrome menu
2. **Sign in with the same email on all devices**
3. **Changes sync instantly** across all devices in real-time

---

## Usage

### Adding Tasks
- Click **"Add task"** button
- Enter task name
- Choose **Quadrant**:
  - **Do first**: Urgent + Important (red zone)
  - **Schedule**: Not urgent but Important (blue zone)
  - **Delegate**: Urgent but Not Important (orange zone)
  - **Eliminate**: Not urgent + Not Important (gray zone)
- Choose **Status**: Not started / In progress / Done
- Click **"Add task"**

### 3 Views

**Matrix View** (default)
- Classic 2×2 Eisenhower grid
- Visual, focused view
- Click checkbox to cycle: Not started → In progress → Done

**List View**
- Flat table of all tasks
- Shows Quadrant, Status, Priority
- Great for scanning everything at once

**Status View**
- Kanban-style: 3 columns (Not started / In progress / Done)
- Drag tasks between columns by cycling status
- Task counts at the top

### Toggling Status
- Click any checkbox to cycle: **Not started** → **In progress** → **Done** → **Not started**
- Changes sync to all devices instantly

---

## Customization & Features You Can Add Later

✨ **Easy wins**:
- Change colors (hex codes in `dashboard.tsx`)
- Add more fields (priority level, due date, tags)
- Add drag-and-drop between views
- Add email notifications
- Add task deletion button
- Add dark mode toggle

✨ **More advanced**:
- Add collaborative editing (multiple users)
- Add task attachments
- Add recurring tasks
- Add calendar integration
- Add Notion export
- Add mobile app (React Native)

---

## Troubleshooting

**"Firebase not initialized"**
- Check `.env.local` file exists and has all 6 variables
- Restart dev server: `npm run dev`

**"Authentication not working"**
- Check Firebase Authentication is enabled (Build → Authentication)
- Check Email/Password is toggled ON
- Check Firestore Database is created

**"Changes not syncing"**
- Check you're signed in
- Check internet connection
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
- Check Firebase Console to see if data is being written

**"App crashes on mobile"**
- Clear app cache and reload
- Try in incognito/private mode
- Check console for errors (Cmd+Option+I on Safari, F12 on Chrome)

---

## Security Notes

**For Production:**
1. Update Firestore security rules (don't use test mode)
2. In Firebase Console → Firestore → Rules, use:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /tasks/{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
3. Enable Authentication methods you want (Google, GitHub, etc.)

---

## Support

- **Firebase Docs**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **Next.js Docs**: [nextjs.org](https://nextjs.org)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)

---

**You're all set! 🚀 Your synced task manager is live. Go add tasks across all your devices!**
