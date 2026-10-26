import Training from '../models/Training.js';
import Employee from '../models/Employee.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';
import { ROLES, TRAINING_STATUS } from '../config/constants.js';

export const getTrainings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, department, search } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (department && department !== 'All') {
      query.$or = [{ department: department }, { department: null }, { department: 'All' }];
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: regex }, { instructor: regex }, { description: regex }];
    }

    const total = await Training.countDocuments(query);
    const trainings = await Training.find(query)
      .populate('enrollments.employee', 'firstName lastName employeeId department designation workEmail')
      .sort({ scheduleDate: 1 })
      .skip(skip)
      .limit(limitNum);

    return sendSuccess(res, 'Trainings retrieved successfully', trainings, 200, {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum
    });
  } catch (error) {
    next(error);
  }
};

export const getTrainingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const training = await Training.findById(id).populate(
      'enrollments.employee',
      'firstName lastName employeeId department designation workEmail'
    );

    if (!training) {
      return sendError(res, 'Training program not found', 404);
    }

    return sendSuccess(res, 'Training program retrieved', training);
  } catch (error) {
    next(error);
  }
};

export const createTraining = async (req, res, next) => {
  try {
    const {
      title,
      description,
      instructor,
      scheduleDate,
      durationHours,
      capacity = 30,
      department = 'All'
    } = req.body;

    const training = await Training.create({
      title,
      description,
      instructor,
      scheduleDate: new Date(scheduleDate),
      durationHours,
      capacity,
      department: department || 'All',
      status: TRAINING_STATUS.UPCOMING
    });

    return sendSuccess(res, 'Training program created successfully', training, 201);
  } catch (error) {
    next(error);
  }
};

export const updateTraining = async (req, res, next) => {
  try {
    const { id } = req.params;
    const training = await Training.findById(id);

    if (!training) {
      return sendError(res, 'Training program not found', 404);
    }

    const { title, description, instructor, scheduleDate, durationHours, capacity, status, department } = req.body;

    if (title !== undefined) training.title = title;
    if (description !== undefined) training.description = description;
    if (instructor !== undefined) training.instructor = instructor;
    if (scheduleDate !== undefined) training.scheduleDate = new Date(scheduleDate);
    if (durationHours !== undefined) training.durationHours = durationHours;
    if (capacity !== undefined) training.capacity = capacity;
    if (status !== undefined) training.status = status;
    if (department !== undefined) training.department = department;

    await training.save();

    return sendSuccess(res, 'Training program updated successfully', training);
  } catch (error) {
    next(error);
  }
};

export const deleteTraining = async (req, res, next) => {
  try {
    const { id } = req.params;
    const training = await Training.findByIdAndDelete(id);

    if (!training) {
      return sendError(res, 'Training program not found', 404);
    }

    return sendSuccess(res, 'Training program deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const enrollTraining = async (req, res, next) => {
  try {
    if (!req.employee) {
      return sendError(res, 'Employee profile required to enroll', 400);
    }

    const { id } = req.params;
    const training = await Training.findById(id);

    if (!training) {
      return sendError(res, 'Training program not found', 404);
    }

    if (training.status === TRAINING_STATUS.CANCELLED || training.status === TRAINING_STATUS.COMPLETED) {
      return sendError(res, `Cannot enroll in a training that is ${training.status.toLowerCase()}`, 400);
    }

    // Check duplicate enrollment
    const alreadyEnrolled = training.enrollments.some(
      (e) => e.employee.toString() === req.employee._id.toString() && e.status === 'ENROLLED'
    );

    if (alreadyEnrolled) {
      return sendError(res, 'You are already enrolled in this training program', 409);
    }

    // Check capacity
    const activeEnrollments = training.enrollments.filter((e) => e.status === 'ENROLLED');
    if (activeEnrollments.length >= training.capacity) {
      return sendError(res, 'This training program has reached maximum capacity', 400);
    }

    training.enrollments.push({
      employee: req.employee._id,
      enrolledAt: new Date(),
      status: 'ENROLLED'
    });

    await training.save();

    const updated = await Training.findById(id).populate(
      'enrollments.employee',
      'firstName lastName employeeId department designation'
    );

    return sendSuccess(res, 'Enrolled in training program successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const cancelEnrollment = async (req, res, next) => {
  try {
    if (!req.employee) {
      return sendError(res, 'Employee profile required', 400);
    }

    const { id } = req.params;
    const training = await Training.findById(id);

    if (!training) {
      return sendError(res, 'Training program not found', 404);
    }

    const enrollmentIndex = training.enrollments.findIndex(
      (e) => e.employee.toString() === req.employee._id.toString() && e.status === 'ENROLLED'
    );

    if (enrollmentIndex === -1) {
      return sendError(res, 'You are not actively enrolled in this program', 400);
    }

    training.enrollments[enrollmentIndex].status = 'CANCELLED';
    await training.save();

    return sendSuccess(res, 'Enrollment cancelled successfully', training);
  } catch (error) {
    next(error);
  }
};
