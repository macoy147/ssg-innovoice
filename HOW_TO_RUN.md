# 🚀 How to Run Voice It, Shape It

## ⚡ FASTEST WAY (Recommended)

### Just double-click this file:
```
start-dev.bat
```

**That's it!** Two windows will open:
- ✅ Backend Server (port 5000)
- ✅ Frontend Server (port 3000)

Then open your browser: **http://localhost:3000**

---

## 📝 Step-by-Step Guide

### Step 1: Open Command Prompt or Terminal

**Windows:**
- Press `Win + R`
- Type `cmd`
- Press Enter

**Or in VS Code:**
- Press `Ctrl + ~` (backtick)

### Step 2: Navigate to Project Folder

```bash
cd C:\Users\MARCO\Desktop\BACKUP\VOICEIT-SHAPEIT
```

### Step 3: Choose Your Method

#### **Method A: Use the Batch File (Easiest)**
```bash
start-dev.bat
```

#### **Method B: Manual (Two Terminals)**

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### Step 4: Open Your Browser

Go to: **http://localhost:3000**

---

## 🎯 What You'll See

### Terminal 1 (Backend):
```
> voice-it-shape-it-server@1.0.0 dev
> nodemon src/index.js

[nodemon] starting `node src/index.js`
🚀 Server running on port 5000
📍 Environment: development
🌐 API URL: http://localhost:5000
✅ MongoDB Connected: ac-gtbazlm-shard-00-01.kzd7kux.mongodb.net
📊 Database: voiceit-shapeit
```

### Terminal 2 (Frontend):
```
> voice-it-shape-it-client@1.0.0 dev
> vite

  VITE v5.4.21  ready in 598 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Browser:
1. **Loading Screen** appears (red theme with SSG logo)
2. **Suggestion Form** loads after 1-4 seconds
3. You can now submit suggestions!

---

## 🛑 How to Stop

### Method 1: Use the Stop Script
```bash
stop-dev.bat
```

### Method 2: In Each Terminal
Press `Ctrl + C`

### Method 3: Close Terminal Windows
Just close the terminal windows

---

## 🔧 First Time Setup

If this is your first time running the project:

### 1. Install Backend Dependencies
```bash
cd server
npm install
```

### 2. Install Frontend Dependencies
```bash
cd client
npm install
```

### 3. Then Run
```bash
start-dev.bat
```

---

## 📊 Visual Guide

```
┌─────────────────────────────────────────────────────────┐
│  Step 1: Open Command Prompt                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │ C:\Users\MARCO\Desktop\BACKUP\VOICEIT-SHAPEIT>   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Step 2: Run start-dev.bat                              │
│  ┌───────────────────────────────────────────────────┐  │
│  │ C:\...\VOICEIT-SHAPEIT> start-dev.bat            │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Two Windows Open Automatically                         │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │ Backend Server   │  │ Frontend Server  │            │
│  │ Port 5000        │  │ Port 3000        │            │
│  │ ✅ MongoDB OK    │  │ ✅ Vite Ready    │            │
│  └──────────────────┘  └──────────────────┘            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Step 3: Open Browser                                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │ http://localhost:3000                             │  │
│  │                                                   │  │
│  │  [Loading Screen with SSG Logo]                  │  │
│  │           ↓                                       │  │
│  │  [Suggestion Form]                                │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🎮 Using Different Tools

### Using Windows Command Prompt
```cmd
cd C:\Users\MARCO\Desktop\BACKUP\VOICEIT-SHAPEIT
start-dev.bat
```

### Using PowerShell
```powershell
cd C:\Users\MARCO\Desktop\BACKUP\VOICEIT-SHAPEIT
.\start-dev.bat
```

### Using Git Bash
```bash
cd /c/Users/MARCO/Desktop/BACKUP/VOICEIT-SHAPEIT
./start-dev.bat
```

### Using VS Code Terminal
1. Open VS Code
2. Open folder: `VOICEIT-SHAPEIT`
3. Press `Ctrl + ~` to open terminal
4. Type: `start-dev.bat`
5. Press Enter

---

## ❓ Common Questions

### Q: Do I need to run both servers?
**A:** Yes! The frontend (React) needs the backend (API) to submit suggestions to MongoDB.

### Q: Can I run them in one terminal?
**A:** No, they need separate terminals. But `start-dev.bat` handles this automatically!

### Q: What if port 3000 is already in use?
**A:** Run `stop-dev.bat` first, then `start-dev.bat` again.

### Q: How do I know if it's working?
**A:** 
- Backend shows "✅ MongoDB Connected"
- Frontend shows "VITE ready"
- Browser loads http://localhost:3000

### Q: Do I need internet?
**A:** Yes, for MongoDB Atlas connection.

### Q: Can I use a different port?
**A:** Yes, edit `vite.config.js` (frontend) and `.env` (backend).

---

## 🐛 Troubleshooting

### Problem: "npm is not recognized"
**Solution:** Install Node.js from https://nodejs.org/

### Problem: "Cannot find module"
**Solution:**
```bash
cd server
npm install
cd ../client
npm install
```

### Problem: "Port already in use"
**Solution:**
```bash
stop-dev.bat
start-dev.bat
```

### Problem: "MongoDB connection failed"
**Solution:** Check your internet connection

### Problem: "Page not loading"
**Solution:**
1. Check both terminals are running
2. Refresh browser (Ctrl + F5)
3. Clear browser cache

---

## ✅ Checklist

Before running:
- [ ] Node.js installed
- [ ] Project folder opened
- [ ] Internet connection active

After running:
- [ ] Backend terminal shows MongoDB connected
- [ ] Frontend terminal shows Vite ready
- [ ] Browser loads http://localhost:3000
- [ ] Loading screen appears
- [ ] Form loads successfully

---

## 🎯 Quick Reference

| What | Command | Port |
|------|---------|------|
| Start both | `start-dev.bat` | - |
| Stop both | `stop-dev.bat` | - |
| Frontend | `cd client && npm run dev` | 3000 |
| Backend | `cd server && npm run dev` | 5000 |
| View app | Open browser | 3000 |
| View API | Open browser | 5000 |

---

## 🎉 You're Ready!

Just run:
```bash
start-dev.bat
```

Then open: **http://localhost:3000**

**That's it!** 🚀

---

*Need more help? Check DEV_GUIDE.md for detailed instructions.*
