# SSG InnoVoice 🎯

**Speak Ideas. Spark Change.**  
*Student Suggestion System - CTU Daanbantayan Campus*

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://reactjs.org/)

---

## 📋 Overview

A modern, full-stack web application for collecting and managing student suggestions at CTU-Daanbantayan Campus. Built for the Supreme Student Government with AI-powered priority analysis, photo evidence support, and comprehensive admin tools.

---

## 🚀 Live Demo

- **Frontend**: [https://voiceitshapeit.vercel.app](https://voiceitshapeit.vercel.app)
- **Backend API**: [https://voiceit-shapeit-api.onrender.com](https://voiceit-shapeit-api.onrender.com)

---

## ✨ Key Features

### For Students
- 📝 **Submit Suggestions** - Easy-to-use form with category selection
- 📷 **Photo Evidence** - Attach images to support suggestions (max 2MB)
- 🔒 **Anonymous Option** - Submit anonymously or with contact details
- 🔍 **Track Status** - Monitor suggestion progress with tracking code
- 🌐 **Multi-Language** - Supports English, Tagalog, and Bisaya

### For Admins
- 🎛️ **Comprehensive Dashboard** - View and manage all suggestions
- 🤖 **AI Priority Analysis** - Automatic priority assignment using Groq AI
- 📊 **Advanced Filtering** - Filter by category, status, priority, date, identity
- 🔎 **Search & Sort** - Powerful search and multiple sorting options
- 👥 **Multi-Admin Support** - Multiple admin accounts with activity tracking
- 📈 **Statistics & Analytics** - Real-time stats and insights
- 📋 **Activity Logs** - Complete audit trail of all admin actions
- 🗂️ **Archive System** - Archive old suggestions
- 💾 **Bulk Operations** - Select and delete multiple suggestions

### Technical Features
- 🔐 **Security** - Rate limiting, CORS, Helmet, NoSQL injection prevention
- 📱 **Responsive Design** - Works on all devices
- 🌙 **Dark/Light Mode** - Theme switching for admins
- 🎨 **Modern UI** - Smooth animations with Framer Motion
- 📝 **Structured Logging** - Winston logger with file logging
- ✅ **Input Validation** - Comprehensive validation on all endpoints
- 🏗️ **Clean Architecture** - Service layer, DTOs, middleware separation

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.2
- **Build Tool**: Vite
- **Styling**: SCSS, Framer Motion
- **Routing**: React Router DOM
- **HTTP Client**: Fetch API

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **ODM**: Mongoose
- **Logging**: Winston
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting

### External Services
- **AI**: Groq (primary), Google Gemini (fallback)
- **Image Storage**: Cloudinary
- **Deployment**: Vercel (frontend), Render (backend)

---

## 📦 Installation

### Prerequisites
- Node.js >= 18.0.0
- MongoDB Atlas account
- Cloudinary account (for photo uploads)
- Groq API key (for AI features)

### Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd SSG-INNOVOICE

# Install dependencies
npm run install:all

# Configure environment variables (see SETUP_GUIDE.md)
# Create server/.env and client/.env

# Start development servers
npm run dev
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Admin Panel: http://localhost:3000/admin

For detailed setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md)

---

## 📁 Project Structure

```
SSG-INNOVOICE/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── config/        # API configuration
│   │   └── styles/        # Global styles
│   └── public/            # Static assets
│
├── server/                # Express backend
│   ├── src/
│   │   ├── config/       # Database configuration
│   │   ├── dto/          # Data Transfer Objects
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Utilities (logger)
│   │   └── validators/   # Input validators
│   └── logs/             # Application logs
│
├── papers/               # Project documentation
├── SETUP_GUIDE.md       # Complete setup guide
├── CLOUDINARY_SETUP.md  # Cloudinary configuration
└── README.md            # This file
```

---

## 🔐 Admin Access

Multiple admin accounts with different roles:
- President, Vice President
- CoTE Governor, CoEd Governor
- Press Secretary, Network Secretary
- Developer (with additional tools)
- BSED-Math Representative
- Social Media Manager

Admin passwords are configured via environment variables.

---

## 📚 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete installation and configuration guide
- **[CLOUDINARY_SETUP.md](CLOUDINARY_SETUP.md)** - Photo upload configuration
- **[server/BACKEND_IMPROVEMENTS.md](server/BACKEND_IMPROVEMENTS.md)** - Backend architecture and improvements
- **[server/ARCHITECTURE.md](server/ARCHITECTURE.md)** - System architecture diagrams
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Recent improvements summary

---

## 🚀 Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Backend (Render)
1. Create Web Service
2. Connect repository
3. Configure build/start commands
4. Set environment variables
5. Deploy

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

---

## 🤝 Contributing

This project is maintained by the CTU Daanbantayan Campus Supreme Student Government.

---

## 📄 License

This project is for CTU Daanbantayan Campus SSG use.

---

## 👥 Credits

**CTU Daanbantayan Campus**  
Supreme Student Government  
Series 2025-2026

**Developed by:** SSG Development Team

---

## 📞 Support

For issues or questions:
1. Check the [SETUP_GUIDE.md](SETUP_GUIDE.md)
2. Review server logs in `server/logs/`
3. Contact the SSG Development Team

---

*Speak Ideas. Spark Change.* ✨
