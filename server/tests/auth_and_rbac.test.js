import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { seedDatabase } from '../scripts/seed.js';

describe('StaffSync Auth & RBAC Suite', () => {
  let hrToken = '';
  let managerToken = '';
  let employeeToken = '';

  before(async () => {
    await seedDatabase();

    // Log in HR
    const hrRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'hr@staffsync.io', password: 'StaffSync2026!' });
    assert.strictEqual(hrRes.status, 200);
    hrToken = hrRes.body.data.token;

    // Log in Manager
    const mgrRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@staffsync.io', password: 'StaffSync2026!' });
    assert.strictEqual(mgrRes.status, 200);
    managerToken = mgrRes.body.data.token;

    // Log in Employee
    const empRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'employee@staffsync.io', password: 'StaffSync2026!' });
    assert.strictEqual(empRes.status, 200);
    employeeToken = empRes.body.data.token;
  });

  after(async () => {
    await disconnectDB();
  });

  it('rejects invalid password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'hr@staffsync.io', password: 'WrongPassword123' });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  it('allows current user profile retrieval for authenticated employee', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${employeeToken}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.role, 'EMPLOYEE');
    assert.ok(res.body.data.employee);
  });

  it('blocks unauthenticated access to protected routes with 401', async () => {
    const res = await request(app).get('/api/employees');
    assert.strictEqual(res.status, 401);
  });

  it('allows HR to access full employee management', async () => {
    const res = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${hrToken}`);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
  });

  it('blocks regular employees from creating new employee records with 403 Forbidden', async () => {
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        employeeId: 'EMP-999',
        firstName: 'Test',
        lastName: 'Unauthorized',
        workEmail: 'unauthorized@staffsync.io',
        department: 'Engineering',
        designation: 'Hacker'
      });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
  });

  it('allows HR to successfully create a new employee', async () => {
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${hrToken}`)
      .send({
        employeeId: 'EMP-099',
        firstName: 'Elena',
        lastName: 'Rostova',
        workEmail: 'elena.rostova@staffsync.io',
        phone: '+1 (555) 777-8888',
        department: 'Sales',
        designation: 'Enterprise Account Executive',
        role: 'EMPLOYEE'
      });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.data.employee.employeeId, 'EMP-099');
  });
});
