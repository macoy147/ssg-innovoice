import adminService from '../services/adminService.js';
import logger from '../utils/logger.js';

export const verifyAdminPassword = (req, res, next) => {
  const password = req.headers['x-admin-password'];
  
  if (!password) {
    logger.warn('Admin authentication failed: No password provided');
    return res.status(401).json({
      success: false,
      message: 'Admin authentication required'
    });
  }
  
  const adminInfo = adminService.getAdminInfo(password);
  
  if (!adminInfo) {
    logger.warn('Admin authentication failed: Invalid password');
    return res.status(401).json({
      success: false,
      message: 'Invalid admin password'
    });
  }
  
  // Attach admin info to request
  req.adminInfo = adminInfo;
  next();
};

export const requireDeveloperRole = (req, res, next) => {
  if (req.adminInfo.role !== 'developer') {
    logger.warn('Access denied: Developer role required', { 
      adminLabel: req.adminInfo.label,
      adminRole: req.adminInfo.role 
    });
    return res.status(403).json({
      success: false,
      message: 'Only developers can access this resource'
    });
  }
  next();
};
