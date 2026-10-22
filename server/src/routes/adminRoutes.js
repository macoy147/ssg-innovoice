import express from 'express';
import suggestionService from '../services/suggestionService.js';
import adminService from '../services/adminService.js';
import { 
  SuggestionResponseDTO 
} from '../dto/suggestion.dto.js';
import { 
  AdminVerifyDTO, 
  AdminVerifyResponseDTO, 
  ActivityLogResponseDTO,
  OnlineAdminResponseDTO 
} from '../dto/admin.dto.js';
import { 
  UpdateStatusDTO, 
  UpdatePriorityDTO, 
  BulkDeleteDTO 
} from '../dto/suggestion.dto.js';
import { 
  updateStatusValidator, 
  updatePriorityValidator, 
  suggestionIdValidator, 
  bulkDeleteValidator,
  paginationValidator 
} from '../validators/suggestion.validator.js';
import { 
  adminVerifyValidator, 
  activityLogQueryValidator 
} from '../validators/admin.validator.js';
import { handleValidationErrors } from '../middleware/validationMiddleware.js';
import { verifyAdminPassword, requireDeveloperRole } from '../middleware/adminMiddleware.js';
import studentAuthService from '../services/studentAuthService.js';
import notificationEmitter from '../utils/notificationEmitter.js';
import logger from '../utils/logger.js';

const router = express.Router();
const SESSION_NAME = process.env.SESSION_NAME || 'innovoice.sid';
const IS_PROD = process.env.NODE_ENV === 'production';

// Allowed origins for SSE stream
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) 
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'];

// GET /api/admin/live-stream - Server-Sent Events (SSE) stream for real-time notifications
router.get('/live-stream', (req, res) => {
  // Check authorization exclusively through session or verified Google Bearer token
  let isAuthorized = false;

  if (req.session?.admin) {
    isAuthorized = true;
  } else {
    const token = req.query.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
    if (token) {
      const decoded = studentAuthService.verifyStudentToken(token);
      if (decoded?.email) {
        const info = adminService.getAdminByEmail(decoded.email);
        if (info) isAuthorized = true;
      }
    }
  }

  if (!isAuthorized) {
    return res.status(401).json({ success: false, message: 'Unauthorized for live stream' });
  }

  // Determine safe origin for CORS (never echo arbitrary origins with credentials)
  const reqOrigin = req.headers.origin;
  const isOriginAllowed = reqOrigin && allowedOrigins.includes(reqOrigin);
  const streamOrigin = isOriginAllowed ? reqOrigin : allowedOrigins[0];

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': streamOrigin,
    'Access-Control-Allow-Credentials': 'true'
  });

  res.write(`event: connected\ndata: ${JSON.stringify({ message: 'Live stream connected', time: new Date() })}\n\n`);

  const onNewSuggestion = (suggestionData) => {
    try {
      res.write(`event: new_suggestion\ndata: ${JSON.stringify(suggestionData)}\n\n`);
    } catch (err) {
      logger.error('Error sending SSE message', { error: err.message });
    }
  };

  notificationEmitter.on('new_suggestion', onNewSuggestion);

  // Keep-alive heartbeat every 20 seconds to prevent proxy drop
  const keepAliveTimer = setInterval(() => {
    try {
      res.write(': keep-alive ping\n\n');
    } catch (e) {}
  }, 20000);

  req.on('close', () => {
    clearInterval(keepAliveTimer);
    notificationEmitter.off('new_suggestion', onNewSuggestion);
  });
});

// POST /api/admin/verify - Passkey authentication decommissioned
router.post('/verify', (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Passkey login has been decommissioned for security. Please sign in with your authorized SSG Google Account.'
  });
});

// GET /api/admin/me - Validate session and return admin info
router.get('/me', verifyAdminPassword, async (req, res) => {
  const responseDto = new AdminVerifyResponseDTO(req.adminInfo);
  res.json({ success: true, admin: responseDto });
});

// POST /api/admin/logout - Log logout activity
router.post('/logout', verifyAdminPassword, async (req, res) => {
  try {
    adminService.setAdminOffline(req.adminInfo.label);
    await adminService.logActivity(req, 'logout', {});

    if (req.session) {
      req.session.destroy(() => {
        res.clearCookie(SESSION_NAME, { sameSite: IS_PROD ? 'none' : 'lax', secure: IS_PROD });
        res.json({ success: true, message: 'Logged out successfully' });
      });
    } else {
      res.json({ success: true, message: 'Logged out successfully' });
    }
  } catch (error) {
    logger.error('Error in logout endpoint', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Logout failed. Please try again later.'
    });
  }
});

// POST /api/admin/logout-beacon - Handle offline status when tab closes or reloads
router.post('/logout-beacon', async (req, res) => {
  try {
    if (req.session?.admin) {
      adminService.setAdminOffline(req.session.admin.label);
    } else {
      const token = req.query.token;
      if (token) {
        const decoded = studentAuthService.verifyStudentToken(token);
        if (decoded?.email) {
          const info = adminService.getAdminByEmail(decoded.email);
          if (info) {
            adminService.setAdminOffline(info.label);
          }
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Error in logout beacon endpoint', { error: error.message });
    res.json({ success: true }); // Always return success for beacon
  }
});

// POST /api/admin/heartbeat - Update last seen time and return online admins in one roundtrip
router.post('/heartbeat', verifyAdminPassword, async (req, res) => {
  try {
    adminService.updateHeartbeat(req.adminInfo.label, req.adminInfo);
    const onlineList = adminService.getOnlineAdmins();
    const responseDtos = onlineList.map(admin => new OnlineAdminResponseDTO(admin));
    res.json({ success: true, onlineAdmins: responseDtos });
  } catch (error) {
    logger.error('Error in heartbeat endpoint', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Heartbeat failed'
    });
  }
});

// GET /api/admin/online - Get list of online admins
router.get('/online', verifyAdminPassword, async (req, res) => {
  try {
    const onlineList = adminService.getOnlineAdmins();
    const responseDtos = onlineList.map(admin => new OnlineAdminResponseDTO(admin));
    
    res.json({
      success: true,
      data: responseDtos
    });
  } catch (error) {
    logger.error('Error in get online admins endpoint', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch online admins'
    });
  }
});

// GET /api/admin/suggestions - Get all suggestions with full details
router.get(
  '/suggestions', 
  verifyAdminPassword, 
  paginationValidator, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const filters = {
        category: req.query.category,
        status: req.query.status,
        search: req.query.search,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        sort: req.query.sort || 'newest',
        view: req.query.view,
        trash: req.query.trash,
        archived: req.query.archived,
        identity: req.query.identity,
        id: req.query.id
      };
      
      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };
      
      const result = await suggestionService.getSuggestions(filters, pagination);
      
      // Map to response DTOs
      const responseDtos = result.suggestions.map(s => new SuggestionResponseDTO(s));
      
      res.json({
        success: true,
        data: responseDtos,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error('Error in get suggestions endpoint', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch suggestions'
      });
    }
  }
);

// GET /api/admin/suggestions/:id - Get single suggestion
router.get(
  '/suggestions/:id', 
  verifyAdminPassword, 
  suggestionIdValidator, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const suggestion = await suggestionService.getSuggestionById(req.params.id);
      
      if (!suggestion) {
        return res.status(404).json({
          success: false,
          message: 'Suggestion not found'
        });
      }

      await adminService.logActivity(req, 'view_suggestion', {
        suggestionId: suggestion._id,
        suggestionTitle: suggestion.title,
        suggestionTrackingCode: suggestion.trackingCode
      });

      const responseDto = new SuggestionResponseDTO(suggestion);
      res.json({ success: true, data: responseDto });
    } catch (error) {
      logger.error('Error in get suggestion by ID endpoint', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch suggestion'
      });
    }
  }
);

// PUT /api/admin/suggestions/:id/status - Update suggestion status
router.put(
  '/suggestions/:id/status', 
  verifyAdminPassword, 
  updateStatusValidator, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const dto = new UpdateStatusDTO(req.body);
      const result = await suggestionService.updateStatus(req.params.id, dto, req.adminInfo);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Suggestion not found'
        });
      }

      await adminService.logActivity(req, 'update_status', {
        suggestionId: result.suggestion._id,
        suggestionTitle: result.suggestion.title,
        suggestionTrackingCode: result.suggestion.trackingCode,
        extra: { oldStatus: result.oldStatus, newStatus: dto.status, notes: dto.notes }
      });

      const responseDto = new SuggestionResponseDTO(result.suggestion);
      res.json({
        success: true,
        message: 'Status updated successfully',
        data: responseDto
      });
    } catch (error) {
      logger.error('Error in update status endpoint', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to update status'
      });
    }
  }
);

// PUT /api/admin/suggestions/:id/priority - Update suggestion priority
router.put(
  '/suggestions/:id/priority', 
  verifyAdminPassword, 
  updatePriorityValidator, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const dto = new UpdatePriorityDTO(req.body);
      const result = await suggestionService.updatePriority(req.params.id, dto, req.adminInfo);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Suggestion not found'
        });
      }

      await adminService.logActivity(req, 'update_priority', {
        suggestionId: result.suggestion._id,
        suggestionTitle: result.suggestion.title,
        suggestionTrackingCode: result.suggestion.trackingCode,
        extra: { oldPriority: result.oldPriority, newPriority: dto.priority }
      });

      const responseDto = new SuggestionResponseDTO(result.suggestion);
      res.json({
        success: true,
        message: 'Priority updated successfully',
        data: responseDto
      });
    } catch (error) {
      logger.error('Error in update priority endpoint', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to update priority'
      });
    }
  }
);

// PUT /api/admin/suggestions/:id/read - Mark suggestion as read
router.put(
  '/suggestions/:id/read', 
  verifyAdminPassword, 
  suggestionIdValidator, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const suggestion = await suggestionService.markAsRead(req.params.id, req.adminInfo);
      
      if (!suggestion) {
        return res.status(404).json({
          success: false,
          message: 'Suggestion not found'
        });
      }

      if (suggestion.isRead && suggestion.readBy === req.adminInfo.label) {
        await adminService.logActivity(req, 'mark_read', {
          suggestionId: suggestion._id,
          suggestionTitle: suggestion.title,
          suggestionTrackingCode: suggestion.trackingCode
        });
      }

      const responseDto = new SuggestionResponseDTO(suggestion);
      res.json({
        success: true,
        message: 'Suggestion marked as read',
        data: responseDto
      });
    } catch (error) {
      logger.error('Error in mark as read endpoint', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to mark as read'
      });
    }
  }
);

// PUT /api/admin/suggestions/:id/archive - Toggle archive status
router.put(
  '/suggestions/:id/archive', 
  verifyAdminPassword, 
  suggestionIdValidator, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const result = await suggestionService.toggleArchive(req.params.id, req.adminInfo);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Suggestion not found'
        });
      }

      await adminService.logActivity(
        req, 
        result.wasArchived ? 'unarchive_suggestion' : 'archive_suggestion', 
        {
          suggestionId: result.suggestion._id,
          suggestionTitle: result.suggestion.title,
          suggestionTrackingCode: result.suggestion.trackingCode
        }
      );

      const responseDto = new SuggestionResponseDTO(result.suggestion);
      res.json({
        success: true,
        message: result.suggestion.isArchived ? 'Suggestion archived' : 'Suggestion unarchived',
        data: responseDto
      });
    } catch (error) {
      logger.error('Error in toggle archive endpoint', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to update archive status'
      });
    }
  }
);

// PUT /api/admin/suggestions/:id/trash - Move suggestion to trash (soft delete)
router.put(
  '/suggestions/:id/trash',
  verifyAdminPassword,
  suggestionIdValidator,
  handleValidationErrors,
  async (req, res) => {
    try {
      const reason = req.body?.reason || null;
      const suggestion = await suggestionService.moveToTrash(req.params.id, req.adminInfo, reason);
      
      if (!suggestion) {
        return res.status(404).json({
          success: false,
          message: 'Suggestion not found'
        });
      }

      await adminService.logActivity(req, 'delete_suggestion', {
        suggestionId: suggestion._id,
        suggestionTitle: suggestion.title,
        suggestionTrackingCode: suggestion.trackingCode,
        extra: { type: 'soft_delete', to: 'trash', reason: suggestion.deletedReason }
      });

      const responseDto = new SuggestionResponseDTO(suggestion);
      res.json({
        success: true,
        message: 'Suggestion moved to trash',
        data: responseDto
      });
    } catch (error) {
      logger.error('Error in move to trash endpoint', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to move suggestion to trash'
      });
    }
  }
);

// PUT /api/admin/suggestions/:id/restore - Restore suggestion from trash
router.put(
  '/suggestions/:id/restore',
  verifyAdminPassword,
  suggestionIdValidator,
  handleValidationErrors,
  async (req, res) => {
    try {
      const suggestion = await suggestionService.restoreFromTrash(req.params.id, req.adminInfo);
      
      if (!suggestion) {
        return res.status(404).json({
          success: false,
          message: 'Suggestion not found'
        });
      }

      await adminService.logActivity(req, 'restore_suggestion', {
        suggestionId: suggestion._id,
        suggestionTitle: suggestion.title,
        suggestionTrackingCode: suggestion.trackingCode,
        extra: { from: 'trash', to: 'inbox' }
      });

      const responseDto = new SuggestionResponseDTO(suggestion);
      res.json({
        success: true,
        message: 'Suggestion restored to inbox',
        data: responseDto
      });
    } catch (error) {
      logger.error('Error in restore suggestion endpoint', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to restore suggestion'
      });
    }
  }
);

// DELETE /api/admin/suggestions/:id/permanent - Permanently delete suggestion
router.delete(
  '/suggestions/:id/permanent',
  verifyAdminPassword,
  requireDeveloperRole,
  suggestionIdValidator,
  handleValidationErrors,
  async (req, res) => {
    try {
      const suggestionInfo = await suggestionService.permanentDelete(req.params.id, req.adminInfo);
      
      if (!suggestionInfo) {
        return res.status(404).json({
          success: false,
          message: 'Suggestion not found'
        });
      }

      await adminService.logActivity(req, 'permanent_delete', {
        suggestionId: suggestionInfo.id,
        suggestionTitle: suggestionInfo.title,
        suggestionTrackingCode: suggestionInfo.trackingCode
      });

      res.json({
        success: true,
        message: 'Suggestion permanently deleted'
      });
    } catch (error) {
      logger.error('Error in permanent delete endpoint', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to permanently delete suggestion'
      });
    }
  }
);

// DELETE /api/admin/suggestions/:id - Soft-delete (backward compatible)
router.delete(
  '/suggestions/:id', 
  verifyAdminPassword, 
  suggestionIdValidator, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const reason = req.body?.reason || null;
      const suggestion = await suggestionService.moveToTrash(req.params.id, req.adminInfo, reason);
      
      if (!suggestion) {
        return res.status(404).json({
          success: false,
          message: 'Suggestion not found'
        });
      }

      await adminService.logActivity(req, 'delete_suggestion', {
        suggestionId: suggestion._id,
        suggestionTitle: suggestion.title,
        suggestionTrackingCode: suggestion.trackingCode,
        extra: { type: 'soft_delete', to: 'trash', reason: suggestion.deletedReason }
      });

      res.json({
        success: true,
        message: 'Suggestion moved to trash'
      });
    } catch (error) {
      logger.error('Error in delete suggestion endpoint', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to delete suggestion'
      });
    }
  }
);

// POST /api/admin/suggestions/bulk-trash - Bulk soft delete
router.post(
  '/suggestions/bulk-trash',
  verifyAdminPassword,
  bulkDeleteValidator,
  handleValidationErrors,
  async (req, res) => {
    try {
      const dto = new BulkDeleteDTO(req.body);
      if (dto.ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No suggestion IDs provided'
        });
      }

      const reason = req.body?.reason || null;
      const result = await suggestionService.bulkTrash(dto.ids, req.adminInfo, reason);
      await adminService.logActivity(req, 'bulk_delete', {
        extra: { count: result.trashedCount, action: 'bulk_trash', reason }
      });

      res.json({
        success: true,
        message: `${result.trashedCount} suggestion(s) moved to trash`,
        trashedCount: result.trashedCount
      });
    } catch (error) {
      logger.error('Error in bulk trash endpoint', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to move suggestions to trash'
      });
    }
  }
);

// POST /api/admin/suggestions/bulk-restore - Bulk restore
router.post(
  '/suggestions/bulk-restore',
  verifyAdminPassword,
  bulkDeleteValidator,
  handleValidationErrors,
  async (req, res) => {
    try {
      const dto = new BulkDeleteDTO(req.body);
      if (dto.ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No suggestion IDs provided'
        });
      }

      const result = await suggestionService.bulkRestore(dto.ids, req.adminInfo);
      await adminService.logActivity(req, 'restore_suggestion', {
        extra: { count: result.restoredCount, action: 'bulk_restore' }
      });

      res.json({
        success: true,
        message: `${result.restoredCount} suggestion(s) restored`,
        restoredCount: result.restoredCount
      });
    } catch (error) {
      logger.error('Error in bulk restore endpoint', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to restore suggestions'
      });
    }
  }
);

// POST /api/admin/suggestions/empty-trash - Empty all trash
router.post(
  '/suggestions/empty-trash',
  verifyAdminPassword,
  requireDeveloperRole,
  async (req, res) => {
    try {
      const result = await suggestionService.emptyTrash(req.adminInfo);
      await adminService.logActivity(req, 'empty_trash', {
        extra: { count: result.deletedCount }
      });

      res.json({
        success: true,
        message: `Trash emptied (${result.deletedCount} items permanently deleted)`,
        deletedCount: result.deletedCount
      });
    } catch (error) {
      logger.error('Error in empty trash endpoint', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to empty trash'
      });
    }
  }
);

// POST /api/admin/suggestions/bulk-delete - Bulk permanent delete
router.post(
  '/suggestions/bulk-delete', 
  verifyAdminPassword, 
  requireDeveloperRole,
  bulkDeleteValidator, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const dto = new BulkDeleteDTO(req.body);
      
      if (dto.ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No suggestion IDs provided'
        });
      }

      const result = await suggestionService.bulkPermanentDelete(dto.ids, req.adminInfo);

      await adminService.logActivity(req, 'bulk_delete', {
        extra: { 
          count: result.deletedCount,
          deletedSuggestions: result.deletedInfo
        }
      });

      res.json({
        success: true,
        message: `${result.deletedCount} suggestions permanently deleted`,
        deletedCount: result.deletedCount
      });
    } catch (error) {
      logger.error('Error in bulk delete endpoint', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to delete suggestions'
      });
    }
  }
);

// GET /api/admin/stats - Get dashboard statistics
router.get('/stats', verifyAdminPassword, async (req, res) => {
  try {
    const stats = await suggestionService.getStatistics();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error in get stats endpoint', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

// GET /api/admin/activity-logs - Get activity logs
router.get(
  '/activity-logs', 
  verifyAdminPassword, 
  activityLogQueryValidator, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const filters = {
        adminRole: req.query.adminRole,
        action: req.query.action,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        search: req.query.search
      };
      
      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50
      };
      
      const result = await adminService.getActivityLogs(filters, pagination);
      
      // Map to response DTOs (hide sensitive data)
      const responseDtos = result.logs.map(log => new ActivityLogResponseDTO(log));
      
      res.json({
        success: true,
        data: responseDtos,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error('Error in get activity logs endpoint', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch activity logs'
      });
    }
  }
);

// GET /api/admin/activity-logs/stats - Get activity log statistics
router.get('/activity-logs/stats', verifyAdminPassword, async (req, res) => {
  try {
    const stats = await adminService.getActivityLogStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error in get activity log stats endpoint', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity log statistics'
    });
  }
});

// GET /api/admin/archived - Get archived suggestions
router.get(
  '/archived', 
  verifyAdminPassword, 
  paginationValidator, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };
      
      const result = await suggestionService.getArchivedSuggestions(pagination);
      
      const responseDtos = result.suggestions.map(s => new SuggestionResponseDTO(s));
      
      res.json({
        success: true,
        data: responseDtos,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error('Error in get archived suggestions endpoint', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch archived suggestions'
      });
    }
  }
);

// GET /api/admin/activity-logs/deprecated-count - Get count of logs with deprecated roles
router.get(
  '/activity-logs/deprecated-count', 
  verifyAdminPassword, 
  requireDeveloperRole, 
  async (req, res) => {
    try {
      const result = await adminService.getDeprecatedLogsCount();
      
      res.json({
        success: true,
        count: result.count,
        deprecatedRoles: result.deprecatedRoles
      });
    } catch (error) {
      logger.error('Error in get deprecated logs count endpoint', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to count deprecated logs'
      });
    }
  }
);

// DELETE /api/admin/activity-logs/cleanup - Remove old logs with deprecated roles
router.delete(
  '/activity-logs/cleanup', 
  verifyAdminPassword, 
  requireDeveloperRole, 
  async (req, res) => {
    try {
      const deletedCount = await adminService.cleanupDeprecatedLogs();
      
      res.json({
        success: true,
        message: deletedCount > 0 
          ? `Cleaned up ${deletedCount} old activity logs`
          : 'No deprecated logs found to clean up',
        deletedCount
      });
    } catch (error) {
      logger.error('Error in cleanup deprecated logs endpoint', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to clean up activity logs'
      });
    }
  }
);

export default router;
