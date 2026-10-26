import { body } from 'express-validator';
import { LEAVE_TYPES, LEAVE_STATUS } from '../config/constants.js';

export const applyLeaveValidator = [
  body('leaveType')
    .isIn(LEAVE_TYPES)
    .withMessage(`Leave type must be one of: ${LEAVE_TYPES.join(', ')}`),
  body('startDate')
    .isISO8601()
    .withMessage('Valid start date required (YYYY-MM-DD)'),
  body('endDate')
    .isISO8601()
    .withMessage('Valid end date required (YYYY-MM-DD)')
    .custom((endDate, { req }) => {
      if (new Date(endDate) < new Date(req.body.startDate)) {
        throw new Error('End date cannot be earlier than start date');
      }
      return true;
    }),
  body('reason')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason must be between 5 and 500 characters')
];

export const reviewLeaveValidator = [
  body('status')
    .isIn([LEAVE_STATUS.APPROVED, LEAVE_STATUS.REJECTED])
    .withMessage('Status must be either APPROVED or REJECTED'),
  body('reviewReason')
    .trim()
    .custom((value, { req }) => {
      if (req.body.status === LEAVE_STATUS.REJECTED && (!value || value.length < 3)) {
        throw new Error('A rejection reason of at least 3 characters is required');
      }
      return true;
    })
];
