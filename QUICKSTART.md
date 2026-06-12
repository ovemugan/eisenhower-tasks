# ⚡ Quick Start (5 minutes)

## TL;DR - Get it running now

### 1️⃣ **Firebase Setup** (2 min)
- Go to [firebase.google.com](https://firebase.google.com)
- Create a project
- Enable **Authentication** (Email/Password)
- Enable **Firestore Database**
- Copy your 6 config values

### 2️⃣ **Code Setup** (2 min)
```bash
# Install dependencies
npm install

# Create .env.local with your Firebase config
cp .env.local.example .env.local
# Edit .env.local and paste your 6 Firebase values

# Start dev server
npm run dev
# Open http://localhost:3000
```

### 3️⃣ **Deploy to Vercel** (1 min)
```bash
git push  # (to your GitHub repo)
```
Then:
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repo
- Add the 6 Firebase env vars
- Click Deploy
- Done! ✅

---

## File Structure

```
.
├── app/
│   ├── page.tsx              # Login/signup page
│   ├── dashboard/
│   │   ├── page.tsx          # Main app (3 views)
│   │   └── dashboard.css     # Styling
│   ├── auth.css              # Login styling
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── lib/
│   └── firebase.ts           # Firebase config
├── package.json              # Dependencies
├── .env.local.example        # Copy this → .env.local
├── tsconfig.json             # TypeScript config
├── next.config.js            # Next.js config
└── README.md                 # Full setup guide
```

---

## What You Get

✅ **3 Views** - Matrix / List / Status (Kanban)
✅ **Real-time Sync** - Changes appear on all devices instantly
✅ **Offline Support** - Works without internet, syncs when online
✅ **Mobile Ready** - Responsive on all screen sizes
✅ **Secure** - Password-protected with Firebase Auth
✅ **Free Hosting** - Vercel + Firebase free tier

---

## Your Firebase Config

You need **6 values** from Firebase Console → Project Settings:

1. `NEXT_PUBLIC_FIREBASE_API_KEY`
2. `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
3. `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
4. `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
5. `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
6. `NEXT_PUBLIC_FIREBASE_APP_ID`

Paste these into `.env.local`

---

## Common Issues

| Issue | Fix |
|-------|-----|
| "Firebase not initialized" | Check `.env.local` has all 6 values, restart `npm run dev` |
| "Auth not working" | Check Firebase Console → Authentication is enabled for Email/Password |
| "Changes not syncing" | Check Firestore Database exists, check internet |
| "Mobile app crashes" | Clear cache, try incognito mode, check F12 console |

---

## Next: Add Features

Easy to add later:
- Dark mode
- Task deletion
- Due dates
- Tags
- Priorities
- Recurring tasks
- Calendar view
- Search
- Filters

---

**Questions?** Check the full `README.md` file.

**Ready?** `npm run dev` 🚀
