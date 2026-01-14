import express from 'express';
import Suggestion from '../models/Suggestion.js';
import ActivityLog from '../models/ActivityLog.js';

const router = express.Router();

// Admin accounts configuration
// Note: President, VP, CoTE Gov, CoEd Gov all log as "executive" role for activity tracking
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
  'ssg2526press': {
    role: 'press_secretary',
    label: 'Press Secretary',
    color: '#f59e0b'
  },
  'ssg2526net': {
    role: 'network_secretary',
    label: 'Secretary on Networks',
    color: '#10b981'
  },
  'ssg2526dev': {
    role: 'developer',
    label: 'Developer',
    color: '#6366f1'
  },
  'ssg2526juls': {
    role: 'executive',
    label: 'Julianna',
    color: '#f472b6'
  }
};

// Track online admins (in-memory store) - keyed by label for uniqueness
const onlineAdmins = new Map();

// Helper to get admin info from password
const getAdminInfo = (password) => {
  return ADMIN_ACCOUNTS[password] || null;
};

// Helper to log activity
const logActivity = async (req, action, details = {}) => {
  try {
    const password = req.headers['x-admin-password'];
    const adminInfo = getAdminInfo(password);
    
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
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// Password verification middleware with multi-admin support
const verifyAdminPassword = (req, res, next) => {
  const password = req.headers['x-admin-password'];
  
  if (!password || !ADMIN_ACCOUNTS[password]) {
    return res.status(401).json({
      success: false,
      message: 'Invalid admin password'
    });
  }
  
  // Attach admin info to request
  req.adminInfo = ADMIN_ACCOUNTS[password];
  next();
};

// POST /api/admin/verify - Verify admin password and return role info
router.post('/verify', async (req, res) => {
  const { password } = req.body;
  const adminInfo = getAdminInfo(password);
  
  if (adminInfo) {
    // Track online admin by label (unique per person)
    onlineAdmins.set(adminInfo.label, {
      ...adminInfo,
      lastSeen: new Date(),
      loginTime: new Date()
    });
    
    // Log login activity
    await logActivity(
      { headers: { 'x-admin-password': password }, ip: req.ip, connection: req.connection },
      'login',
      {}
    );
    
    res.json({ 
      success: true, 
      message: 'Password verified',
      admin: {
        role: adminInfo.role,
        label: adminInfo.label,
        color: adminInfo.color
      }
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

// POST /api/admin/logout - Log logout activity
router.post('/logout', verifyAdminPassword, async (req, res) => {
  // Remove from online admins by label
  onlineAdmins.delete(req.adminInfo.label);
  
  await logActivity(req, 'logout', {});
  res.json({ success: true, message: 'Logged out successfully' });
});

// POST /api/admin/heartbeat - Update last seen time
router.post('/heartbeat', verifyAdminPassword, async (req, res) => {
  const adminInfo = req.adminInfo;
  
  if (onlineAdmins.has(adminInfo.label)) {
    const existing = onlineAdmins.get(adminInfo.label);
    onlineAdmins.set(adminInfo.label, {
      ...existing,
      lastSeen: new Date()
    });
  } else {
    onlineAdmins.set(adminInfo.label, {
      ...adminInfo,
      lastSeen: new Date(),
      loginTime: new Date()
    });
  }
  
  res.json({ success: true });
});

// GET /api/admin/online - Get list of online admins
router.get('/online', verifyAdminPassword, async (req, res) => {
  const now = new Date();
  const onlineTimeout = 15 * 1000; // 15 seconds timeout for real-time feel
  
  const onlineList = [];
  
  onlineAdmins.forEach((admin, label) => {
    const timeSinceLastSeen = now - new Date(admin.lastSeen);
    if (timeSinceLastSeen < onlineTimeout) {
      onlineList.push({
        role: admin.role,
        label: admin.label,
        color: admin.color,
        lastSeen: admin.lastSeen,
        loginTime: admin.loginTime
      });
    } else {
      // Remove stale entries
      onlineAdmins.delete(label);
    }
  });
  
  res.json({
    success: true,
    data: onlineList
  });
});

// GET /api/admin/suggestions - Get all suggestions with full details
router.get('/suggestions', verifyAdminPassword, async (req, res) => {
  try {
    const { category, status, search, page = 1, limit = 20, dateFrom, dateTo, sort = 'newest', archived, identity } = req.query;
    
    const query = { isDeleted: { $ne: true } };
    
    // Handle archived filter
    if (archived === 'true') {
      query.isArchived = true;
    } else if (archived === 'all') {
      // Show all (archived and non-archived)
    } else {
      // Default: exclude archived
      query.isArchived = { $ne: true };
    }
    
    if (category && category !== 'all') query.category = category;
    if (status && status !== 'all') query.status = status;
    
    // Identity filter (anonymous vs identified)
    if (identity === 'anonymous') {
      query.isAnonymous = true;
    } else if (identity === 'identified') {
      query.isAnonymous = false;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { trackingCode: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Date range filtering
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Determine sort order
    let sortOption = { createdAt: -1 }; // default: newest first
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'recently_updated':
        sortOption = { updatedAt: -1 };
        break;
      case 'priority_high':
        sortOption = { priority: 1, createdAt: -1 };
        break;
      case 'priority_low':
        sortOption = { priority: -1, createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    let suggestions;
    const count = await Suggestion.countDocuments(query);
    
    if (sort === 'priority_high' || sort === 'priority_low') {
      const priorityOrder = sort === 'priority_high' 
        ? { 'urgent': 1, 'high': 2, 'medium': 3, 'low': 4 }
        : { 'low': 1, 'medium': 2, 'high': 3, 'urgent': 4 };
      
      suggestions = await Suggestion.aggregate([
        { $match: query },
        { 
          $addFields: { 
            priorityOrder: {
              $switch: {
                branches: [
                  { case: { $eq: ['$priority', 'urgent'] }, then: priorityOrder['urgent'] },
                  { case: { $eq: ['$priority', 'high'] }, then: priorityOrder['high'] },
                  { case: { $eq: ['$priority', 'medium'] }, then: priorityOrder['medium'] },
                  { case: { $eq: ['$priority', 'low'] }, then: priorityOrder['low'] }
                ],
                default: 5
              }
            }
          }
        },
        { $sort: { priorityOrder: 1, createdAt: -1 } },
        { $skip: (page - 1) * parseInt(limit) },
        { $limit: parseInt(limit) },
        { $project: { priorityOrder: 0, __v: 0 } }
      ]);
    } else {
      suggestions = await Suggestion.find(query)
        .sort(sortOption)
        .limit(parseInt(limit))
        .skip((page - 1) * parseInt(limit))
        .select('-__v');
    }

    res.json({
      success: true,
      data: suggestions,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching suggestions',
      error: error.message
    });
  }
});

// GET /api/admin/suggestions/:id - Get single suggestion
router.get('/suggestions/:id', verifyAdminPassword, async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id).select('-__v');
    
    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }

    // Log view activity
    await logActivity(req, 'view_suggestion', {
      suggestionId: suggestion._id,
      suggestionTitle: suggestion.title,
      suggestionTrackingCode: suggestion.trackingCode
    });

    res.json({ success: true, data: suggestion });
  } catch (error) {
    console.error('Error fetching suggestion:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching suggestion',
      error: error.message
    });
  }
});

// PUT /api/admin/suggestions/:id/status - Update suggestion status
router.put('/suggestions/:id/status', verifyAdminPassword, async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const validStatuses = ['submitted', 'under_review', 'forwarded', 'action_taken', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const suggestion = await Suggestion.findById(req.params.id);
    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }

    const oldStatus = suggestion.status;

    // Add to status history with admin info
    suggestion.statusHistory.push({
      status,
      notes: notes || '',
      changedAt: new Date(),
      changedBy: req.adminInfo.label
    });

    suggestion.status = status;
    await suggestion.save();

    // Log activity
    await logActivity(req, 'update_status', {
      suggestionId: suggestion._id,
      suggestionTitle: suggestion.title,
      suggestionTrackingCode: suggestion.trackingCode,
      extra: { oldStatus, newStatus: status, notes }
    });

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: suggestion
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message
    });
  }
});

// PUT /api/admin/suggestions/:id/priority - Update suggestion priority
router.put('/suggestions/:id/priority', verifyAdminPassword, async (req, res) => {
  try {
    const { priority } = req.body;
    
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority'
      });
    }

    const suggestion = await Suggestion.findById(req.params.id);
    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }

    const oldPriority = suggestion.priority;
    suggestion.priority = priority;
    await suggestion.save();

    // Log activity
    await logActivity(req, 'update_priority', {
      suggestionId: suggestion._id,
      suggestionTitle: suggestion.title,
      suggestionTrackingCode: suggestion.trackingCode,
      extra: { oldPriority, newPriority: priority }
    });

    res.json({
      success: true,
      message: 'Priority updated successfully',
      data: suggestion
    });
  } catch (error) {
    console.error('Error updating priority:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating priority',
      error: error.message
    });
  }
});

// PUT /api/admin/suggestions/:id/read - Mark suggestion as read
router.put('/suggestions/:id/read', verifyAdminPassword, async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id);
    
    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }

    if (!suggestion.isRead) {
      suggestion.isRead = true;
      suggestion.readAt = new Date();
      suggestion.readBy = req.adminInfo.label;
      await suggestion.save();

      // Log activity
      await logActivity(req, 'mark_read', {
        suggestionId: suggestion._id,
        suggestionTitle: suggestion.title,
        suggestionTrackingCode: suggestion.trackingCode
      });
    }

    res.json({
      success: true,
      message: 'Suggestion marked as read',
      data: suggestion
    });
  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking as read',
      error: error.message
    });
  }
});

// PUT /api/admin/suggestions/:id/archive - Toggle archive status
router.put('/suggestions/:id/archive', verifyAdminPassword, async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id);
    
    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }

    const wasArchived = suggestion.isArchived;
    suggestion.isArchived = !suggestion.isArchived;
    suggestion.archivedAt = suggestion.isArchived ? new Date() : null;
    suggestion.archivedBy = suggestion.isArchived ? req.adminInfo.label : null;
    await suggestion.save();

    // Log activity
    await logActivity(req, wasArchived ? 'unarchive_suggestion' : 'archive_suggestion', {
      suggestionId: suggestion._id,
      suggestionTitle: suggestion.title,
      suggestionTrackingCode: suggestion.trackingCode
    });

    res.json({
      success: true,
      message: suggestion.isArchived ? 'Suggestion archived' : 'Suggestion unarchived',
      data: suggestion
    });
  } catch (error) {
    console.error('Error archiving suggestion:', error);
    res.status(500).json({
      success: false,
      message: 'Error archiving suggestion',
      error: error.message
    });
  }
});

// DELETE /api/admin/suggestions/:id - Delete suggestion
router.delete('/suggestions/:id', verifyAdminPassword, async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id);
    
    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }

    const suggestionInfo = {
      suggestionId: suggestion._id,
      suggestionTitle: suggestion.title,
      suggestionTrackingCode: suggestion.trackingCode
    };

    await Suggestion.findByIdAndDelete(req.params.id);

    // Log activity
    await logActivity(req, 'delete_suggestion', suggestionInfo);

    res.json({
      success: true,
      message: 'Suggestion deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting suggestion:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting suggestion',
      error: error.message
    });
  }
});

// POST /api/admin/suggestions/bulk-delete - Bulk delete suggestions
router.post('/suggestions/bulk-delete', verifyAdminPassword, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No suggestion IDs provided'
      });
    }

    // Get suggestion info before deleting
    const suggestions = await Suggestion.find({ _id: { $in: ids } });
    const deletedInfo = suggestions.map(s => ({
      id: s._id,
      title: s.title,
      trackingCode: s.trackingCode
    }));

    await Suggestion.deleteMany({ _id: { $in: ids } });

    // Log activity
    await logActivity(req, 'bulk_delete', {
      extra: { 
        count: ids.length,
        deletedSuggestions: deletedInfo
      }
    });

    res.json({
      success: true,
      message: `${ids.length} suggestions deleted successfully`,
      deletedCount: ids.length
    });
  } catch (error) {
    console.error('Error bulk deleting:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting suggestions',
      error: error.message
    });
  }
});

// GET /api/admin/stats - Get dashboard statistics
router.get('/stats', verifyAdminPassword, async (req, res) => {
  try {
    const activeFilter = { isArchived: { $ne: true }, isDeleted: { $ne: true } };
    
    const total = await Suggestion.countDocuments(activeFilter);
    
    const byCategory = await Suggestion.aggregate([
      { $match: activeFilter },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    const byStatus = await Suggestion.aggregate([
      { $match: activeFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const byPriority = await Suggestion.aggregate([
      { $match: activeFilter },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentCount = await Suggestion.countDocuments({
      ...activeFilter,
      createdAt: { $gte: weekAgo }
    });

    const anonymousCount = await Suggestion.countDocuments({ ...activeFilter, isAnonymous: true });
    const unreadCount = await Suggestion.countDocuments({ ...activeFilter, isRead: { $ne: true } });
    const archivedCount = await Suggestion.countDocuments({ isArchived: true, isDeleted: { $ne: true } });
    const deletedCount = await Suggestion.countDocuments({ isDeleted: true });

    res.json({
      success: true,
      data: {
        total,
        byCategory,
        byStatus,
        byPriority,
        recentCount,
        anonymousCount,
        identifiedCount: total - anonymousCount,
        unreadCount,
        archivedCount,
        deletedCount
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// ==========================================
// ACTIVITY LOGS ENDPOINTS
// ==========================================

// GET /api/admin/activity-logs - Get activity logs
router.get('/activity-logs', verifyAdminPassword, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      adminRole, 
      action, 
      dateFrom, 
      dateTo,
      search
    } = req.query;
    
    const query = {};
    
    if (adminRole && adminRole !== 'all') {
      query.adminRole = adminRole;
    }
    
    if (action && action !== 'all') {
      query.action = action;
    }
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }
    
    // Search by tracking code or suggestion title
    if (search) {
      query.$or = [
        { suggestionTrackingCode: { $regex: search, $options: 'i' } },
        { suggestionTitle: { $regex: search, $options: 'i' } },
        { adminLabel: { $regex: search, $options: 'i' } }
      ];
    }
    
    const count = await ActivityLog.countDocuments(query);
    
    const logs = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((page - 1) * parseInt(limit));
    
    res.json({
      success: true,
      data: logs,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity logs',
      error: error.message
    });
  }
});

// GET /api/admin/activity-logs/stats - Get activity log statistics
router.get('/activity-logs/stats', verifyAdminPassword, async (req, res) => {
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
    
    // Today's activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await ActivityLog.countDocuments({ createdAt: { $gte: today } });
    
    // This week's activity
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekCount = await ActivityLog.countDocuments({ createdAt: { $gte: weekAgo } });
    
    res.json({
      success: true,
      data: {
        totalLogs,
        byAdmin,
        byAction,
        todayCount,
        weekCount
      }
    });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity statistics',
      error: error.message
    });
  }
});

// GET /api/admin/archived - Get archived suggestions
router.get('/archived', verifyAdminPassword, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const query = { isArchived: true, isDeleted: { $ne: true } };
    const count = await Suggestion.countDocuments(query);
    
    const suggestions = await Suggestion.find(query)
      .sort({ archivedAt: -1 })
      .limit(parseInt(limit))
      .skip((page - 1) * parseInt(limit))
      .select('-__v');

    res.json({
      success: true,
      data: suggestions,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching archived:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching archived suggestions',
      error: error.message
    });
  }
});

// DELETE /api/admin/activity-logs/cleanup - Remove old logs with deprecated roles
router.delete('/activity-logs/cleanup', verifyAdminPassword, async (req, res) => {
  try {
    // Only developer can clean up logs
    if (req.adminInfo.role !== 'developer') {
      return res.status(403).json({
        success: false,
        message: 'Only developers can clean up activity logs'
      });
    }
    
    // Delete logs with old/deprecated role names
    const deprecatedRoles = ['president', 'vice_president', 'cote_governor', 'coed_governor', 'admin', 'executive_admin'];
    
    const result = await ActivityLog.deleteMany({
      adminRole: { $in: deprecatedRoles }
    });
    
    res.json({
      success: true,
      message: `Cleaned up ${result.deletedCount} old activity logs`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error cleaning up activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error cleaning up activity logs',
      error: error.message
    });
  }
});

export default router;
