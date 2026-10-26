import { body } from 'express-validator';
import { DEPARTMENTS, EMPLOYMENT_STATUS, ROLES } from '../config/constants.js';

export const createEmployeeValidator = [
  body('employeeId')
    .trim()
    .notEmpty()
    .withMessage('Employee ID is required')
    .isLength({ max: 20 })
    .withMessage('Employee ID cannot exceed 20 characters'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
  body('workEmail')
    .trim()
    .isEmail()
    .withMessage('Valid work email is required')
    .normalizeEmail(),
  body('department')
    .isIn(DEPARTMENTS)
    .withMessage(`Department must be one of: ${DEPARTMENTS.join(', ')}`),
  body('designation')
    .trim()
    .notEmpty()
    .withMessage('Designation is required'),
  body('role')
    .optional()
    .isIn(Object.values(ROLES))
    .withMessage('Invalid role'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

export const updateEmployeeValidator = [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('department').optional().isIn(DEPARTMENTS).withMessage('Invalid department'),
  body('employmentStatus').optional().isIn(Object.values(EMPLOYMENT_STATUS)).withMessage('Invalid employment status')
];
