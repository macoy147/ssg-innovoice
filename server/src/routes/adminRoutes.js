import express from 'express';
import Suggestion from '../models/Suggestion.js';

const router = express.Router();

// Simple password verification middleware
const verifyAdminPassword = (req, res, next) => {
  const password = req.headers['x-admin-password'];
  
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      message: 'Invalid admin password'
    });
  }
  next();
};

// POST /api/admin/verify - Verify admin password
router.post('/verify', (req, res) => {
  const { password } = req.body;
  
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true, message: 'Password verified' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

// GET /api/admin/suggestions - Get all suggestions with full details
router.get('/suggestions', verifyAdminPassword, async (req, res) => {
  try {
    const { category, status, search, page = 1, limit = 20, dateFrom, dateTo, sort = 'newest', archived } = req.query;
    
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
      case 'priority_high':
        // Custom sort: urgent > high > medium > low
        sortOption = { 
          priority: 1, // Will be handled with aggregation or custom sort
          createdAt: -1 
        };
        break;
      case 'priority_low':
        sortOption = { 
          priority: -1,
          createdAt: -1 
        };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // For priority sorting, we need to use aggregation for proper ordering
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

    // Add to status history
    suggestion.statusHistory.push({
      status,
      notes: notes || '',
      changedAt: new Date()
    });

    suggestion.status = status;
    await suggestion.save();

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

    const suggestion = await Suggestion.findByIdAndUpdate(
      req.params.id,
      { priority },
      { new: true }
    );

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }

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

    // Toggle archive status
    suggestion.isArchived = !suggestion.isArchived;
    suggestion.archivedAt = suggestion.isArchived ? new Date() : null;
    await suggestion.save();

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
    const suggestion = await Suggestion.findByIdAndDelete(req.params.id);
    
    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }

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

// GET /api/admin/stats - Get dashboard statistics
router.get('/stats', verifyAdminPassword, async (req, res) => {
  try {
    // Exclude archived and deleted from stats
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

    // Recent activity (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentCount = await Suggestion.countDocuments({
      ...activeFilter,
      createdAt: { $gte: weekAgo }
    });

    // Anonymous vs identified
    const anonymousCount = await Suggestion.countDocuments({ ...activeFilter, isAnonymous: true });
    
    // Archive and trash counts
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

// GET /api/admin/trash - Get deleted suggestions
router.get('/trash', verifyAdminPassword, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const query = { isDeleted: true };
    const count = await Suggestion.countDocuments(query);
    
    const suggestions = await Suggestion.find(query)
      .sort({ deletedAt: -1 })
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
    console.error('Error fetching trash:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching deleted suggestions',
      error: error.message
    });
  }
});

// PUT /api/admin/suggestions/:id/archive - Archive a suggestion
router.put('/suggestions/:id/archive', verifyAdminPassword, async (req, res) => {
  try {
    const suggestion = await Suggestion.findByIdAndUpdate(
      req.params.id,
      { isArchived: true, archivedAt: new Date() },
      { new: true }
    );

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }

    res.json({
      success: true,
      message: 'Suggestion archived successfully',
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

// PUT /api/admin/suggestions/:id/unarchive - Restore from archive
router.put('/suggestions/:id/unarchive', verifyAdminPassword, async (req, res) => {
  try {
    const suggestion = await Suggestion.findByIdAndUpdate(
      req.params.id,
      { isArchived: false, archivedAt: null },
      { new: true }
    );

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }

    res.json({
      success: true,
      message: 'Suggestion restored from archive',
      data: suggestion
    });
  } catch (error) {
    console.error('Error unarchiving suggestion:', error);
    res.status(500).json({
      success: false,
      message: 'Error restoring suggestion',
      error: error.message
    });
  }
});

// PUT /api/admin/suggestions/:id/soft-delete - Move to trash
router.put('/suggestions/:id/soft-delete', verifyAdminPassword, async (req, res) => {
  try {
    const suggestion = await Suggestion.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }

    res.json({
      success: true,
      message: 'Suggestion moved to trash',
      data: suggestion
    });
  } catch (error) {
    console.error('Error deleting suggestion:', error);
    res.status(500).json({
      success: false,
      message: 'Error moving to trash',
      error: error.message
    });
  }
});

// PUT /api/admin/suggestions/:id/restore - Restore from trash
router.put('/suggestions/:id/restore', verifyAdminPassword, async (req, res) => {
  try {
    const suggestion = await Suggestion.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false, deletedAt: null },
      { new: true }
    );

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }

    res.json({
      success: true,
      message: 'Suggestion restored from trash',
      data: suggestion
    });
  } catch (error) {
    console.error('Error restoring suggestion:', error);
    res.status(500).json({
      success: false,
      message: 'Error restoring suggestion',
      error: error.message
    });
  }
});

// DELETE /api/admin/suggestions/:id/permanent - Permanently delete
router.delete('/suggestions/:id/permanent', verifyAdminPassword, async (req, res) => {
  try {
    const suggestion = await Suggestion.findByIdAndDelete(req.params.id);
    
    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }

    res.json({
      success: true,
      message: 'Suggestion permanently deleted'
    });
  } catch (error) {
    console.error('Error permanently deleting:', error);
    res.status(500).json({
      success: false,
      message: 'Error permanently deleting suggestion',
      error: error.message
    });
  }
});

// DELETE /api/admin/trash/empty - Empty trash
router.delete('/trash/empty', verifyAdminPassword, async (req, res) => {
  try {
    const result = await Suggestion.deleteMany({ isDeleted: true });

    res.json({
      success: true,
      message: `Permanently deleted ${result.deletedCount} suggestions`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error emptying trash:', error);
    res.status(500).json({
      success: false,
      message: 'Error emptying trash',
      error: error.message
    });
  }
});

export default router;
