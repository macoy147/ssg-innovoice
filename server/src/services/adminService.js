import ActivityLog from '../models/ActivityLog.js';
import logger from '../utils/logger.js';

// Admin accounts configuration
const ADMIN_ACCOUNTS = {
  'ssg2526pres': {
    role: 'executive',
    label: 'President',
    color: '#8b5cf6'
  },
  'ssg2526vp': {
    role: 'executive',
    label: 'Vice President',
    color: '#ec4899'
  },
  'ssg2526cote': {
    role: 'executive',
    label: 'CoTE Governor',
    color: '#3b82f6'
  },
  'ssg2526coed': {
    role: 'executive',
    label: 'CoEd Governor',
    color: '#14b8a6'
  },
  'ssg2526presssec': {
    role: 'press_secretary',
    label: 'Press Secretary',
    color: '#f59e0b'
  },
  'ssg2526netsec': {
    role: 'network_secretary',
    label: 'Secretary on Networks',
    color: '#10b981'
  },
  'ssg2526dev': {
    role: 'developer',
    label: 'Developer',
    color: '#6366f1'
  },
  'ssg2526mathrep': {
    role: 'executive',
    label: 'BSED-Math Representative',
    color: '#f472b6'
  },
  'ssg2526smm': {
    role: 'press_secretary',
    label: 'Social Media Manager',
    color: '#06b6d4'
  }
};

// Track online admins (in-memory store)
const onlineAdmins = new Map();

class AdminService {
  getAdminInfo(password) {
    return ADMIN_ACCOUNTS[password] || null;
  }

  verifyPassword(password) {
    const adminInfo = this.getAdminInfo(password);
    if (adminInfo) {
      logger.info('Admin login successful', { label: adminInfo.label, role: adminInfo.role });
      return adminInfo;
    }
    logger.warn('Failed admin login attempt');
    return null;
  }

  setAdminOnline(adminInfo) {
    onlineAdmins.set(adminInfo.label, {
      ...adminInfo,
      lastSeen: new Date(),
      loginTime: new Date()
    });
  }

  setAdminOffline(label) {
    onlineAdmins.delete(label);
  }

  updateHeartbeat(label, adminInfo) {
    if (onlineAdmins.has(label)) {
      const existing = onlineAdmins.get(label);
      onlineAdmins.set(label, {
        ...existing,
        lastSeen: new Date()
      });
    } else {
      onlineAdmins.set(label, {
        ...adminInfo,
        lastSeen: new Date(),
        loginTime: new Date()
      });
    }
  }

  getOnlineAdmins() {
    const now = new Date();
    const onlineTimeout = 35 * 1000; // 35 seconds
    
    const onlineList = [];
    
    onlineAdmins.forEach((admin, label) => {
      const timeSinceLastSeen = now - new Date(admin.lastSeen);
      if (timeSinceLastSeen < onlineTimeout) {
        onlineList.push(admin);
      } else {
        // Remove stale entries
        onlineAdmins.delete(label);
      }
    });
    
    return onlineList;
  }

  async logActivity(req, action, details = {}) {
    try {
      const password = req.headers['x-admin-password'];
      const adminInfo = this.getAdminInfo(password);
      
      if (!adminInfo) return;
      
      const log = new ActivityLog({
        adminRole: adminInfo.role,
        adminLabel: adminInfo.label,
        action,
        suggestionId: details.suggestionId || null,
        suggestionTitle: details.suggestionTitle || null,
        suggestionTrackingCode: details.suggestionTrackingCode || null,
        details: details.extra || {},
        ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      
      await log.save();
      logger.debug('Activity logged', { action, adminLabel: adminInfo.label });
    } catch (error) {
      logger.error('Error logging activity', { error: error.message });
    }
  }

  async getActivityLogs(filters, pagination) {
    try {
      const query = {};
      
      if (filters.adminRole && filters.adminRole !== 'all') {
        query.adminRole = filters.adminRole;
      }
      
      if (filters.action && filters.action !== 'all') {
        query.action = filters.action;
      }
      
      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
        if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
      }
      
      if (filters.search) {
        query.$or = [
          { suggestionTrackingCode: { $regex: filters.search, $options: 'i' } },
          { suggestionTitle: { $regex: filters.search, $options: 'i' } },
          { adminLabel: { $regex: filters.search, $options: 'i' } }
        ];
      }
      
      const count = await ActivityLog.countDocuments(query);
      
      const logs = await ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .limit(pagination.limit)
        .skip((pagination.page - 1) * pagination.limit);
      
      return {
        logs,
        pagination: {
          total: count,
          page: pagination.page,
          pages: Math.ceil(count / pagination.limit),
          limit: pagination.limit
        }
      };
    } catch (error) {
      logger.error('Error fetching activity logs', { error: error.message });
      throw error;
    }
  }

  async getActivityLogStats() {
    try {
      const totalLogs = await ActivityLog.countDocuments();
      
      const byAdmin = await ActivityLog.aggregate([
        { $group: { _id: '$adminRole', count: { $sum: 1 }, label: { $first: '$adminLabel' } } },
        { $sort: { count: -1 } }
      ]);
      
      const byAction = await ActivityLog.aggregate([
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayCount = await ActivityLog.countDocuments({ createdAt: { $gte: today } });
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekCount = await ActivityLog.countDocuments({ createdAt: { $gte: weekAgo } });
      
      return {
        totalLogs,
        byAdmin,
        byAction,
        todayCount,
        weekCount
      };
    } catch (error) {
      logger.error('Error fetching activity log stats', { error: error.message });
      throw error;
    }
  }

  async getDeprecatedLogsCount() {
    try {
      const deprecatedRoles = ['president', 'vice_president', 'cote_governor', 'coed_governor', 'admin', 'executive_admin'];
      
      const count = await ActivityLog.countDocuments({
        adminRole: { $in: deprecatedRoles }
      });
      
      return { count, deprecatedRoles };
    } catch (error) {
      logger.error('Error counting deprecated logs', { error: error.message });
      throw error;
    }
  }

  async cleanupDeprecatedLogs() {
    try {
      const deprecatedRoles = ['president', 'vice_president', 'cote_governor', 'coed_governor', 'admin', 'executive_admin'];
      
      const result = await ActivityLog.deleteMany({
        adminRole: { $in: deprecatedRoles }
      });
      
      logger.info('Deprecated logs cleaned up', { deletedCount: result.deletedCount });
      
      return result.deletedCount;
    } catch (error) {
      logger.error('Error cleaning up deprecated logs', { error: error.message });
      throw error;
    }
  }
}

export default new AdminService();
