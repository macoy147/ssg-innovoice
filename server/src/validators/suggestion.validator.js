import { body, param, query } from 'express-validator';

export const createSuggestionValidator = [
  body('category')
    .isIn(['academic', 'administrative', 'extracurricular', 'general'])
    .withMessage('Invalid category'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ max: 2000 })
    .withMessage('Content must be less than 2000 characters'),
  body('isAnonymous')
    .isBoolean()
    .withMessage('isAnonymous must be a boolean'),
  body('submitter.email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  body('submitter.yearLevel')
    .optional()
    .isIn(['1st Year', '2nd Year', '3rd Year', '4th Year', ''])
    .withMessage('Invalid year level'),
  body('image')
    .optional()
    .isString()
    .withMessage('Image must be a string')
];

export const trackingCodeValidator = [
  param('trackingCode')
    .trim()
    .notEmpty()
    .withMessage('Tracking code is required')
    .isLength({ min: 5, max: 50 })
    .withMessage('Invalid tracking code format')
];

export const updateStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid suggestion ID'),
  body('status')
    .isIn(['submitted', 'under_review', 'forwarded', 'action_taken', 'resolved', 'rejected'])
    .withMessage('Invalid status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
];

export const updatePriorityValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid suggestion ID'),
  body('priority')
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority')
];

export const suggestionIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid suggestion ID')
];

export const bulkDeleteValidator = [
  body('ids')
    .isArray({ min: 1 })
    .withMessage('IDs must be a non-empty array'),
  body('ids.*')
    .isMongoId()
    .withMessage('Each ID must be a valid MongoDB ID')
];

export const paginationValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];
