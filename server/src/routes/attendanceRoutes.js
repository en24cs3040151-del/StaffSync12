import express from 'express';
import {
  checkIn,
  checkOut,
  getTodayStatus,
  getMyAttendanceHistory,
  getTeamAttendance,
  getOrgAttendance,
  recordManualAttendance
} from '../controllers/attendanceController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { manualAttendanceValidator } from '../validators/attendanceValidators.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/today', getTodayStatus);
router.get('/my-history', getMyAttendanceHistory);
router.get('/team', authorize(ROLES.MANAGER, ROLES.HR), getTeamAttendance);
router.get('/org', authorize(ROLES.HR), getOrgAttendance);
router.post('/manual', authorize(ROLES.HR), manualAttendanceValidator, validate, recordManualAttendance);

export default router;
