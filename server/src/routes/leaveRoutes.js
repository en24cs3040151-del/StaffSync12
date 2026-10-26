import express from 'express';
import {
  applyLeave,
  getMyLeaves,
  getTeamLeaves,
  getAllLeaves,
  reviewLeave,
  cancelLeave
} from '../controllers/leaveController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { applyLeaveValidator, reviewLeaveValidator } from '../validators/leaveValidators.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);

router.post('/apply', applyLeaveValidator, validate, applyLeave);
router.get('/my', getMyLeaves);
router.get('/team', authorize(ROLES.MANAGER, ROLES.HR), getTeamLeaves);
router.get('/all', authorize(ROLES.HR), getAllLeaves);
router.patch('/:id/review', authorize(ROLES.MANAGER, ROLES.HR), reviewLeaveValidator, validate, reviewLeave);
router.patch('/:id/cancel', cancelLeave);

export default router;
