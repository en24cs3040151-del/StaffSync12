import { body } from 'express-validator';
import { TRAINING_STATUS } from '../config/constants.js';

export const trainingValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Training title is required')
    .isLength({ max: 200 })
    .withMessage('Training title cannot exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Training description is required'),
  body('instructor')
    .trim()
    .notEmpty()
    .withMessage('Instructor name is required'),
  body('scheduleDate')
    .isISO8601()
    .withMessage('Valid schedule date is required'),
  body('durationHours')
    .isFloat({ min: 0.5, max: 100 })
    .withMessage('Duration must be between 0.5 and 100 hours'),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Capacity must be between 1 and 1000'),
  body('status')
    .optional()
    .isIn(Object.values(TRAINING_STATUS))
    .withMessage('Invalid training status')
];
