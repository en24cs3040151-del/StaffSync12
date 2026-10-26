import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { notificationApi } from '../../api/notificationApi.js';
import { fetchNotifications } from '../../features/notifications/notificationSlice.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import AlertBanner from '../../components/common/AlertBanner.jsx';
import { formatDate } from '../../utils/formatters.js';

export const NotificationsPage = () => {
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadList();
  }, []);

  const loadList = async () => {
    setLoading(true);
    try {
      const res = await notificationApi.getMyNotifications({ limit: 30 });
      setNotifications(res.data || []);
      dispatch(fetchNotifications());
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to load notifications' });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      loadList();
    } catch {
      // Non-fatal
    }
  };

  const handleMarkAll = async () => {
    try {
      await notificationApi.markAllAsRead();
      setAlert({ type: 'success', message: 'All notifications marked as read.' });
      loadList();
    } catch {
      // Non-fatal
    }
  };

  return (
    <div className="vstack gap-4">
      {alert && (
        <AlertBanner
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Header */}
      <div className="card border shadow-sm rounded-3 p-3 bg-white">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h5 className="fw-bold text-dark mb-0">Notifications Center</h5>
            <small className="text-muted">Real-time alerts for leave approvals, attendance notices, and announcements</small>
          </div>

          {notifications.some((n) => !n.isRead) && (
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={handleMarkAll}
            >
              <i className="bi bi-check2-all me-1" /> Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="card border shadow-sm rounded-3 overflow-hidden bg-white">
        {loading ? (
          <LoadingSpinner message="Checking notifications..." />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon="🔔"
            title="No notifications"
            message="You are completely caught up! No active or pending alerts."
          />
        ) : (
          <div className="list-group list-group-flush">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`list-group-item p-3 d-flex align-items-start justify-content-between gap-3 ${
                  !n.isRead ? 'bg-light' : ''
                }`}
              >
                <div className="d-flex gap-3">
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center ${
                      n.type === 'LEAVE'
                        ? 'bg-warning-subtle text-warning'
                        : n.type === 'ATTENDANCE'
                        ? 'bg-success-subtle text-success'
                        : 'bg-primary-subtle text-primary'
                    }`}
                    style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}
                  >
                    <i
                      className={`bi ${
                        n.type === 'LEAVE'
                          ? 'bi-calendar-minus'
                          : n.type === 'ATTENDANCE'
                          ? 'bi-clock-history'
                          : 'bi-bell'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <h6 className="fw-bold text-dark mb-0">{n.title}</h6>
                      {!n.isRead && (
                        <span className="badge bg-primary" style={{ fontSize: '0.65rem' }}>
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-muted small mb-1">{n.message}</p>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                      {formatDate(n.createdAt)}
                    </div>
                  </div>
                </div>

                {!n.isRead && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary py-0 px-2 rounded-pill"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => handleMarkAsRead(n._id)}
                  >
                    Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
