import Suggestion from '../models/Suggestion.js';
import ReportTombstone from '../models/ReportTombstone.js';
import logger from '../utils/logger.js';
import { analyzePriority } from './aiPriorityService.js';
import { uploadImage } from './imageUploadService.js';

class SuggestionService {
  async createSuggestion(dto) {
    try {
      logger.info('Processing new suggestion submission', { 
        category: dto.category, 
        isAnonymous: dto.isAnonymous 
      });

      // AI Priority Analysis
      const { priority, reason, aiAnalyzed } = await analyzePriority(
        dto.title,
        dto.content,
        dto.category
      );

      // Handle image upload if provided
      let imageUrl = null;
      if (dto.image) {
        logger.debug('Image attached, uploading...');
        const uploadResult = await uploadImage(dto.image);
        if (uploadResult.success) {
          imageUrl = uploadResult.url;
          logger.info('Image uploaded successfully');
        } else {
          logger.warn('Image upload failed, continuing without image');
        }
      }

      const suggestionData = {
        category: dto.category,
        title: dto.title,
        content: dto.content,
        isAnonymous: dto.isAnonymous,
        userId: dto.userId || null,
        priority: priority,
        aiPriorityReason: reason,
        imageUrl: imageUrl
      };

      // Add submitter info if not anonymous
      if (!dto.isAnonymous && dto.submitter) {
        suggestionData.submitter = dto.submitter;
      }

      const suggestion = new Suggestion(suggestionData);
      await suggestion.save();

      logger.info('Suggestion created successfully', { 
        trackingCode: suggestion.trackingCode,
        priority: suggestion.priority
      });

      return { suggestion, aiAnalyzed };
    } catch (error) {
      logger.error('Error creating suggestion', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  async getSuggestionByTrackingCode(trackingCode) {
    try {
      const code = trackingCode.trim().toUpperCase();
      const suggestion = await Suggestion.findOne({ 
        trackingCode: code 
      }).select('-__v');

      if (suggestion) {
        return suggestion;
      }

      // Safeguard: Check if this was a permanently purged report with an official tombstone
      const tombstone = await ReportTombstone.findOne({ trackingCode: code }).lean();
      if (tombstone) {
        return {
          trackingCode: tombstone.trackingCode,
          title: tombstone.title,
          category: tombstone.category,
          status: 'purged',
          reason: tombstone.reason,
          purgedAt: tombstone.purgedAt
        };
      }

      logger.warn('Suggestion not found', { trackingCode: code });
      return null;
    } catch (error) {
      logger.error('Error fetching suggestion by tracking code', { 
        trackingCode, 
        error: error.message 
      });
      throw error;
    }
  }

  async getSuggestions(filters, pagination) {
    try {
      let query = {};

      // Handle view modes: 'active', 'archived', 'trash', 'all'
      const viewMode = filters.view || (filters.trash === 'true' ? 'trash' : (filters.archived === 'true' ? 'archived' : 'active'));

      if (viewMode === 'trash') {
        query.isDeleted = true;
      } else if (viewMode === 'archived') {
        query.isArchived = true;
        query.isDeleted = { $ne: true };
      } else if (viewMode === 'all') {
        query.isDeleted = { $ne: true };
      } else {
        // Default: active submissions (not archived, not deleted)
        query.isArchived = { $ne: true };
        query.isDeleted = { $ne: true };
      }
      
      if (filters.category && filters.category !== 'all') {
        query.category = filters.category;
      }
      if (filters.status && filters.status !== 'all') {
        query.status = filters.status;
      }
      
      // Identity filter
      if (filters.identity === 'anonymous') {
        query.isAnonymous = true;
      } else if (filters.identity === 'identified') {
        query.isAnonymous = false;
      }
      
      // Direct ID filter
      if (filters.id) {
        query._id = filters.id;
      }
      
      if (filters.search) {
        const cleanSearch = filters.search.trim().replace(/^#/, '');
        if (cleanSearch) {
          const escaped = cleanSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const searchRegex = new RegExp(escaped, 'i');
          query.$or = [
            { title: searchRegex },
            { content: searchRegex },
            { trackingCode: searchRegex },
            { 'submitter.name': searchRegex },
            { 'submitter.email': searchRegex },
            { 'submitter.studentId': searchRegex }
          ];
        }
      }
      
      // Date range filtering
      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
        if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
      }

      // Determine sort order
      let sortOption = { createdAt: -1 };
      switch (filters.sort) {
        case 'oldest':
          sortOption = { createdAt: 1 };
          break;
        case 'recently_updated':
          sortOption = { updatedAt: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }

      const count = await Suggestion.countDocuments(query);
      
      let suggestions;
      if (filters.sort === 'priority_high' || filters.sort === 'priority_low') {
        const priorityOrder = filters.sort === 'priority_high' 
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
          { $skip: (pagination.page - 1) * pagination.limit },
          { $limit: pagination.limit },
          { $project: { priorityOrder: 0, __v: 0 } }
        ]);
      } else {
        suggestions = await Suggestion.find(query)
          .sort(sortOption)
          .limit(pagination.limit)
          .skip((pagination.page - 1) * pagination.limit)
          .select('-__v');
      }

      return {
        suggestions,
        pagination: {
          total: count,
          page: pagination.page,
          pages: Math.ceil(count / pagination.limit),
          limit: pagination.limit
        }
      };
    } catch (error) {
      logger.error('Error fetching suggestions', { error: error.message });
      throw error;
    }
  }

  async getSuggestionById(id) {
    try {
      const suggestion = await Suggestion.findById(id).select('-__v');
      
      if (!suggestion) {
        logger.warn('Suggestion not found', { id });
        return null;
      }

      return suggestion;
    } catch (error) {
      logger.error('Error fetching suggestion by ID', { id, error: error.message });
      throw error;
    }
  }

  async updateStatus(id, statusDto, adminInfo) {
    try {
      const suggestion = await Suggestion.findById(id);
      if (!suggestion) {
        return null;
      }

      const oldStatus = suggestion.status;

      suggestion.statusHistory.push({
        status: statusDto.status,
        notes: statusDto.notes,
        changedAt: new Date(),
        changedBy: adminInfo.label
      });

      suggestion.status = statusDto.status;
      await suggestion.save();

      logger.info('Suggestion status updated', {
        suggestionId: id,
        oldStatus,
        newStatus: statusDto.status,
        changedBy: adminInfo.label
      });

      return { suggestion, oldStatus };
    } catch (error) {
      logger.error('Error updating suggestion status', { id, error: error.message });
      throw error;
    }
  }

  async updatePriority(id, priorityDto, adminInfo) {
    try {
      const suggestion = await Suggestion.findById(id);
      if (!suggestion) {
        return null;
      }

      const oldPriority = suggestion.priority;
      suggestion.priority = priorityDto.priority;
      await suggestion.save();

      logger.info('Suggestion priority updated', {
        suggestionId: id,
        oldPriority,
        newPriority: priorityDto.priority,
        changedBy: adminInfo.label
      });

      return { suggestion, oldPriority };
    } catch (error) {
      logger.error('Error updating suggestion priority', { id, error: error.message });
      throw error;
    }
  }

  async markAsRead(id, adminInfo) {
    try {
      const suggestion = await Suggestion.findById(id);
      
      if (!suggestion) {
        return null;
      }

      // Normalize isRead to handle migrated string values like "false"/"true"
      const isReadNormalized = suggestion.isRead === true || suggestion.isRead === 'true';

      if (isReadNormalized) {
        return suggestion;
      }

      // IMPORTANT: Use atomic update to avoid failing validation on migrated/legacy documents
      // that may be missing required fields (e.g., `content`).
      const now = new Date();
      const updatedSuggestion = await Suggestion.findByIdAndUpdate(
        id,
        { $set: { isRead: true, readAt: now, readBy: adminInfo.label } },
        { new: true }
      );

      if (!updatedSuggestion) return null;

      logger.info('Suggestion marked as read', {
        suggestionId: id,
        readBy: adminInfo.label
      });

      return updatedSuggestion;
    } catch (error) {
      logger.error('Error marking suggestion as read', { id, error: error.message });
      throw error;
    }
  }

  async toggleArchive(id, adminInfo) {
    try {
      const suggestion = await Suggestion.findById(id);
      
      if (!suggestion) {
        return null;
      }

      const wasArchived = suggestion.isArchived;
      suggestion.isArchived = !suggestion.isArchived;
      suggestion.archivedAt = suggestion.isArchived ? new Date() : null;
      suggestion.archivedBy = suggestion.isArchived ? adminInfo.label : null;
      await suggestion.save();

      logger.info(`Suggestion ${wasArchived ? 'unarchived' : 'archived'}`, {
        suggestionId: id,
        by: adminInfo.label
      });

      return { suggestion, wasArchived };
    } catch (error) {
      logger.error('Error toggling archive status', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Soft delete: Move suggestion to trash
   */
  async moveToTrash(id, adminInfo, reason = null) {
    try {
      const suggestion = await Suggestion.findById(id);
      if (!suggestion) return null;

      suggestion.isDeleted = true;
      suggestion.deletedAt = new Date();
      suggestion.deletedBy = adminInfo?.label || 'Officer';
      suggestion.deletedByRole = adminInfo?.role || null;
      if (reason && typeof reason === 'string' && reason.trim()) {
        suggestion.deletedReason = reason.trim();
      }
      await suggestion.save();

      logger.info('Suggestion moved to trash', { 
        suggestionId: id, 
        by: adminInfo?.label,
        reason: suggestion.deletedReason 
      });

      return suggestion;
    } catch (error) {
      logger.error('Error moving suggestion to trash', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Restore a soft-deleted suggestion from trash
   */
  async restoreFromTrash(id, adminInfo) {
    try {
      const suggestion = await Suggestion.findById(id);
      if (!suggestion) return null;

      suggestion.isDeleted = false;
      suggestion.deletedAt = null;
      suggestion.deletedBy = null;
      suggestion.deletedByRole = null;
      suggestion.deletedReason = null;
      await suggestion.save();

      logger.info('Suggestion restored from trash', { suggestionId: id, by: adminInfo?.label });

      return suggestion;
    } catch (error) {
      logger.error('Error restoring suggestion from trash', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Permanent delete (hard removal from database with tombstone safeguard)
   */
  async permanentDelete(id, adminInfo) {
    try {
      const suggestion = await Suggestion.findById(id);
      if (!suggestion) return null;

      const suggestionInfo = {
        id: suggestion._id,
        title: suggestion.title,
        trackingCode: suggestion.trackingCode
      };

      // Record tombstone so tracking code provides transparency instead of 404
      try {
        await ReportTombstone.findOneAndUpdate(
          { trackingCode: suggestion.trackingCode },
          {
            trackingCode: suggestion.trackingCode,
            title: suggestion.title,
            category: suggestion.category,
            status: 'purged',
            reason: suggestion.deletedReason || 'Permanently removed by SSG administration during maintenance.',
            purgedAt: new Date(),
            purgedBy: adminInfo?.label || 'Officer'
          },
          { upsert: true }
        );
      } catch (tombstoneErr) {
        logger.warn('Could not write tombstone for permanent delete', { error: tombstoneErr.message });
      }

      await Suggestion.findByIdAndDelete(id);
      logger.info('Suggestion permanently purged', { suggestionId: id, by: adminInfo?.label });

      return suggestionInfo;
    } catch (error) {
      logger.error('Error permanently deleting suggestion', { id, error: error.message });
      throw error;
    }
  }

  // Alias deleteSuggestion to moveToTrash for safe default behavior
  async deleteSuggestion(id, adminInfo, reason = null) {
    return this.moveToTrash(id, adminInfo, reason);
  }

  /**
   * Bulk move to trash
   */
  async bulkTrash(ids, adminInfo, reason = null) {
    try {
      const now = new Date();
      const by = adminInfo?.label || 'Officer';
      const role = adminInfo?.role || null;
      const updateData = {
        isDeleted: true,
        deletedAt: now,
        deletedBy: by,
        deletedByRole: role
      };
      if (reason && typeof reason === 'string' && reason.trim()) {
        updateData.deletedReason = reason.trim();
      }

      const result = await Suggestion.updateMany(
        { _id: { $in: ids } },
        { $set: updateData }
      );

      logger.info('Bulk moved to trash', { count: result.modifiedCount, by, reason });
      return { trashedCount: result.modifiedCount };
    } catch (error) {
      logger.error('Error in bulk trash', { error: error.message });
      throw error;
    }
  }

  /**
   * Bulk restore from trash
   */
  async bulkRestore(ids, adminInfo) {
    try {
      const result = await Suggestion.updateMany(
        { _id: { $in: ids } },
        { 
          $set: { 
            isDeleted: false, 
            deletedAt: null, 
            deletedBy: null,
            deletedByRole: null,
            deletedReason: null 
          } 
        }
      );

      logger.info('Bulk restored from trash', { count: result.modifiedCount, by: adminInfo?.label });
      return { restoredCount: result.modifiedCount };
    } catch (error) {
      logger.error('Error in bulk restore', { error: error.message });
      throw error;
    }
  }

  /**
   * Bulk permanent delete with tombstone safeguard
   */
  async bulkPermanentDelete(ids, adminInfo) {
    try {
      const suggestions = await Suggestion.find({ _id: { $in: ids } });
      const deletedInfo = suggestions.map(s => ({
        id: s._id,
        title: s.title,
        trackingCode: s.trackingCode
      }));

      // Record tombstones
      try {
        const tombstones = suggestions.map(s => ({
          trackingCode: s.trackingCode,
          title: s.title,
          category: s.category,
          status: 'purged',
          reason: s.deletedReason || 'Permanently removed during bulk maintenance.',
          purgedAt: new Date(),
          purgedBy: adminInfo?.label || 'Officer'
        }));
        await ReportTombstone.insertMany(tombstones, { ordered: false }).catch(() => {});
      } catch (tombstoneErr) {
        logger.warn('Could not write tombstones for bulk permanent delete', { error: tombstoneErr.message });
      }

      const result = await Suggestion.deleteMany({ _id: { $in: ids } });
      logger.info('Bulk permanent delete completed', { count: result.deletedCount });

      return { deletedCount: result.deletedCount, deletedInfo };
    } catch (error) {
      logger.error('Error bulk permanently deleting suggestions', { error: error.message });
      throw error;
    }
  }

  // Backward-compatible bulkDelete alias
  async bulkDelete(ids) {
    return this.bulkTrash(ids);
  }

  /**
   * Empty entire trash (with tombstone safeguard for student transparency)
   */
  async emptyTrash(adminInfo) {
    try {
      const trashed = await Suggestion.find({ isDeleted: true });
      if (trashed.length > 0) {
        try {
          const tombstones = trashed.map(t => ({
            trackingCode: t.trackingCode,
            title: t.title,
            category: t.category,
            status: 'purged',
            reason: t.deletedReason || 'Purged during scheduled trash cleanup.',
            purgedAt: new Date(),
            purgedBy: adminInfo?.label || 'Officer'
          }));
          await ReportTombstone.insertMany(tombstones, { ordered: false }).catch(() => {});
        } catch (tombstoneErr) {
          logger.warn('Could not write tombstones for empty trash', { error: tombstoneErr.message });
        }
      }

      const result = await Suggestion.deleteMany({ isDeleted: true });
      logger.info('Empty trash completed', { count: result.deletedCount, by: adminInfo?.label });
      return { deletedCount: result.deletedCount };
    } catch (error) {
      logger.error('Error emptying trash', { error: error.message });
      throw error;
    }
  }

  async getStatistics() {
    try {
      const activeFilter = { isArchived: { $ne: true }, isDeleted: { $ne: true } };
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const [
        total,
        byCategory,
        byStatus,
        byPriority,
        recentCount,
        anonymousCount,
        unreadCount,
        archivedCount,
        deletedCount,
        grandTotal
      ] = await Promise.all([
        Suggestion.countDocuments(activeFilter),
        Suggestion.aggregate([
          { $match: activeFilter },
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ]),
        Suggestion.aggregate([
          { $match: activeFilter },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        Suggestion.aggregate([
          { $match: activeFilter },
          { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]),
        Suggestion.countDocuments({ ...activeFilter, createdAt: { $gte: weekAgo } }),
        Suggestion.countDocuments({ ...activeFilter, isAnonymous: true }),
        Suggestion.countDocuments({ ...activeFilter, isRead: { $ne: true } }),
        Suggestion.countDocuments({ isArchived: true, isDeleted: { $ne: true } }),
        Suggestion.countDocuments({ isDeleted: true }),
        Suggestion.countDocuments({})
      ]);

      return {
        total,
        activeCount: total,
        byCategory,
        byStatus,
        byPriority,
        recentCount,
        anonymousCount,
        identifiedCount: total - anonymousCount,
        unreadCount,
        archivedCount,
        deletedCount,
        trashCount: deletedCount,
        grandTotal
      };
    } catch (error) {
      logger.error('Error fetching statistics', { error: error.message });
      throw error;
    }
  }

  async getArchivedSuggestions(pagination) {
    try {
      const query = { isArchived: true, isDeleted: { $ne: true } };
      const count = await Suggestion.countDocuments(query);
      
      const suggestions = await Suggestion.find(query)
        .sort({ archivedAt: -1 })
        .limit(pagination.limit)
        .skip((pagination.page - 1) * pagination.limit)
        .select('-__v');

      return {
        suggestions,
        pagination: {
          total: count,
          page: pagination.page,
          pages: Math.ceil(count / pagination.limit),
          limit: pagination.limit
        }
      };
    } catch (error) {
      logger.error('Error fetching archived suggestions', { error: error.message });
      throw error;
    }
  }
}

export default new SuggestionService();
