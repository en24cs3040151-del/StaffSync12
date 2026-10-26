import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';
import { getTodayDateString, calculateWorkedMinutes } from '../utils/dateUtils.js';
import { ATTENDANCE_STATUS, ROLES } from '../config/constants.js';

export const checkIn = async (req, res, next) => {
  try {
    if (!req.employee) {
      return sendError(res, 'Employee profile required to mark attendance', 400);
    }

    const today = getTodayDateString();
    let record = await Attendance.findOne({
      employee: req.employee._id,
      attendanceDate: today
    });

    if (record && record.checkInTime) {
      return sendError(res, 'You have already checked in for today', 409);
    }

    const now = new Date();
    // Standard start is 09:30 AM. After 9:30 is considered LATE
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);
    const initialStatus = isLate ? ATTENDANCE_STATUS.LATE : ATTENDANCE_STATUS.PRESENT;

    if (!record) {
      record = new Attendance({
        employee: req.employee._id,
        attendanceDate: today,
        checkInTime: now,
        status: initialStatus
      });
    } else {
      record.checkInTime = now;
      record.status = initialStatus;
    }

    await record.save();

    return sendSuccess(res, 'Checked in successfully', record, 201);
  } catch (error) {
    next(error);
  }
};

export const checkOut = async (req, res, next) => {
  try {
    if (!req.employee) {
      return sendError(res, 'Employee profile required to mark attendance', 400);
    }

    const today = getTodayDateString();
    const record = await Attendance.findOne({
      employee: req.employee._id,
      attendanceDate: today
    });

    if (!record || !record.checkInTime) {
      return sendError(res, 'Cannot check out before checking in', 400);
    }

    if (record.checkOutTime) {
      return sendError(res, 'You have already checked out for today', 409);
    }

    const now = new Date();
    record.checkOutTime = now;
    const minutes = calculateWorkedMinutes(record.checkInTime, now);
    record.workedMinutes = minutes;

    // Rule: < 4 hours (240 mins) is HALF_DAY. Otherwise keep PRESENT or LATE.
    if (minutes < 240 && record.status !== ATTENDANCE_STATUS.LATE) {
      record.status = ATTENDANCE_STATUS.HALF_DAY;
    }

    await record.save();

    return sendSuccess(res, 'Checked out successfully', record);
  } catch (error) {
    next(error);
  }
};

export const getTodayStatus = async (req, res, next) => {
  try {
    if (!req.employee) {
      return sendError(res, 'Employee profile required', 400);
    }

    const today = getTodayDateString();
    const record = await Attendance.findOne({
      employee: req.employee._id,
      attendanceDate: today
    });

    return sendSuccess(res, "Today's attendance status", {
      date: today,
      serverTime: new Date(),
      attendance: record || null
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAttendanceHistory = async (req, res, next) => {
  try {
    if (!req.employee) {
      return sendError(res, 'Employee profile required', 400);
    }

    const { page = 1, limit = 15, startDate, endDate, status } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const query = { employee: req.employee._id };

    if (startDate && endDate) {
      query.attendanceDate = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.attendanceDate = { $gte: startDate };
    } else if (endDate) {
      query.attendanceDate = { $lte: endDate };
    }

    if (status) {
      query.status = status;
    }

    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .sort({ attendanceDate: -1 })
      .skip(skip)
      .limit(limitNum);

    return sendSuccess(res, 'Attendance history retrieved', records, 200, {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum
    });
  } catch (error) {
    next(error);
  }
};

export const getTeamAttendance = async (req, res, next) => {
  try {
    if (!req.employee) {
      return sendError(res, 'Manager employee profile required', 400);
    }

    const { date = getTodayDateString(), status } = req.query;

    // Find all team members managed by this employee
    const teamMembers = await Employee.find({ manager: req.employee._id }).select('_id firstName lastName employeeId designation workEmail department');
    const teamMemberIds = teamMembers.map((m) => m._id);

    const query = {
      employee: { $in: teamMemberIds },
      attendanceDate: date
    };

    if (status) {
      query.status = status;
    }

    const records = await Attendance.find(query).populate('employee', 'firstName lastName employeeId designation department workEmail');

    // Cross-reference with team members to show who hasn't checked in (ABSENT)
    const attendanceMap = new Map();
    records.forEach((r) => {
      if (r.employee) {
        attendanceMap.set(r.employee._id.toString(), r);
      }
    });

    const fullTeamAttendance = teamMembers.map((member) => {
      const record = attendanceMap.get(member._id.toString());
      if (record) {
        return record;
      }
      return {
        _id: null,
        employee: member,
        attendanceDate: date,
        checkInTime: null,
        checkOutTime: null,
        status: ATTENDANCE_STATUS.ABSENT,
        workedMinutes: 0
      };
    });

    return sendSuccess(res, 'Team attendance retrieved', {
      date,
      totalTeam: teamMembers.length,
      presentCount: records.length,
      attendance: fullTeamAttendance
    });
  } catch (error) {
    next(error);
  }
};

export const getOrgAttendance = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      date = getTodayDateString(),
      department = '',
      status = '',
      search = ''
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Build employee filter first
    const empFilter = { employmentStatus: 'ACTIVE' };
    if (department) {
      empFilter.department = department;
    }
    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      empFilter.$or = [
        { firstName: regex },
        { lastName: regex },
        { employeeId: regex },
        { workEmail: regex }
      ];
    }

    const matchingEmployees = await Employee.find(empFilter).select('_id firstName lastName employeeId department designation');
    const empIds = matchingEmployees.map((e) => e._id);

    const attendanceQuery = {
      attendanceDate: date,
      employee: { $in: empIds }
    };

    if (status) {
      attendanceQuery.status = status;
    }

    const total = await Attendance.countDocuments(attendanceQuery);
    const records = await Attendance.find(attendanceQuery)
      .populate('employee', 'firstName lastName employeeId department designation workEmail')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return sendSuccess(res, 'Organization attendance records retrieved', records, 200, {
      total,
      date,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum
    });
  } catch (error) {
    next(error);
  }
};

export const recordManualAttendance = async (req, res, next) => {
  try {
    const { employeeId, attendanceDate, checkInTime, checkOutTime, status, notes } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    let record = await Attendance.findOne({
      employee: employeeId,
      attendanceDate
    });

    const checkIn = checkInTime ? new Date(checkInTime) : null;
    const checkOut = checkOutTime ? new Date(checkOutTime) : null;
    const workedMinutes = checkIn && checkOut ? calculateWorkedMinutes(checkIn, checkOut) : 0;

    if (record) {
      record.checkInTime = checkIn;
      record.checkOutTime = checkOut;
      record.status = status || record.status;
      record.workedMinutes = workedMinutes;
      record.notes = notes || record.notes;
      await record.save();
    } else {
      record = await Attendance.create({
        employee: employeeId,
        attendanceDate,
        checkInTime: checkIn,
        checkOutTime: checkOut,
        status: status || ATTENDANCE_STATUS.PRESENT,
        workedMinutes,
        notes: notes || ''
      });
    }

    const populated = await Attendance.findById(record._id).populate('employee', 'firstName lastName employeeId department');

    return sendSuccess(res, 'Attendance record updated successfully', populated);
  } catch (error) {
    next(error);
  }
};
