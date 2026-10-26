import express from 'express';
import {
  getTrainings,
  getTrainingById,
  createTraining,
  updateTraining,
  deleteTraining,
  enrollTraining,
  cancelEnrollment
} from '../controllers/trainingController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { trainingValidator } from '../validators/trainingValidators.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getTrainings);
router.get('/:id', getTrainingById);
router.post('/', authorize(ROLES.HR, ROLES.MANAGER), trainingValidator, validate, createTraining);
router.put('/:id', authorize(ROLES.HR, ROLES.MANAGER), updateTraining);
router.delete('/:id', authorize(ROLES.HR), deleteTraining);
router.post('/:id/enroll', enrollTraining);
router.post('/:id/cancel', cancelEnrollment);

export default router;
