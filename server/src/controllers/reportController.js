import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Training from '../models/Training.js';
import Announcement from '../models/Announcement.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';
import { getTodayDateString } from '../utils/dateUtils.js';
import { ATTENDANCE_STATUS, LEAVE_STATUS, TRAINING_STATUS, EMPLOYMENT_STATUS } from '../config/constants.js';

export const getHRDashboardMetrics = async (req, res, next) => {
  try {
    const today = getTodayDateString();

    const [
      totalEmployees,
      todayAttendances,
      pendingLeaves,
      upcomingTrainings,
      departmentStats,
      leaveStats
    ] = await Promise.all([
      Employee.countDocuments({ employmentStatus: EMPLOYMENT_STATUS.ACTIVE }),
      Attendance.find({ attendanceDate: today }),
      Leave.countDocuments({ status: LEAVE_STATUS.PENDING }),
      Training.countDocuments({ status: TRAINING_STATUS.UPCOMING }),
      Employee.aggregate([
        { $match: { employmentStatus: EMPLOYMENT_STATUS.ACTIVE } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $project: { department: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } }
      ]),
      Leave.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } }
      ])
    ]);

    const presentCount = todayAttendances.filter((a) => a.checkInTime !== null).length;
    const lateCount = todayAttendances.filter((a) => a.status === ATTENDANCE_STATUS.LATE).length;
    const absentCount = Math.max(0, totalEmployees - presentCount);

    // Calculate last 7 days attendance trend
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(getTodayDateString(d));
    }

    const pastAttendances = await Attendance.find({
      attendanceDate: { $in: last7Days }
    });

    const attendanceTrend = last7Days.map((dateStr) => {
      const recordsForDay = pastAttendances.filter((a) => a.attendanceDate === dateStr);
      return {
        date: dateStr.slice(5), // MM-DD
        present: recordsForDay.filter((a) => a.checkInTime !== null).length,
        late: recordsForDay.filter((a) => a.status === ATTENDANCE_STATUS.LATE).length,
        halfDay: recordsForDay.filter((a) => a.status === ATTENDANCE_STATUS.HALF_DAY).length
      };
    });

    return sendSuccess(res, 'HR dashboard metrics loaded', {
      totalEmployees,
      presentToday: presentCount,
      absentToday: absentCount,
      lateToday: lateCount,
      pendingLeaves,
      upcomingTrainings,
      departmentBreakdown: departmentStats,
      leaveDistribution: leaveStats,
      attendanceTrend
    });
  } catch (error) {
    next(error);
  }
};

export const getManagerDashboardMetrics = async (req, res, next) => {
  try {
    if (!req.employee) {
      return sendError(res, 'Manager employee profile required', 400);
    }

    const today = getTodayDateString();
    const teamMembers = await Employee.find({ manager: req.employee._id, employmentStatus: EMPLOYMENT_STATUS.ACTIVE });
    const teamIds = teamMembers.map((m) => m._id);

    const [todayAttendances, pendingLeaves, upcomingTrainings] = await Promise.all([
      Attendance.find({ employee: { $in: teamIds }, attendanceDate: today }),
      Leave.countDocuments({ employee: { $in: teamIds }, status: LEAVE_STATUS.PENDING }),
      Training.countDocuments({ status: TRAINING_STATUS.UPCOMING })
    ]);

    const presentCount = todayAttendances.filter((a) => a.checkInTime !== null).length;
    const absentCount = Math.max(0, teamMembers.length - presentCount);

    const recentTeamLeaves = await Leave.find({ employee: { $in: teamIds } })
      .populate('employee', 'firstName lastName employeeId department designation')
      .sort({ createdAt: -1 })
      .limit(5);

    return sendSuccess(res, 'Manager dashboard metrics loaded', {
      teamSize: teamMembers.length,
      teamPresentToday: presentCount,
      teamAbsentToday: absentCount,
      pendingLeaveRequests: pendingLeaves,
      upcomingTrainings,
      recentTeamLeaves
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeDashboardMetrics = async (req, res, next) => {
  try {
    if (!req.employee) {
      return sendError(res, 'Employee profile required', 400);
    }

    const today = getTodayDateString();

    const [todayAttendance, totalLeaves, approvedLeaves, pendingLeaves, enrolledTrainings, announcements] =
      await Promise.all([
        Attendance.findOne({ employee: req.employee._id, attendanceDate: today }),
        Leave.countDocuments({ employee: req.employee._id }),
        Leave.countDocuments({ employee: req.employee._id, status: LEAVE_STATUS.APPROVED }),
        Leave.countDocuments({ employee: req.employee._id, status: LEAVE_STATUS.PENDING }),
        Training.countDocuments({
          'enrollments.employee': req.employee._id,
          'enrollments.status': 'ENROLLED'
        }),
        Announcement.countDocuments({ publicationStatus: 'PUBLISHED' })
      ]);

    // Calculate total worked hours this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const startStr = getTodayDateString(startOfMonth);

    const monthlyAttendances = await Attendance.find({
      employee: req.employee._id,
      attendanceDate: { $gte: startStr }
    });

    const totalMinutesWorkedThisMonth = monthlyAttendances.reduce((acc, curr) => acc + (curr.workedMinutes || 0), 0);
    const daysAttendedThisMonth = monthlyAttendances.filter((a) => a.checkInTime).length;

    return sendSuccess(res, 'Employee dashboard metrics loaded', {
      todayAttendance,
      monthlySummary: {
        totalHoursWorked: (totalMinutesWorkedThisMonth / 60).toFixed(1),
        daysAttended: daysAttendedThisMonth
      },
      leaveSummary: {
        total: totalLeaves,
        approved: approvedLeaves,
        pending: pendingLeaves
      },
      enrolledTrainingsCount: enrolledTrainings,
      publishedAnnouncementsCount: announcements
    });
  } catch (error) {
    next(error);
  }
};
