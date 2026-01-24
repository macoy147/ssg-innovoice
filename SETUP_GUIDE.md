# SSG InnoVoice - Setup Guide

Complete setup guide for the SSG InnoVoice Student Suggestion System.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Running the Application](#running-the-application)
5. [Features](#features)
6. [Deployment](#deployment)

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier) - for photo uploads
- Groq API key (free tier) - for AI priority analysis

## Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd SSG-INNOVOICE
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

## Configuration

### Server Configuration

1. **Create `.env` file in `server/` directory:**

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development
ADMIN_PASSWORD=your_secure_admin_password
CLIENT_URL=http://localhost:3000

# Security
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# AI Settings (Groq - Free tier: 14,400 requests/day)
# Get your API key at: https://console.groq.com
GROQ_API_KEY=your_groq_api_key

# Optional: Google Gemini as fallback
GEMINI_API_KEY=your_gemini_api_key

# Cloudinary Settings (Free tier: 25GB storage, 25GB bandwidth/month)
# Get your credentials at: https://console.cloudinary.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

2. **Get MongoDB Connection String:**
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Get connection string and replace `your_mongodb_connection_string`

3. **Get Groq API Key:**
   - Sign up at [Groq Console](https://console.groq.com)
   - Create API key
   - Replace `your_groq_api_key`

4. **Get Cloudinary Credentials:**
   - Sign up at [Cloudinary](https://cloudinary.com/users/register/free)
   - Get Cloud Name, API Key, and API Secret from dashboard
   - Replace the placeholder values

### Client Configuration

1. **Create `.env` file in `client/` directory:**

```env
VITE_API_URL=http://localhost:5000
```

## Running the Application

### Development Mode

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Client:**
```bash
cd client
npm run dev
```

The application will be available at:
- **Client:** http://localhost:3000
- **Server API:** http://localhost:5000
- **Admin Panel:** http://localhost:3000/admin

### Production Mode

**Server:**
```bash
cd server
npm start
```

**Client:**
```bash
cd client
npm run build
npm run preview
```

## Features

### For Students

1. **Submit Suggestions**
   - Choose category (Academic, Administrative, Extracurricular, General)
   - Write title and detailed description
   - Attach photo evidence (optional, max 2MB)
   - Submit anonymously or with contact information
   - Get tracking code to monitor status

2. **Track Suggestions**
   - Use tracking code to check status
   - View status history
   - See priority level assigned by AI

### For Admins

1. **Dashboard**
   - View all suggestions with filters
   - See statistics and analytics
   - Filter by category, status, priority, date
   - Search suggestions
   - Bulk operations

2. **Suggestion Management**
   - Update status (Submitted, Under Review, Forwarded, Action Taken, Resolved, Rejected)
   - Change priority (Low, Medium, High, Urgent)
   - View photo evidence (if attached)
   - Archive/unarchive suggestions
   - Delete suggestions
   - View status history

3. **Activity Logs**
   - Track all admin actions
   - Filter by admin role, action type, date
   - Search logs
   - View statistics

4. **Multi-Admin Support**
   - Multiple admin accounts with different roles
   - See who's online
   - Track individual admin activities

### AI Features

- **Automatic Priority Analysis:** AI analyzes suggestion content and assigns priority
- **Safety-First Approach:** Broken infrastructure and safety hazards automatically marked as urgent
- **Multi-Language Support:** Works with English, Tagalog, and Bisaya

### Photo Evidence

- **Upload Photos:** Students can attach photos to support their suggestions
- **Cloud Storage:** Images stored securely in Cloudinary
- **Automatic Optimization:** Images compressed and optimized for web
- **Admin View:** 📷 icon shows on suggestions with photos, "View Evidence" button in detail view

## Admin Accounts

Default admin accounts (change passwords in production):

| Username | Role | Access Level |
|----------|------|--------------|
| ssg2526pres | Executive | Full access |
| ssg2526vp | Executive | Full access |
| ssg2526cote | Executive | Full access |
| ssg2526coed | Executive | Full access |
| ssg2526presssec | Press Secretary | Full access |
| ssg2526netsec | Network Secretary | Full access |
| ssg2526dev | Developer | Full access + cleanup tools |
| ssg2526mathrep | Executive | Full access |
| ssg2526smm | Press Secretary | Full access |

## Deployment

### Vercel (Client)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `VITE_API_URL=your_server_url`
4. Deploy

### Render (Server)

1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `cd server && npm install`
4. Set start command: `cd server && npm start`
5. Add environment variables from `.env`
6. Deploy

## Troubleshooting

### Server won't start
- Check MongoDB connection string
- Verify all required environment variables are set
- Check if port 5000 is available

### Photo uploads not working
- Verify Cloudinary credentials
- Check server logs: `tail -f server/logs/combined.log`
- Ensure image is under 2MB and valid format

### AI priority not working
- Check Groq API key
- Verify internet connection
- Check server logs for errors

## Documentation

- **Backend Improvements:** `server/BACKEND_IMPROVEMENTS.md`
- **Architecture:** `server/ARCHITECTURE.md`
- **Quick Start:** `server/QUICK_START.md`
- **Cloudinary Setup:** `CLOUDINARY_SETUP.md`
- **Implementation Summary:** `IMPLEMENTATION_SUMMARY.md`

## Support

For issues or questions:
1. Check server logs: `server/logs/`
2. Review documentation
3. Check `.env` configuration
4. Verify all services are running

## License

This project is for CTU Daanbantayan Campus SSG use.
