import express from 'express';
import suggestionService from '../services/suggestionService.js';
import { 
  CreateSuggestionDTO, 
  PublicSuggestionResponseDTO, 
  CreateSuggestionResponseDTO 
} from '../dto/suggestion.dto.js';
import { 
  createSuggestionValidator, 
  trackingCodeValidator 
} from '../validators/suggestion.validator.js';
import { handleValidationErrors } from '../middleware/validationMiddleware.js';
import logger from '../utils/logger.js';

import { optionalStudentAuth } from '../middleware/studentMiddleware.js';
import studentAuthService from '../services/studentAuthService.js';
import notificationEmitter from '../utils/notificationEmitter.js';

const router = express.Router();

// POST /api/suggestions - Create new suggestion
router.post(
  '/', 
  optionalStudentAuth,
  createSuggestionValidator, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const studentId = req.studentUser?._id || req.studentId;

      // Map request to DTO with authenticated user link
      const dto = new CreateSuggestionDTO({
        ...req.body,
        userId: studentId || null
      });
      
      // Process through service
      const { suggestion, aiAnalyzed } = await suggestionService.createSuggestion(dto);

      // If student is logged in, attach tracking code to their saved reports
      if (studentId) {
        try {
          await studentAuthService.attachTrackingCodeToStudent(
            studentId,
            suggestion.trackingCode,
            suggestion.title,
            true
          );
        } catch (attachErr) {
          logger.warn('Failed to attach tracking code to student record', { error: attachErr.message });
        }
      }

      // Broadcast real-time live notification to all online admins
      try {
        notificationEmitter.emit('new_suggestion', {
          _id: suggestion._id,
          trackingCode: suggestion.trackingCode,
          title: suggestion.title,
          category: suggestion.category,
          priority: suggestion.priority,
          type: suggestion.type,
          isAnonymous: suggestion.isAnonymous,
          submitterName: suggestion.submitter?.name || '',
          submitterEmail: suggestion.submitter?.email || '',
          status: suggestion.status,
          isRead: suggestion.isRead,
          createdAt: suggestion.createdAt
        });
      } catch (broadcastErr) {
        logger.warn('Failed to broadcast real-time notification', { error: broadcastErr.message });
      }

      // Map to response DTO
      const responseDto = new CreateSuggestionResponseDTO(suggestion, aiAnalyzed);

      res.status(201).json({
        success: true,
        message: 'Suggestion submitted successfully',
        data: responseDto
      });
    } catch (error) {
      logger.error('Error in create suggestion endpoint', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to submit suggestion. Please try again later.'
      });
    }
  }
);

// GET /api/suggestions/track/:trackingCode - Track suggestion
router.get(
  '/track/:trackingCode', 
  trackingCodeValidator, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const suggestion = await suggestionService.getSuggestionByTrackingCode(
        req.params.trackingCode
      );

      if (!suggestion) {
        return res.status(404).json({
          success: false,
          message: 'Suggestion not found with this tracking code'
        });
      }

      // Use public DTO to hide sensitive information
      const responseDto = new PublicSuggestionResponseDTO(suggestion);

      res.json({
        success: true,
        data: responseDto
      });
    } catch (error) {
      logger.error('Error in track suggestion endpoint', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to track suggestion. Please try again later.'
      });
    }
  }
);

export default router;
