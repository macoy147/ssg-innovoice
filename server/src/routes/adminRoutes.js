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
    const { category, status, search, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (category && category !== 'all') query.category = category;
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { trackingCode: { $regex: search, $options: 'i' } }
      ];
    }

    const suggestions = await Suggestion.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const count = await Suggestion.countDocuments(query);

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
    const total = await Suggestion.countDocuments();
    
    const byCategory = await Suggestion.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    const byStatus = await Suggestion.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const byPriority = await Suggestion.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Recent activity (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentCount = await Suggestion.countDocuments({
      createdAt: { $gte: weekAgo }
    });

    // Anonymous vs identified
    const anonymousCount = await Suggestion.countDocuments({ isAnonymous: true });

    res.json({
      success: true,
      data: {
        total,
        byCategory,
        byStatus,
        byPriority,
        recentCount,
        anonymousCount,
        identifiedCount: total - anonymousCount
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

export default router;
