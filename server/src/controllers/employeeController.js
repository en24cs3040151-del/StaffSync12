import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';
import { ROLES, ACCOUNT_STATUS, EMPLOYMENT_STATUS } from '../config/constants.js';

export const getEmployees = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      department = '',
      employmentStatus = '',
      managerId = '',
      teamOnly = 'false'
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    // Filter by department
    if (department) {
      query.department = department;
    }

    // Filter by employmentStatus
    if (employmentStatus) {
      query.employmentStatus = employmentStatus;
    }

    // Manager requesting their team only
    if (teamOnly === 'true' && req.employee) {
      query.manager = req.employee._id;
    } else if (managerId) {
      query.manager = managerId;
    }

    // Search query across name, employeeId, workEmail
    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { firstName: regex },
        { lastName: regex },
        { employeeId: regex },
        { workEmail: regex },
        { designation: regex }
      ];
    }

    const total = await Employee.countDocuments(query);
    const employees = await Employee.find(query)
      .populate('user', 'role accountStatus email lastLogin')
      .populate('manager', 'firstName lastName employeeId workEmail')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return sendSuccess(res, 'Employees fetched successfully', employees, 200, {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id)
      .populate('user', 'role accountStatus email lastLogin')
      .populate('manager', 'firstName lastName employeeId workEmail designation');

    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    return sendSuccess(res, 'Employee retrieved successfully', employee);
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req, res, next) => {
  try {
    const {
      employeeId,
      firstName,
      lastName,
      workEmail,
      phone,
      department,
      designation,
      manager,
      joiningDate,
      role = ROLES.EMPLOYEE,
      password,
      address,
      emergencyContact
    } = req.body;

    // Check duplicate employee ID
    const existingEmpId = await Employee.findOne({ employeeId: employeeId.toUpperCase() });
    if (existingEmpId) {
      return sendError(res, `Employee ID '${employeeId}' is already registered`, 409);
    }

    // Check duplicate email in User and Employee
    const existingUser = await User.findOne({ email: workEmail.toLowerCase() });
    if (existingUser) {
      return sendError(res, `Email address '${workEmail}' is already in use`, 409);
    }

    const rawPassword = password || 'StaffSync@123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawPassword, salt);

    // Create User account
    const user = await User.create({
      name: `${firstName} ${lastName}`.trim(),
      email: workEmail.toLowerCase(),
      passwordHash,
      role,
      accountStatus: ACCOUNT_STATUS.ACTIVE
    });

    // Create Employee record
    const employee = await Employee.create({
      employeeId: employeeId.toUpperCase(),
      user: user._id,
      firstName,
      lastName,
      workEmail: workEmail.toLowerCase(),
      phone: phone || '',
      department,
      designation,
      manager: manager || null,
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      employmentStatus: EMPLOYMENT_STATUS.ACTIVE,
      address: address || {},
      emergencyContact: emergencyContact || {}
    });

    // Link employee to user
    user.employee = employee._id;
    await user.save();

    const populatedEmployee = await Employee.findById(employee._id)
      .populate('user', 'role accountStatus email')
      .populate('manager', 'firstName lastName employeeId');

    return sendSuccess(
      res,
      'Employee created successfully',
      {
        employee: populatedEmployee,
        initialPassword: rawPassword
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);

    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    const isHR = req.user.role === ROLES.HR;
    const isSelf = req.employee && req.employee._id.toString() === employee._id.toString();

    if (!isHR && !isSelf) {
      return sendError(res, 'You are not authorized to edit this employee record', 403);
    }

    // HR can update all fields
    if (isHR) {
      const allowedFields = [
        'firstName',
        'lastName',
        'phone',
        'department',
        'designation',
        'manager',
        'joiningDate',
        'employmentStatus',
        'profileImage',
        'address',
        'emergencyContact'
      ];

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          employee[field] = req.body[field];
        }
      });

      // Update role if passed
      if (req.body.role && employee.user) {
        await User.findByIdAndUpdate(employee.user, {
          role: req.body.role,
          name: `${employee.firstName} ${employee.lastName}`.trim()
        });
      }
    } else {
      // Employees can only update personal contact details
      const selfFields = ['phone', 'address', 'emergencyContact', 'profileImage'];
      selfFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          employee[field] = req.body[field];
        }
      });
    }

    await employee.save();

    const updated = await Employee.findById(employee._id)
      .populate('user', 'role accountStatus email')
      .populate('manager', 'firstName lastName employeeId workEmail');

    return sendSuccess(res, 'Employee updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const deactivateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);

    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    employee.employmentStatus = EMPLOYMENT_STATUS.INACTIVE;
    await employee.save();

    if (employee.user) {
      await User.findByIdAndUpdate(employee.user, { accountStatus: ACCOUNT_STATUS.INACTIVE });
    }

    return sendSuccess(res, `Employee ${employee.employeeId} deactivated successfully`);
  } catch (error) {
    next(error);
  }
};

export const assignManager = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { managerId } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    if (managerId) {
      const managerExists = await Employee.findById(managerId);
      if (!managerExists) {
        return sendError(res, 'Selected manager does not exist', 404);
      }
      if (managerId.toString() === id.toString()) {
        return sendError(res, 'An employee cannot be their own manager', 400);
      }
    }

    employee.manager = managerId || null;
    await employee.save();

    return sendSuccess(res, 'Manager assigned successfully', employee);
  } catch (error) {
    next(error);
  }
};
