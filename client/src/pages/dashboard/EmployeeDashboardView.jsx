import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/common/StatCard.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import AlertBanner from '../../components/common/AlertBanner.jsx';
import { reportApi } from '../../api/reportApi.js';
import { attendanceApi } from '../../api/attendanceApi.js';
import { formatTime, formatDurationMinutes } from '../../utils/formatters.js';

export const EmployeeDashboardView = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);
  const [clockMessage, setClockMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await reportApi.getEmployeeDashboardMetrics();
      setMetrics(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load employee metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setClockLoading(true);
    setClockMessage(null);
    try {
      const res = await attendanceApi.checkIn();
      setClockMessage({ type: 'success', text: 'Checked in successfully!' });
      await fetchData();
    } catch (err) {
      setClockMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Check-in failed'
      });
    } finally {
      setClockLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setClockLoading(true);
    setClockMessage(null);
    try {
      const res = await attendanceApi.checkOut();
      setClockMessage({ type: 'success', text: 'Checked out successfully!' });
      await fetchData();
    } catch (err) {
      setClockMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Check-out failed'
      });
    } finally {
      setClockLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading your workspace..." />;
  if (error) return <AlertBanner type="danger" message={error} />;
  if (!metrics) return null;

  const {
    todayAttendance,
    monthlySummary = {},
    leaveSummary = {},
    enrolledTrainingsCount = 0,
    publishedAnnouncementsCount = 0
  } = metrics;

  const isCheckedIn = !!todayAttendance?.checkInTime;
  const isCheckedOut = !!todayAttendance?.checkOutTime;

  return (
    <div className="vstack gap-4">
      {clockMessage && (
        <AlertBanner
          type={clockMessage.type}
          message={clockMessage.text}
          onClose={() => setClockMessage(null)}
        />
      )}

      {/* Top Banner: Today's Time Tracker Card */}
      <div className="card border shadow-sm rounded-4 p-4 bg-white">
        <div className="row align-items-center gy-4">
          <div className="col-12 col-md-7">
            <span className="badge bg-light text-primary border mb-2 px-3 py-1 fw-semibold small">
              Workday Timecard &bull; {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <h4 className="fw-bold text-dark mb-1">
              {isCheckedOut
                ? 'Your workday is concluded!'
                : isCheckedIn
                ? 'You are currently on the clock'
                : 'You have not checked in today'}
            </h4>
            <p className="text-muted small mb-0">
              Standard office shifts start at 09:30 AM. Attendance logs are securely recorded and mapped to your monthly payroll summary.
            </p>

            <div className="d-flex flex-wrap gap-4 mt-3 pt-3 border-top">
              <div>
                <div className="text-muted small">CHECK-IN</div>
                <div className="fw-bold text-dark fs-6">{formatTime(todayAttendance?.checkInTime)}</div>
              </div>
              <div>
                <div className="text-muted small">CHECK-OUT</div>
                <div className="fw-bold text-dark fs-6">{formatTime(todayAttendance?.checkOutTime)}</div>
              </div>
              <div>
                <div className="text-muted small">WORKED DURATION</div>
                <div className="fw-bold text-indigo fs-6">
                  {formatDurationMinutes(todayAttendance?.workedMinutes)}
                </div>
              </div>
              <div>
                <div className="text-muted small">STATUS</div>
                <div>
                  <StatusBadge status={todayAttendance?.status || 'ABSENT'} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-5 text-md-end">
            {!isCheckedIn && (
              <button
                type="button"
                className="btn btn-primary btn-lg px-4 py-3 fw-bold rounded-pill shadow-sm"
                disabled={clockLoading}
                onClick={handleCheckIn}
              >
                {clockLoading ? (
                  <span className="spinner-border spinner-border-sm me-2" />
                ) : (
                  <i className="bi bi-box-arrow-in-right me-2" />
                )}
                Mark Check-In Now
              </button>
            )}

            {isCheckedIn && !isCheckedOut && (
              <button
                type="button"
                className="btn btn-danger btn-lg px-4 py-3 fw-bold rounded-pill shadow-sm"
                disabled={clockLoading}
                onClick={handleCheckOut}
              >
                {clockLoading ? (
                  <span className="spinner-border spinner-border-sm me-2" />
                ) : (
                  <i className="bi bi-box-arrow-right me-2" />
                )}
                Conclude Shift & Check Out
              </button>
            )}

            {isCheckedOut && (
              <div className="alert alert-success d-inline-block text-start mb-0 py-2 px-3 rounded-3 small">
                <i className="bi bi-check-circle-fill me-2" />
                Shift recorded ({formatDurationMinutes(todayAttendance?.workedMinutes)} worked).
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="row g-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Monthly Hours"
            value={`${monthlySummary.totalHoursWorked || 0} hrs`}
            icon={<i className="bi bi-clock-history" />}
            iconBg="#e0e7ff"
            iconColor="#4338ca"
            subtitle={`${monthlySummary.daysAttended || 0} workdays attended`}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Approved Leaves"
            value={leaveSummary.approved || 0}
            icon={<i className="bi bi-calendar-check" />}
            iconBg="#dcfce7"
            iconColor="#15803d"
            subtitle={`${leaveSummary.pending || 0} pending review`}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Enrolled Trainings"
            value={enrolledTrainingsCount}
            icon={<i className="bi bi-mortarboard-fill" />}
            iconBg="#fef3c7"
            iconColor="#b45309"
            subtitle="Upskilling workshops"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Company Notices"
            value={publishedAnnouncementsCount}
            icon={<i className="bi bi-megaphone-fill" />}
            iconBg="#e0f2fe"
            iconColor="#0369a1"
            subtitle="Published updates"
          />
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="row g-3">
        <div className="col-12 col-md-4">
          <Link to="/attendance/my" className="card border shadow-sm rounded-3 p-3 text-decoration-none text-dark bg-white h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="stat-icon bg-primary text-white">
                <i className="bi bi-calendar3" />
              </div>
              <div>
                <h6 className="fw-bold mb-1">My Attendance History</h6>
                <div className="small text-muted">Review full calendar logs and check-in times</div>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-12 col-md-4">
          <Link to="/leaves/my" className="card border shadow-sm rounded-3 p-3 text-decoration-none text-dark bg-white h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="stat-icon bg-warning text-white">
                <i className="bi bi-file-earmark-plus" />
              </div>
              <div>
                <h6 className="fw-bold mb-1">Apply for Time Off</h6>
                <div className="small text-muted">Submit leave applications and check review notes</div>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-12 col-md-4">
          <Link to="/trainings" className="card border shadow-sm rounded-3 p-3 text-decoration-none text-dark bg-white h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="stat-icon bg-info text-white">
                <i className="bi bi-lightbulb-fill" />
              </div>
              <div>
                <h6 className="fw-bold mb-1">Browse Trainings</h6>
                <div className="small text-muted">Explore upcoming workshops and enroll online</div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboardView;
