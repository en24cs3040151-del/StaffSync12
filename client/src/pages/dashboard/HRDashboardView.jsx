import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import StatCard from '../../components/common/StatCard.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import AlertBanner from '../../components/common/AlertBanner.jsx';
import { reportApi } from '../../api/reportApi.js';

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export const HRDashboardView = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await reportApi.getHRDashboardMetrics();
      setMetrics(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load HR metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading organization metrics..." />;
  if (error) return <AlertBanner type="danger" message={error} />;
  if (!metrics) return null;

  const {
    totalEmployees = 0,
    presentToday = 0,
    absentToday = 0,
    lateToday = 0,
    pendingLeaves = 0,
    upcomingTrainings = 0,
    departmentBreakdown = [],
    attendanceTrend = []
  } = metrics;

  return (
    <div className="vstack gap-4">
      {/* Top Stat Cards Grid */}
      <div className="row g-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Active Workforce"
            value={totalEmployees}
            icon={<i className="bi bi-people-fill" />}
            iconBg="#e0e7ff"
            iconColor="#4338ca"
            subtitle="Across all departments"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Present Today"
            value={presentToday}
            icon={<i className="bi bi-check2-circle" />}
            iconBg="#dcfce7"
            iconColor="#15803d"
            subtitle={`${lateToday} arrived after 9:30 AM`}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Absent Today"
            value={absentToday}
            icon={<i className="bi bi-person-x" />}
            iconBg="#fee2e2"
            iconColor="#b91c1c"
            subtitle="Pending check-in or on leave"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Pending Leaves"
            value={pendingLeaves}
            icon={<i className="bi bi-calendar-event" />}
            iconBg="#fef3c7"
            iconColor="#b45309"
            subtitle="Awaiting administrative review"
          />
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="row g-4">
        {/* Attendance Trends Chart */}
        <div className="col-12 col-lg-7">
          <div className="card border shadow-sm rounded-3 h-100 p-4 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h6 className="fw-bold text-dark mb-0">7-Day Attendance Trajectory</h6>
                <small className="text-muted">Daily check-ins vs late arrivals</small>
              </div>
              <Link to="/attendance/org" className="btn btn-sm btn-outline-primary">
                View Detailed Logs
              </Link>
            </div>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="present" name="Present On-Time" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="late" name="Late Arrivals" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Department Distribution Pie Chart */}
        <div className="col-12 col-lg-5">
          <div className="card border shadow-sm rounded-3 h-100 p-4 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h6 className="fw-bold text-dark mb-0">Departmental Distribution</h6>
                <small className="text-muted">Active employee counts by team</small>
              </div>
            </div>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentBreakdown}
                    dataKey="count"
                    nameKey="department"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {departmentBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions and Admin Shortcuts */}
      <div className="card border shadow-sm rounded-3 p-4 bg-white">
        <h6 className="fw-bold text-dark mb-3">Administrative Operations Hub</h6>
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <Link to="/employees" className="p-3 bg-light rounded-3 d-flex align-items-center gap-3 text-decoration-none text-dark border h-100">
              <div className="stat-icon bg-primary text-white">
                <i className="bi bi-person-plus-fill" />
              </div>
              <div>
                <div className="fw-bold">Manage Employees</div>
                <div className="small text-muted">Create records, assign roles & managers</div>
              </div>
            </Link>
          </div>
          <div className="col-12 col-md-4">
            <Link to="/leaves/manage" className="p-3 bg-light rounded-3 d-flex align-items-center gap-3 text-decoration-none text-dark border h-100">
              <div className="stat-icon bg-warning text-white">
                <i className="bi bi-check2-all" />
              </div>
              <div>
                <div className="fw-bold">Review Leave Requests</div>
                <div className="small text-muted">{pendingLeaves} pending approvals awaiting decision</div>
              </div>
            </Link>
          </div>
          <div className="col-12 col-md-4">
            <Link to="/reports" className="p-3 bg-light rounded-3 d-flex align-items-center gap-3 text-decoration-none text-dark border h-100">
              <div className="stat-icon bg-info text-white">
                <i className="bi bi-file-earmark-bar-graph" />
              </div>
              <div>
                <div className="fw-bold">Export Audit Reports</div>
                <div className="small text-muted">Organization-wide attendance & leave breakdown</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboardView;
