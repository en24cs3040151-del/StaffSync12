import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import { createNotification } from '../services/notificationService.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';
import { calculateDaysCount } from '../utils/dateUtils.js';
import { LEAVE_STATUS, ROLES, NOTIFICATION_TYPES } from '../config/constants.js';

export const applyLeave = async (req, res, next) => {
  try {
    if (!req.employee) {
      return sendError(res, 'Employee profile required to apply for leave', 400);
    }

    const { leaveType, startDate, endDate, reason } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return sendError(res, 'End date cannot be earlier than start date', 400);
    }

    // Check for overlapping active leaves (PENDING or APPROVED)
    const overlapping = await Leave.findOne({
      employee: req.employee._id,
      status: { $in: [LEAVE_STATUS.PENDING, LEAVE_STATUS.APPROVED] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlapping) {
      return sendError(
        res,
        `You already have an active leave request (${overlapping.status}) overlapping this period (${new Date(overlapping.startDate).toLocaleDateString()} - ${new Date(overlapping.endDate).toLocaleDateString()})`,
        409
      );
    }

    const daysCount = calculateDaysCount(start, end);

    const leave = await Leave.create({
      employee: req.employee._id,
      leaveType,
      startDate: start,
      endDate: end,
      daysCount,
      reason,
      status: LEAVE_STATUS.PENDING
    });

    // Notify assigned manager or HR
    if (req.employee.manager) {
      const managerEmployee = await Employee.findById(req.employee.manager);
      if (managerEmployee && managerEmployee.user) {
        await createNotification({
          recipient: managerEmployee.user,
          title: 'New Leave Request',
          message: `${req.employee.firstName} ${req.employee.lastName} submitted a ${leaveType} leave request for ${daysCount} day(s).`,
          type: NOTIFICATION_TYPES.LEAVE,
          relatedResource: { model: 'Leave', id: leave._id }
        });
      }
    }

    const populated = await Leave.findById(leave._id).populate('employee', 'firstName lastName employeeId department');

    return sendSuccess(res, 'Leave request submitted successfully', populated, 201);
  } catch (error) {
    next(error);
  }
};

export const getMyLeaves = async (req, res, next) => {
  try {
    if (!req.employee) {
      return sendError(res, 'Employee profile required', 400);
    }

    const { page = 1, limit = 10, status } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const query = { employee: req.employee._id };
    if (status) {
      query.status = status;
    }

    const total = await Leave.countDocuments(query);
    const leaves = await Leave.find(query)
      .populate('reviewer', 'firstName lastName employeeId designation')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return sendSuccess(res, 'My leave requests retrieved', leaves, 200, {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum
    });
  } catch (error) {
    next(error);
  }
};

export const getTeamLeaves = async (req, res, next) => {
  try {
    if (!req.employee) {
      return sendError(res, 'Manager profile required', 400);
    }

    const { page = 1, limit = 10, status } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Find all direct reports
    const team = await Employee.find({ manager: req.employee._id }).select('_id');
    const teamIds = team.map((t) => t._id);

    const query = { employee: { $in: teamIds } };
    if (status) {
      query.status = status;
    }

    const total = await Leave.countDocuments(query);
    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName employeeId department designation workEmail')
      .populate('reviewer', 'firstName lastName employeeId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return sendSuccess(res, 'Team leave requests retrieved', leaves, 200, {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum
    });
  } catch (error) {
    next(error);
  }
};

export const getAllLeaves = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      department,
      employeeId,
      search
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (employeeId) {
      query.employee = employeeId;
    }

    if (department || (search && search.trim())) {
      const empQuery = {};
      if (department) empQuery.department = department;
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        empQuery.$or = [{ firstName: regex }, { lastName: regex }, { employeeId: regex }];
      }
      const emps = await Employee.find(empQuery).select('_id');
      query.employee = { $in: emps.map((e) => e._id) };
    }

    const total = await Leave.countDocuments(query);
    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName employeeId department designation workEmail')
      .populate('reviewer', 'firstName lastName employeeId designation')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return sendSuccess(res, 'All leave requests retrieved', leaves, 200, {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum
    });
  } catch (error) {
    next(error);
  }
};

export const reviewLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reviewReason } = req.body;

    const leave = await Leave.findById(id).populate('employee');
    if (!leave) {
      return sendError(res, 'Leave request not found', 404);
    }

    // Prevent repeated reviews
    if (leave.status !== LEAVE_STATUS.PENDING) {
      return sendError(res, `This leave request is already ${leave.status} and cannot be modified`, 400);
    }

    // Role and assignment check
    const isHR = req.user.role === ROLES.HR;
    const isManager =
      req.user.role === ROLES.MANAGER &&
      req.employee &&
      leave.employee.manager &&
      leave.employee.manager.toString() === req.employee._id.toString();

    if (!isHR && !isManager) {
      return sendError(res, 'You are not authorized to review this leave request', 403);
    }

    // Prevent self-approval
    if (req.employee && req.employee._id.toString() === leave.employee._id.toString()) {
      return sendError(res, 'You cannot review or approve your own leave request', 403);
    }

    leave.status = status;
    leave.reviewReason = reviewReason || '';
    leave.reviewer = req.employee ? req.employee._id : null;
    leave.reviewTimestamp = new Date();

    await leave.save();

    // Notify employee of the decision
    if (leave.employee.user) {
      await createNotification({
        recipient: leave.employee.user,
        title: `Leave Request ${status}`,
        message: `Your ${leave.leaveType} leave request for ${leave.daysCount} day(s) was ${status.toLowerCase()}.${
          reviewReason ? ` Note: ${reviewReason}` : ''
        }`,
        type: NOTIFICATION_TYPES.LEAVE,
        relatedResource: { model: 'Leave', id: leave._id }
      });
    }

    const updated = await Leave.findById(leave._id)
      .populate('employee', 'firstName lastName employeeId department')
      .populate('reviewer', 'firstName lastName employeeId');

    return sendSuccess(res, `Leave request has been ${status.toLowerCase()}`, updated);
  } catch (error) {
    next(error);
  }
};

export const cancelLeave = async (req, res, next) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findById(id);
    if (!leave) {
      return sendError(res, 'Leave request not found', 404);
    }

    if (!req.employee || leave.employee.toString() !== req.employee._id.toString()) {
      return sendError(res, 'You can only cancel your own leave request', 403);
    }

    if (leave.status !== LEAVE_STATUS.PENDING) {
      return sendError(res, 'Only pending leave requests can be cancelled', 400);
    }

    leave.status = LEAVE_STATUS.CANCELLED;
    await leave.save();

    return sendSuccess(res, 'Leave request cancelled successfully', leave);
  } catch (error) {
    next(error);
  }
};
