import React, { useEffect, useState } from 'react';
import { leaveApi } from '../../api/leaveApi.js';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import AlertBanner from '../../components/common/AlertBanner.jsx';
import ApplyLeaveModal from './ApplyLeaveModal.jsx';
import { formatDate } from '../../utils/formatters.js';

export const MyLeavesPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchMyLeaves();
  }, [page, statusFilter]);

  const fetchMyLeaves = async () => {
    setLoading(true);
    try {
      const res = await leaveApi.getMyLeaves({ page, limit: 10, status: statusFilter });
      setLeaves(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to load leave records' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelLeave = async (id) => {
    if (window.confirm('Are you sure you want to cancel this pending leave request?')) {
      try {
        await leaveApi.cancelLeave(id);
        setAlert({ type: 'success', message: 'Leave request cancelled successfully.' });
        fetchMyLeaves();
      } catch (err) {
        setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to cancel request' });
      }
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

      {/* Header Bar */}
      <div className="card border shadow-sm rounded-3 p-3 bg-white">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-0">My Leave Applications</h5>
            <small className="text-muted">Track submission statuses and supervisor review justifications</small>
          </div>

          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <button
              type="button"
              className="btn btn-primary btn-sm text-nowrap d-inline-flex align-items-center gap-1"
              onClick={() => setModalOpen(true)}
            >
              <i className="bi bi-plus-circle" /> Apply for Leave
            </button>
          </div>
        </div>
      </div>

      {/* Leave Table */}
      <div className="card border shadow-sm rounded-3 overflow-hidden bg-white">
        {loading ? (
          <LoadingSpinner message="Fetching leave requests..." />
        ) : leaves.length === 0 ? (
          <EmptyState
            icon="🏖️"
            title="No leave applications"
            message="You haven't submitted any leave requests matching the selected filter."
            action={
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => setModalOpen(true)}
              >
                Apply for Time Off Now
              </button>
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="small text-muted">TYPE</th>
                  <th className="small text-muted">TIMEFRAME</th>
                  <th className="small text-muted">DAYS</th>
                  <th className="small text-muted">MY REASON</th>
                  <th className="small text-muted">STATUS</th>
                  <th className="small text-muted">REVIEWER NOTE</th>
                  <th className="small text-muted text-end">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l._id}>
                    <td>
                      <span className="badge bg-light text-dark border fw-semibold">
                        {l.leaveType}
                      </span>
                    </td>
                    <td className="small">
                      <div className="fw-semibold text-dark">
                        {formatDate(l.startDate)} &rarr; {formatDate(l.endDate)}
                      </div>
                    </td>
                    <td>
                      <span className="fw-semibold text-dark">{l.daysCount}</span>
                    </td>
                    <td className="small text-muted" style={{ maxWidth: '200px' }}>
                      <div className="text-truncate" title={l.reason}>
                        {l.reason}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="small text-muted" style={{ maxWidth: '220px' }}>
                      {l.reviewReason ? (
                        <div>
                          <span className="text-dark fst-italic">"{l.reviewReason}"</span>
                          {l.reviewer && (
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                              Reviewed by {l.reviewer.firstName} {l.reviewer.lastName}
                            </div>
                          )}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="text-end">
                      {l.status === 'PENDING' && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-xs py-1 px-2 rounded-pill small"
                          onClick={() => handleCancelLeave(l._id)}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
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

      <ApplyLeaveModal
        show={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setAlert({ type: 'success', message: 'Leave request submitted successfully!' });
          fetchMyLeaves();
        }}
      />
    </div>
  );
};

export default MyLeavesPage;
