import Announcement from '../models/Announcement.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { createNotification } from '../services/notificationService.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';
import { ROLES, ANNOUNCEMENT_STATUS, NOTIFICATION_TYPES } from '../config/constants.js';

export const getAnnouncements = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, priority, status } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    // HR can view all statuses (drafts, published, archived)
    if (req.user.role === ROLES.HR) {
      if (status) {
        query.publicationStatus = status;
      }
    } else {
      // Non-HR users only view published announcements
      query.publicationStatus = ANNOUNCEMENT_STATUS.PUBLISHED;

      // Filter by audience
      const allowedAudiences = ['ALL'];
      if (req.user.role === ROLES.MANAGER) {
        allowedAudiences.push('MANAGERS');
      }

      const orConditions = [{ audience: { $in: allowedAudiences } }];
      if (req.employee && req.employee.department) {
        orConditions.push({ audience: 'DEPARTMENT', department: req.employee.department });
      }

      query.$or = orConditions;
    }

    if (priority) {
      query.priority = priority;
    }

    const total = await Announcement.countDocuments(query);
    const announcements = await Announcement.find(query)
      .populate('author', 'firstName lastName employeeId designation')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return sendSuccess(res, 'Announcements retrieved', announcements, 200, {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum
    });
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    if (!req.employee) {
      return sendError(res, 'Employee author profile required', 400);
    }

    const {
      title,
      content,
      audience = 'ALL',
      department = null,
      priority = 'NORMAL',
      publicationStatus = ANNOUNCEMENT_STATUS.PUBLISHED,
      expiryDate = null
    } = req.body;

    const announcement = await Announcement.create({
      title,
      content,
      author: req.employee._id,
      audience,
      department: audience === 'DEPARTMENT' ? department : null,
      priority,
      publicationStatus,
      expiryDate: expiryDate ? new Date(expiryDate) : null
    });

    const populated = await Announcement.findById(announcement._id).populate('author', 'firstName lastName employeeId');

    // Notify employees if published
    if (publicationStatus === ANNOUNCEMENT_STATUS.PUBLISHED) {
      const activeUsers = await User.find({ accountStatus: 'ACTIVE' }).select('_id');
      // Create notification for active users (limit to max 50 for performance)
      for (const u of activeUsers.slice(0, 50)) {
        if (u._id.toString() !== req.user._id.toString()) {
          createNotification({
            recipient: u._id,
            title: `Announcement: ${title}`,
            message: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
            type: NOTIFICATION_TYPES.ANNOUNCEMENT,
            relatedResource: { model: 'Announcement', id: announcement._id }
          });
        }
      }
    }

    return sendSuccess(res, 'Announcement created successfully', populated, 201);
  } catch (error) {
    next(error);
  }
};

export const updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return sendError(res, 'Announcement not found', 404);
    }

    const { title, content, audience, department, priority, publicationStatus, expiryDate } = req.body;

    if (title !== undefined) announcement.title = title;
    if (content !== undefined) announcement.content = content;
    if (audience !== undefined) announcement.audience = audience;
    if (department !== undefined) announcement.department = audience === 'DEPARTMENT' ? department : null;
    if (priority !== undefined) announcement.priority = priority;
    if (publicationStatus !== undefined) announcement.publicationStatus = publicationStatus;
    if (expiryDate !== undefined) announcement.expiryDate = expiryDate ? new Date(expiryDate) : null;

    await announcement.save();

    const updated = await Announcement.findById(announcement._id).populate('author', 'firstName lastName employeeId');

    return sendSuccess(res, 'Announcement updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findByIdAndDelete(id);

    if (!announcement) {
      return sendError(res, 'Announcement not found', 404);
    }

    return sendSuccess(res, 'Announcement deleted successfully');
  } catch (error) {
    next(error);
  }
};
