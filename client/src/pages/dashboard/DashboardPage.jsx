import React from 'react';
import { useSelector } from 'react-redux';
import { ROLES } from '../../utils/constants.js';
import HRDashboardView from './HRDashboardView.jsx';
import ManagerDashboardView from './ManagerDashboardView.jsx';
import EmployeeDashboardView from './EmployeeDashboardView.jsx';

export const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role;

  if (role === ROLES.HR) {
    return <HRDashboardView />;
  }

  if (role === ROLES.MANAGER) {
    return <ManagerDashboardView />;
  }

  return <EmployeeDashboardView />;
};

export default DashboardPage;
