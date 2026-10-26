import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Employee from '../src/models/Employee.js';
import Attendance from '../src/models/Attendance.js';
import Leave from '../src/models/Leave.js';
import Announcement from '../src/models/Announcement.js';
import Training from '../src/models/Training.js';
import Notification from '../src/models/Notification.js';
import {
  ROLES,
  ACCOUNT_STATUS,
  EMPLOYMENT_STATUS,
  ATTENDANCE_STATUS,
  LEAVE_TYPES,
  LEAVE_STATUS,
  NOTIFICATION_TYPES
} from '../src/config/constants.js';
import { getTodayDateString } from '../src/utils/dateUtils.js';

dotenv.config();

const DEFAULT_PASSWORD = 'StaffSync2026!';

export const seedDatabase = async () => {
  console.log('[Seed] Connecting to database...');
  await connectDB();

  console.log('[Seed] Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Employee.deleteMany({}),
    Attendance.deleteMany({}),
    Leave.deleteMany({}),
    Announcement.deleteMany({}),
    Training.deleteMany({}),
    Notification.deleteMany({})
  ]);

  console.log('[Seed] Creating demo user and employee accounts...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, salt);

  // 1. HR Administrator
  const hrUser = await User.create({
    name: 'Eleanor Vance',
    email: 'hr@staffsync.io',
    passwordHash,
    role: ROLES.HR,
    accountStatus: ACCOUNT_STATUS.ACTIVE,
    lastLogin: new Date()
  });

  const hrEmp = await Employee.create({
    employeeId: 'EMP-001',
    user: hrUser._id,
    firstName: 'Eleanor',
    lastName: 'Vance',
    workEmail: 'hr@staffsync.io',
    phone: '+1 (555) 234-5671',
    department: 'Human Resources',
    designation: 'VP of People Operations',
    joiningDate: new Date('2022-01-15'),
    employmentStatus: EMPLOYMENT_STATUS.ACTIVE,
    address: { street: '100 Metro Tower', city: 'San Francisco', state: 'CA', postalCode: '94105', country: 'USA' },
    emergencyContact: { name: 'Robert Vance', relationship: 'Spouse', phone: '+1 (555) 234-5679' }
  });

  hrUser.employee = hrEmp._id;
  await hrUser.save();

  // 2. Manager (Engineering Director)
  const managerUser = await User.create({
    name: 'Marcus Brody',
    email: 'manager@staffsync.io',
    passwordHash,
    role: ROLES.MANAGER,
    accountStatus: ACCOUNT_STATUS.ACTIVE,
    lastLogin: new Date()
  });

  const managerEmp = await Employee.create({
    employeeId: 'EMP-002',
    user: managerUser._id,
    firstName: 'Marcus',
    lastName: 'Brody',
    workEmail: 'manager@staffsync.io',
    phone: '+1 (555) 345-6782',
    department: 'Engineering',
    designation: 'Engineering Director',
    manager: hrEmp._id,
    joiningDate: new Date('2022-03-01'),
    employmentStatus: EMPLOYMENT_STATUS.ACTIVE,
    address: { street: '450 Innovation Way', city: 'San Jose', state: 'CA', postalCode: '95112', country: 'USA' },
    emergencyContact: { name: 'Sarah Brody', relationship: 'Spouse', phone: '+1 (555) 345-6789' }
  });

  managerUser.employee = managerEmp._id;
  await managerUser.save();

  // 3. Team Employees under Marcus
  const employeeData = [
    {
      firstName: 'Sophia',
      lastName: 'Chen',
      email: 'employee@staffsync.io', // standard employee login
      employeeId: 'EMP-003',
      department: 'Engineering',
      designation: 'Senior Full-Stack Engineer',
      manager: managerEmp._id,
      phone: '+1 (555) 456-7893'
    },
    {
      firstName: 'David',
      lastName: 'Kim',
      email: 'david.kim@staffsync.io',
      employeeId: 'EMP-004',
      department: 'Engineering',
      designation: 'Frontend Engineer',
      manager: managerEmp._id,
      phone: '+1 (555) 567-8904'
    },
    {
      firstName: 'Aisha',
      lastName: 'Patel',
      email: 'aisha.patel@staffsync.io',
      employeeId: 'EMP-005',
      department: 'Engineering',
      designation: 'DevOps & Cloud Engineer',
      manager: managerEmp._id,
      phone: '+1 (555) 678-9015'
    },
    {
      firstName: 'Lucas',
      lastName: 'Ramirez',
      email: 'lucas.ramirez@staffsync.io',
      employeeId: 'EMP-006',
      department: 'Product',
      designation: 'Lead Product Designer',
      manager: hrEmp._id,
      phone: '+1 (555) 789-0126'
    },
    {
      firstName: 'Olivia',
      lastName: 'Taylor',
      email: 'olivia.taylor@staffsync.io',
      employeeId: 'EMP-007',
      department: 'Marketing',
      designation: 'Growth Marketing Lead',
      manager: hrEmp._id,
      phone: '+1 (555) 890-1237'
    },
    {
      firstName: 'James',
      lastName: 'Wilson',
      email: 'james.wilson@staffsync.io',
      employeeId: 'EMP-008',
      department: 'Finance',
      designation: 'Senior Financial Analyst',
      manager: hrEmp._id,
      phone: '+1 (555) 901-2348'
    }
  ];

  const createdEmployees = [];
  for (const item of employeeData) {
    const user = await User.create({
      name: `${item.firstName} ${item.lastName}`,
      email: item.email,
      passwordHash,
      role: ROLES.EMPLOYEE,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      lastLogin: new Date(Date.now() - Math.floor(Math.random() * 86400000))
    });

    const emp = await Employee.create({
      employeeId: item.employeeId,
      user: user._id,
      firstName: item.firstName,
      lastName: item.lastName,
      workEmail: item.email,
      phone: item.phone,
      department: item.department,
      designation: item.designation,
      manager: item.manager,
      joiningDate: new Date('2023-05-10'),
      employmentStatus: EMPLOYMENT_STATUS.ACTIVE,
      address: { street: '123 Market St', city: 'San Francisco', state: 'CA', postalCode: '94103', country: 'USA' },
      emergencyContact: { name: 'Emergency Contact', relationship: 'Family', phone: '+1 (555) 000-1111' }
    });

    user.employee = emp._id;
    await user.save();
    createdEmployees.push(emp);
  }

  const allEmps = [hrEmp, managerEmp, ...createdEmployees];
  console.log(`[Seed] Created ${allEmps.length} active employees across ${new Set(allEmps.map(e => e.department)).size} departments.`);

  // 4. Seed Attendance Records for the last 7 days
  console.log('[Seed] Generating realistic attendance data for past 7 days...');
  const todayStr = getTodayDateString();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getTodayDateString(d);
    const isToday = dateStr === todayStr;

    for (const emp of allEmps) {
      // Today: some employees have checked in, some haven't yet
      if (isToday) {
        if (emp.employeeId === 'EMP-001' || emp.employeeId === 'EMP-002' || emp.employeeId === 'EMP-003') {
          const checkIn = new Date();
          checkIn.setHours(9, 15, 0, 0);
          await Attendance.create({
            employee: emp._id,
            attendanceDate: dateStr,
            checkInTime: checkIn,
            checkOutTime: null, // Still active
            status: ATTENDANCE_STATUS.PRESENT,
            workedMinutes: 0
          });
        }
      } else {
        // Historical workdays: skip weekend if Saturday (6) or Sunday (0)
        const dayOfWeek = d.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        const isLate = Math.random() < 0.2;
        const checkIn = new Date(d);
        checkIn.setHours(isLate ? 10 : 9, Math.floor(Math.random() * 25), 0, 0);

        const checkOut = new Date(d);
        checkOut.setHours(17, Math.floor(Math.random() * 50) + 10, 0, 0);

        const workedMinutes = Math.floor((checkOut - checkIn) / (1000 * 60));

        await Attendance.create({
          employee: emp._id,
          attendanceDate: dateStr,
          checkInTime: checkIn,
          checkOutTime: checkOut,
          status: isLate ? ATTENDANCE_STATUS.LATE : ATTENDANCE_STATUS.PRESENT,
          workedMinutes
        });
      }
    }
  }

  // 5. Seed Leave Requests
  console.log('[Seed] Generating sample leave requests with varied statuses...');
  const sophia = createdEmployees.find(e => e.employeeId === 'EMP-003');
  const david = createdEmployees.find(e => e.employeeId === 'EMP-004');
  const aisha = createdEmployees.find(e => e.employeeId === 'EMP-005');
  const lucas = createdEmployees.find(e => e.employeeId === 'EMP-006');

  // Approved Leave
  await Leave.create({
    employee: sophia._id,
    leaveType: 'ANNUAL',
    startDate: new Date('2026-11-10'),
    endDate: new Date('2026-11-13'),
    daysCount: 4,
    reason: 'Attending family wedding and visiting relatives in Seattle.',
    status: LEAVE_STATUS.APPROVED,
    reviewer: managerEmp._id,
    reviewReason: 'Approved. Enjoy the wedding, Sophia! Team coverage is coordinated.',
    reviewTimestamp: new Date()
  });

  // Pending Leave for Manager Review
  await Leave.create({
    employee: david._id,
    leaveType: 'SICK',
    startDate: new Date('2026-10-28'),
    endDate: new Date('2026-10-29'),
    daysCount: 2,
    reason: 'Scheduled wisdom tooth removal surgery and post-op recovery.',
    status: LEAVE_STATUS.PENDING
  });

  // Rejected Leave
  await Leave.create({
    employee: aisha._id,
    leaveType: 'CASUAL',
    startDate: new Date('2026-11-02'),
    endDate: new Date('2026-11-02'),
    daysCount: 1,
    reason: 'Personal errands in downtown.',
    status: LEAVE_STATUS.REJECTED,
    reviewer: managerEmp._id,
    reviewReason: 'Major production infrastructure migration is scheduled on Nov 2nd. Please reschedule for the following week.',
    reviewTimestamp: new Date()
  });

  // Pending Leave for HR Review
  await Leave.create({
    employee: lucas._id,
    leaveType: 'ANNUAL',
    startDate: new Date('2026-11-20'),
    endDate: new Date('2026-11-25'),
    daysCount: 6,
    reason: 'Thanksgiving holiday travel vacation.',
    status: LEAVE_STATUS.PENDING
  });

  // 6. Seed Announcements
  console.log('[Seed] Publishing corporate announcements...');
  await Announcement.create([
    {
      title: 'StaffSync Q4 All-Hands Town Hall & 2027 Vision',
      content: 'Join us this Thursday at 3:00 PM PST in the Main Auditorium or via the live broadcast link for our quarterly review, key milestones celebration, and roadmap unveiling.',
      author: hrEmp._id,
      audience: 'ALL',
      priority: 'HIGH',
      publicationStatus: 'PUBLISHED',
      publishDate: new Date()
    },
    {
      title: 'Annual Benefits Open Enrollment Period Open',
      content: 'The 2027 benefits enrollment window is now active. Please review your healthcare plans, HSA allocations, and commuter perks before the deadline on November 15th.',
      author: hrEmp._id,
      audience: 'ALL',
      priority: 'NORMAL',
      publicationStatus: 'PUBLISHED',
      publishDate: new Date()
    },
    {
      title: 'Engineering Architecture Sync & SOC-2 Compliance Update',
      content: 'All engineering team leads and managers are requested to attend the mandatory SOC-2 Type II audit readiness session on Tuesday at 10:00 AM.',
      author: hrEmp._id,
      audience: 'MANAGERS',
      department: 'Engineering',
      priority: 'URGENT',
      publicationStatus: 'PUBLISHED',
      publishDate: new Date()
    },
    {
      title: 'New Design Tokens and Component Guidelines in Figma',
      content: 'The StaffSync design system tokens have been updated to v3.0. Please review the updated color palette and typography scales for upcoming sprint items.',
      author: hrEmp._id,
      audience: 'DEPARTMENT',
      department: 'Product',
      priority: 'NORMAL',
      publicationStatus: 'PUBLISHED',
      publishDate: new Date()
    }
  ]);

  // 7. Seed Training Programs
  console.log('[Seed] Scheduling training and development workshops...');
  await Training.create([
    {
      title: 'Mastering Cloud Architecture with Kubernetes',
      description: 'Hands-on intensive workshop exploring microservices deployment, ingress controllers, cluster scaling, and production zero-downtime rollouts.',
      instructor: 'Dr. Michael Hansen',
      scheduleDate: new Date('2026-11-05T14:00:00Z'),
      durationHours: 4,
      capacity: 25,
      department: 'Engineering',
      status: 'UPCOMING',
      enrollments: [
        { employee: sophia._id, enrolledAt: new Date(), status: 'ENROLLED' },
        { employee: david._id, enrolledAt: new Date(), status: 'ENROLLED' }
      ]
    },
    {
      title: 'Empathetic Leadership and High-Impact 1-on-1s',
      description: 'Core leadership workshop focusing on psychological safety, constructive feedback loops, career mentoring, and team retention.',
      instructor: 'Eleanor Vance',
      scheduleDate: new Date('2026-11-12T16:00:00Z'),
      durationHours: 3,
      capacity: 15,
      department: 'All',
      status: 'UPCOMING',
      enrollments: [
        { employee: managerEmp._id, enrolledAt: new Date(), status: 'ENROLLED' }
      ]
    },
    {
      title: 'Advanced MongoDB Aggregation Pipelines & Query Indexing',
      description: 'Deep dive into MongoDB 8 aggregation stages, compound indexes, explain plans, and latency minimization for data-intensive apps.',
      instructor: 'Sarah Jenkins',
      scheduleDate: new Date('2026-11-18T15:00:00Z'),
      durationHours: 3.5,
      capacity: 30,
      department: 'Engineering',
      status: 'UPCOMING',
      enrollments: [
        { employee: aisha._id, enrolledAt: new Date(), status: 'ENROLLED' }
      ]
    }
  ]);

  // 8. Seed Notifications
  console.log('[Seed] Seeding sample notifications...');
  await Notification.create([
    {
      recipient: managerUser._id,
      title: 'New Leave Request Submitted',
      message: 'David Kim has applied for 2 days of Sick leave.',
      type: NOTIFICATION_TYPES.LEAVE,
      isRead: false
    },
    {
      recipient: sophia.user,
      title: 'Leave Request Approved',
      message: 'Your Annual leave for Nov 10 - Nov 13 has been approved by Marcus Brody.',
      type: NOTIFICATION_TYPES.LEAVE,
      isRead: true
    },
    {
      recipient: hrUser._id,
      title: 'System Notice: Daily Attendance Ready',
      message: 'Today\'s organization attendance report is now available for review.',
      type: NOTIFICATION_TYPES.ATTENDANCE,
      isRead: false
    }
  ]);

  console.log('====================================================');
  console.log(' [Seed] StaffSync Database Seeded Successfully!');
  console.log(' Default Login Password: ' + DEFAULT_PASSWORD);
  console.log(' HR Admin:  hr@staffsync.io');
  console.log(' Manager:   manager@staffsync.io');
  console.log(' Employee:  employee@staffsync.io (Sophia Chen)');
  console.log('====================================================');
};

if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed] Error seeding database:', err);
      process.exit(1);
    });
}
