import React, { useEffect, useState } from 'react';
import { leaveApi } from '../../api/leaveApi.js';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import AlertBanner from '../../components/common/AlertBanner.jsx';
import ReviewLeaveModal from './ReviewLeaveModal.jsx';
import { formatDate } from '../../utils/formatters.js';

export const TeamLeavesPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchTeamLeaves();
  }, [page, statusFilter]);

  const fetchTeamLeaves = async () => {
    setLoading(true);
    try {
      const res = await leaveApi.getTeamLeaves({ page, limit: 10, status: statusFilter });
      setLeaves(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to load team leaves' });
    } finally {
      setLoading(false);
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

      {/* Header and Filter */}
      <div className="card border shadow-sm rounded-3 p-3 bg-white">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-0">Team Leave Requests & Approvals</h5>
            <small className="text-muted">Review, approve, or reject absence requests submitted by direct reports</small>
          </div>

          <div className="col-12 col-sm-3">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border shadow-sm rounded-3 overflow-hidden bg-white">
        {loading ? (
          <LoadingSpinner message="Querying team requests..." />
        ) : leaves.length === 0 ? (
          <EmptyState
            icon="🏖️"
            title="No team leave requests"
            message="No leave submissions found for your direct reporting members."
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="small text-muted">EMPLOYEE</th>
                  <th className="small text-muted">TYPE</th>
                  <th className="small text-muted">DURATION</th>
                  <th className="small text-muted">DAYS</th>
                  <th className="small text-muted">REASON</th>
                  <th className="small text-muted">STATUS</th>
                  <th className="small text-muted text-end">DECISION</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
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
                      <div className="fw-semibold text-dark">
                        {formatDate(l.startDate)} &rarr; {formatDate(l.endDate)}
                      </div>
                    </td>
                    <td>
                      <span className="fw-semibold text-dark">{l.daysCount}</span>
                    </td>
                    <td className="small text-muted" style={{ maxWidth: '240px' }}>
                      <div className="text-truncate" title={l.reason}>
                        {l.reason}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="text-end">
                      {l.status === 'PENDING' ? (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm py-1 px-3 rounded-pill"
                          onClick={() => {
                            setSelectedLeave(l);
                            setReviewModalOpen(true);
                          }}
                        >
                          Review & Decide
                        </button>
                      ) : (
                        <span className="small text-muted">
                          {l.reviewReason ? `"${l.reviewReason}"` : 'Decided'}
                        </span>
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

      <ReviewLeaveModal
        show={reviewModalOpen}
        leave={selectedLeave}
        onClose={() => setReviewModalOpen(false)}
        onSuccess={() => {
          setAlert({ type: 'success', message: 'Leave request decision successfully recorded.' });
          fetchTeamLeaves();
        }}
      />
    </div>
  );
};

export default TeamLeavesPage;
