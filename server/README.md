# Voice It, Shape It - Backend API

## Overview
Node.js + Express.js backend API for the Student Suggestion Box system.

## Tech Stack
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (Atlas cloud)
- **Mongoose** - ODM for MongoDB
- **Express Validator** - Input validation
- **Helmet** - Security headers
- **Morgan** - Request logging
- **CORS** - Cross-origin resource sharing

## Setup

### Install Dependencies
```bash
npm install
```

### Environment Variables
Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb+srv://marcomontellano147_db_user:ssg20252026@ssg.kzd7kux.mongodb.net/voiceit-shapeit?retryWrites=true&w=majority
NODE_ENV=development
```

### Run Development Server
```bash
npm run dev
```

### Run Production Server
```bash
npm start
```

## API Endpoints

### Base URL
```
http://localhost:5000
```

### Health Check
```http
GET /
```

**Response:**
```json
{
  "message": "Voice It, Shape It API",
  "version": "1.0.0",
  "status": "running"
}
```

---

### Submit Suggestion
```http
POST /api/suggestions
Content-Type: application/json
```

**Request Body:**
```json
{
  "category": "academic",
  "title": "Improve Library Hours",
  "content": "Extend library hours until 8 PM for students who need to study after classes.",
  "isAnonymous": false,
  "submitter": {
    "name": "Juan Dela Cruz",
    "studentId": "2024-12345",
    "email": "juan@ctu.edu.ph",
    "contactNumber": "0912-345-6789",
    "course": "BSIT",
    "yearLevel": "3rd Year",
    "wantsFollowUp": true
  }
}
```

**Validation Rules:**
- `category`: Required, must be one of: academic, administrative, extracurricular, general
- `title`: Required, max 200 characters
- `content`: Required, max 2000 characters
- `isAnonymous`: Required, boolean
- `submitter.email`: Optional, must be valid email format
- `submitter.yearLevel`: Optional, must be one of: 1st Year, 2nd Year, 3rd Year, 4th Year

**Success Response (201):**
```json
{
  "success": true,
  "message": "Suggestion submitted successfully",
  "data": {
    "trackingCode": "VISI-L8X9K2-AB3C",
    "category": "academic",
    "title": "Improve Library Hours",
    "status": "submitted",
    "createdAt": "2026-01-08T08:36:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "errors": [
    {
      "msg": "Title is required",
      "param": "title",
      "location": "body"
    }
  ]
}
```

---

### Track Suggestion
```http
GET /api/suggestions/track/:trackingCode
```

**Example:**
```http
GET /api/suggestions/track/VISI-L8X9K2-AB3C
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "trackingCode": "VISI-L8X9K2-AB3C",
    "category": "academic",
    "title": "Improve Library Hours",
    "content": "Extend library hours until 8 PM...",
    "isAnonymous": false,
    "submitter": {
      "name": "Juan Dela Cruz",
      "studentId": "2024-12345",
      "email": "juan@ctu.edu.ph",
      "contactNumber": "0912-345-6789",
      "course": "BSIT",
      "yearLevel": "3rd Year",
      "wantsFollowUp": true
    },
    "status": "submitted",
    "priority": "medium",
    "statusHistory": [],
    "createdAt": "2026-01-08T08:36:00.000Z",
    "updatedAt": "2026-01-08T08:36:00.000Z"
  }
}
```

**Note:** If `isAnonymous` is true, the `submitter` field will be excluded from the response.

**Error Response (404):**
```json
{
  "success": false,
  "message": "Suggestion not found with this tracking code"
}
```

---

### Get All Suggestions (Admin)
```http
GET /api/suggestions?category=academic&status=submitted&page=1&limit=10
```

**Query Parameters:**
- `category` (optional): Filter by category
- `status` (optional): Filter by status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "trackingCode": "VISI-L8X9K2-AB3C",
      "category": "academic",
      "title": "Improve Library Hours",
      "status": "submitted",
      "createdAt": "2026-01-08T08:36:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "pages": 3
  }
}
```

---

### Get Statistics
```http
GET /api/suggestions/stats
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 25,
    "byCategory": [
      { "_id": "academic", "count": 10 },
      { "_id": "administrative", "count": 8 },
      { "_id": "extracurricular", "count": 4 },
      { "_id": "general", "count": 3 }
    ],
    "byStatus": [
      { "_id": "submitted", "count": 15 },
      { "_id": "under_review", "count": 7 },
      { "_id": "resolved", "count": 3 }
    ]
  }
}
```

---

## Database Schema

### Suggestion Model

```javascript
{
  trackingCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
    // Auto-generated format: VISI-XXXXX-XXXX
  },
  
  category: {
    type: String,
    required: true,
    enum: ['academic', 'administrative', 'extracurricular', 'general']
  },
  
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  
  isAnonymous: {
    type: Boolean,
    default: true
  },
  
  submitter: {
    name: String,
    studentId: String,
    email: String (lowercase),
    contactNumber: String,
    course: String,
    yearLevel: String (enum: '1st Year', '2nd Year', '3rd Year', '4th Year'),
    wantsFollowUp: Boolean
  },
  
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'forwarded', 'action_taken', 'resolved', 'rejected'],
    default: 'submitted'
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  statusHistory: [{
    status: String,
    changedAt: Date,
    notes: String
  }],
  
  timestamps: true  // Adds createdAt and updatedAt
}
```

---

## Testing with cURL

### Submit Anonymous Suggestion
```bash
curl -X POST http://localhost:5000/api/suggestions \
  -H "Content-Type: application/json" \
  -d '{
    "category": "academic",
    "title": "Improve Library Hours",
    "content": "Extend library hours until 8 PM for students who need to study after classes.",
    "isAnonymous": true
  }'
```

### Submit Identified Suggestion
```bash
curl -X POST http://localhost:5000/api/suggestions \
  -H "Content-Type: application/json" \
  -d '{
    "category": "administrative",
    "title": "Better Parking System",
    "content": "Implement a better parking system for students and faculty.",
    "isAnonymous": false,
    "submitter": {
      "name": "Juan Dela Cruz",
      "studentId": "2024-12345",
      "email": "juan@ctu.edu.ph",
      "contactNumber": "0912-345-6789",
      "course": "BSIT",
      "yearLevel": "3rd Year",
      "wantsFollowUp": true
    }
  }'
```

### Track Suggestion
```bash
curl http://localhost:5000/api/suggestions/track/VISI-L8X9K2-AB3C
```

### Get All Suggestions
```bash
curl http://localhost:5000/api/suggestions
```

### Get Statistics
```bash
curl http://localhost:5000/api/suggestions/stats
```

---

## Error Handling

All errors return a consistent format:

```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error (development only)"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

---

## Security Features

- **Helmet** - Sets security HTTP headers
- **CORS** - Configured for frontend origin
- **Input Validation** - Express Validator
- **MongoDB Injection Protection** - Mongoose sanitization
- **Environment Variables** - Sensitive data in .env

---

## Logging

Morgan logs all requests in development mode:
```
GET /api/suggestions 200 45.123 ms - 1234
POST /api/suggestions 201 123.456 ms - 567
```

---

## MongoDB Connection

**Status:** ✅ Connected

**Database:** voiceit-shapeit

**Collections:**
- suggestions

**Connection String:**
```
mongodb+srv://marcomontellano147_db_user:ssg20252026@ssg.kzd7kux.mongodb.net/voiceit-shapeit
```

---

## Development Notes

- Server auto-restarts on file changes (nodemon)
- Validation errors return detailed messages
- Tracking codes are unique and auto-generated
- Anonymous submissions hide submitter data
- All timestamps are in ISO 8601 format

---

*Backend API for Voice It, Shape It - CTU Daanbantayan Campus*
