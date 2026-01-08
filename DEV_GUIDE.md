# Development Guide - Running the Project

## 🎯 Quick Start (Easiest Method)

### Method 1: Use the Batch Files (Windows)

**Start Both Servers:**
```bash
start-dev.bat
```
This will open 2 windows:
- Window 1: Backend server (port 5000)
- Window 2: Frontend server (port 3000)

**Stop All Servers:**
```bash
stop-dev.bat
```
This will stop all Node.js processes.

---

## 📋 Manual Method (More Control)

### Step 1: Open Two Terminal Windows

#### Terminal 1 - Backend Server
```bash
cd server
npm run dev
```

**You should see:**
```
🚀 Server running on port 5000
📍 Environment: development
🌐 API URL: http://localhost:5000
✅ MongoDB Connected: ac-gtbazlm-shard-00-01.kzd7kux.mongodb.net
📊 Database: voiceit-shapeit
```

#### Terminal 2 - Frontend Server
```bash
cd client
npm run dev
```

**You should see:**
```
VITE v5.4.21  ready in 598 ms
➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

### Step 2: Open Your Browser
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 🔧 Detailed Commands

### Frontend (React + Vite)

**Navigate to client folder:**
```bash
cd client
```

**Install dependencies (first time only):**
```bash
npm install
```

**Start development server:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

**Preview production build:**
```bash
npm run preview
```

### Backend (Node.js + Express)

**Navigate to server folder:**
```bash
cd server
```

**Install dependencies (first time only):**
```bash
npm install
```

**Start development server (with auto-reload):**
```bash
npm run dev
```

**Start production server:**
```bash
npm start
```

---

## 🎮 Using VS Code

### Method 1: Integrated Terminal

1. Open VS Code
2. Open Terminal (Ctrl + `)
3. Split terminal (click the split icon)
4. In first terminal:
   ```bash
   cd server
   npm run dev
   ```
5. In second terminal:
   ```bash
   cd client
   npm run dev
   ```

### Method 2: VS Code Tasks (Advanced)

Create `.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Backend",
      "type": "shell",
      "command": "npm run dev",
      "options": {
        "cwd": "${workspaceFolder}/server"
      },
      "isBackground": true,
      "problemMatcher": []
    },
    {
      "label": "Start Frontend",
      "type": "shell",
      "command": "npm run dev",
      "options": {
        "cwd": "${workspaceFolder}/client"
      },
      "isBackground": true,
      "problemMatcher": []
    },
    {
      "label": "Start All",
      "dependsOn": ["Start Backend", "Start Frontend"],
      "problemMatcher": []
    }
  ]
}
```

Then press `Ctrl+Shift+P` → "Tasks: Run Task" → "Start All"

---

## 🛑 Stopping the Servers

### Method 1: Use stop-dev.bat
```bash
stop-dev.bat
```

### Method 2: In Terminal
Press `Ctrl + C` in each terminal window

### Method 3: Task Manager
1. Open Task Manager (Ctrl + Shift + Esc)
2. Find "Node.js" processes
3. End tasks

---

## 🔍 Checking if Servers are Running

### Check Frontend
```bash
curl http://localhost:3000
```
Or open in browser: http://localhost:3000

### Check Backend
```bash
curl http://localhost:5000
```
Or open in browser: http://localhost:5000

### Check Ports
```bash
netstat -ano | findstr :3000
netstat -ano | findstr :5000
```

---

## 🐛 Troubleshooting

### Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution 1: Kill the process**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

**Solution 2: Use stop-dev.bat**
```bash
stop-dev.bat
```

### Dependencies Not Installed

**Error:**
```
Cannot find module 'express'
```

**Solution:**
```bash
# For backend
cd server
npm install

# For frontend
cd client
npm install
```

### MongoDB Connection Error

**Error:**
```
Error connecting to MongoDB
```

**Solution:**
1. Check internet connection
2. Verify `.env` file exists in `server/` folder
3. Check MongoDB Atlas cluster is running

### Frontend Not Loading

**Solution:**
```bash
cd client
rm -rf node_modules
npm install
npm run dev
```

### Backend Not Responding

**Solution:**
```bash
cd server
rm -rf node_modules
npm install
npm run dev
```

---

## 📊 What Each Command Does

### `npm run dev`

**In client folder:**
- Starts Vite development server
- Enables Hot Module Replacement (HMR)
- Opens browser automatically
- Watches for file changes
- Compiles React components

**In server folder:**
- Starts Node.js server with nodemon
- Auto-restarts on file changes
- Connects to MongoDB
- Enables API endpoints
- Logs requests to console

### `npm run build`

**In client folder:**
- Creates production-ready build
- Minifies JavaScript and CSS
- Optimizes assets
- Outputs to `dist/` folder

### `npm start`

**In server folder:**
- Starts production server
- No auto-reload
- Uses Node.js directly (not nodemon)

---

## 🎯 Recommended Workflow

### Daily Development

1. **Start servers:**
   ```bash
   start-dev.bat
   ```

2. **Open browser:**
   - http://localhost:3000

3. **Make changes:**
   - Edit files in `client/src/` or `server/src/`
   - Changes auto-reload

4. **Stop servers when done:**
   ```bash
   stop-dev.bat
   ```

### Testing Changes

1. **Frontend changes:**
   - Edit files in `client/src/`
   - Browser auto-refreshes
   - Check console for errors (F12)

2. **Backend changes:**
   - Edit files in `server/src/`
   - Server auto-restarts
   - Check terminal for logs

3. **Database changes:**
   - Edit `server/src/models/`
   - Server restarts automatically
   - Check MongoDB Atlas for data

---

## 📁 Project Structure

```
voice-it-shape-it/
├── client/              # Frontend (React)
│   ├── src/
│   ├── package.json     # Frontend dependencies
│   └── vite.config.js   # Vite configuration
│
├── server/              # Backend (Node.js)
│   ├── src/
│   ├── package.json     # Backend dependencies
│   └── .env             # Environment variables
│
├── start-dev.bat        # Start both servers
└── stop-dev.bat         # Stop all servers
```

---

## 🚀 Quick Commands Reference

| Action | Command |
|--------|---------|
| Start both servers | `start-dev.bat` |
| Stop all servers | `stop-dev.bat` |
| Start frontend only | `cd client && npm run dev` |
| Start backend only | `cd server && npm run dev` |
| Install frontend deps | `cd client && npm install` |
| Install backend deps | `cd server && npm install` |
| Build frontend | `cd client && npm run build` |
| Check frontend | http://localhost:3000 |
| Check backend | http://localhost:5000 |

---

## 💡 Tips

1. **Keep terminals open** while developing
2. **Watch for errors** in terminal output
3. **Check browser console** (F12) for frontend errors
4. **Use Ctrl+C** to stop servers gracefully
5. **Restart servers** if changes don't appear
6. **Clear browser cache** if styles don't update

---

## ✅ Success Indicators

**Frontend Running:**
```
VITE v5.4.21  ready in 598 ms
➜  Local:   http://localhost:3000/
```

**Backend Running:**
```
🚀 Server running on port 5000
✅ MongoDB Connected
```

**Both Working:**
- Frontend loads at http://localhost:3000
- Form submission succeeds
- Data appears in MongoDB

---

**Need help? Check the troubleshooting section above!** 🚀
