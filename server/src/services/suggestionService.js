import Suggestion from '../models/Suggestion.js';
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
      const suggestion = await Suggestion.findOne({ 
        trackingCode: trackingCode.toUpperCase() 
      }).select('-__v');

      if (!suggestion) {
        logger.warn('Suggestion not found', { trackingCode });
        return null;
      }

      return suggestion;
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
      const query = { isDeleted: { $ne: true } };
      
      // Handle archived filter
      if (filters.archived === 'true') {
        query.isArchived = true;
      } else if (filters.archived === 'all') {
        // Show all
      } else {
        query.isArchived = { $ne: true };
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
      
      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { content: { $regex: filters.search, $options: 'i' } },
          { trackingCode: { $regex: filters.search, $options: 'i' } }
        ];
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

      if (!suggestion.isRead) {
        suggestion.isRead = true;
        suggestion.readAt = new Date();
        suggestion.readBy = adminInfo.label;
        await suggestion.save();

        logger.info('Suggestion marked as read', {
          suggestionId: id,
          readBy: adminInfo.label
        });
      }

      return suggestion;
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

  async deleteSuggestion(id) {
    try {
      const suggestion = await Suggestion.findById(id);
      
      if (!suggestion) {
        return null;
      }

      const suggestionInfo = {
        id: suggestion._id,
        title: suggestion.title,
        trackingCode: suggestion.trackingCode
      };

      await Suggestion.findByIdAndDelete(id);

      logger.info('Suggestion deleted', { suggestionId: id });

      return suggestionInfo;
    } catch (error) {
      logger.error('Error deleting suggestion', { id, error: error.message });
      throw error;
    }
  }

  async bulkDelete(ids) {
    try {
      const suggestions = await Suggestion.find({ _id: { $in: ids } });
      const deletedInfo = suggestions.map(s => ({
        id: s._id,
        title: s.title,
        trackingCode: s.trackingCode
      }));

      const result = await Suggestion.deleteMany({ _id: { $in: ids } });

      logger.info('Bulk delete completed', { count: result.deletedCount });

      return { deletedCount: result.deletedCount, deletedInfo };
    } catch (error) {
      logger.error('Error bulk deleting suggestions', { error: error.message });
      throw error;
    }
  }

  async getStatistics() {
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

      return {
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
