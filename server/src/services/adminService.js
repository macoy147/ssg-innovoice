import ActivityLog from '../models/ActivityLog.js';
import StudentUser from '../models/StudentUser.js';
import logger from '../utils/logger.js';

// Default Whitelisted Google Admin Accounts (RBAC)
// Recommended: override via ADMIN_EMAILS in server/.env
const DEFAULT_GOOGLE_ADMIN_EMAILS = {
  'montellano.marco.c@gmail.com': {
    role: 'developer',
    label: 'Developer',
    color: '#6366f1'
  },
  'montellanomarco.it@gmail.com': {
    role: 'executive',
    label: 'SSG President',
    color: '#8b5cf6'
  },
  'ctu.montellano.marco@gmail.com': {
    role: 'executive',
    label: 'Vice President',
    color: '#ec4899'
  }
};

// Track online admins (in-memory store)
const onlineAdmins = new Map();

class AdminService {
  /**
   * Check if a Google email address is an authorized admin
   * Evaluates environment variable ADMIN_EMAILS / ADMIN_WHITELIST first
   * @param {string} email 
   * @returns {{ role: string, label: string, color: string } | null}
   */
  getAdminByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.toLowerCase().trim();

    // 1. Check environment variable whitelist (format: email:role:label:color,email2:role:label:color)
    const envWhitelist = process.env.ADMIN_WHITELIST || process.env.ADMIN_EMAILS;
    if (envWhitelist) {
      const entries = envWhitelist.split(',');
      for (const entry of entries) {
        const parts = entry.split(':');
        const e = parts[0]?.trim().toLowerCase();
        if (e && e === cleanEmail) {
          return {
            role: parts[1]?.trim() || 'executive',
            label: parts[2]?.trim() || 'SSG Officer',
            color: parts[3]?.trim() || '#8b5cf6'
          };
        }
      }
    }

    // 2. Fallback to default institutional administration accounts
    if (DEFAULT_GOOGLE_ADMIN_EMAILS[cleanEmail]) {
      return DEFAULT_GOOGLE_ADMIN_EMAILS[cleanEmail];
    }

    return null;
  }

  /**
   * Return a dictionary of all recognized admin accounts combining env and defaults
   * @returns {Object.<string, { role: string, label: string, color: string }>}
   */
  getAllAdminDirectory() {
    const directory = { ...DEFAULT_GOOGLE_ADMIN_EMAILS };
    const envWhitelist = process.env.ADMIN_WHITELIST || process.env.ADMIN_EMAILS;
    if (envWhitelist) {
      const entries = envWhitelist.split(',');
      for (const entry of entries) {
        const parts = entry.split(':');
        const e = parts[0]?.trim().toLowerCase();
        if (e) {
          directory[e] = {
            role: parts[1]?.trim() || 'executive',
            label: parts[2]?.trim() || 'SSG Officer',
            color: parts[3]?.trim() || '#8b5cf6'
          };
        }
      }
    }
    return directory;
  }

  setAdminOnline(adminInfo) {
    if (!adminInfo?.label) return;
    onlineAdmins.set(adminInfo.label, {
      ...adminInfo,
      lastSeen: new Date(),
      loginTime: new Date()
    });
    logger.info(`Admin set online: ${adminInfo.label}`);
  }

  setAdminOffline(adminLabel) {
    if (!adminLabel) return;
    onlineAdmins.delete(adminLabel);
    logger.info(`Admin set offline: ${adminLabel}`);
  }

  updateHeartbeat(adminLabel, adminInfo) {
    if (!adminLabel) return;
    const existing = onlineAdmins.get(adminLabel);
    onlineAdmins.set(adminLabel, {
      ...(existing || adminInfo),
      lastSeen: new Date()
    });
  }

  getOnlineAdmins() {
    this.cleanupOfflineAdmins();
    return Array.from(onlineAdmins.values());
  }

  cleanupOfflineAdmins() {
    const TIMEOUT_MS = 60000; // 1 minute inactivity timeout
    const now = Date.now();
    for (const [label, admin] of onlineAdmins.entries()) {
      if (now - new Date(admin.lastSeen).getTime() > TIMEOUT_MS) {
        onlineAdmins.delete(label);
        logger.info(`Cleaned up inactive admin: ${label}`);
      }
    }
  }

  /**
   * Log an administrative activity
   */
  async logActivity(req, action, { suggestionId = null, suggestionTitle = null, suggestionTrackingCode = null, details = {}, extra = null } = {}) {
    try {
      const mergedDetails = { ...(details || {}), ...(extra || {}) };
      const adminRole = req.adminInfo?.role || 'executive';
      const adminLabel = req.adminInfo?.label || 'SSG Officer';
      let adminName = req.adminInfo?.name || req.studentUser?.name || null;
      let adminEmail = req.adminInfo?.email || req.studentUser?.email || null;
      let adminPicture = req.adminInfo?.picture || req.studentUser?.picture || null;

      // Auto-resolve Gmail profile from StudentUser or whitelist if missing
      if (!adminPicture && adminEmail) {
        const student = await StudentUser.findOne({ email: adminEmail.toLowerCase().trim() }).lean();
        if (student?.picture) {
          adminPicture = student.picture;
          if (!adminName) adminName = student.name;
        }
      }
      if (!adminPicture) {
        const adminDirectory = this.getAllAdminDirectory();
        for (const [gEmail, gInfo] of Object.entries(adminDirectory)) {
          if (gInfo.role === adminRole || gInfo.label === adminLabel) {
            const student = await StudentUser.findOne({ email: gEmail }).lean();
            if (student?.picture) {
              adminPicture = student.picture;
              if (!adminName) adminName = student.name;
              if (!adminEmail) adminEmail = gEmail;
              break;
            }
          }
        }
      }

      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
      const userAgent = req.headers['user-agent'];

      await ActivityLog.create({
        adminRole,
        adminLabel,
        adminName,
        adminEmail,
        adminPicture,
        action,
        suggestionId,
        suggestionTitle,
        suggestionTrackingCode,
        details: mergedDetails,
        ipAddress,
        userAgent
      });
    } catch (err) {
      logger.error('Failed to log admin activity', { error: err.message, action });
    }
  }

  /**
   * Retrieve activity logs with filters and pagination
   */
  async getActivityLogs(filters = {}, pagination = { page: 1, limit: 50 }) {
    try {
      const query = {};

      if (filters.adminRole && filters.adminRole !== 'all') {
        query.adminRole = filters.adminRole;
      }

      if (filters.action && filters.action !== 'all') {
        query.action = filters.action;
      }

      if (filters.search) {
        const cleanSearch = filters.search.trim().replace(/^#/, '');
        if (cleanSearch) {
          const escaped = cleanSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const searchRegex = new RegExp(escaped, 'i');
          query.$or = [
            { adminLabel: searchRegex },
            { adminName: searchRegex },
            { adminEmail: searchRegex },
            { suggestionTitle: searchRegex },
            { suggestionTrackingCode: searchRegex }
          ];
        }
      }

      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
        if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
      }

      const page = Math.max(1, parseInt(pagination.page) || 1);
      const limit = Math.max(1, Math.min(100, parseInt(pagination.limit) || 50));
      const skip = (page - 1) * limit;

      const [rawLogs, total] = await Promise.all([
        ActivityLog.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        ActivityLog.countDocuments(query)
      ]);

      // Enrich logs with Gmail profile picture - only query relevant admin candidate emails (efficient)
      const adminDirectory = this.getAllAdminDirectory();
      const candidateEmails = new Set(Object.keys(adminDirectory));
      rawLogs.forEach(l => {
        if (l.adminEmail) candidateEmails.add(l.adminEmail.toLowerCase().trim());
      });

      const registeredUsers = await StudentUser.find({
        email: { $in: Array.from(candidateEmails) },
        picture: { $exists: true, $ne: null }
      })
        .select('email name picture')
        .lean();

      const userMap = new Map();
      registeredUsers.forEach(u => {
        if (u.email) userMap.set(u.email.toLowerCase().trim(), u);
      });

      const logs = rawLogs.map(log => {
        let pic = log.adminPicture;
        let name = log.adminName;
        const email = (log.adminEmail || '').toLowerCase().trim();

        if (!pic && email && userMap.has(email)) {
          pic = userMap.get(email).picture;
          if (!name) name = userMap.get(email).name;
        }

        if (!pic) {
          for (const [gEmail, gInfo] of Object.entries(adminDirectory)) {
            if (email === gEmail || gInfo.role === log.adminRole || gInfo.label === log.adminLabel) {
              if (userMap.has(gEmail)) {
                pic = userMap.get(gEmail).picture;
                if (!name) name = userMap.get(gEmail).name;
                break;
              }
            }
          }
        }

        return {
          ...log,
          adminPicture: pic || log.adminPicture,
          adminName: name || log.adminName
        };
      });

      return {
        logs,
        data: logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (err) {
      logger.error('Error fetching activity logs', { error: err.message });
      throw err;
    }
  }

  /**
   * Get activity log statistics
   */
  async getActivityLogStats() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);

      const [totalLogs, todayCount, weekCount, roleStats, actionStats] = await Promise.all([
        ActivityLog.countDocuments(),
        ActivityLog.countDocuments({ createdAt: { $gte: today } }),
        ActivityLog.countDocuments({ createdAt: { $gte: weekAgo } }),
        ActivityLog.aggregate([
          { $group: { _id: '$adminRole', count: { $sum: 1 }, label: { $first: '$adminLabel' } } }
        ]),
        ActivityLog.aggregate([
          { $group: { _id: '$action', count: { $sum: 1 } } }
        ])
      ]);

      const byAdmin = roleStats.map(r => ({
        _id: r._id,
        label: r.label || r._id,
        count: r.count
      }));

      return {
        total: totalLogs,
        totalLogs,
        todayCount,
        weekCount,
        byAdmin,
        byRole: roleStats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
        byAction: actionStats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {})
      };
    } catch (err) {
      logger.error('Error fetching activity stats', { error: err.message });
      throw err;
    }
  }

  /**
   * Count deprecated logs for cleanup
   */
  async getDeprecatedLogsCount() {
    try {
      const validRoles = ['executive', 'press_secretary', 'network_secretary', 'developer'];
      const [count, deprecatedRoles] = await Promise.all([
        ActivityLog.countDocuments({
          adminRole: { $nin: validRoles }
        }),
        ActivityLog.distinct('adminRole', {
          adminRole: { $nin: validRoles }
        })
      ]);
      return { count, deprecatedRoles };
    } catch (err) {
      logger.error('Error checking deprecated logs count', { error: err.message });
      return { count: 0, deprecatedRoles: [] };
    }
  }

  /**
   * Cleanup deprecated role logs
   */
  async cleanupDeprecatedLogs() {
    try {
      const validRoles = ['executive', 'press_secretary', 'network_secretary', 'developer'];
      const result = await ActivityLog.deleteMany({
        adminRole: { $nin: validRoles }
      });
      return result.deletedCount;
    } catch (err) {
      logger.error('Error cleaning up deprecated logs', { error: err.message });
      throw err;
    }
  }
}

export default new AdminService();