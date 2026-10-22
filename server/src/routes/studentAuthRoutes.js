import express from 'express';
import StudentUser from '../models/StudentUser.js';
import studentAuthService from '../services/studentAuthService.js';
import adminService from '../services/adminService.js';
import { requireStudentAuth } from '../middleware/studentMiddleware.js';
import logger from '../utils/logger.js';

const router = express.Router();

// POST /api/auth/student/google - Login or Register with Google ID Token
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential token is required'
      });
    }

    const payload = await studentAuthService.verifyGoogleToken(credential);
    const student = await studentAuthService.getOrCreateStudent(payload);

    // Check if this Google user is an authorized admin
    const adminInfo = adminService.getAdminByEmail(student.email);
    const isAdmin = !!adminInfo;

    // Generate persistent 30-day JWT token with admin claim
    const token = studentAuthService.generateStudentToken(student, adminInfo);

    // Store in session as well
    if (req.session) {
      req.session.student = {
        id: student._id.toString(),
        email: student.email,
        name: student.name,
        picture: student.picture
      };

      // Provision admin session if authorized
      if (isAdmin) {
        req.session.admin = {
          role: adminInfo.role,
          label: adminInfo.label,
          color: adminInfo.color,
          email: student.email,
          name: student.name,
          picture: student.picture
        };
        adminService.setAdminOnline(req.session.admin);
      }
    }

    res.json({
      success: true,
      message: 'Signed in successfully with Google',
      token,
      student: {
        id: student._id.toString(),
        email: student.email,
        name: student.name,
        picture: student.picture,
        savedReportsCount: student.savedReports?.length || 0,
        isAdmin,
        adminRole: adminInfo?.role || null,
        adminLabel: adminInfo?.label || null,
        adminColor: adminInfo?.color || null
      }
    });
  } catch (err) {
    logger.error('Error in student Google auth endpoint', { error: err.message });
    res.status(401).json({
      success: false,
      message: err.message || 'Failed to authenticate with Google'
    });
  }
});

// GET /api/auth/student/me - Get current logged-in student
router.get('/me', async (req, res) => {
  try {
    let studentId = null;

    // 1. Check Bearer token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = studentAuthService.verifyStudentToken(token);
      if (decoded?.id) {
        studentId = decoded.id;
      }
    }

    // 2. Fallback to session
    if (!studentId && req.session?.student?.id) {
      studentId = req.session.student.id;
    }

    if (!studentId) {
      return res.json({ success: true, student: null });
    }

    const student = await StudentUser.findById(studentId);

    if (!student) {
      return res.json({ success: true, student: null });
    }

    // Check if this student is an authorized admin
    const adminInfo = adminService.getAdminByEmail(student.email);
    const isAdmin = !!adminInfo;

    // Refresh admin session if active
    if (isAdmin && req.session) {
      req.session.admin = {
        role: adminInfo.role,
        label: adminInfo.label,
        color: adminInfo.color,
        email: student.email,
        name: student.name,
        picture: student.picture
      };
      adminService.setAdminOnline(req.session.admin);
    }

    res.json({
      success: true,
      student: {
        id: student._id.toString(),
        email: student.email,
        name: student.name,
        picture: student.picture,
        savedReportsCount: student.savedReports?.length || 0,
        isAdmin,
        adminRole: adminInfo?.role || null,
        adminLabel: adminInfo?.label || null,
        adminColor: adminInfo?.color || null
      }
    });
  } catch (err) {
    logger.error('Error in student me endpoint', { error: err.message });
    res.json({ success: true, student: null });
  }
});

// POST /api/auth/student/logout - Logout student
router.post('/logout', (req, res) => {
  try {
    if (req.session?.student) {
      delete req.session.student;
    }
    if (req.session?.admin) {
      delete req.session.admin;
    }
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (err) {
    logger.error('Error in student logout endpoint', { error: err.message });
    res.status(500).json({
      success: false,
      message: 'Failed to logout'
    });
  }
});

// GET /api/student/my-reports (or /reports) - Get saved reports for student
router.get(['/reports', '/my-reports'], requireStudentAuth, async (req, res) => {
  try {
    const studentId = req.studentId || req.studentUser?._id;
    const reports = await studentAuthService.getSavedReports(studentId);

    res.json({
      success: true,
      data: reports
    });
  } catch (err) {
    logger.error('Error fetching student saved reports', { error: err.message, studentId: req.studentId });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch saved reports'
    });
  }
});

// POST /api/student/save-code (or /reports/bookmark) - Bookmark a tracking code
router.post(['/reports/bookmark', '/save-code'], requireStudentAuth, async (req, res) => {
  try {
    const studentId = req.studentId || req.studentUser?._id;
    const { trackingCode, note } = req.body;
    if (!trackingCode) {
      return res.status(400).json({
        success: false,
        message: 'Tracking code is required'
      });
    }

    const result = await studentAuthService.saveReportCode(studentId, trackingCode, note);

    res.json(result);
  } catch (err) {
    logger.error('Error bookmarking tracking code', { error: err.message, studentId: req.studentId });
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to save report'
    });
  }
});

// DELETE /api/student/save-code/:trackingCode (or /reports/:trackingCode) - Remove a saved tracking code
router.delete(['/reports/:trackingCode', '/save-code/:trackingCode'], requireStudentAuth, async (req, res) => {
  try {
    const studentId = req.studentId || req.studentUser?._id;
    const { trackingCode } = req.params;
    const result = await studentAuthService.removeReportCode(studentId, trackingCode);

    res.json(result);
  } catch (err) {
    logger.error('Error unbookmarking report', { error: err.message, studentId: req.studentId });
    res.status(500).json({
      success: false,
      message: 'Failed to remove saved report'
    });
  }
});

export default router;
