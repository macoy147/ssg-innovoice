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

const router = express.Router();

// POST /api/suggestions - Create new suggestion
router.post(
  '/', 
  createSuggestionValidator, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      // Map request to DTO
      const dto = new CreateSuggestionDTO(req.body);
      
      // Process through service
      const { suggestion, aiAnalyzed } = await suggestionService.createSuggestion(dto);

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
