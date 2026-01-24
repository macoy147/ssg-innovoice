# Backend Architecture

## 🏗️ Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT REQUEST                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY MIDDLEWARE                       │
│  • Helmet (Security Headers)                                 │
│  • CORS (Cross-Origin)                                       │
│  • Rate Limiting                                             │
│  • Mongo Sanitize (NoSQL Injection Prevention)              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    INPUT VALIDATORS                          │
│  • express-validator                                         │
│  • Type checking                                             │
│  • Format validation                                         │
│  • Length constraints                                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 VALIDATION MIDDLEWARE                        │
│  • handleValidationErrors()                                  │
│  • Returns 400 with clear error messages                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  AUTHENTICATION MIDDLEWARE                   │
│  • verifyAdminPassword() (for admin routes)                 │
│  • requireDeveloperRole() (for developer-only routes)       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    ROUTE HANDLERS                            │
│  • suggestionRoutes.js                                       │
│  • adminRoutes.js                                            │
│  • HTTP concerns only (req/res handling)                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    INPUT DTOs                                │
│  • CreateSuggestionDTO                                       │
│  • UpdateStatusDTO                                           │
│  • AdminVerifyDTO                                            │
│  • Sanitize and structure input data                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                             │
│  • suggestionService.js                                      │
│  • adminService.js                                           │
│  • Business logic                                            │
│  • Data operations                                           │
│  • Logging                                                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
│  • aiPriorityService.js (Groq/Gemini)                       │
│  • imageUploadService.js (Cloudinary)                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE MODELS                           │
│  • Suggestion.js                                             │
│  • ActivityLog.js                                            │
│  • Mongoose schemas                                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    MONGODB DATABASE                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    OUTPUT DTOs                               │
│  • SuggestionResponseDTO                                     │
│  • PublicSuggestionResponseDTO                              │
│  • AdminVerifyResponseDTO                                    │
│  • Control what data is exposed                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    STRUCTURED LOGGING                        │
│  • Winston Logger                                            │
│  • logs/error.log                                            │
│  • logs/combined.log                                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    ERROR MIDDLEWARE                          │
│  • Catch all errors                                          │
│  • Log with full details                                     │
│  • Return generic message (production)                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT RESPONSE                           │
│  • JSON format                                               │
│  • Controlled data exposure                                  │
│  • Proper HTTP status codes                                  │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Directory Structure

```
server/
├── src/
│   ├── config/
│   │   └── database.js              # MongoDB connection
│   │
│   ├── dto/                          # Data Transfer Objects
│   │   ├── admin.dto.js              # Admin DTOs
│   │   └── suggestion.dto.js         # Suggestion DTOs
│   │
│   ├── middleware/                   # Middleware functions
│   │   ├── adminMiddleware.js        # Admin authentication
│   │   └── validationMiddleware.js   # Validation error handling
│   │
│   ├── models/                       # Database models
│   │   ├── ActivityLog.js            # Activity log schema
│   │   └── Suggestion.js             # Suggestion schema
│   │
│   ├── routes/                       # API routes
│   │   ├── adminRoutes.js            # Admin endpoints
│   │   └── suggestionRoutes.js       # Public endpoints
│   │
│   ├── services/                     # Business logic
│   │   ├── adminService.js           # Admin operations
│   │   ├── aiPriorityService.js      # AI priority analysis
│   │   ├── imageUploadService.js     # Image upload
│   │   └── suggestionService.js      # Suggestion operations
│   │
│   ├── utils/                        # Utilities
│   │   └── logger.js                 # Winston logger
│   │
│   ├── validators/                   # Input validators
│   │   ├── admin.validator.js        # Admin validators
│   │   └── suggestion.validator.js   # Suggestion validators
│   │
│   └── index.js                      # Application entry point
│
├── logs/                             # Log files (gitignored)
│   ├── combined.log                  # All logs
│   └── error.log                     # Error logs only
│
├── .env                              # Environment variables (gitignored)
├── .env.example                      # Environment template
├── package.json                      # Dependencies
├── ARCHITECTURE.md                   # This file
├── BACKEND_IMPROVEMENTS.md           # Detailed improvements
├── QUICK_START.md                    # Quick start guide
└── test-api.js                       # API test script
```

## 🔄 Request Flow Example

### Creating a Suggestion

```
1. Client sends POST /api/suggestions
   ↓
2. Security Middleware (Helmet, CORS, Rate Limit)
   ↓
3. Input Validators (createSuggestionValidator)
   ↓
4. Validation Middleware (handleValidationErrors)
   ↓
5. Route Handler (suggestionRoutes.js)
   ↓
6. Input DTO (CreateSuggestionDTO)
   ↓
7. Service Layer (suggestionService.createSuggestion)
   ↓
8. External Services (AI Priority, Image Upload)
   ↓
9. Database Model (Suggestion.save())
   ↓
10. MongoDB (Data persisted)
   ↓
11. Output DTO (CreateSuggestionResponseDTO)
   ↓
12. Logger (Log success)
   ↓
13. Client receives response
```

### Admin Authentication

```
1. Client sends POST /api/admin/verify
   ↓
2. Security Middleware
   ↓
3. Input Validators (adminVerifyValidator)
   ↓
4. Validation Middleware
   ↓
5. Route Handler (adminRoutes.js)
   ↓
6. Input DTO (AdminVerifyDTO)
   ↓
7. Service Layer (adminService.verifyPassword)
   ↓
8. Output DTO (AdminVerifyResponseDTO)
   ↓
9. Logger (Log login attempt)
   ↓
10. Activity Log (Save to database)
   ↓
11. Client receives response
```

## 🛡️ Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 1: NETWORK                          │
│  • Rate Limiting (prevent brute force)                       │
│  • CORS (control origins)                                    │
│  • Helmet (security headers)                                 │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 2: INPUT                            │
│  • Validation (type, format, length)                         │
│  • Sanitization (NoSQL injection prevention)                 │
│  • DTOs (prevent mass assignment)                            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 3: AUTHENTICATION                   │
│  • Admin password verification                               │
│  • Role-based access control                                 │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 4: BUSINESS LOGIC                   │
│  • Service layer validation                                  │
│  • Data integrity checks                                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 5: OUTPUT                           │
│  • DTOs control data exposure                                │
│  • Sensitive fields excluded                                 │
│  • Generic error messages                                    │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow

### Input Data Flow
```
Raw Request Body
    ↓
Validators (express-validator)
    ↓
Input DTO (sanitize & structure)
    ↓
Service Layer (business logic)
    ↓
Database Model (Mongoose schema)
    ↓
MongoDB
```

### Output Data Flow
```
MongoDB
    ↓
Database Model (Mongoose document)
    ↓
Service Layer (process data)
    ↓
Output DTO (control exposure)
    ↓
Route Handler (HTTP response)
    ↓
Client
```

## 🔍 Logging Flow

```
Application Event
    ↓
Logger Call (logger.info/warn/error)
    ↓
Winston Logger
    ├─→ Console Transport (colorized, development)
    ├─→ File Transport (logs/combined.log)
    └─→ Error File Transport (logs/error.log)
```

## 🎯 Key Principles

1. **Separation of Concerns**
   - Routes: HTTP handling
   - Services: Business logic
   - Models: Data structure
   - DTOs: Data transfer
   - Validators: Input validation

2. **Single Responsibility**
   - Each file has one clear purpose
   - Each function does one thing well

3. **DRY (Don't Repeat Yourself)**
   - Reusable middleware
   - Shared validators
   - Common DTOs

4. **Security First**
   - Multiple security layers
   - Input validation everywhere
   - Output control with DTOs
   - No sensitive data exposure

5. **Maintainability**
   - Clear file structure
   - Consistent patterns
   - Well-documented
   - Easy to extend

## 🚀 Scalability Considerations

The architecture supports:
- ✅ Easy addition of new endpoints
- ✅ Simple service extension
- ✅ Reusable validators and DTOs
- ✅ Clear testing boundaries
- ✅ Horizontal scaling (stateless)
- ✅ Microservices migration path

## 📚 Further Reading

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Service Layer Pattern](https://martinfowler.com/eaaCatalog/serviceLayer.html)
- [DTO Pattern](https://en.wikipedia.org/wiki/Data_transfer_object)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
