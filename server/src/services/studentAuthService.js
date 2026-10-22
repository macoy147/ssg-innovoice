import 'dotenv/config';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import StudentUser from '../models/StudentUser.js';
import Suggestion from '../models/Suggestion.js';
import logger from '../utils/logger.js';

// Enforce strong JWT Secret - auto-generate ephemeral cryptographically random key if unconfigured in dev
const DEFAULT_EPHEMERAL_SECRET = crypto.randomBytes(32).toString('hex');
function getJwtSecret() {
  return process.env.JWT_SECRET || process.env.SESSION_SECRET || (
    process.env.NODE_ENV === 'production'
      ? (() => { throw new Error('FATAL SECURITY ERROR: JWT_SECRET or SESSION_SECRET must be configured in production environment.'); })()
      : DEFAULT_EPHEMERAL_SECRET
  );
}
const JWT_EXPIRES_IN = '30d';

let googleClient = null;

function getGoogleClient() {
  if (!googleClient && process.env.GOOGLE_CLIENT_ID) {
    googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }
  return googleClient;
}

class StudentAuthService {
  /**
   * Generate persistent JWT token for student
   */
  generateStudentToken(student, adminInfo = null) {
    return jwt.sign(
      {
        id: student._id ? student._id.toString() : student.id,
        email: student.email,
        name: student.name,
        picture: student.picture,
        isAdmin: !!adminInfo,
        adminRole: adminInfo?.role || null,
        adminLabel: adminInfo?.label || null,
        adminColor: adminInfo?.color || null
      },
      getJwtSecret(),
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  /**
   * Verify student JWT token
   */
  verifyStudentToken(token) {
    try {
      return jwt.verify(token, getJwtSecret());
    } catch (err) {
      return null;
    }
  }

  /**
   * Verify Google ID token from frontend with cryptographic signature check
   * @param {string} idToken 
   * @returns {Promise<{googleId: string, email: string, name: string, picture: string}>}
   */
  async verifyGoogleToken(idToken) {
    if (!idToken) {
      throw new Error('ID Token is required');
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const client = getGoogleClient();

    if (!clientId || !client) {
      logger.error('Google OAuth is not configured on server (GOOGLE_CLIENT_ID is missing in .env)');
      throw new Error('Google OAuth is not configured on server');
    }

    try {
      // Cryptographically verify token signature with Google's public keys
      const ticket = await client.verifyIdToken({
        idToken,
        audience: clientId,
      });
      const payload = ticket.getPayload();

      if (!payload?.sub || !payload?.email) {
        throw new Error('Invalid token claims received from Google');
      }

      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        picture: payload.picture || '',
      };
    } catch (err) {
      logger.error('Cryptographic Google token verification failed', { error: err.message });
      throw new Error('Invalid or expired Google credential');
    }
  }

  /**
   * Find or register student user
   */
  async getOrCreateStudent(profile) {
    try {
      let student = await StudentUser.findOne({ googleId: profile.googleId });

      if (!student) {
        // Also check by email to link existing records if any
        student = await StudentUser.findOne({ email: profile.email.toLowerCase() });
        if (student) {
          student.googleId = profile.googleId;
          student.name = profile.name;
          student.picture = profile.picture;
          student.lastLogin = new Date();
          await student.save();
          return student;
        }

        student = await StudentUser.create({
          googleId: profile.googleId,
          email: profile.email.toLowerCase(),
          name: profile.name,
          picture: profile.picture,
          lastLogin: new Date(),
          savedReports: []
        });

        logger.info(`New student registered via Google: ${student.email}`);
      } else {
        // Update metadata
        student.name = profile.name;
        student.picture = profile.picture;
        student.lastLogin = new Date();
        await student.save();
      }

      return student;
    } catch (err) {
      logger.error('Error in getOrCreateStudent', { error: err.message });
      throw err;
    }
  }

  /**
   * Get all saved reports for a student with live status updates
   */
  async getSavedReports(studentId) {
    try {
      if (!studentId) return [];

      const student = await StudentUser.findById(studentId);
      if (!student) return [];

      const bookmarkedCodes = (student.savedReports || [])
        .map(r => r.trackingCode)
        .filter(Boolean);

      // Query reports where user is the author OR report tracking code is bookmarked
      const query = {
        $or: [
          { userId: student._id },
          ...(bookmarkedCodes.length > 0 ? [{ trackingCode: { $in: bookmarkedCodes } }] : [])
        ]
      };

      const suggestions = await Suggestion.find(query)
        .select('_id trackingCode title category status priority createdAt updatedAt statusHistory userId isAnonymous imageUrl isDeleted deletedAt deletedReason')
        .sort({ createdAt: -1 })
        .lean();

      const bookmarkMap = new Map((student.savedReports || []).map(r => [r.trackingCode, r]));

      return suggestions.map(s => {
        const bookmark = bookmarkMap.get(s.trackingCode);
        const isDismissed = Boolean(s.isDeleted);
        const displayStatus = isDismissed ? 'dismissed' : (s.status || 'submitted');

        // Extract latest rejection note if rejected
        const lastRejectionNote = s.status === 'rejected'
          ? s.statusHistory?.slice().reverse().find(h => h.status === 'rejected')?.notes
          : null;

        return {
          _id: s._id,
          id: s._id,
          trackingCode: s.trackingCode,
          title: s.title || 'Untitled Suggestion',
          category: s.category || 'general',
          status: displayStatus,
          isDismissed,
          dismissedAt: s.deletedAt || null,
          dismissalReason: s.deletedReason || (isDismissed ? 'Closed during administrative triage.' : null),
          rejectionReason: lastRejectionNote || null,
          priority: s.priority || 'medium',
          isAnonymous: s.isAnonymous,
          imageUrl: s.imageUrl,
          userId: s.userId,
          savedAt: bookmark?.savedAt || s.createdAt,
          note: bookmark?.note || (String(s.userId) === String(student._id) ? 'Submitted by me' : ''),
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
          statusHistory: s.statusHistory || []
        };
      });
    } catch (err) {
      logger.error('Error fetching saved reports', { error: err.message, studentId });
      throw err;
    }
  }

  /**
   * Alias for getSavedReports
   */
  async getMyReports(studentId) {
    return this.getSavedReports(studentId);
  }

  /**
   * Save / bookmark a suggestion tracking code
   */
  async saveReportCode(studentId, trackingCode, note = '') {
    try {
      const cleanCode = trackingCode.trim().toUpperCase();
      const student = await StudentUser.findById(studentId);
      if (!student) throw new Error('Student user not found');

      // Check if code already saved
      const existing = student.savedReports.find(r => r.trackingCode === cleanCode);
      if (existing) {
        return { success: true, message: 'Report is already in your saved list', student };
      }

      // Verify that the tracking code exists in database
      const suggestion = await Suggestion.findOne({ trackingCode: cleanCode }).select('title category').lean();
      if (!suggestion) {
        return { success: false, message: 'No suggestion found with that tracking code' };
      }

      student.savedReports.push({
        trackingCode: cleanCode,
        title: suggestion.title,
        category: suggestion.category,
        savedAt: new Date(),
        note: note.trim()
      });

      await student.save();
      logger.info(`Student ${student.email} bookmarked report ${cleanCode}`);

      return {
        success: true,
        message: 'Report saved to your dashboard',
        savedReportsCount: student.savedReports.length
      };
    } catch (err) {
      logger.error('Error saving report code', { error: err.message, studentId });
      throw err;
    }
  }

  /**
   * Remove a saved tracking code from student list
   */
  async removeReportCode(studentId, trackingCode) {
    try {
      const cleanCode = trackingCode.trim().toUpperCase();
      const student = await StudentUser.findById(studentId);
      if (!student) throw new Error('Student user not found');

      student.savedReports = student.savedReports.filter(r => r.trackingCode !== cleanCode);
      await student.save();

      return {
        success: true,
        message: 'Report removed from your saved list',
        savedReportsCount: student.savedReports.length
      };
    } catch (err) {
      logger.error('Error removing report code', { error: err.message, studentId });
      throw err;
    }
  }

  /**
   * Automatically attach a submitted report code to the student author's dashboard
   */
  async attachTrackingCodeToStudent(studentId, trackingCode, title = '', isAuthor = true) {
    try {
      if (!studentId || !trackingCode) return false;
      const cleanCode = trackingCode.trim().toUpperCase();
      const student = await StudentUser.findById(studentId);
      if (!student) return false;

      if (!student.savedReports) student.savedReports = [];
      const existing = student.savedReports.find(r => r.trackingCode === cleanCode);
      if (!existing) {
        student.savedReports.push({
          trackingCode: cleanCode,
          title: title || 'My Submitted Suggestion',
          savedAt: new Date(),
          isOwner: isAuthor,
          note: isAuthor ? 'Submitted by me' : ''
        });
        await student.save();
        logger.info(`Attached submitted report ${cleanCode} to student ${student.email}`);
      }
      return true;
    } catch (err) {
      logger.warn('Failed to auto-attach tracking code to student', { error: err.message });
      return false;
    }
  }
}

export default new StudentAuthService();
