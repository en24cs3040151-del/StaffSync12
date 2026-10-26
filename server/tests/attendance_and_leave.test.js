import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { seedDatabase } from '../scripts/seed.js';
import Attendance from '../src/models/Attendance.js';
import Leave from '../src/models/Leave.js';
import { getTodayDateString } from '../src/utils/dateUtils.js';

describe('StaffSync Attendance & Leave Business Rules Suite', () => {
  let hrToken = '';
  let managerToken = '';
  let employeeToken = '';
  let employeeProfile = null;

  before(async () => {
    await seedDatabase();

    // Log in David Kim (EMP-004) who hasn't checked in today in seed
    const empRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'david.kim@staffsync.io', password: 'StaffSync2026!' });
    employeeToken = empRes.body.data.token;
    employeeProfile = empRes.body.data.user.employee;

    // Log in Manager
    const mgrRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@staffsync.io', password: 'StaffSync2026!' });
    managerToken = mgrRes.body.data.token;

    // Log in HR
    const hrRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'hr@staffsync.io', password: 'StaffSync2026!' });
    hrToken = hrRes.body.data.token;
  });

  after(async () => {
    await disconnectDB();
  });

  it('allows employee to check in for the current workday', async () => {
    const res = await request(app)
      .post('/api/attendance/check-in')
      .set('Authorization', `Bearer ${employeeToken}`);
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.checkInTime);
  });

  it('rejects duplicate check-in on the same day with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/attendance/check-in')
      .set('Authorization', `Bearer ${employeeToken}`);
    assert.strictEqual(res.status, 409);
    assert.match(res.body.message, /already checked in/i);
  });

  it('allows employee to check out and calculates worked minutes', async () => {
    const res = await request(app)
      .post('/api/attendance/check-out')
      .set('Authorization', `Bearer ${employeeToken}`);
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.data.checkOutTime);
    assert.strictEqual(typeof res.body.data.workedMinutes, 'number');
  });

  it('rejects duplicate check-out with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/attendance/check-out')
      .set('Authorization', `Bearer ${employeeToken}`);
    assert.strictEqual(res.status, 409);
    assert.match(res.body.message, /already checked out/i);
  });

  it('rejects leave application where end date precedes start date', async () => {
    const res = await request(app)
      .post('/api/leaves/apply')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        leaveType: 'CASUAL',
        startDate: '2026-12-10',
        endDate: '2026-12-05',
        reason: 'Backwards time travel'
      });
    assert.strictEqual(res.status, 422);
  });

  it('allows employee to apply for leave with valid future dates', async () => {
    const res = await request(app)
      .post('/api/leaves/apply')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        leaveType: 'CASUAL',
        startDate: '2026-12-01',
        endDate: '2026-12-03',
        reason: 'Personal family gathering'
      });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.data.status, 'PENDING');
    assert.strictEqual(res.body.data.daysCount, 3);
  });

  it('prevents overlapping leave requests for the same employee', async () => {
    const res = await request(app)
      .post('/api/leaves/apply')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        leaveType: 'SICK',
        startDate: '2026-12-02',
        endDate: '2026-12-04',
        reason: 'Overlapping request'
      });
    assert.strictEqual(res.status, 409);
    assert.match(res.body.message, /overlapping/i);
  });

  it('allows authorized manager to review and approve direct report leave', async () => {
    // Find a pending leave for David Kim
    const pendingLeave = await Leave.findOne({
      employee: employeeProfile._id,
      status: 'PENDING'
    });
    assert.ok(pendingLeave);

    const res = await request(app)
      .patch(`/api/leaves/${pendingLeave._id}/review`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        status: 'APPROVED',
        reviewReason: 'Approved by manager, coverage assigned.'
      });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.status, 'APPROVED');
  });

  it('prevents repeated review of an already resolved leave request', async () => {
    const approvedLeave = await Leave.findOne({
      employee: employeeProfile._id,
      status: 'APPROVED'
    });

    const res = await request(app)
      .patch(`/api/leaves/${approvedLeave._id}/review`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        status: 'REJECTED',
        reviewReason: 'Changing mind'
      });
    assert.strictEqual(res.status, 400);
    assert.match(res.body.message, /already APPROVED/i);
  });
});
