import React, { useEffect, useState } from 'react';
import { attendanceApi } from '../../api/attendanceApi.js';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import AlertBanner from '../../components/common/AlertBanner.jsx';
import { formatDate, formatTime, formatDurationMinutes } from '../../utils/formatters.js';

export const MyAttendancePage = () => {
  const [history, setHistory] = useState([]);
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchTodayAndHistory();
  }, [page, statusFilter]);

  const fetchTodayAndHistory = async () => {
    setLoading(true);
    try {
      const [todayRes, historyRes] = await Promise.all([
        attendanceApi.getTodayStatus(),
        attendanceApi.getMyHistory({ page, limit: 12, status: statusFilter })
      ]);
      setTodayStatus(todayRes.data?.attendance || null);
      setHistory(historyRes.data || []);
      setTotalPages(historyRes.meta?.totalPages || 1);
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to load attendance logs' });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setClockLoading(true);
    try {
      await attendanceApi.checkIn();
      setAlert({ type: 'success', message: 'Checked in successfully!' });
      fetchTodayAndHistory();
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Check-in failed' });
    } finally {
      setClockLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setClockLoading(true);
    try {
      await attendanceApi.checkOut();
      setAlert({ type: 'success', message: 'Checked out successfully!' });
      fetchTodayAndHistory();
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Check-out failed' });
    } finally {
      setClockLoading(false);
    }
  };

  const isCheckedIn = !!todayStatus?.checkInTime;
  const isCheckedOut = !!todayStatus?.checkOutTime;

  return (
    <div className="vstack gap-4">
      {alert && (
        <AlertBanner
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Today's Punch Clock Card */}
      <div className="card border shadow-sm rounded-4 p-4 bg-white">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <span className="badge bg-light text-primary border mb-1 px-3 py-1 fw-semibold small">
              Today: {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <h5 className="fw-bold text-dark mb-1">Attendance Check-In Station</h5>
            <p className="text-muted small mb-0">
              Shift records are automatically stamped using standardized server time.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            {!isCheckedIn && (
              <button
                type="button"
                className="btn btn-primary px-4 py-2 fw-semibold rounded-pill"
                disabled={clockLoading}
                onClick={handleCheckIn}
              >
                {clockLoading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                <i className="bi bi-box-arrow-in-right me-2" /> Check In Now
              </button>
            )}

            {isCheckedIn && !isCheckedOut && (
              <button
                type="button"
                className="btn btn-danger px-4 py-2 fw-semibold rounded-pill"
                disabled={clockLoading}
                onClick={handleCheckOut}
              >
                {clockLoading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                <i className="bi bi-box-arrow-right me-2" /> Conclude Shift
              </button>
            )}

            {isCheckedOut && (
              <div className="badge bg-success-subtle text-success border border-success-subtle p-2 px-3 rounded-pill fw-semibold">
                <i className="bi bi-check-circle-fill me-1" /> Shift Logged
              </div>
            )}
          </div>
        </div>

        {todayStatus && (
          <div className="row g-3 mt-3 pt-3 border-top small">
            <div className="col-6 col-sm-3">
              <span className="text-muted">Check-In Time:</span>
              <div className="fw-semibold text-dark">{formatTime(todayStatus.checkInTime)}</div>
            </div>
            <div className="col-6 col-sm-3">
              <span className="text-muted">Check-Out Time:</span>
              <div className="fw-semibold text-dark">{formatTime(todayStatus.checkOutTime)}</div>
            </div>
            <div className="col-6 col-sm-3">
              <span className="text-muted">Duration:</span>
              <div className="fw-semibold text-indigo">{formatDurationMinutes(todayStatus.workedMinutes)}</div>
            </div>
            <div className="col-6 col-sm-3">
              <span className="text-muted">Day Status:</span>
              <div><StatusBadge status={todayStatus.status} /></div>
            </div>
          </div>
        )}
      </div>

      {/* History Log Table */}
      <div className="card border shadow-sm rounded-3 overflow-hidden bg-white">
        <div className="p-3 border-bottom d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
          <h6 className="fw-bold text-dark mb-0">Attendance History Log</h6>
          <div className="col-12 col-sm-4">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Attendance Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="LATE">Late Arrivals</option>
              <option value="HALF_DAY">Half Day</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading attendance logs..." />
        ) : history.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No attendance records"
            message="No attendance logs found for the selected period."
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="small text-muted">DATE</th>
                  <th className="small text-muted">CHECK-IN</th>
                  <th className="small text-muted">CHECK-OUT</th>
                  <th className="small text-muted">WORKED TIME</th>
                  <th className="small text-muted">STATUS</th>
                  <th className="small text-muted">NOTES</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record) => (
                  <tr key={record._id}>
                    <td>
                      <span className="fw-semibold text-dark font-monospace">
                        {record.attendanceDate}
                      </span>
                    </td>
                    <td className="small">{formatTime(record.checkInTime)}</td>
                    <td className="small">{formatTime(record.checkOutTime)}</td>
                    <td>
                      <span className="fw-semibold text-indigo">
                        {formatDurationMinutes(record.workedMinutes)}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="small text-muted">{record.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
        />
      </div>
    </div>
  );
};

export default MyAttendancePage;
