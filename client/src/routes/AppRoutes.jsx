import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import ProtectedRoute from '../components/common/ProtectedRoute.jsx';
import { ROLES } from '../utils/constants.js';

// Public Pages
import LandingPage from '../pages/public/LandingPage.jsx';
import LoginPage from '../pages/public/LoginPage.jsx';
import UnauthorizedPage from '../pages/public/UnauthorizedPage.jsx';
import NotFoundPage from '../pages/public/NotFoundPage.jsx';

// Shared & Role Pages
import DashboardPage from '../pages/dashboard/DashboardPage.jsx';
import EmployeeDirectoryPage from '../pages/employees/EmployeeDirectoryPage.jsx';
import EmployeeDetailPage from '../pages/employees/EmployeeDetailPage.jsx';
import MyAttendancePage from '../pages/attendance/MyAttendancePage.jsx';
import TeamAttendancePage from '../pages/attendance/TeamAttendancePage.jsx';
import OrgAttendancePage from '../pages/attendance/OrgAttendancePage.jsx';
import MyLeavesPage from '../pages/leaves/MyLeavesPage.jsx';
import TeamLeavesPage from '../pages/leaves/TeamLeavesPage.jsx';
import LeaveManagementPage from '../pages/leaves/LeaveManagementPage.jsx';
import AnnouncementsPage from '../pages/announcements/AnnouncementsPage.jsx';
import TrainingsPage from '../pages/trainings/TrainingsPage.jsx';
import NotificationsPage from '../pages/notifications/NotificationsPage.jsx';
import ReportsPage from '../pages/reports/ReportsPage.jsx';
import MyProfilePage from '../pages/profile/MyProfilePage.jsx';
import AccountSettingsPage from '../pages/profile/AccountSettingsPage.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Authenticated Application Routes wrapped in MainLayout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<MyProfilePage />} />
        <Route path="/settings" element={<AccountSettingsPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/trainings" element={<TrainingsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Self-service Attendance & Leaves */}
        <Route path="/attendance/my" element={<MyAttendancePage />} />
        <Route path="/leaves/my" element={<MyLeavesPage />} />

        {/* Manager-Protected Routes */}
        <Route
          path="/team"
          element={
            <ProtectedRoute allowedRoles={[ROLES.MANAGER, ROLES.HR]}>
              <EmployeeDirectoryPage teamOnly={true} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/team"
          element={
            <ProtectedRoute allowedRoles={[ROLES.MANAGER, ROLES.HR]}>
              <TeamAttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaves/team"
          element={
            <ProtectedRoute allowedRoles={[ROLES.MANAGER, ROLES.HR]}>
              <TeamLeavesPage />
            </ProtectedRoute>
          }
        />

        {/* HR-Protected Routes */}
        <Route
          path="/employees"
          element={
            <ProtectedRoute allowedRoles={[ROLES.HR]}>
              <EmployeeDirectoryPage teamOnly={false} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/:id"
          element={
            <ProtectedRoute allowedRoles={[ROLES.HR, ROLES.MANAGER]}>
              <EmployeeDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/org"
          element={
            <ProtectedRoute allowedRoles={[ROLES.HR]}>
              <OrgAttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaves/manage"
          element={
            <ProtectedRoute allowedRoles={[ROLES.HR]}>
              <LeaveManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={[ROLES.HR]}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
