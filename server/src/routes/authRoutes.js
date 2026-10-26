import express from 'express';
import { login, getCurrentUser, changePassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { loginValidator, changePasswordValidator } from '../validators/authValidators.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/login', authLimiter, loginValidator, validate, login);
router.get('/me', authenticate, getCurrentUser);
router.post('/change-password', authenticate, changePasswordValidator, validate, changePassword);

export default router;
