import React, { useEffect, useState } from 'react';
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
import { reportApi } from '../../api/reportApi.js';
import StatCard from '../../components/common/StatCard.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import AlertBanner from '../../components/common/AlertBanner.jsx';

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
const LEAVE_COLORS = {
  APPROVED: '#10b981',
  PENDING: '#f59e0b',
  REJECTED: '#ef4444',
  CANCELLED: '#94a3b8'
};

export const ReportsPage = () => {
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
      setError(err.response?.data?.message || 'Failed to load report analytics');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <LoadingSpinner message="Generating executive reports..." />;
  if (error) return <AlertBanner type="danger" message={error} />;
  if (!metrics) return null;

  const {
    totalEmployees = 0,
    presentToday = 0,
    absentToday = 0,
    lateToday = 0,
    departmentBreakdown = [],
    attendanceTrend = [],
    leaveDistribution = []
  } = metrics;

  return (
    <div className="vstack gap-4">
      {/* Header and Print Button */}
      <div className="card border shadow-sm rounded-3 p-3 bg-white">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-0">Human Capital Analytics & Audit Reporting</h5>
            <small className="text-muted">Generated from live database records for administrative oversight</small>
          </div>

          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2"
            onClick={handlePrint}
          >
            <i className="bi bi-printer" /> Print / Export Audit Snapshot
          </button>
        </div>
      </div>

      {/* High-level KPI Cards */}
      <div className="row g-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Workforce"
            value={totalEmployees}
            icon={<i className="bi bi-people" />}
            subtitle="Active full-time employees"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Present Today"
            value={presentToday}
            icon={<i className="bi bi-check2-circle" />}
            iconBg="#dcfce7"
            iconColor="#15803d"
            subtitle={`${Math.round((presentToday / (totalEmployees || 1)) * 100)}% attendance rate`}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Late Clock-Ins"
            value={lateToday}
            icon={<i className="bi bi-clock-history" />}
            iconBg="#fffbeb"
            iconColor="#b45309"
            subtitle="Arrived after 09:30 AM"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Absent Today"
            value={absentToday}
            icon={<i className="bi bi-person-x" />}
            iconBg="#fee2e2"
            iconColor="#b91c1c"
            subtitle="Approved leave or pending"
          />
        </div>
      </div>

      {/* Main Charts */}
      <div className="row g-4">
        {/* Attendance Trajectory */}
        <div className="col-12 col-lg-7">
          <div className="card border shadow-sm rounded-4 p-4 bg-white h-100">
            <h6 className="fw-bold text-dark mb-1">Weekly Workforce Attendance Analysis</h6>
            <small className="text-muted mb-4 d-block">
              Daily comparative volume of on-time vs late clock-ins
            </small>

            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="present" name="On-Time Present" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="late" name="Late Arrivals" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="halfDay" name="Half Day Shifts" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Leave Status Distribution */}
        <div className="col-12 col-lg-5">
          <div className="card border shadow-sm rounded-4 p-4 bg-white h-100">
            <h6 className="fw-bold text-dark mb-1">Leave Requests by Status</h6>
            <small className="text-muted mb-4 d-block">
              Resolution breakdown across organization requests
            </small>

            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leaveDistribution}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={50}
                    paddingAngle={3}
                  >
                    {leaveDistribution.map((entry) => (
                      <Cell
                        key={`cell-${entry.status}`}
                        fill={LEAVE_COLORS[entry.status] || '#64748b'}
                      />
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

      {/* Department Breakdown Table */}
      <div className="card border shadow-sm rounded-4 p-4 bg-white">
        <h6 className="fw-bold text-dark mb-3">Department Headcount & Allocation Matrix</h6>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="small text-muted">DEPARTMENT NAME</th>
                <th className="small text-muted">ACTIVE HEADCOUNT</th>
                <th className="small text-muted">PERCENTAGE OF ORG</th>
                <th className="small text-muted">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {departmentBreakdown.map((d, index) => {
                const pct = Math.round((d.count / (totalEmployees || 1)) * 100);
                return (
                  <tr key={d.department || index}>
                    <td className="fw-semibold text-dark">
                      <span
                        className="d-inline-block rounded-circle me-2"
                        style={{ width: '10px', height: '10px', backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      {d.department}
                    </td>
                    <td className="fw-bold">{d.count}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2" style={{ maxWidth: '200px' }}>
                        <div className="progress flex-grow-1" style={{ height: '6px' }}>
                          <div
                            className="progress-bar bg-primary"
                            role="progressbar"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="small text-muted">{pct}%</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-success-subtle text-success border border-success-subtle">
                        Operational
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
