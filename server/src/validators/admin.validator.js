import { body, query } from 'express-validator';

export const adminVerifyValidator = [
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('Invalid password format')
];

export const activityLogQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('Limit must be between 1 and 200'),
  query('adminRole')
    .optional()
    .isIn(['executive', 'press_secretary', 'network_secretary', 'developer', 'all'])
    .withMessage('Invalid admin role'),
  query('action')
    .optional()
    .isString()
    .withMessage('Action must be a string'),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for dateFrom'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for dateTo')
];
