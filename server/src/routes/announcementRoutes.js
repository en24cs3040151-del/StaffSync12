import express from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} from '../controllers/announcementController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { announcementValidator } from '../validators/announcementValidators.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAnnouncements);
router.post('/', authorize(ROLES.HR), announcementValidator, validate, createAnnouncement);
router.put('/:id', authorize(ROLES.HR), announcementValidator, validate, updateAnnouncement);
router.delete('/:id', authorize(ROLES.HR), deleteAnnouncement);

export default router;
