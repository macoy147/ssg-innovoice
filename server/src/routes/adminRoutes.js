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
import logger from '../utils/logger.js';

const router = express.Router();

// POST /api/admin/verify - Verify admin password
router.post(
  '/verify', 
  adminVerifyValidator, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const dto = new AdminVerifyDTO(req.body);
      const adminInfo = adminService.verifyPassword(dto.password);
      
      if (adminInfo) {
        adminService.setAdminOnline(adminInfo);
        
        await adminService.logActivity(
          { headers: { 'x-admin-password': dto.password }, ip: req.ip, connection: req.connection },
          'login',
          {}
        );
        
        const responseDto = new AdminVerifyResponseDTO(adminInfo);
        
        res.json({ 
          success: true, 
          message: 'Password verified',
          admin: responseDto
        });
      } else {
        res.status(401).json({ 
          success: false, 
          message: 'Invalid password' 
        });
      }
    } catch (error) {
      logger.error('Error in admin verify endpoint', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Authentication failed. Please try again later.'
      });
    }
  }
);

// POST /api/admin/logout - Log logout activity
router.post('/logout', verifyAdminPassword, async (req, res) => {
  try {
    adminService.setAdminOffline(req.adminInfo.label);
    await adminService.logActivity(req, 'logout', {});
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Error in logout endpoint', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Logout failed. Please try again later.'
    });
  }
});

// POST /api/admin/logout-beacon - Handle logout when tab closes
router.post('/logout-beacon', async (req, res) => {
  try {
    const password = req.query.password;
    const adminInfo = adminService.getAdminInfo(password);
    
    if (adminInfo) {
      adminService.setAdminOffline(adminInfo.label);
      
      await adminService.logActivity(
        { headers: { 'x-admin-password': password }, ip: req.ip, connection: req.connection },
        'session_ended',
        {}
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Error in logout beacon endpoint', { error: error.message });
    res.json({ success: true }); // Always return success for beacon
  }
});

// POST /api/admin/heartbeat - Update last seen time
router.post('/heartbeat', verifyAdminPassword, async (req, res) => {
  try {
    adminService.updateHeartbeat(req.adminInfo.label, req.adminInfo);
    res.json({ success: true });
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
        archived: req.query.archived,
        identity: req.query.identity
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

// DELETE /api/admin/suggestions/:id - Delete suggestion
router.delete(
  '/suggestions/:id', 
  verifyAdminPassword, 
  suggestionIdValidator, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const suggestionInfo = await suggestionService.deleteSuggestion(req.params.id);
      
      if (!suggestionInfo) {
        return res.status(404).json({
          success: false,
          message: 'Suggestion not found'
        });
      }

      await adminService.logActivity(req, 'delete_suggestion', {
        suggestionId: suggestionInfo.id,
        suggestionTitle: suggestionInfo.title,
        suggestionTrackingCode: suggestionInfo.trackingCode
      });

      res.json({
        success: true,
        message: 'Suggestion deleted successfully'
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

// POST /api/admin/suggestions/bulk-delete - Bulk delete suggestions
router.post(
  '/suggestions/bulk-delete', 
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

      const result = await suggestionService.bulkDelete(dto.ids);

      await adminService.logActivity(req, 'bulk_delete', {
        extra: { 
          count: result.deletedCount,
          deletedSuggestions: result.deletedInfo
        }
      });

      res.json({
        success: true,
        message: `${result.deletedCount} suggestions deleted successfully`,
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
