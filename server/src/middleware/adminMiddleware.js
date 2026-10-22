import adminService from '../services/adminService.js';
import studentAuthService from '../services/studentAuthService.js';
import logger from '../utils/logger.js';

export const verifyAdminPassword = (req, res, next) => {
  // 1. Prefer session-based auth
  if (req.session?.admin) {
    req.adminInfo = req.session.admin;
    return next();
  }

  // 2. Check student Bearer token with admin role
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = studentAuthService.verifyStudentToken(token);
    if (decoded?.email) {
      const adminInfo = adminService.getAdminByEmail(decoded.email);
      if (adminInfo) {
        req.adminInfo = {
          ...adminInfo,
          email: decoded.email,
          name: decoded.name || adminInfo.label,
          picture: decoded.picture || null
        };
        if (req.session) {
          req.session.admin = req.adminInfo;
        }
        return next();
      }
    }
  }

  // No valid session or token provided
  logger.warn('Admin access denied: Valid Google Admin session or Bearer token required', {
    ip: req.ip,
    path: req.originalUrl || req.path
  });
  return res.status(401).json({
    success: false,
    message: 'Authorized Google Officer authentication required'
  });
};

export const requireDeveloperRole = (req, res, next) => {
  if (req.adminInfo?.role !== 'developer') {
    logger.warn('Access denied: Developer role required', { 
      adminLabel: req.adminInfo?.label,
      adminRole: req.adminInfo?.role 
    });
    return res.status(403).json({
      success: false,
      message: 'Only developers can access this resource'
    });
  }
  next();
};
