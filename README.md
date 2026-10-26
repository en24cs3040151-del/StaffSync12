# StaffSync — Modern Human Resource Management System

> **Tagline:** *"People. Processes. Productivity."*

[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)]()
[![Tests Status](https://img.shields.io/badge/Tests-15%2F15%20Passing-success)]()
[![License](https://img.shields.io/badge/License-ISC-blue)]()
[![Tech Stack](https://img.shields.io/badge/Stack-MERN-orange)]()

---

## Evaluation Links

- **Live Demo URL:** [https://staffsync-demo.example.com](https://staffsync-demo.example.com) *(Replace with your live deployed URL)*
- **GitHub Repository URL:** [https://github.com/your-username/staffsync]([https://github.com/sawanshivhare75/StaffSync]) *(Replace with your GitHub repository URL)*

---

## 1. Project Overview

**StaffSync** is a production-minded, full-stack Human Resource Management System (HRMS) built on the MERN stack (MongoDB, Express.js, React, Node.js). Designed for modern distributed teams and enterprise compliance, StaffSync streamlines day-to-day employee lifecycle processes:
- Role-based authorization across HR Administrators, Managers, and Employees.
- Exact workday attendance clocking with worked-minute calculations and duplicate protections.
- Multi-tier leave applications with calendar collision prevention and mandatory rejection justifications.
- Targeted corporate announcements and professional upskilling workshop enrollment.
- Executive analytical dashboards powered by Recharts with 100% database-derived metrics.

---

## 2. Key Features

### Role-Based Access Control (RBAC)
- **HR Administrator:** Complete employee lifecycle management, account deactivations, manager reassignments, organization-wide attendance ledger, global leave approvals, notice publication, and company analytics.
- **Team Manager:** Dedicated team dashboard, direct-report directory, team daily attendance monitoring, and direct leave request approvals/rejections with mandatory notes.
- **Employee:** Personal self-service dashboard, workday check-in/out, attendance history, leave applications with status tracking, workshop enrollment, and personal profile management.

### Attendance Management Engine
- Standard shift clocking with server-side time stamps.
- Prevention of duplicate clock-ins on the same work date.
- Prevention of check-out before check-in or repeated check-outs.
- Automatic worked duration calculation (`workedMinutes`) and daily status classification (`PRESENT`, `LATE`, `HALF_DAY`, `ABSENT`).
- Filterable organization and team attendance rosters.

### Leave Management & Collision Prevention
- Multi-category support: `ANNUAL`, `SICK`, `CASUAL`, `UNPAID`, `MATERNITY`, `PATERNITY`.
- Automatic calendar day computation with date range validation (end date cannot precede start date).
- **Collision Prevention:** System rejects overlapping pending or approved leave applications for the same employee.
- **Audit-Locked Decisions:** Once approved or rejected, decisions cannot be repeatedly tampered with.
- Rejection reason enforcement (minimum 3 characters required).

### Training, Announcements & Alerts
- Workshop scheduling with seat capacity limits and automatic double-enrollment blocking.
- Targeted announcements (`ALL`, `MANAGERS`, `DEPARTMENT`) with priority tags (`URGENT`, `HIGH`, `NORMAL`, `LOW`).
- Database-backed notification center with unread count badges and mark-all-read capabilities.

---

## 3. Technology Stack

### Frontend
- **Framework:** React 18 with Vite for ultra-fast HMR and optimized production bundles.
- **Routing:** React Router v6 with strict client-side role guards (`ProtectedRoute`).
- **Styling:** Bootstrap 5.3 + Bootstrap Icons + Custom SaaS Design System (Deep Navy `#0f172a`, Indigo `#4f46e5`, Slate neutrals).
- **State Management:** Redux Toolkit (`@reduxjs/toolkit` and `react-redux`) for authentication and notifications.
- **Forms & Validation:** React Hook Form (`react-hook-form`).
- **Data Visualization:** Recharts for attendance trajectories, department distribution, and leave trends.
- **HTTP Client:** Axios with JWT request interceptors and automatic 401 session expiration handling.

### Backend
- **Runtime:** Node.js (ES Modules).
- **Framework:** Express.js.
- **Database & ODM:** MongoDB with Mongoose (with automated in-memory MongoDB fallback for zero-config local testing).
- **Authentication:** JSON Web Tokens (JWT) + bcryptjs password hashing (10 salt rounds).
- **Security:** Helmet (HTTP headers), CORS origin allowlisting, Express Rate Limit (strict auth limiter and global limiter).
- **Testing:** Node.js native test runner (`node --test`) + Supertest.

---

## 4. Application Architecture

```
StaffSync/
├── client/                     # Frontend Vite + React application
│   ├── public/
│   ├── src/
│   │   ├── api/                # Modular Axios API services
│   │   ├── app/                # Redux Toolkit store
│   │   ├── components/         # Reusable UI widgets & layouts
│   │   │   ├── common/         # StatCards, StatusBadges, Spinners, etc.
│   │   ├── features/           # Auth and Notification slices
│   │   ├── layouts/            # MainLayout (Sidebar + Navbar)
│   │   ├── pages/
│   │   │   ├── public/         # Landing, Login, 403, 404
│   │   │   ├── dashboard/      # HR, Manager, and Employee views
│   │   │   ├── employees/      # Directory, Detail, and Modals
│   │   │   ├── attendance/     # Self, Team, and Org Attendance
│   │   │   ├── leaves/         # Apply, Team review, Org manage
│   │   │   ├── announcements/  # Bulletins & publication
│   │   │   ├── trainings/      # Upskilling & class enrollment
│   │   │   ├── profile/        # Profile & Password management
│   │   │   └── reports/        # Recharts visual analytics
│   │   ├── routes/             # AppRoutes with RBAC guards
│   │   └── styles/             # custom.css SaaS theme
│   ├── index.html
│   └── vite.config.js
├── server/                     # Backend Express API & Database
│   ├── src/
│   │   ├── config/             # DB connection, constants, environment
│   │   ├── controllers/        # Request controllers
│   │   ├── middleware/         # Auth, RBAC, validators, rate limiting, errors
│   │   ├── models/             # User, Employee, Attendance, Leave, etc.
│   │   ├── routes/             # Modular REST route trees
│   │   ├── services/           # Notification & business logic services
│   │   ├── utils/              # Token, date math, response helpers
│   │   ├── app.js              # Express app setup
│   │   └── server.js           # Server entry point
│   ├── scripts/
│   │   └── seed.js             # Fictional enterprise seed script
│   └── tests/                  # Automated API & business rule test suites
├── README.md
├── package.json
└── .env.example
```

---

## 5. Environment Setup

Copy `.env.example` in both `server/` and `client/` directories:

### Backend (`server/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/staffsync
JWT_SECRET=super_secret_jwt_key_staffsync_enterprise_2026_dev
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 6. Installation & Quickstart

### Prerequisites
- Node.js v18+ (tested on Node v24).
- MongoDB (Optional: If local MongoDB is not running, StaffSync automatically switches to an in-memory MongoDB instance for seamless, zero-friction local execution).

### Step 1: Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 2: Seed the Database
```bash
cd ../server
npm run seed
```

### Step 3: Start the Backend and Frontend Servers
In terminal 1 (Backend):
```bash
cd server
npm run dev
# Running on http://localhost:5000
```

In terminal 2 (Frontend):
```bash
cd client
npm run dev
# Running on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 7. Demo Accounts & Personas (Development Only)

All seeded development accounts share the password: **`StaffSync2026!`**

| Role | Name | Email | Default Password | Scope of Access |
| :--- | :--- | :--- | :--- | :--- |
| **HR Administrator** | Eleanor Vance | `hr@staffsync.io` | `StaffSync2026!` | Full organization CRUD, Global Attendance, All Leaves, Analytics |
| **Team Manager** | Marcus Brody | `manager@staffsync.io` | `StaffSync2026!` | Engineering Team (3 direct reports), Team Attendance, Leave Decisions |
| **Employee** | Sophia Chen | `employee@staffsync.io` | `StaffSync2026!` | Self check-in/out, Leave applications, Workshop enrollment |
| **Employee** | David Kim | `david.kim@staffsync.io` | `StaffSync2026!` | Self-service attendance & leave portal |

> **Note:** Quick 1-click login buttons are provided on the Login Page and Landing Page to populate credentials instantly during evaluations.

---

## 8. Automated Testing

StaffSync features automated integration and unit test suites covering Authentication, Role-Based Access Control, Attendance State Machine, and Leave Collisions.

Run tests:
```bash
cd server
npm test
```

### Test Results
- **Auth & RBAC Suite:**
  - `✔ rejects invalid password with 401`
  - `✔ allows current user profile retrieval for authenticated employee`
  - `✔ blocks unauthenticated access to protected routes with 401`
  - `✔ allows HR to access full employee management`
  - `✔ blocks regular employees from creating new employee records with 403 Forbidden`
  - `✔ allows HR to successfully create a new employee`
- **Attendance & Leave Suite:**
  - `✔ allows employee to check in for the current workday`
  - `✔ rejects duplicate check-in on the same day with 409 Conflict`
  - `✔ allows employee to check out and calculates worked minutes`
  - `✔ rejects duplicate check-out with 409 Conflict`
  - `✔ rejects leave application where end date precedes start date`
  - `✔ allows employee to apply for leave with valid future dates`
  - `✔ prevents overlapping leave requests for the same employee`
  - `✔ allows authorized manager to review and approve direct report leave`
  - `✔ prevents repeated review of an already resolved leave request`
- **Total: 15 / 15 Passed (100% success rate)**

---

## 9. Production Build

To verify production bundle compilation:
```bash
cd client
npm run build
```
Builds statically minified assets to `client/dist/` in ~3.3s.

---

## 10. Known Limitations & Future Improvements

### Known Limitations
- Attendance is recorded via browser clock-in and standard server timestamps; physical biometric or GPS geofencing hardware is not integrated in this version.
- Real-time notifications utilize database persistence with state-based refresh; WebSocket push is slated for a future release.

### Future Improvements
- Multi-currency payroll generation with PDF payslip export.
- Biometric & RFID device webhooks for hardware-integrated turnstiles.
- WebSocket real-time push for instant manager-to-employee notifications.
- Multi-factor authentication (MFA/TOTP) using authenticator apps.
