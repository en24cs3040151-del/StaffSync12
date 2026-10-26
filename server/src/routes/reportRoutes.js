import express from 'express';
import {
  getHRDashboardMetrics,
  getManagerDashboardMetrics,
  getEmployeeDashboardMetrics
} from '../controllers/reportController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);

router.get('/hr-dashboard', authorize(ROLES.HR), getHRDashboardMetrics);
router.get('/manager-dashboard', authorize(ROLES.MANAGER, ROLES.HR), getManagerDashboardMetrics);
router.get('/employee-dashboard', getEmployeeDashboardMetrics);

export default router;
