import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar.jsx';
import Navbar from '../components/common/Navbar.jsx';

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Determine page title based on path
  const getPageTitle = (path) => {
    if (path.startsWith('/dashboard')) return 'Overview Dashboard';
    if (path.startsWith('/employees')) return 'Employee Directory';
    if (path.startsWith('/team')) return 'Team Directory';
    if (path.startsWith('/attendance/my')) return 'My Attendance';
    if (path.startsWith('/attendance/team')) return 'Team Attendance';
    if (path.startsWith('/attendance/org')) return 'Organization Attendance';
    if (path.startsWith('/leaves/my')) return 'My Leave Requests';
    if (path.startsWith('/leaves/team')) return 'Team Leave Approvals';
    if (path.startsWith('/leaves/manage')) return 'Organization Leave Management';
    if (path.startsWith('/announcements')) return 'Announcements';
    if (path.startsWith('/trainings')) return 'Training & Upskilling Programs';
    if (path.startsWith('/notifications')) return 'Notifications Center';
    if (path.startsWith('/reports')) return 'Reports & Analytics';
    if (path.startsWith('/profile')) return 'My Profile';
    if (path.startsWith('/settings')) return 'Account Settings';
    return 'StaffSync';
  };

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          pageTitle={getPageTitle(location.pathname)}
        />
        <main className="p-3 p-md-4 flex-grow-1">
          <Outlet />
        </main>
        <footer className="p-3 bg-white border-top text-center text-muted small">
          StaffSync &copy; {new Date().getFullYear()} &mdash; People. Processes. Productivity.
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
