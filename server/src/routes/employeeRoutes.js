import express from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deactivateEmployee,
  assignManager
} from '../controllers/employeeController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { createEmployeeValidator, updateEmployeeValidator } from '../validators/employeeValidators.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.post('/', authorize(ROLES.HR), createEmployeeValidator, validate, createEmployee);
router.put('/:id', updateEmployeeValidator, validate, updateEmployee);
router.patch('/:id/deactivate', authorize(ROLES.HR), deactivateEmployee);
router.patch('/:id/assign-manager', authorize(ROLES.HR), assignManager);

export default router;
