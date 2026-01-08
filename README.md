# Voice It, Shape It 🎯

**Student Suggestion Box Web Application**  
*Cebu Technological University - Daanbantayan Campus*

---

## 📋 Project Overview

A modern, responsive web application that digitizes the "Voice It, Shape It: Student Suggestion Box Policy" (Resolution No. 031, Series 2025-2026) for CTU-Daanbantayan Campus Supreme Student Government.

### Purpose
Provide a structured digital platform for students to:
- Submit feedback and suggestions (anonymous or with contact details)
- Track suggestion status in real-time
- Rate the policy's effectiveness
- Improve campus life, academic services, and student welfare

---

## ✨ Current Status

### ✅ Phase 1 Complete: Foundation & Loading Screen

**What's Working:**
- 🎨 Modern React application with Vite
- 💅 SCSS styling system with SSG color scheme
- ⚡ Dynamic loading screen with connection-aware animations
- 📱 Fully responsive design (mobile-first)
- 🎭 Smooth animations using Framer Motion
- 🎯 Professional branding based on SSG logo

**Live Development Server:**
```bash
http://localhost:3000
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ ([Download](https://nodejs.org/))
- npm (comes with Node.js)
- Internet connection (for MongoDB)

### ⚡ FASTEST WAY - Just Run This:

**Windows:**
```bash
start-dev.bat
```
This automatically starts both frontend and backend servers!

**Then open:** http://localhost:3000

---

### 📝 Manual Method (Two Terminals)

#### Terminal 1 - Backend Server
```bash
cd server
npm install          # First time only
npm run dev          # Start backend (port 5000)
```

#### Terminal 2 - Frontend Server
```bash
cd client
npm install          # First time only
npm run dev          # Start frontend (port 3000)
```

#### Open Browser
```
http://localhost:3000
```

---

### 🛑 Stop Servers

**Easy way:**
```bash
stop-dev.bat
```

**Manual way:**
Press `Ctrl + C` in each terminal

---

### 📚 More Help
- **HOW_TO_RUN.md** - Visual step-by-step guide
- **DEV_GUIDE.md** - Detailed development guide
- **QUICK_REFERENCE.md** - Quick command reference

---

## 🎨 Design System

### Color Scheme (Based on SSG Logo)

**Primary Colors:**
- Deep Blue: `#1e3a8a` - Trust, authority
- Bright Blue: `#3b82f6` - Modern, engaging
- Dark Blue: `#1e40af` - Professional depth

**Secondary Colors:**
- Gold: `#f59e0b` - Excellence, achievement
- Yellow: `#fbbf24` - Energy, warmth
- Dark Gold: `#d97706` - Rich accents

**Accent Colors:**
- Red: `#dc2626` - Alerts, errors
- Green: `#16a34a` - Success, completion
- Purple: `#9333ea` - Special highlights

### Typography
- **Primary Font:** Inter (clean, modern)
- **Heading Font:** Poppins (bold, impactful)
- **Base Size:** 16px (responsive scaling)

### Responsive Breakpoints
- Mobile: 320px - 575px
- Tablet: 576px - 991px
- Desktop: 992px - 1199px
- Large: 1200px+

---

## 🎯 Features Implemented

### Dynamic Loading Screen

**Connection-Aware Performance:**
- Detects user's internet speed (4G, 3G, 2G)
- Adjusts animation timing accordingly
- Fast connection: ~1.5 seconds
- Medium connection: ~2.5 seconds
- Slow connection: ~4 seconds

**Visual Elements:**
- ✨ Animated gradient background with floating orbs
- 🔄 Rotating logo ring with pulse effect
- 📊 Smooth progress bar with shimmer overlay
- 🌟 20 floating particles for depth
- 📡 Connection speed indicator
- 💫 Glassmorphism effects

**Animations:**
- Logo entrance with spring physics
- Continuous ring rotation
- Progress bar fill with glow
- Floating orbs with blur
- Particle system with random movement
- Staggered text fade-in

---

## 📁 Project Structure

```
voice-it-shape-it/
├── client/                          # React Frontend
│   ├── public/
│   │   └── ssg-logo.jpg            # SSG Logo
│   ├── src/
│   │   ├── components/
│   │   │   └── LoadingScreen/
│   │   │       ├── LoadingScreen.jsx
│   │   │       └── LoadingScreen.scss
│   │   ├── styles/
│   │   │   ├── _variables.scss     # Design tokens
│   │   │   ├── _mixins.scss        # SCSS utilities
│   │   │   └── global.scss         # Global styles
│   │   ├── App.jsx                 # Main component
│   │   ├── App.scss                # App styles
│   │   └── main.jsx                # Entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── README.md
├── docs/
│   ├── PROJECT_PLAN.md             # Complete project plan
│   ├── IMPLEMENTATION_STATUS.md    # Current progress
│   ├── DESIGN_CONCEPT.md           # Design guidelines
│   └── GETTING_STARTED.md          # Quick start guide
├── Reso 31.docx                    # Original resolution
├── SSG_LOGO.jpg                    # Logo file
└── README.md                       # This file
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool & dev server
- **SCSS** - Advanced CSS with variables & mixins
- **Framer Motion** - Smooth animations
- **React Router** - Navigation (ready)
- **Axios** - HTTP client (ready)

### Future Backend (Planned)
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Nodemailer for emails

---

## 📊 Development Progress

| Phase | Status | Completion |
|-------|--------|------------|
| ✅ Foundation & Loading | Complete | 100% |
| 🔄 Home/Landing Page | Next | 0% |
| ⏳ Suggestion Form | Pending | 0% |
| ⏳ Tracking System | Pending | 0% |
| ⏳ Admin Dashboard | Pending | 0% |
| ⏳ Backend API | Pending | 0% |
| ⏳ Testing & QA | Pending | 0% |
| ⏳ Deployment | Pending | 0% |

**Overall: 12.5%** (1/8 phases)

---

## 🎯 Next Steps

### Phase 2: Home/Landing Page
- Hero section with CTU-DBC branding
- "Submit a Suggestion" call-to-action
- Feature highlights
- Statistics showcase
- Quick navigation cards
- Footer with contact information

### Phase 3: Suggestion Submission Form
- Multi-step wizard interface
- Category selection (Academic, Administrative, etc.)
- Anonymous vs. Non-anonymous toggle
- File upload capability
- Form validation
- Success page with tracking code

### Phase 4: Tracking System
- Tracking code input
- Status timeline visualization
- Committee response display
- Real-time status updates

### Phase 5: Admin Dashboard
- Secure authentication
- Suggestions management
- Department forwarding
- Analytics & reporting
- User management

---

## 📖 Documentation

- **[PROJECT_PLAN.md](PROJECT_PLAN.md)** - Complete 16-week development plan
- **[IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)** - Current progress tracker
- **[DESIGN_CONCEPT.md](DESIGN_CONCEPT.md)** - Design system & guidelines
- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Quick start guide
- **[client/README.md](client/README.md)** - Frontend documentation

---

## 🎨 Design Highlights

### Loading Screen Features
1. **Adaptive Performance** - Responds to connection speed
2. **Engaging Animations** - Keeps users entertained
3. **Brand Integration** - SSG colors and identity
4. **Professional Polish** - Modern, smooth transitions
5. **Mobile Optimized** - Works perfectly on all devices

### Design Principles
- **Modern & Professional** - Clean, contemporary interface
- **Student-Friendly** - Approachable and welcoming
- **Mobile-First** - Optimized for smartphones
- **Accessible** - WCAG AA compliant (planned)

---

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Clean install (if issues)
rm -rf node_modules
npm install
```

---

## 🌐 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Android Chrome)

---

## 📝 Based on Resolution No. 031

**Series of 2025-2026**  
**Author:** Hon. Marco C. Montellano  
**Co-Author:** Hon. Leslie Jane Dela Peña

This application implements the "Voice It, Shape It: Student Suggestion Box Policy" to provide a structured mechanism for collecting student feedback and ideas to address student needs, improve campus services, and foster a collaborative community.

---

## 👥 Stakeholders

- **Students** - Submit and track suggestions
- **Feedback Committee** - Review and manage submissions
- **SSG Adviser** - Oversight and guidance
- **Campus Administration** - Review and action items
- **Department Heads** - Receive forwarded suggestions

---

## 🎓 CTU Daanbantayan Campus

**Supreme Student Government**  
Cebu Technological University  
Daanbantayan Campus

---

## 📄 License

This project is developed for CTU-Daanbantayan Campus Supreme Student Government.

---

## 🚀 Current Status: READY FOR PHASE 2

The foundation is solid, the loading screen is beautiful, and we're ready to build the main application features!

**Development Server Running:** ✅  
**Loading Screen Complete:** ✅  
**Design System Ready:** ✅  
**Next Phase:** Home/Landing Page 🎯

---

*Last Updated: January 8, 2026*  
*Version: 1.0.0-alpha*  
*Status: Active Development*
