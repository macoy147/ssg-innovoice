# Getting Started with Voice It, Shape It

## Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation Steps

1. **Navigate to the client folder:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   The app will automatically open at `http://localhost:3000`

### What You'll See

1. **Dynamic Loading Screen:**
   - Connection-aware animations (adapts to your internet speed)
   - Animated logo with rotating ring
   - Progress bar with smooth transitions
   - Floating particles effect
   - Gradient background with animated orbs

2. **Color Scheme:**
   - Based on SSG_LOGO.jpg
   - Primary: Blue tones (#1e3a8a, #3b82f6)
   - Secondary: Gold/Yellow (#f59e0b, #fbbf24)
   - Modern gradients and shadows

### Features Implemented

✅ React 18 with Vite (fast build tool)
✅ SCSS for advanced styling
✅ Framer Motion for smooth animations
✅ Connection-aware loading screen
✅ Responsive design (mobile-first)
✅ Modern UI with glassmorphism effects
✅ Animated logo and branding

### Next Steps

The loading screen is complete! Next, we'll build:
- Home/Landing page
- Suggestion submission form
- Tracking system
- Admin dashboard

### Troubleshooting

**If you encounter any issues:**

1. Make sure Node.js is installed:
   ```bash
   node --version
   ```

2. Clear npm cache if needed:
   ```bash
   npm cache clean --force
   ```

3. Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```

### Development Tips

- The loading screen duration is based on connection speed
- Fast connection (4G): ~1.5 seconds
- Medium connection (3G): ~2.5 seconds
- Slow connection: ~4 seconds

- You can adjust the loading speed in `LoadingScreen.jsx` by modifying the `baseSpeed` variable

### File Structure

```
client/
├── src/
│   ├── components/
│   │   └── LoadingScreen/
│   │       ├── LoadingScreen.jsx    (Component logic)
│   │       └── LoadingScreen.scss   (Styles)
│   ├── styles/
│   │   ├── _variables.scss          (Color scheme, spacing, etc.)
│   │   ├── _mixins.scss             (Reusable SCSS mixins)
│   │   └── global.scss              (Global styles)
│   ├── App.jsx                      (Main app component)
│   └── main.jsx                     (Entry point)
```

Enjoy building! 🚀
