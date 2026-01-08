# API Testing Guide

## Quick Test Commands

### 1. Test Server Health
```bash
curl http://localhost:5000
```

**Expected Response:**
```json
{
  "message": "Voice It, Shape It API",
  "version": "1.0.0",
  "status": "running"
}
```

---

### 2. Submit Test Suggestion (Anonymous)
```bash
curl -X POST http://localhost:5000/api/suggestions \
  -H "Content-Type: application/json" \
  -d "{\"category\":\"academic\",\"title\":\"Test Suggestion\",\"content\":\"This is a test suggestion to verify the API is working correctly.\",\"isAnonymous\":true}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Suggestion submitted successfully",
  "data": {
    "trackingCode": "VISI-XXXXX-XXXX",
    "category": "academic",
    "title": "Test Suggestion",
    "status": "submitted",
    "createdAt": "2026-01-08T..."
  }
}
```

**Save the tracking code from the response!**

---

### 3. Track the Suggestion
Replace `VISI-XXXXX-XXXX` with your actual tracking code:

```bash
curl http://localhost:5000/api/suggestions/track/VISI-XXXXX-XXXX
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "trackingCode": "VISI-XXXXX-XXXX",
    "category": "academic",
    "title": "Test Suggestion",
    "content": "This is a test suggestion...",
    "isAnonymous": true,
    "status": "submitted",
    "priority": "medium",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### 4. Get All Suggestions
```bash
curl http://localhost:5000/api/suggestions
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "trackingCode": "VISI-XXXXX-XXXX",
      "category": "academic",
      "title": "Test Suggestion",
      "status": "submitted",
      ...
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "pages": 1
  }
}
```

---

### 5. Get Statistics
```bash
curl http://localhost:5000/api/suggestions/stats
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "total": 1,
    "byCategory": [
      { "_id": "academic", "count": 1 }
    ],
    "byStatus": [
      { "_id": "submitted", "count": 1 }
    ]
  }
}
```

---

## Testing with the Web Form

### 1. Open the Application
```
http://localhost:3000
```

### 2. Wait for Loading Screen
- Watch the SSG logo with red rotating ring
- See the red gradient background
- Wait for "Ready!" message

### 3. Fill Out the Form

**Step 1: Select Category**
- Click on "Academic Services" card

**Step 2: Enter Details**
- Title: "Improve WiFi Connection"
- Content: "The WiFi connection in the library is very slow. Please upgrade the internet speed to help students with their research and online activities."

**Step 3: Choose Submission Type**
- Try "Anonymous Submission" first
- Click "Submit Suggestion"

### 4. Success!
- You'll see a green checkmark
- Your tracking code will be displayed
- Example: `VISI-L8X9K2-AB3C`

### 5. Verify in Database
The suggestion is now stored in MongoDB!

---

## Testing with Postman

### Import Collection

Create a new Postman collection with these requests:

#### 1. Submit Suggestion
- **Method:** POST
- **URL:** `http://localhost:5000/api/suggestions`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "category": "extracurricular",
  "title": "More Sports Equipment",
  "content": "We need more basketball and volleyball equipment for students who want to play during breaks.",
  "isAnonymous": false,
  "submitter": {
    "name": "Maria Santos",
    "studentId": "2024-67890",
    "email": "maria@ctu.edu.ph",
    "contactNumber": "0923-456-7890",
    "course": "BSED",
    "yearLevel": "2nd Year",
    "wantsFollowUp": true
  }
}
```

#### 2. Track Suggestion
- **Method:** GET
- **URL:** `http://localhost:5000/api/suggestions/track/{{trackingCode}}`

#### 3. Get All Suggestions
- **Method:** GET
- **URL:** `http://localhost:5000/api/suggestions?page=1&limit=10`

#### 4. Get Statistics
- **Method:** GET
- **URL:** `http://localhost:5000/api/suggestions/stats`

---

## Validation Testing

### Test Invalid Category
```bash
curl -X POST http://localhost:5000/api/suggestions \
  -H "Content-Type: application/json" \
  -d "{\"category\":\"invalid\",\"title\":\"Test\",\"content\":\"Test content\",\"isAnonymous\":true}"
```

**Expected:** 400 Bad Request with validation error

### Test Missing Title
```bash
curl -X POST http://localhost:5000/api/suggestions \
  -H "Content-Type: application/json" \
  -d "{\"category\":\"academic\",\"content\":\"Test content\",\"isAnonymous\":true}"
```

**Expected:** 400 Bad Request with validation error

### Test Title Too Long
```bash
curl -X POST http://localhost:5000/api/suggestions \
  -H "Content-Type: application/json" \
  -d "{\"category\":\"academic\",\"title\":\"$(printf 'A%.0s' {1..201})\",\"content\":\"Test\",\"isAnonymous\":true}"
```

**Expected:** 400 Bad Request with validation error

### Test Invalid Email
```bash
curl -X POST http://localhost:5000/api/suggestions \
  -H "Content-Type: application/json" \
  -d "{\"category\":\"academic\",\"title\":\"Test\",\"content\":\"Test content\",\"isAnonymous\":false,\"submitter\":{\"email\":\"invalid-email\"}}"
```

**Expected:** 400 Bad Request with validation error

---

## Expected Results

### ✅ All Tests Should Pass

1. **Server Health Check** - Returns API info
2. **Submit Suggestion** - Returns tracking code
3. **Track Suggestion** - Returns suggestion details
4. **Get All Suggestions** - Returns list with pagination
5. **Get Statistics** - Returns counts by category and status
6. **Validation Tests** - Return appropriate error messages

### ✅ Database Verification

Check MongoDB Atlas:
1. Go to MongoDB Atlas dashboard
2. Browse Collections
3. Select `voiceit-shapeit` database
4. View `suggestions` collection
5. See your submitted suggestions

---

## Troubleshooting

### Server Not Responding
```bash
# Check if server is running
curl http://localhost:5000

# Restart server
cd server
npm run dev
```

### MongoDB Connection Error
- Check internet connection
- Verify MongoDB URI in `.env`
- Check MongoDB Atlas cluster status

### CORS Error
- Ensure backend server is running
- Check CORS configuration in `server/src/index.js`
- Verify frontend is on `http://localhost:3000`

### Validation Errors
- Check request body format
- Ensure all required fields are present
- Verify data types match schema

---

## Success Indicators

✅ **Backend Running:**
```
🚀 Server running on port 5000
📍 Environment: development
🌐 API URL: http://localhost:5000
✅ MongoDB Connected: ac-gtbazlm-shard-00-01.kzd7kux.mongodb.net
📊 Database: voiceit-shapeit
```

✅ **Frontend Running:**
```
VITE v5.4.21  ready in 598 ms
➜  Local:   http://localhost:3000/
```

✅ **Form Submission:**
- Loading screen appears with red theme
- Form loads with 3 steps
- Submission succeeds
- Tracking code displayed

✅ **Database:**
- Suggestions stored in MongoDB
- Tracking codes are unique
- Data matches form input

---

*Test your API to ensure everything is working correctly!*
