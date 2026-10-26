import React, { useEffect, useState } from 'react';
import { attendanceApi } from '../../api/attendanceApi.js';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import AlertBanner from '../../components/common/AlertBanner.jsx';
import { formatTime, formatDurationMinutes } from '../../utils/formatters.js';

export const TeamAttendancePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [statusFilter, setStatusFilter] = useState('');
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchTeamAttendance();
  }, [selectedDate, statusFilter]);

  const fetchTeamAttendance = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getTeamAttendance({
        date: selectedDate,
        status: statusFilter
      });
      setData(res.data);
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to fetch team attendance' });
    } finally {
      setLoading(false);
    }
  };

  const attendanceList = data?.attendance || [];
  const totalTeam = data?.totalTeam || 0;
  const presentCount = data?.presentCount || 0;
  const absentCount = Math.max(0, totalTeam - presentCount);

  return (
    <div className="vstack gap-4">
      {alert && (
        <AlertBanner
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Header and Filter */}
      <div className="card border shadow-sm rounded-3 p-3 bg-white">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-0">Team Attendance Roster</h5>
            <small className="text-muted">Real-time attendance for your direct reporting members</small>
          </div>

          <div className="d-flex align-items-center gap-2">
            <input
              type="date"
              className="form-control form-control-sm"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="ABSENT">Absent / Not Checked In</option>
            </select>
          </div>
        </div>

        {/* Quick Counters */}
        <div className="row g-3 mt-2 pt-3 border-top text-center">
          <div className="col-4">
            <div className="text-muted small">TOTAL MANAGED</div>
            <div className="fw-bold fs-5 text-dark">{totalTeam}</div>
          </div>
          <div className="col-4">
            <div className="text-muted small">CHECKED IN</div>
            <div className="fw-bold fs-5 text-success">{presentCount}</div>
          </div>
          <div className="col-4">
            <div className="text-muted small">ABSENT / PENDING</div>
            <div className="fw-bold fs-5 text-danger">{absentCount}</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border shadow-sm rounded-3 overflow-hidden bg-white">
        {loading ? (
          <LoadingSpinner message="Fetching team records..." />
        ) : attendanceList.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No records found"
            message="No team attendance entries found for the selected date."
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="small text-muted">EMPLOYEE</th>
                  <th className="small text-muted">DESIGNATION</th>
                  <th className="small text-muted">CHECK-IN</th>
                  <th className="small text-muted">CHECK-OUT</th>
                  <th className="small text-muted">WORKED</th>
                  <th className="small text-muted">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {attendanceList.map((entry, idx) => (
                  <tr key={entry.employee?._id || idx}>
                    <td>
                      <div className="fw-semibold text-dark">
                        {entry.employee?.firstName} {entry.employee?.lastName}
                      </div>
                      <div className="small text-muted font-monospace">{entry.employee?.employeeId}</div>
                    </td>
                    <td className="small text-muted">{entry.employee?.designation}</td>
                    <td className="small">{formatTime(entry.checkInTime)}</td>
                    <td className="small">{formatTime(entry.checkOutTime)}</td>
                    <td>
                      <span className="fw-semibold text-indigo">
                        {formatDurationMinutes(entry.workedMinutes)}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={entry.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamAttendancePage;
