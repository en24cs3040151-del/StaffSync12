import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { generateToken } from '../utils/tokenHelper.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';
import { ACCOUNT_STATUS } from '../config/constants.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+passwordHash')
      .populate({
        path: 'employee',
        populate: { path: 'manager', select: 'firstName lastName employeeId workEmail' }
      });

    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    if (user.accountStatus !== ACCOUNT_STATUS.ACTIVE) {
      return sendError(res, 'Account is deactivated. Contact your HR administrator.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401);
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role
    });

    const userObj = user.toObject();
    delete userObj.passwordHash;

    return sendSuccess(res, 'Login successful', {
      token,
      user: userObj
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'employee',
        populate: { path: 'manager', select: 'firstName lastName employeeId workEmail designation' }
      });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, 'Current user profile retrieved', user);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 'Current password is incorrect', 400);
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    return sendSuccess(res, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};
