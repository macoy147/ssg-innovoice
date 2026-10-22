import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import connectDB from './config/database.js';
import suggestionRoutes from './routes/suggestionRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import studentAuthRoutes from './routes/studentAuthRoutes.js';
import crypto from 'crypto';
import logger from './utils/logger.js';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
const IS_PROD = process.env.NODE_ENV === 'production';
const SESSION_NAME = process.env.SESSION_NAME || 'innovoice.sid';

// Trust proxy - required for Render/Heroku/etc behind reverse proxy
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// CORS configuration - mounted first before all other middleware
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'https://ssginnovoice.cebutech.digital',
  'http://ssginnovoice.cebutech.digital',
  'https://www.ssginnovoice.cebutech.digital'
];

const envOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim().replace(/\/$/, '')).filter(Boolean)
  : [];

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

const isOriginAllowed = (origin) => {
  if (!origin) return true; // Server-to-server or tools with no origin
  const normalized = origin.replace(/\/$/, '');

  if (allowedOrigins.includes(normalized)) {
    return true;
  }

  try {
    const parsed = new URL(normalized);
    const hostname = parsed.hostname;
    if (
      hostname === 'cebutech.digital' ||
      hostname.endsWith('.cebutech.digital') ||
      hostname.endsWith('.vercel.app') ||
      hostname.endsWith('.onrender.com')
    ) {
      return true;
    }
  } catch {
    // Malformed URL, reject
  }

  return false;
};

const corsOptions = {
  origin: function (origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      logger.warn(`Blocked by CORS: origin ${origin} is not in allowed origins`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "https://accounts.google.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));

// Rate limiting - prevent brute force attacks (skip OPTIONS and allow high headroom in dev/polling)
const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 5000 : 1000, // generous limit for live polling (heartbeat, stats, logs)
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 100 : 15,
  message: { success: false, message: 'Too many login attempts, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS'
});

const submissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDev ? 200 : 30,
  message: { success: false, message: 'Too many submissions, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  // Only apply to POST requests and skip OPTIONS
  skip: (req) => req.method !== 'POST' || req.method === 'OPTIONS'
});

// Apply general rate limiting to all requests
app.use(generalLimiter);

// Logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Sessions (cookie-based admin auth)
const DEFAULT_SESSION_SECRET = crypto.randomBytes(32).toString('hex');
const SESSION_SECRET = process.env.SESSION_SECRET || (
  IS_PROD 
    ? (() => { throw new Error('FATAL SECURITY ERROR: SESSION_SECRET must be configured in production environment.'); })()
    : DEFAULT_SESSION_SECRET
);

app.use(session({
  name: SESSION_NAME,
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: 60 * 60 * 8 // 8 hours
  }),
  cookie: {
    httpOnly: true,
    secure: IS_PROD,                 // required for SameSite=None in production
    sameSite: IS_PROD ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 8       // 8 hours
  }
}));

// Body parsing with size limits (increased for base64 image uploads)
app.use(express.json({ limit: '5mb' })); // Increased for image uploads
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Sanitize data - prevent NoSQL injection
app.use(mongoSanitize());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'SSG InnoVoice API',
    version: '1.0.0',
    status: 'running'
  });
});

// Apply specific rate limiters to routes
app.use('/api/admin/verify', authLimiter);
app.use('/api/auth/student/google', authLimiter);
app.use('/api/suggestions', submissionLimiter);

app.use('/api/auth/student', studentAuthRoutes);
app.use('/api/student', studentAuthRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  // Log error with full details
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  // Don't leak error details in production
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong. Please try again later.' 
      : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
