import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/common/StatCard.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import AlertBanner from '../../components/common/AlertBanner.jsx';
import { reportApi } from '../../api/reportApi.js';
import { formatDate } from '../../utils/formatters.js';

export const ManagerDashboardView = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await reportApi.getManagerDashboardMetrics();
      setMetrics(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load team metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading team analytics..." />;
  if (error) return <AlertBanner type="danger" message={error} />;
  if (!metrics) return null;

  const {
    teamSize = 0,
    teamPresentToday = 0,
    teamAbsentToday = 0,
    pendingLeaveRequests = 0,
    recentTeamLeaves = []
  } = metrics;

  return (
    <div className="vstack gap-4">
      {/* Metrics Row */}
      <div className="row g-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Managed Team Size"
            value={teamSize}
            icon={<i className="bi bi-person-badge-fill" />}
            iconBg="#e0e7ff"
            iconColor="#4338ca"
            subtitle="Direct report headcount"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Team Present Today"
            value={teamPresentToday}
            icon={<i className="bi bi-person-check-fill" />}
            iconBg="#dcfce7"
            iconColor="#15803d"
            subtitle={`${teamSize - teamPresentToday} not checked in`}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Team Absent"
            value={teamAbsentToday}
            icon={<i className="bi bi-person-dash" />}
            iconBg="#fee2e2"
            iconColor="#b91c1c"
            subtitle="Absent or on leave"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Pending Team Leaves"
            value={pendingLeaveRequests}
            icon={<i className="bi bi-envelope-exclamation" />}
            iconBg="#fef3c7"
            iconColor="#b45309"
            subtitle="Requires your review"
          />
        </div>
      </div>

      {/* Team Leave Approvals Overview */}
      <div className="card border shadow-sm rounded-3 p-4 bg-white">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h6 className="fw-bold text-dark mb-0">Recent Team Leave Activity</h6>
            <small className="text-muted">Applications submitted by direct reports</small>
          </div>
          <Link to="/leaves/team" className="btn btn-sm btn-primary">
            Review Team Requests ({pendingLeaveRequests})
          </Link>
        </div>

        {recentTeamLeaves.length === 0 ? (
          <div className="text-center py-4 text-muted small">
            No active or recent leave requests from your team members.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="small text-muted">EMPLOYEE</th>
                  <th className="small text-muted">TYPE</th>
                  <th className="small text-muted">DURATION</th>
                  <th className="small text-muted">DAYS</th>
                  <th className="small text-muted">STATUS</th>
                  <th className="small text-muted text-end">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {recentTeamLeaves.map((l) => (
                  <tr key={l._id}>
                    <td>
                      <div className="fw-semibold text-dark">
                        {l.employee?.firstName} {l.employee?.lastName}
                      </div>
                      <div className="small text-muted">{l.employee?.designation}</div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">{l.leaveType}</span>
                    </td>
                    <td className="small">
                      {formatDate(l.startDate)} &rarr; {formatDate(l.endDate)}
                    </td>
                    <td>
                      <span className="fw-semibold text-dark">{l.daysCount}</span>
                    </td>
                    <td>
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="text-end">
                      <Link to="/leaves/team" className="btn btn-xs btn-outline-primary py-1 px-2 rounded-pill small">
                        {l.status === 'PENDING' ? 'Review & Decision' : 'View Details'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Team Navigation Shortcuts */}
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <Link to="/attendance/team" className="card border shadow-sm rounded-3 p-3 text-decoration-none text-dark h-100 bg-white">
            <div className="d-flex align-items-center gap-3">
              <div className="stat-icon bg-primary text-white">
                <i className="bi bi-clock" />
              </div>
              <div>
                <h6 className="fw-bold mb-1">Check Team Daily Attendance</h6>
                <div className="small text-muted">Monitor check-in timings and daily hours for your department</div>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-12 col-md-6">
          <Link to="/team" className="card border shadow-sm rounded-3 p-3 text-decoration-none text-dark h-100 bg-white">
            <div className="d-flex align-items-center gap-3">
              <div className="stat-icon bg-success text-white">
                <i className="bi bi-person-lines-fill" />
              </div>
              <div>
                <h6 className="fw-bold mb-1">Direct Reports Directory</h6>
                <div className="small text-muted">View team contact details, emergency contacts, and roles</div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboardView;
