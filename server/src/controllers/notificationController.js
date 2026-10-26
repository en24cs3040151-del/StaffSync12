import Notification from '../models/Notification.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly = 'false' } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const query = { recipient: req.user._id };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return sendSuccess(res, 'Notifications retrieved', notifications, 200, {
      total,
      unreadCount,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      _id: id,
      recipient: req.user._id
    });

    if (!notification) {
      return sendError(res, 'Notification not found', 404);
    }

    notification.isRead = true;
    await notification.save();

    return sendSuccess(res, 'Notification marked as read', notification);
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    return sendSuccess(res, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};
