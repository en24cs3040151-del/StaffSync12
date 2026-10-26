import { body } from 'express-validator';
import {
  ANNOUNCEMENT_AUDIENCES,
  ANNOUNCEMENT_PRIORITIES,
  ANNOUNCEMENT_STATUS,
  DEPARTMENTS
} from '../config/constants.js';

export const announcementValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Announcement content is required'),
  body('audience')
    .optional()
    .isIn(ANNOUNCEMENT_AUDIENCES)
    .withMessage('Invalid audience target'),
  body('department')
    .optional({ nullable: true })
    .custom((dept) => {
      if (dept && !DEPARTMENTS.includes(dept)) {
        throw new Error('Invalid department specified for announcement');
      }
      return true;
    }),
  body('priority')
    .optional()
    .isIn(ANNOUNCEMENT_PRIORITIES)
    .withMessage('Invalid priority level'),
  body('publicationStatus')
    .optional()
    .isIn(Object.values(ANNOUNCEMENT_STATUS))
    .withMessage('Invalid publication status')
];
