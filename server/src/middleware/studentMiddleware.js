import StudentUser from '../models/StudentUser.js';
import studentAuthService from '../services/studentAuthService.js';
import logger from '../utils/logger.js';

// Helper to extract student ID from either Bearer token or session
async function resolveStudent(req) {
  // 1. Check Authorization Bearer header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = studentAuthService.verifyStudentToken(token);
    if (decoded?.id) {
      const student = await StudentUser.findById(decoded.id);
      if (student) return student;
    }
  }

  // 2. Fallback to session
  if (req.session?.student?.id) {
    const student = await StudentUser.findById(req.session.student.id);
    if (student) return student;
  }

  return null;
}

export const requireStudentAuth = async (req, res, next) => {
  try {
    const student = await resolveStudent(req);
    if (student) {
      req.studentUser = student;
      req.studentId = student._id;
      return next();
    }

    return res.status(401).json({
      success: false,
      message: 'Student authentication required. Please sign in with Google.'
    });
  } catch (err) {
    logger.error('Error in requireStudentAuth middleware', { error: err.message });
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

/**
 * Optional student auth: If student is logged in, attach to req.studentUser, otherwise proceed as guest
 */
export const optionalStudentAuth = async (req, res, next) => {
  try {
    const student = await resolveStudent(req);
    if (student) {
      req.studentUser = student;
      req.studentId = student._id;
    }
    next();
  } catch (err) {
    // On error, just continue as guest
    next();
  }
};
