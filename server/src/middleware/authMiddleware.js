import { verifyToken } from '../utils/tokenHelper.js';
import { sendError } from '../utils/responseHelper.js';
import User from '../models/User.js';
import { ACCOUNT_STATUS } from '../config/constants.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'Authentication token required. Please log in.', 401);
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return sendError(res, 'Invalid or expired session. Please log in again.', 401);
    }

    const user = await User.findById(decoded.id).populate('employee');
    if (!user) {
      return sendError(res, 'User associated with this token no longer exists.', 401);
    }

    if (user.accountStatus !== ACCOUNT_STATUS.ACTIVE) {
      return sendError(res, 'Your account has been deactivated. Please contact HR.', 403);
    }

    req.user = user;
    req.employee = user.employee || null;
    next();
  } catch (error) {
    return sendError(res, `Authentication error: ${error.message}`, 500);
  }
};
