# Voice It, Shape It: Student Suggestion Box System
## Comprehensive Project Plan

---

## 1. PROJECT OVERVIEW

### 1.1 Project Title
**Voice It, Shape It: Student Suggestion Box Web Application**

### 1.2 Project Purpose
A responsive web application that digitizes the Student Suggestion Box Policy of Cebu Technological University–Daanbantayan Campus, enabling students to submit feedback, suggestions, and innovative ideas to improve campus life, academic services, and student welfare.

### 1.3 Target Users
- **Students**: All bona fide students of CTU-Daanbantayan Campus
- **Feedback Committee**: SSG officers responsible for reviewing suggestions
- **Administrators**: Dean of Student Affairs, Dean of Instruction, Campus Director
- **SSG Adviser**: Oversight and guidance role

### 1.4 Target Devices
- Smartphones (iOS & Android browsers)
- Tablets (various screen sizes)
- Desktop PCs and Laptops
- Responsive design supporting 320px to 2560px+ screen widths

---

## 2. FUNCTIONAL REQUIREMENTS

### 2.1 Student Portal (Public-Facing)

#### 2.1.1 Suggestion Submission System

**Anonymous Submission Mode:**
- Submit suggestions without any identification
- No login required
- Categories selection (dropdown):
  - Academic Services
  - Administrative Matters
  - Extracurricular Activities
  - General Campus Improvements
- Free-text suggestion field (with character limit guidance)
- Optional: Attach supporting documents/images
- Confirmation message upon successful submission
- Unique tracking code generated for anonymous submissions (to check status later)

**Non-Anonymous Submission Mode (Optional Contact Details):**
- All anonymous features PLUS:
- Optional fields for:
  - Full Name
  - Student ID Number
  - Email Address
  - Contact Number
  - Course/Program
  - Year Level
- Checkbox: "I want to receive follow-up on my suggestion"
- Terms and conditions acceptance
- Email confirmation sent upon submission

#### 2.1.2 Suggestion Tracking System
- Track suggestion status using unique tracking code
- Status stages:
  - Submitted
  - Under Review
  - Forwarded to Department
  - Action Taken
  - Resolved/Closed
  - Rejected (with reason)
- View committee response/feedback
- Timeline of status changes

#### 2.1.3 Policy Information Page
- Full text of the Student Suggestion Box Policy
- Guidelines for submission
- Categories explanation
- Prohibited content guidelines
- FAQ section
- Contact information for the Feedback Committee

#### 2.1.4 Policy Feedback/Rating System
- Rate the suggestion box policy's effectiveness (1-5 stars)
- Rate accessibility of the system
- Optional comments on policy improvement
- Anonymous rating option

### 2.2 Feedback Committee Dashboard (Admin Panel)

#### 2.2.1 Authentication & Authorization
- Secure login system
- Role-based access control:
  - **Super Admin**: Full system access (Campus Director level)
  - **Admin**: Full management access (Dean level)
  - **Committee Chair**: Review, categorize, forward, respond
  - **Committee Member**: Review and categorize
  - **Viewer**: Read-only access to reports
- Password requirements (minimum 8 characters, mixed case, numbers)
- Session management and timeout
- Password reset functionality
- Two-factor authentication (optional enhancement)

#### 2.2.2 Suggestion Management

**Inbox/Queue System:**
- View all incoming suggestions
- Filter by:
  - Category
  - Date range
  - Status
  - Priority level
  - Anonymous vs. Non-anonymous
- Sort by date, priority, category
- Search functionality (keyword search in suggestions)
- Bulk actions (mark as reviewed, assign priority)

**Individual Suggestion View:**
- Full suggestion details
- Submission timestamp
- Category
- Contact information (if provided)
- Attachments viewer
- Status history/audit trail
- Internal notes section (visible only to committee)
- Action buttons:
  - Change status
  - Assign priority (Low, Medium, High, Urgent)
  - Forward to department
  - Add response/feedback
  - Flag for review
  - Mark as duplicate
  - Reject (with reason selection)

**Department Forwarding System:**
- Forward suggestions to appropriate departments:
  - Office of the Campus Director
  - Dean of Instruction
  - Dean of Student Affairs and Services
  - SSG Adviser
  - Other (custom department)
- Attach committee notes
- Set deadline for department response
- Track department acknowledgment and response

#### 2.2.3 Response Management
- Draft and send responses to students (for non-anonymous with contact)
- Response templates for common issues
- Email notification to students when status changes
- Public response posting (for general announcements)

#### 2.2.4 Reporting & Analytics Dashboard

**Real-time Statistics:**
- Total suggestions received (all-time, monthly, weekly)
- Suggestions by category (pie chart)
- Suggestions by status (bar chart)
- Response time metrics
- Resolution rate
- Trend analysis (line graph over time)

**Monthly Reports (as per policy requirement):**
- Auto-generated monthly summary report
- Number of submissions
- Categories breakdown
- Actions taken
- Pending items
- Export to PDF/Excel

**Semester-End Evaluation Report:**
- Comprehensive semester analysis
- Total submissions received
- Categories of feedback distribution
- Actions taken and their impact assessment
- Student ratings from feedback mechanism
- Recommendations for improvement
- Export functionality for submission to:
  - SSG Adviser
  - Dean of Student Affairs and Services
  - Campus Director

#### 2.2.5 Policy Feedback Analysis
- View all policy ratings
- Average rating calculation
- Comments analysis
- Trend of policy satisfaction over time

#### 2.2.6 User Management (Super Admin)
- Add/edit/deactivate committee members
- Assign roles and permissions
- View user activity logs
- Manage department contacts

#### 2.2.7 System Settings
- Configure categories (add/edit/disable)
- Set up email templates
- Configure notification preferences
- Manage announcement banners
- System maintenance mode toggle

### 2.3 Notification System

**Email Notifications:**
- Submission confirmation (non-anonymous)
- Status change notifications
- Response received notification
- Monthly digest for committee members
- Deadline reminders for pending actions

**In-App Notifications:**
- New suggestion alerts (for committee)
- Department response received
- Overdue action items
- System announcements

### 2.4 Content Moderation

**Automated Filtering:**
- Profanity filter for submissions
- Spam detection
- Duplicate submission detection

**Manual Review:**
- Flag system for inappropriate content
- Review queue for flagged items
- Rejection workflow with reason codes:
  - Offensive language
  - Personal attacks
  - Unrelated content
  - Spam/duplicate
  - False information

### 2.5 Sanctions Management (for Non-Anonymous Violations)

**Violation Tracking:**
- Record violations per student
- Warning issuance system
- Restriction management (temporary submission ban)
- Appeal process tracking
- Reinstatement after one semester

**Workflow:**
1. Flag violation
2. Generate written notice
3. Schedule hearing (if needed)
4. Record outcome
5. Apply sanction
6. Track restriction period
7. Auto-notify for reinstatement eligibility

---

## 3. NON-FUNCTIONAL REQUIREMENTS

### 3.1 Performance
- Page load time: < 3 seconds on 3G connection
- API response time: < 500ms for standard operations
- Support 500+ concurrent users
- Database query optimization
- Image compression for attachments
- Lazy loading for lists

### 3.2 Security
- HTTPS encryption (SSL/TLS)
- Input validation and sanitization
- SQL injection prevention
- XSS (Cross-Site Scripting) protection
- CSRF (Cross-Site Request Forgery) tokens
- Rate limiting for submissions (prevent spam)
- Secure password hashing (bcrypt)
- Session security
- Data encryption at rest for sensitive information
- Regular security audits
- GDPR-compliant data handling (privacy)

### 3.3 Accessibility
- WCAG 2.1 AA compliance
- Screen reader compatibility
- Keyboard navigation support
- Color contrast ratios
- Alt text for images
- Focus indicators
- Resizable text support
- Filipino language support (bilingual interface)

### 3.4 Reliability
- 99.5% uptime target
- Automated backups (daily)
- Error logging and monitoring
- Graceful error handling
- Offline submission queue (PWA feature)

### 3.5 Scalability
- Horizontal scaling capability
- Database indexing strategy
- Caching implementation (Redis)
- CDN for static assets

### 3.6 Maintainability
- Clean code architecture
- Comprehensive documentation
- Version control (Git)
- Automated testing
- CI/CD pipeline ready

---

## 4. TECHNICAL ARCHITECTURE

### 4.1 Technology Stack

**Frontend:**
- React.js (v18+)
- React Router (navigation)
- Redux Toolkit or Zustand (state management)
- Axios (HTTP client)
- Tailwind CSS or Material-UI (responsive styling)
- React Hook Form (form handling)
- Yup/Zod (validation)
- Chart.js or Recharts (analytics visualization)
- React-PDF (report generation)
- i18next (internationalization - English/Filipino)

**Backend:**
- Node.js (v18+ LTS)
- Express.js (web framework)
- JWT (JSON Web Tokens) for authentication
- Passport.js (authentication middleware)
- Nodemailer (email service)
- Multer (file uploads)
- Express-validator (input validation)
- Helmet.js (security headers)
- Morgan (logging)
- Cors (cross-origin resource sharing)

**Database:**
- MongoDB (primary database)
- Mongoose (ODM - Object Document Mapper)
- MongoDB Atlas (cloud hosting option)

**Additional Services:**
- Redis (caching & session storage)
- Cloudinary or AWS S3 (file storage)
- SendGrid or Mailgun (email delivery)
- Google reCAPTCHA (spam prevention)

### 4.2 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Mobile Web  │  │   Tablet     │  │   Desktop    │          │
│  │  (Responsive)│  │  (Responsive)│  │  (Responsive)│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                           │                                      │
│                    React.js SPA                                  │
│         (Redux/Zustand + React Router + Tailwind)               │
└─────────────────────────────────────────────────────────────────┘
                            │
                      HTTPS/REST API
                            │
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                    Node.js + Express.js                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  API Routes                                              │   │
│  │  ├── /api/suggestions (CRUD operations)                  │   │
│  │  ├── /api/auth (login, register, password reset)         │   │
│  │  ├── /api/users (user management)                        │   │
│  │  ├── /api/reports (analytics & reports)                  │   │
│  │  ├── /api/feedback (policy ratings)                      │   │
│  │  ├── /api/notifications (alerts)                         │   │
│  │  └── /api/settings (system configuration)                │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Middleware: Auth, Validation, Rate Limiting, Logging    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   MongoDB    │  │    Redis     │  │  File Storage│          │
│  │  (Primary DB)│  │   (Cache)    │  │ (Cloudinary) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Database Schema Design

#### Collections:

**1. suggestions**
```javascript
{
  _id: ObjectId,
  trackingCode: String (unique, auto-generated),
  category: String (enum: academic, administrative, extracurricular, general),
  content: String,
  attachments: [{ url: String, filename: String, type: String }],
  isAnonymous: Boolean,
  submitter: {
    name: String (optional),
    studentId: String (optional),
    email: String (optional),
    contactNumber: String (optional),
    course: String (optional),
    yearLevel: String (optional),
    wantsFollowUp: Boolean
  },
  status: String (enum: submitted, under_review, forwarded, action_taken, resolved, rejected),
  priority: String (enum: low, medium, high, urgent),
  forwardedTo: [{
    department: String,
    forwardedAt: Date,
    forwardedBy: ObjectId (ref: users),
    deadline: Date,
    acknowledged: Boolean,
    response: String
  }],
  internalNotes: [{
    note: String,
    addedBy: ObjectId (ref: users),
    addedAt: Date
  }],
  response: {
    message: String,
    respondedBy: ObjectId (ref: users),
    respondedAt: Date,
    isPublic: Boolean
  },
  rejectionReason: String,
  flagged: Boolean,
  flagReason: String,
  duplicateOf: ObjectId (ref: suggestions),
  createdAt: Date,
  updatedAt: Date,
  statusHistory: [{
    status: String,
    changedBy: ObjectId (ref: users),
    changedAt: Date,
    notes: String
  }]
}
```

**2. users (Committee Members & Admins)**
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  role: String (enum: super_admin, admin, committee_chair, committee_member, viewer),
  position: String,
  department: String,
  isActive: Boolean,
  lastLogin: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  twoFactorEnabled: Boolean,
  twoFactorSecret: String,
  createdAt: Date,
  updatedAt: Date
}
```

**3. categories**
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  isActive: Boolean,
  order: Number,
  createdAt: Date,
  updatedAt: Date
}
```

**4. policyFeedback**
```javascript
{
  _id: ObjectId,
  effectivenessRating: Number (1-5),
  accessibilityRating: Number (1-5),
  comments: String,
  isAnonymous: Boolean,
  submitterEmail: String (optional),
  createdAt: Date
}
```

**5. violations**
```javascript
{
  _id: ObjectId,
  studentId: String,
  studentName: String,
  studentEmail: String,
  suggestionId: ObjectId (ref: suggestions),
  violationType: String (enum: offensive, personal_attack, spam, false_info),
  description: String,
  status: String (enum: pending, warning_issued, hearing_scheduled, restricted, resolved),
  warningIssuedAt: Date,
  hearingDate: Date,
  hearingNotes: String,
  restrictionStartDate: Date,
  restrictionEndDate: Date,
  reinstated: Boolean,
  handledBy: ObjectId (ref: users),
  createdAt: Date,
  updatedAt: Date
}
```

**6. departments**
```javascript
{
  _id: ObjectId,
  name: String,
  code: String,
  contactPerson: String,
  email: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**7. notifications**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  type: String,
  title: String,
  message: String,
  link: String,
  isRead: Boolean,
  createdAt: Date
}
```

**8. activityLogs**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  action: String,
  resourceType: String,
  resourceId: ObjectId,
  details: Object,
  ipAddress: String,
  userAgent: String,
  createdAt: Date
}
```

**9. settings**
```javascript
{
  _id: ObjectId,
  key: String (unique),
  value: Mixed,
  description: String,
  updatedBy: ObjectId (ref: users),
  updatedAt: Date
}
```

**10. emailTemplates**
```javascript
{
  _id: ObjectId,
  name: String,
  subject: String,
  body: String,
  variables: [String],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 5. API ENDPOINTS DESIGN

### 5.1 Public Endpoints (No Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/suggestions | Submit a new suggestion |
| GET | /api/suggestions/track/:trackingCode | Track suggestion status |
| GET | /api/categories | Get active categories |
| GET | /api/policy | Get policy information |
| POST | /api/policy-feedback | Submit policy rating |
| GET | /api/announcements | Get public announcements |

### 5.2 Protected Endpoints (Auth Required)

**Authentication:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | User login |
| POST | /api/auth/logout | User logout |
| POST | /api/auth/forgot-password | Request password reset |
| POST | /api/auth/reset-password | Reset password |
| GET | /api/auth/me | Get current user profile |
| PUT | /api/auth/change-password | Change password |

**Suggestions Management:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/suggestions | Get all suggestions (with filters) |
| GET | /api/admin/suggestions/:id | Get suggestion details |
| PUT | /api/admin/suggestions/:id/status | Update suggestion status |
| PUT | /api/admin/suggestions/:id/priority | Update priority |
| POST | /api/admin/suggestions/:id/forward | Forward to department |
| POST | /api/admin/suggestions/:id/respond | Add response |
| POST | /api/admin/suggestions/:id/notes | Add internal note |
| PUT | /api/admin/suggestions/:id/flag | Flag suggestion |
| PUT | /api/admin/suggestions/:id/reject | Reject suggestion |
| DELETE | /api/admin/suggestions/:id | Delete suggestion (Super Admin) |

**User Management:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/users | Get all users |
| POST | /api/admin/users | Create new user |
| GET | /api/admin/users/:id | Get user details |
| PUT | /api/admin/users/:id | Update user |
| DELETE | /api/admin/users/:id | Deactivate user |

**Reports & Analytics:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/reports/dashboard | Get dashboard statistics |
| GET | /api/admin/reports/monthly | Get monthly report |
| GET | /api/admin/reports/semester | Get semester evaluation |
| GET | /api/admin/reports/export | Export report (PDF/Excel) |
| GET | /api/admin/reports/policy-feedback | Get policy feedback analysis |

**Violations:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/violations | Get all violations |
| POST | /api/admin/violations | Create violation record |
| PUT | /api/admin/violations/:id | Update violation |
| PUT | /api/admin/violations/:id/reinstate | Reinstate student |

**Settings:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/settings | Get all settings |
| PUT | /api/admin/settings/:key | Update setting |
| GET | /api/admin/categories | Get all categories |
| POST | /api/admin/categories | Create category |
| PUT | /api/admin/categories/:id | Update category |
| GET | /api/admin/departments | Get all departments |
| POST | /api/admin/departments | Create department |
| PUT | /api/admin/departments/:id | Update department |
| GET | /api/admin/email-templates | Get email templates |
| PUT | /api/admin/email-templates/:id | Update email template |

**Notifications:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/notifications | Get user notifications |
| PUT | /api/admin/notifications/:id/read | Mark as read |
| PUT | /api/admin/notifications/read-all | Mark all as read |

---

## 6. USER INTERFACE DESIGN

### 6.1 Public Pages (Student-Facing)

#### 6.1.1 Home/Landing Page
- Hero section with policy tagline: "Voice It, Shape It"
- CTU-Daanbantayan Campus branding (SSG Logo)
- Quick action buttons:
  - "Submit a Suggestion" (prominent)
  - "Track Your Suggestion"
  - "Rate This Policy"
- Brief policy overview
- Statistics showcase (total suggestions, resolved count)
- Footer with contact info and links

#### 6.1.2 Suggestion Submission Page
- Step-by-step form wizard:
  - Step 1: Choose submission type (Anonymous/With Contact)
  - Step 2: Select category
  - Step 3: Write suggestion
  - Step 4: Attach files (optional)
  - Step 5: Review & Submit
- Progress indicator
- Character counter
- File upload with drag-and-drop
- reCAPTCHA verification
- Success page with tracking code

#### 6.1.3 Track Suggestion Page
- Tracking code input field
- Status timeline visualization
- Current status display
- Committee response (if any)
- Last updated timestamp

#### 6.1.4 Policy Information Page
- Full policy text (collapsible sections)
- Guidelines and rules
- FAQ accordion
- Contact information

#### 6.1.5 Policy Feedback Page
- Star rating components
- Comment text area
- Anonymous toggle
- Submit button

### 6.2 Admin Dashboard Pages

#### 6.2.1 Login Page
- Email/password form
- "Forgot Password" link
- SSG branding
- Secure login indicators

#### 6.2.2 Dashboard Overview
- Key metrics cards:
  - Total suggestions (with trend)
  - Pending review count
  - This month's submissions
  - Average response time
  - Resolution rate
- Charts:
  - Submissions over time (line chart)
  - Categories distribution (pie chart)
  - Status breakdown (bar chart)
- Recent suggestions list
- Quick action buttons
- Notifications panel

#### 6.2.3 Suggestions List Page
- Data table with columns:
  - Tracking Code
  - Category
  - Status
  - Priority
  - Date Submitted
  - Actions
- Advanced filters sidebar
- Search bar
- Bulk action toolbar
- Pagination
- Export button

#### 6.2.4 Suggestion Detail Page
- Full suggestion content
- Submitter info (if non-anonymous)
- Attachments gallery
- Status timeline
- Action panel:
  - Status dropdown
  - Priority selector
  - Forward button
  - Respond button
  - Flag/Reject buttons
- Internal notes section
- Activity log

#### 6.2.5 Reports Page
- Report type selector
- Date range picker
- Generate report button
- Preview section
- Export options (PDF, Excel)
- Scheduled reports configuration

#### 6.2.6 User Management Page
- Users table
- Add user button
- Edit/deactivate actions
- Role filter
- Activity status indicators

#### 6.2.7 Settings Page
- Tabbed interface:
  - General Settings
  - Categories Management
  - Departments Management
  - Email Templates
  - Notification Preferences
  - System Maintenance

#### 6.2.8 Violations Management Page
- Violations list
- Status filters
- Create violation form
- Violation detail modal
- Reinstatement workflow

### 6.3 Responsive Design Breakpoints

| Breakpoint | Width | Target Devices |
|------------|-------|----------------|
| xs | < 576px | Small phones |
| sm | ≥ 576px | Large phones |
| md | ≥ 768px | Tablets |
| lg | ≥ 992px | Small laptops |
| xl | ≥ 1200px | Desktops |
| xxl | ≥ 1400px | Large screens |

### 6.4 Mobile-First Considerations
- Touch-friendly buttons (minimum 44x44px)
- Swipe gestures for navigation
- Collapsible sidebar for admin
- Bottom navigation for key actions
- Pull-to-refresh functionality
- Optimized forms for mobile keyboards
- Floating action button for quick submission

---

## 7. PROJECT STRUCTURE

```
voice-it-shape-it/
├── client/                          # React Frontend
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   ├── manifest.json
│   │   └── assets/
│   │       └── images/
│   │           └── ssg-logo.png
│   ├── src/
│   │   ├── index.js
│   │   ├── App.js
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Table.jsx
│   │   │   │   ├── Pagination.jsx
│   │   │   │   ├── Loading.jsx
│   │   │   │   ├── Alert.jsx
│   │   │   │   ├── FileUpload.jsx
│   │   │   │   ├── StarRating.jsx
│   │   │   │   └── StatusBadge.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── PublicLayout.jsx
│   │   │   │   └── AdminLayout.jsx
│   │   │   ├── public/
│   │   │   │   ├── SuggestionForm.jsx
│   │   │   │   ├── TrackingForm.jsx
│   │   │   │   ├── PolicyContent.jsx
│   │   │   │   ├── FeedbackForm.jsx
│   │   │   │   └── StatusTimeline.jsx
│   │   │   ├── admin/
│   │   │   │   ├── DashboardStats.jsx
│   │   │   │   ├── SuggestionsList.jsx
│   │   │   │   ├── SuggestionDetail.jsx
│   │   │   │   ├── UsersList.jsx
│   │   │   │   ├── ReportsPanel.jsx
│   │   │   │   ├── ViolationsList.jsx
│   │   │   │   ├── SettingsPanel.jsx
│   │   │   │   ├── NotificationsDropdown.jsx
│   │   │   │   └── charts/
│   │   │   │       ├── SubmissionsChart.jsx
│   │   │   │       ├── CategoriesChart.jsx
│   │   │   │       └── StatusChart.jsx
│   │   │   └── forms/
│   │   │       ├── LoginForm.jsx
│   │   │       ├── ForgotPasswordForm.jsx
│   │   │       ├── UserForm.jsx
│   │   │       ├── CategoryForm.jsx
│   │   │       └── DepartmentForm.jsx
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   │   ├── HomePage.jsx
│   │   │   │   ├── SubmitPage.jsx
│   │   │   │   ├── TrackPage.jsx
│   │   │   │   ├── PolicyPage.jsx
│   │   │   │   ├── FeedbackPage.jsx
│   │   │   │   └── SuccessPage.jsx
│   │   │   ├── admin/
│   │   │   │   ├── DashboardPage.jsx
│   │   │   │   ├── SuggestionsPage.jsx
│   │   │   │   ├── SuggestionDetailPage.jsx
│   │   │   │   ├── UsersPage.jsx
│   │   │   │   ├── ReportsPage.jsx
│   │   │   │   ├── ViolationsPage.jsx
│   │   │   │   └── SettingsPage.jsx
│   │   │   └── auth/
│   │   │       ├── LoginPage.jsx
│   │   │       ├── ForgotPasswordPage.jsx
│   │   │       └── ResetPasswordPage.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useSuggestions.js
│   │   │   ├── useNotifications.js
│   │   │   └── useDebounce.js
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── store/                   # Redux/Zustand
│   │   │   ├── index.js
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js
│   │   │   │   ├── suggestionsSlice.js
│   │   │   │   ├── usersSlice.js
│   │   │   │   └── notificationsSlice.js
│   │   │   └── api/
│   │   │       └── apiSlice.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── suggestionService.js
│   │   │   ├── userService.js
│   │   │   └── reportService.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   ├── helpers.js
│   │   │   ├── validators.js
│   │   │   └── formatters.js
│   │   ├── styles/
│   │   │   ├── index.css
│   │   │   ├── tailwind.css
│   │   │   └── components/
│   │   ├── locales/                 # i18n
│   │   │   ├── en.json
│   │   │   └── fil.json
│   │   └── config/
│   │       └── routes.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env.example
│
├── server/                          # Node.js Backend
│   ├── src/
│   │   ├── index.js                 # Entry point
│   │   ├── app.js                   # Express app setup
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── passport.js
│   │   │   ├── email.js
│   │   │   └── cloudinary.js
│   │   ├── models/
│   │   │   ├── Suggestion.js
│   │   │   ├── User.js
│   │   │   ├── Category.js
│   │   │   ├── PolicyFeedback.js
│   │   │   ├── Violation.js
│   │   │   ├── Department.js
│   │   │   ├── Notification.js
│   │   │   ├── ActivityLog.js
│   │   │   ├── Setting.js
│   │   │   └── EmailTemplate.js
│   │   ├── routes/
│   │   │   ├── index.js
│   │   │   ├── publicRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── suggestionRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── reportRoutes.js
│   │   │   ├── violationRoutes.js
│   │   │   ├── settingRoutes.js
│   │   │   └── notificationRoutes.js
│   │   ├── controllers/
│   │   │   ├── publicController.js
│   │   │   ├── authController.js
│   │   │   ├── suggestionController.js
│   │   │   ├── userController.js
│   │   │   ├── reportController.js
│   │   │   ├── violationController.js
│   │   │   ├── settingController.js
│   │   │   └── notificationController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── roleCheck.js
│   │   │   ├── validate.js
│   │   │   ├── rateLimiter.js
│   │   │   ├── errorHandler.js
│   │   │   └── upload.js
│   │   ├── services/
│   │   │   ├── emailService.js
│   │   │   ├── trackingCodeService.js
│   │   │   ├── reportService.js
│   │   │   ├── notificationService.js
│   │   │   └── fileService.js
│   │   ├── validators/
│   │   │   ├── suggestionValidator.js
│   │   │   ├── userValidator.js
│   │   │   └── authValidator.js
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   ├── helpers.js
│   │   │   ├── profanityFilter.js
│   │   │   └── pdfGenerator.js
│   │   └── jobs/                    # Scheduled tasks
│   │       ├── monthlyReport.js
│   │       └── notificationCleanup.js
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── docs/                            # Documentation
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── USER_GUIDE.md
│
├── docker-compose.yml               # Docker setup
├── .gitignore
├── README.md
└── LICENSE
```

---

## 8. DEVELOPMENT PHASES & TIMELINE

### Phase 1: Foundation (Week 1-2)
**Backend Setup:**
- [ ] Initialize Node.js project with Express
- [ ] Configure MongoDB connection with Mongoose
- [ ] Set up project structure and folders
- [ ] Implement environment configuration
- [ ] Set up logging (Morgan, Winston)
- [ ] Configure security middleware (Helmet, CORS)
- [ ] Create base models (User, Suggestion, Category)

**Frontend Setup:**
- [ ] Initialize React project (Create React App or Vite)
- [ ] Configure Tailwind CSS
- [ ] Set up routing (React Router)
- [ ] Create base layout components
- [ ] Configure state management (Redux/Zustand)
- [ ] Set up API service layer (Axios)

### Phase 2: Core Features - Public (Week 3-4)
**Backend:**
- [ ] Implement suggestion submission API
- [ ] Create tracking code generation service
- [ ] Build suggestion tracking API
- [ ] Implement categories API
- [ ] Add input validation
- [ ] Set up file upload (Multer + Cloudinary)
- [ ] Implement reCAPTCHA verification

**Frontend:**
- [ ] Build landing/home page
- [ ] Create suggestion submission form (multi-step wizard)
- [ ] Implement file upload component
- [ ] Build tracking page with status timeline
- [ ] Create policy information page
- [ ] Implement responsive design for all public pages
- [ ] Add form validation

### Phase 3: Authentication & Admin Foundation (Week 5-6)
**Backend:**
- [ ] Implement JWT authentication
- [ ] Create user registration/login APIs
- [ ] Build password reset functionality
- [ ] Implement role-based access control
- [ ] Create user management APIs
- [ ] Set up session management

**Frontend:**
- [ ] Build login page
- [ ] Create forgot/reset password pages
- [ ] Implement auth context and protected routes
- [ ] Build admin layout with sidebar
- [ ] Create user management pages
- [ ] Implement role-based UI rendering

### Phase 4: Admin Dashboard & Management (Week 7-8)
**Backend:**
- [ ] Build suggestions management APIs (CRUD, filters, search)
- [ ] Implement status update workflow
- [ ] Create department forwarding system
- [ ] Build response/feedback APIs
- [ ] Implement internal notes functionality
- [ ] Create notification system

**Frontend:**
- [ ] Build dashboard overview with statistics
- [ ] Create suggestions list with filters and search
- [ ] Build suggestion detail page with actions
- [ ] Implement status update workflow UI
- [ ] Create department forwarding modal
- [ ] Build response composition interface
- [ ] Implement notifications dropdown

### Phase 5: Reporting & Analytics (Week 9-10)
**Backend:**
- [ ] Build dashboard statistics API
- [ ] Create monthly report generation
- [ ] Implement semester evaluation report
- [ ] Build policy feedback analysis API
- [ ] Create PDF/Excel export functionality
- [ ] Set up scheduled report jobs

**Frontend:**
- [ ] Implement dashboard charts (Chart.js/Recharts)
- [ ] Build reports page with filters
- [ ] Create report preview and export UI
- [ ] Build policy feedback analysis view
- [ ] Implement date range selectors

### Phase 6: Policy Feedback & Violations (Week 11)
**Backend:**
- [ ] Implement policy feedback submission API
- [ ] Build violations management APIs
- [ ] Create sanctions workflow
- [ ] Implement reinstatement logic

**Frontend:**
- [ ] Build policy feedback/rating page
- [ ] Create violations management page
- [ ] Implement violation detail modal
- [ ] Build reinstatement workflow UI

### Phase 7: Settings & Configuration (Week 12)
**Backend:**
- [ ] Build settings management APIs
- [ ] Create categories CRUD APIs
- [ ] Implement departments management
- [ ] Build email templates management
- [ ] Create activity logging

**Frontend:**
- [ ] Build settings page with tabs
- [ ] Create categories management UI
- [ ] Build departments management UI
- [ ] Implement email templates editor
- [ ] Create activity log viewer

### Phase 8: Polish & Optimization (Week 13-14)
- [ ] Implement email notifications (Nodemailer)
- [ ] Add profanity filter
- [ ] Implement spam detection
- [ ] Optimize database queries and indexing
- [ ] Add Redis caching
- [ ] Implement rate limiting
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] Accessibility audit and fixes
- [ ] Cross-browser testing
- [ ] Mobile responsiveness fine-tuning
- [ ] Add loading states and error handling
- [ ] Implement i18n (English/Filipino)

### Phase 9: Testing & QA (Week 15)
- [ ] Unit testing (Jest)
- [ ] Integration testing
- [ ] End-to-end testing (Cypress)
- [ ] Security testing
- [ ] Performance testing
- [ ] User acceptance testing
- [ ] Bug fixes and refinements

### Phase 10: Deployment & Launch (Week 16)
- [ ] Set up production environment
- [ ] Configure CI/CD pipeline
- [ ] Deploy to hosting platform
- [ ] Set up SSL certificates
- [ ] Configure domain and DNS
- [ ] Set up monitoring and alerts
- [ ] Create user documentation
- [ ] Conduct training for committee members
- [ ] Soft launch and monitoring
- [ ] Official launch

---

## 9. SECURITY CONSIDERATIONS

### 9.1 Authentication Security
- JWT tokens with short expiration (15 minutes access, 7 days refresh)
- Secure HTTP-only cookies for token storage
- Password hashing with bcrypt (salt rounds: 12)
- Account lockout after 5 failed login attempts
- Session invalidation on password change
- Optional two-factor authentication

### 9.2 Data Protection
- HTTPS enforcement (SSL/TLS)
- Input sanitization on all user inputs
- Parameterized queries (Mongoose handles this)
- XSS prevention (escape output, Content Security Policy)
- CSRF protection tokens
- SQL injection prevention
- File upload validation (type, size, content)

### 9.3 API Security
- Rate limiting (100 requests/15 minutes per IP)
- Request size limits
- API versioning
- CORS configuration (whitelist origins)
- Helmet.js security headers
- Request logging and monitoring

### 9.4 Privacy & Anonymity
- Anonymous submissions truly anonymous (no IP logging for anonymous)
- Encrypted storage for sensitive data
- Data retention policies
- Right to deletion compliance
- Audit trails for admin actions

### 9.5 Infrastructure Security
- Environment variables for secrets
- Secure MongoDB connection (authentication, SSL)
- Regular security updates
- Backup encryption
- Access control for production servers

---

## 10. DEPLOYMENT OPTIONS

### 10.1 Recommended: Cloud Hosting

**Option A: Render.com (Recommended for simplicity)**
- Free tier available
- Auto-deploy from GitHub
- Built-in SSL
- Easy MongoDB Atlas integration

**Option B: Railway**
- Simple deployment
- Good free tier
- Integrated database options

**Option C: Vercel (Frontend) + Railway (Backend)**
- Excellent React hosting on Vercel
- Backend on Railway
- Good performance

**Option D: DigitalOcean App Platform**
- More control
- Predictable pricing
- Good for scaling

### 10.2 Database Hosting
- MongoDB Atlas (recommended)
  - Free tier: 512MB storage
  - Automatic backups
  - Global clusters
  - Built-in security

### 10.3 File Storage
- Cloudinary (recommended)
  - Free tier: 25GB storage
  - Automatic optimization
  - Easy integration
- Alternative: AWS S3

### 10.4 Email Service
- SendGrid (recommended)
  - Free tier: 100 emails/day
  - Good deliverability
- Alternative: Mailgun, Nodemailer with Gmail

### 10.5 Domain & SSL
- Custom domain: ctu-dbc-suggestionbox.edu.ph (or similar)
- Free SSL via Let's Encrypt (auto-configured on most platforms)

---

## 11. TESTING STRATEGY

### 11.1 Unit Testing
- Jest for both frontend and backend
- Test coverage target: 80%
- Focus areas:
  - Utility functions
  - Validators
  - Services
  - React components (React Testing Library)

### 11.2 Integration Testing
- API endpoint testing with Supertest
- Database operations testing
- Authentication flow testing

### 11.3 End-to-End Testing
- Cypress for E2E tests
- Critical user flows:
  - Suggestion submission (anonymous & non-anonymous)
  - Tracking suggestion
  - Admin login and dashboard
  - Status update workflow
  - Report generation

### 11.4 Manual Testing Checklist
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Mobile device testing (iOS Safari, Android Chrome)
- Accessibility testing (screen readers, keyboard navigation)
- Performance testing (Lighthouse scores)

---

## 12. MAINTENANCE & SUPPORT PLAN

### 12.1 Regular Maintenance Tasks
- Weekly: Review error logs, check system health
- Monthly: Security updates, dependency updates
- Semester: Full system review, performance audit
- Yearly: Major version updates, infrastructure review

### 12.2 Backup Strategy
- Daily automated database backups
- 30-day backup retention
- Weekly backup verification
- Disaster recovery plan documentation

### 12.3 Monitoring
- Uptime monitoring (UptimeRobot - free)
- Error tracking (Sentry - free tier)
- Performance monitoring (built-in platform tools)
- User analytics (optional: Google Analytics)

### 12.4 Support Channels
- Technical support email
- Documentation/FAQ
- Training materials for committee members
- Issue tracking (GitHub Issues)

---

## 13. COMPLIANCE WITH RESOLUTION NO. 031

### 13.1 Policy Requirements Mapping

| Policy Requirement | System Feature |
|-------------------|----------------|
| Physical suggestion boxes with anonymity | Digital anonymous submission system |
| Optional contact details for follow-up | Non-anonymous submission mode with optional fields |
| Categories: academic, administrative, extracurricular, general | Category selection in submission form |
| Monthly collection by Feedback Committee | Digital submissions available in real-time; monthly reports |
| Forward to appropriate departments | Department forwarding system with tracking |
| Updates to students on suggestion status | Status tracking via tracking code; email notifications |
| Feedback mechanism to rate policy | Policy feedback/rating page |
| Semester-end evaluation | Automated semester evaluation reports |
| Prohibited submissions (offensive, personal attacks) | Content moderation, profanity filter, rejection workflow |
| Sanctions for violations | Violations management system |
| Restriction and reinstatement | Sanctions workflow with semester-based reinstatement |

### 13.2 Stakeholder Access Levels

| Stakeholder | System Role | Access Level |
|-------------|-------------|--------------|
| Campus Director | Super Admin | Full system access |
| Dean of Instruction | Admin | Full management access |
| Dean of Student Affairs | Admin | Full management access |
| SSG Adviser | Admin | Full management access |
| Feedback Committee Chair | Committee Chair | Review, forward, respond |
| Committee Members | Committee Member | Review and categorize |
| Students | Public User | Submit, track, rate |

---

## 14. RISK ASSESSMENT & MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Low user adoption | Medium | High | User-friendly design, awareness campaign, QR codes |
| Spam submissions | Medium | Medium | reCAPTCHA, rate limiting, content filtering |
| System downtime | Low | High | Reliable hosting, monitoring, backup systems |
| Data breach | Low | Critical | Security best practices, encryption, regular audits |
| Scope creep | Medium | Medium | Clear requirements, phased development |
| Technical debt | Medium | Medium | Code reviews, documentation, testing |
| Committee training gaps | Medium | Medium | Comprehensive documentation, training sessions |

---

## 15. SUCCESS METRICS

### 15.1 Key Performance Indicators (KPIs)
- Number of suggestions submitted per month
- Percentage of suggestions resolved
- Average response time
- User satisfaction rating (policy feedback)
- System uptime percentage
- Mobile vs. desktop usage ratio

### 15.2 Goals for First Semester
- 100+ suggestions submitted
- 80% resolution rate
- Average response time < 7 days
- Policy satisfaction rating > 4.0/5.0
- 99.5% system uptime

---

## 16. BUDGET CONSIDERATIONS (Optional Enhancements)

### 16.1 Free Tier Stack (Recommended for Start)
- Frontend hosting: Vercel/Netlify (Free)
- Backend hosting: Render/Railway (Free tier)
- Database: MongoDB Atlas (Free tier - 512MB)
- File storage: Cloudinary (Free tier - 25GB)
- Email: SendGrid (Free - 100/day)
- **Total: $0/month**

### 16.2 Production Scale (If needed)
- Hosting: ~$10-25/month
- Database: ~$10-25/month
- File storage: ~$5-10/month
- Email service: ~$10-20/month
- Domain: ~$10-15/year
- **Total: ~$35-80/month**

---

## 17. NEXT STEPS

1. **Review and approve this project plan**
2. **Set up development environment**
3. **Initialize project repositories**
4. **Begin Phase 1: Foundation**
5. **Establish communication channels for progress updates**

---

*Document prepared for: Supreme Student Government, Cebu Technological University–Daanbantayan Campus*
*Project: Voice It, Shape It - Student Suggestion Box Web Application*
*Tech Stack: React.js, Node.js, Express.js, MongoDB*
