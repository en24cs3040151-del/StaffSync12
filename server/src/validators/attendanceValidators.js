import { body } from 'express-validator';
import { ATTENDANCE_STATUS } from '../config/constants.js';

export const manualAttendanceValidator = [
  body('employeeId')
    .notEmpty()
    .withMessage('Employee reference ID is required'),
  body('attendanceDate')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be formatted as YYYY-MM-DD'),
  body('status')
    .isIn(Object.values(ATTENDANCE_STATUS))
    .withMessage('Invalid attendance status')
];
