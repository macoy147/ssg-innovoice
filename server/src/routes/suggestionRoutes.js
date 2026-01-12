import express from 'express';
import { body, validationResult } from 'express-validator';
import Suggestion from '../models/Suggestion.js';
import { analyzePriority } from '../services/aiPriorityService.js';

const router = express.Router();

// Validation middleware
const validateSuggestion = [
  body('category').isIn(['academic', 'administrative', 'extracurricular', 'general'])
    .withMessage('Invalid category'),
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title must be less than 200 characters'),
  body('content').trim().notEmpty().withMessage('Content is required')
    .isLength({ max: 2000 }).withMessage('Content must be less than 2000 characters'),
  body('isAnonymous').isBoolean().withMessage('isAnonymous must be a boolean'),
  body('submitter.email').optional().isEmail().withMessage('Invalid email format'),
  body('submitter.yearLevel').optional().isIn(['1st Year', '2nd Year', '3rd Year', '4th Year', ''])
];

// POST /api/suggestions - Create new suggestion
router.post('/', validateSuggestion, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    // AI Priority Analysis
    console.log('');
    console.log('🔄 Processing new suggestion submission...');
    const { priority, reason, aiAnalyzed } = await analyzePriority(
      req.body.title,
      req.body.content,
      req.body.category
    );

    const suggestionData = {
      category: req.body.category,
      title: req.body.title,
      content: req.body.content,
      isAnonymous: req.body.isAnonymous,
      priority: priority, // AI-determined priority
      aiPriorityReason: reason // Store the reason for transparency
    };

    // Add submitter info if not anonymous
    if (!req.body.isAnonymous && req.body.submitter) {
      suggestionData.submitter = {
        name: req.body.submitter.name || '',
        studentId: req.body.submitter.studentId || '',
        email: req.body.submitter.email || '',
        contactNumber: req.body.submitter.contactNumber || '',
        course: req.body.submitter.course || '',
        yearLevel: req.body.submitter.yearLevel || '',
        wantsFollowUp: req.body.submitter.wantsFollowUp || false
      };
    }

    const suggestion = new Suggestion(suggestionData);
    await suggestion.save();

    res.status(201).json({
      success: true,
      message: 'Suggestion submitted successfully',
      data: {
        trackingCode: suggestion.trackingCode,
        category: suggestion.category,
        title: suggestion.title,
        status: suggestion.status,
        priority: suggestion.priority,
        aiPriorityReason: suggestion.aiPriorityReason,
        aiAnalyzed: aiAnalyzed,
        createdAt: suggestion.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating suggestion:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting suggestion',
      error: error.message
    });
  }
});

// GET /api/suggestions/track/:trackingCode - Track suggestion
router.get('/track/:trackingCode', async (req, res) => {
  try {
    const suggestion = await Suggestion.findOne({ 
      trackingCode: req.params.trackingCode.toUpperCase() 
    }).select('-__v');

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found with this tracking code'
      });
    }

    // Hide submitter info if anonymous
    const responseData = suggestion.toObject();
    if (responseData.isAnonymous) {
      delete responseData.submitter;
    }

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error tracking suggestion:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking suggestion',
      error: error.message
    });
  }
});

// GET /api/suggestions - Get all suggestions (for admin)
router.get('/', async (req, res) => {
  try {
    const { category, status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;

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
        pages: Math.ceil(count / limit)
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

// GET /api/suggestions/stats - Get statistics
router.get('/stats', async (req, res) => {
  try {
    const total = await Suggestion.countDocuments();
    const byCategory = await Suggestion.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const byStatus = await Suggestion.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        total,
        byCategory,
        byStatus
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
