import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice.js';
import { fetchNotifications } from '../../features/notifications/notificationSlice.js';
import { attendanceApi } from '../../api/attendanceApi.js';

export const Navbar = ({ onToggleSidebar, pageTitle = 'Dashboard' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);

  const [todayAttendance, setTodayAttendance] = useState(null);
  const [clockLoading, setClockLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
    fetchTodayClock();
  }, [dispatch]);

  const fetchTodayClock = async () => {
    try {
      if (user?.employee) {
        const res = await attendanceApi.getTodayStatus();
        setTodayAttendance(res.data?.attendance || null);
      }
    } catch {
      // Non-fatal if employee record not found
    }
  };

  const handleQuickCheckIn = async () => {
    setClockLoading(true);
    try {
      await attendanceApi.checkIn();
      await fetchTodayClock();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    } finally {
      setClockLoading(false);
    }
  };

  const handleQuickCheckOut = async () => {
    setClockLoading(true);
    try {
      await attendanceApi.checkOut();
      await fetchTodayClock();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed');
    } finally {
      setClockLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isCheckedIn = !!todayAttendance?.checkInTime;
  const isCheckedOut = !!todayAttendance?.checkOutTime;

  return (
    <header className="top-navbar">
      <div className="d-flex align-items-center gap-3">
        <button
          type="button"
          className="btn btn-sm btn-light d-lg-none"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
        >
          <i className="bi bi-list fs-5" />
        </button>
        <h1 className="h5 fw-bold mb-0 text-dark">{pageTitle}</h1>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Quick Check-in/Check-out Control */}
        {user?.employee && (
          <div className="d-none d-md-flex align-items-center gap-2 bg-light px-3 py-1 rounded-pill border">
            <span
              className={`rounded-circle ${
                isCheckedOut ? 'bg-secondary' : isCheckedIn ? 'bg-success' : 'bg-warning'
              }`}
              style={{ width: '8px', height: '8px' }}
            />
            <span className="small text-muted me-1">
              {isCheckedOut
                ? 'Checked Out'
                : isCheckedIn
                ? `In since ${new Date(todayAttendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Not Checked In'}
            </span>

            {!isCheckedIn && (
              <button
                type="button"
                className="btn btn-xs btn-primary py-0 px-2 rounded-pill"
                style={{ fontSize: '0.75rem' }}
                disabled={clockLoading}
                onClick={handleQuickCheckIn}
              >
                {clockLoading ? '...' : 'Check In'}
              </button>
            )}

            {isCheckedIn && !isCheckedOut && (
              <button
                type="button"
                className="btn btn-xs btn-outline-danger py-0 px-2 rounded-pill"
                style={{ fontSize: '0.75rem' }}
                disabled={clockLoading}
                onClick={handleQuickCheckOut}
              >
                {clockLoading ? '...' : 'Check Out'}
              </button>
            )}
          </div>
        )}

        {/* Notifications Icon Pill */}
        <Link
          to="/notifications"
          className="btn btn-sm btn-light position-relative rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: '38px', height: '38px' }}
          title="Notifications"
        >
          <i className="bi bi-bell text-secondary fs-6" />
          {unreadCount > 0 && (
            <span
              className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              style={{ fontSize: '0.65rem' }}
            >
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Profile Dropdown */}
        <div className="dropdown">
          <button
            className="btn btn-light d-flex align-items-center gap-2 p-1 pe-2 rounded-pill border"
            type="button"
            id="userProfileDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
              style={{ width: '30px', height: '30px', fontSize: '0.8rem' }}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="small fw-semibold text-dark d-none d-sm-inline">{user?.name?.split(' ')[0]}</span>
            <i className="bi bi-chevron-down text-muted" style={{ fontSize: '0.7rem' }} />
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 py-2" aria-labelledby="userProfileDropdown">
            <li className="px-3 py-1">
              <div className="fw-semibold small text-dark">{user?.name}</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>{user?.email}</div>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <Link className="dropdown-item small d-flex align-items-center gap-2" to="/profile">
                <i className="bi bi-person" /> My Profile
              </Link>
            </li>
            <li>
              <Link className="dropdown-item small d-flex align-items-center gap-2" to="/settings">
                <i className="bi bi-gear" /> Account Settings
              </Link>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button
                type="button"
                className="dropdown-item small text-danger d-flex align-items-center gap-2"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right" /> Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
