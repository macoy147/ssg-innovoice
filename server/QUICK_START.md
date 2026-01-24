# Quick Start Guide - Improved Backend

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and configure:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development
LOG_LEVEL=info

# Security
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# AI (Optional)
GROQ_API_KEY=your_groq_api_key

# Image Upload (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Start Server
```bash
npm run dev
```

## 📊 What's New

### Structured Logging
Logs are now written to:
- `logs/error.log` - Error logs only
- `logs/combined.log` - All logs

Console output is colorized in development.

### Log Levels
Set `LOG_LEVEL` in `.env`:
- `error` - Only errors
- `warn` - Warnings and errors
- `info` - General info (recommended for production)
- `debug` - Detailed debugging (recommended for development)

### Better Error Messages
- **Production:** Generic, safe messages
- **Development:** Detailed error information
- **Logs:** Full stack traces and context

### Input Validation
All endpoints now validate:
- Data types
- Required fields
- Format constraints
- Length limits

Invalid requests return clear error messages.

## 🧪 Testing

### Run API Tests
```bash
# Make sure server is running first
node test-api.js
```

### Manual Testing
```bash
# Health check
curl http://localhost:5000

# Create suggestion
curl -X POST http://localhost:5000/api/suggestions \
  -H "Content-Type: application/json" \
  -d '{
    "category": "academic",
    "title": "Test Suggestion",
    "content": "This is a test",
    "isAnonymous": true
  }'

# Track suggestion (replace TRACKING_CODE)
curl http://localhost:5000/api/suggestions/track/TRACKING_CODE
```

## 📁 New File Structure

```
server/src/
├── config/          # Configuration
├── dto/             # Data Transfer Objects (NEW)
├── middleware/      # Middleware functions (NEW)
├── models/          # Database models
├── routes/          # API routes (refactored)
├── services/        # Business logic (NEW)
├── utils/           # Utilities (NEW)
└── validators/      # Input validators (NEW)
```

## 🔍 Debugging

### View Logs
```bash
# Tail error logs
tail -f logs/error.log

# Tail all logs
tail -f logs/combined.log

# Search logs
grep "error" logs/combined.log
```

### Common Issues

**Issue:** Server won't start
- Check MongoDB connection string
- Verify all required env variables are set
- Check logs for detailed error

**Issue:** Validation errors
- Check request body format
- Verify all required fields are present
- Check field types and constraints

**Issue:** No logs appearing
- Check `LOG_LEVEL` setting
- Verify `logs/` directory exists
- Check file permissions

## 📚 API Documentation

### Public Endpoints

**POST /api/suggestions**
Create a new suggestion
```json
{
  "category": "academic|administrative|extracurricular|general",
  "title": "string (max 200 chars)",
  "content": "string (max 2000 chars)",
  "isAnonymous": boolean,
  "submitter": {
    "name": "string (optional)",
    "email": "string (optional)",
    "studentId": "string (optional)",
    "contactNumber": "string (optional)",
    "course": "string (optional)",
    "yearLevel": "string (optional)"
  }
}
```

**GET /api/suggestions/track/:trackingCode**
Track a suggestion by tracking code

### Admin Endpoints

All admin endpoints require `x-admin-password` header.

**POST /api/admin/verify**
Verify admin password

**GET /api/admin/suggestions**
Get all suggestions (with filters)

**PUT /api/admin/suggestions/:id/status**
Update suggestion status

**PUT /api/admin/suggestions/:id/priority**
Update suggestion priority

See `BACKEND_IMPROVEMENTS.md` for complete API documentation.

## 🔒 Security Features

✅ Input validation on all endpoints
✅ Rate limiting
✅ CORS protection
✅ NoSQL injection prevention
✅ Helmet security headers
✅ No internal error exposure
✅ Structured logging for audit trails

## 💡 Tips

1. **Development:** Set `LOG_LEVEL=debug` for detailed logs
2. **Production:** Set `LOG_LEVEL=info` and `NODE_ENV=production`
3. **Monitoring:** Regularly check `logs/error.log`
4. **Testing:** Use `test-api.js` to verify functionality
5. **Debugging:** Check logs for detailed error information

## 📖 Further Reading

- `BACKEND_IMPROVEMENTS.md` - Detailed documentation
- `IMPLEMENTATION_SUMMARY.md` - What was changed
- Winston docs: https://github.com/winstonjs/winston
- Express Validator: https://express-validator.github.io/

## 🆘 Support

If you encounter issues:
1. Check the logs in `logs/` directory
2. Review `BACKEND_IMPROVEMENTS.md`
3. Verify environment variables
4. Run `test-api.js` to identify issues
