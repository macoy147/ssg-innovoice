# Quick Reference Card

## 🚀 URLs

| Service | URL | Status |
|---------|-----|--------|
| Frontend | http://localhost:3000 | ✅ Running |
| Backend API | http://localhost:5000 | ✅ Running |
| MongoDB | Atlas Cloud | ✅ Connected |

## 🎨 Color Scheme

```
Red:    #dc2626  (Primary)
White:  #ffffff  (Text/Background)
Grey:   #9ca3af  (Secondary)
Black:  #000000  (Text/Shadows)
```

## 📝 Form Categories

1. 📚 **Academic Services** - Curriculum, teaching, learning
2. 🏛️ **Administrative Matters** - Policies, procedures, facilities
3. 🎭 **Extracurricular Activities** - Events, organizations, sports
4. 💡 **General Campus Improvements** - Overall campus life

## 🔑 API Endpoints

```
POST   /api/suggestions              Submit new suggestion
GET    /api/suggestions/track/:code  Track suggestion
GET    /api/suggestions              Get all (admin)
GET    /api/suggestions/stats        Get statistics
```

## 📊 Database

**Name:** voiceit-shapeit
**Collection:** suggestions
**Tracking Code Format:** VISI-XXXXX-XXXX

## 🎯 Form Fields

### Required
- Category (select one)
- Title (max 200 chars)
- Content (max 2000 chars)
- Submission type (anonymous/identified)

### Optional (if identified)
- Name
- Student ID
- Email
- Contact Number
- Course
- Year Level (1st-4th)
- Follow-up preference

## 🔧 Commands

### Start Frontend
```bash
cd client
npm run dev
```

### Start Backend
```bash
cd server
npm run dev
```

### Test API
```bash
curl http://localhost:5000
```

### Submit Test Suggestion
```bash
curl -X POST http://localhost:5000/api/suggestions \
  -H "Content-Type: application/json" \
  -d '{"category":"academic","title":"Test","content":"Test content","isAnonymous":true}'
```

## 📱 Responsive Breakpoints

- Mobile: 320px - 575px
- Tablet: 576px - 991px
- Desktop: 992px+

## ✅ Status Checklist

- [x] Loading screen with red theme
- [x] SSG logo displayed
- [x] Multi-step form working
- [x] MongoDB connected
- [x] API endpoints functional
- [x] Form validation active
- [x] Tracking codes generating
- [x] Data persisting

## 🎓 For Students

1. Visit http://localhost:3000
2. Wait for loading screen
3. Select a category
4. Write your suggestion
5. Choose anonymous or add details
6. Submit and save tracking code

## 👨‍💼 For Admins

**API Access:**
- View all: `GET /api/suggestions`
- Get stats: `GET /api/suggestions/stats`
- Track specific: `GET /api/suggestions/track/:code`

**MongoDB Access:**
- Database: voiceit-shapeit
- Collection: suggestions
- View in MongoDB Atlas dashboard

## 📚 Documentation

- **SETUP_COMPLETE.md** - Full setup guide
- **TEST_API.md** - API testing
- **FINAL_SUMMARY.md** - Complete summary
- **server/README.md** - API docs
- **PROJECT_PLAN.md** - Full plan

## 🆘 Troubleshooting

**Frontend not loading?**
```bash
cd client
npm install
npm run dev
```

**Backend not responding?**
```bash
cd server
npm install
npm run dev
```

**MongoDB connection error?**
- Check internet connection
- Verify .env file exists
- Check MongoDB Atlas status

## 🎉 Success Indicators

✅ Loading screen shows SSG logo with red ring
✅ Form has 3 steps with progress indicator
✅ Submission returns tracking code
✅ Backend logs show MongoDB connected
✅ Data appears in MongoDB Atlas

---

**Version:** 2.0.0
**Status:** Operational ✅
**Last Updated:** January 8, 2026
