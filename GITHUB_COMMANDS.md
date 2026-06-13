# 📋 COPY-PASTE COMMANDS FOR GITHUB

## For Windows Command Prompt or Mac/Linux Terminal

Run these commands **exactly as shown** in your terminal/command prompt.

---

## STEP 1: Download the code

Download the **outputs** folder from above.

---

## STEP 2: Open terminal/command prompt in that folder

**Windows:**
1. Open File Explorer
2. Go to the `outputs` folder
3. Hold **Shift** + **Right-click** inside the folder
4. Click **"Open PowerShell window here"** (or "Command prompt")

**Mac/Linux:**
1. Open Terminal
2. Type: `cd Downloads/outputs` (if that's where you saved it)

---

## STEP 3: Copy-paste these commands ONE BY ONE

### Command 1: Tell git who you are
```
git config --global user.email "your-email@gmail.com"
```
(Replace with your actual email)

### Command 2: Tell git your name
```
git config --global user.name "Your Name"
```
(Replace with your actual name)

### Command 3: Connect to GitHub
```
git remote add origin https://github.com/ovemugan/eisenhower-tasks.git
```
(This tells git where to upload)

### Command 4: Rename branch
```
git branch -M main
```

### Command 5: Upload to GitHub
```
git push -u origin main
```

**It will ask for your password!** Use your GitHub **Personal Access Token** (not your password):

1. Go to `github.com/settings/tokens`
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `eisenhower-setup`
4. Check these boxes:
   - ☑️ `repo` (full control)
5. Click **"Generate token"**
6. **Copy the token** (it won't show again!)
7. Paste it when git asks for password
8. Press Enter

**Done!** Your code is on GitHub! 🎉

---

## Verify it worked

Go to `github.com/ovemugan/eisenhower-tasks`

You should see:
- All your code files
- `README.md` 
- `package.json`
- `app/` folder
- `lib/` folder

---

## Next: Firebase + Vercel

Follow the **ULTIMATE_GUIDE.md** for Firebase and Vercel setup.

---

## If something goes wrong:

```
# Reset and start over
rm -rf .git
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/ovemugan/eisenhower-tasks.git
git branch -M main
git push -u origin main
```

Then follow steps 3-5 again.

---

**You've got this!** 💪
