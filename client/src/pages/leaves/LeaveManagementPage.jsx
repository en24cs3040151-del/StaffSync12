import React, { useEffect, useState } from 'react';
import { leaveApi } from '../../api/leaveApi.js';
import { DEPARTMENTS } from '../../utils/constants.js';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import AlertBanner from '../../components/common/AlertBanner.jsx';
import ReviewLeaveModal from './ReviewLeaveModal.jsx';
import { formatDate } from '../../utils/formatters.js';

export const LeaveManagementPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchAllLeaves();
  }, [page, department, status]);

  const fetchAllLeaves = async () => {
    setLoading(true);
    try {
      const res = await leaveApi.getAllLeaves({ page, limit: 12, department, status });
      setLeaves(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalCount(res.meta?.total || 0);
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to fetch organization leaves' });
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
            <h5 className="fw-bold text-dark mb-0">Organization Leave Management</h5>
            <small className="text-muted">{totalCount} total employee absence records across all departments</small>
          </div>

          <div className="d-flex gap-2">
            <select
              className="form-select form-select-sm"
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              className="form-select form-select-sm"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border shadow-sm rounded-3 overflow-hidden bg-white">
        {loading ? (
          <LoadingSpinner message="Querying organization leaves..." />
        ) : leaves.length === 0 ? (
          <EmptyState
            icon="🏖️"
            title="No records found"
            message="No leave records matching the chosen filters."
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="small text-muted">EMPLOYEE</th>
                  <th className="small text-muted">DEPARTMENT</th>
                  <th className="small text-muted">TYPE</th>
                  <th className="small text-muted">DURATION</th>
                  <th className="small text-muted">DAYS</th>
                  <th className="small text-muted">STATUS</th>
                  <th className="small text-muted">REVIEWER</th>
                  <th className="small text-muted text-end">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l._id}>
                    <td>
                      <div className="fw-semibold text-dark">
                        {l.employee?.firstName} {l.employee?.lastName}
                      </div>
                      <div className="small text-muted font-monospace">{l.employee?.employeeId}</div>
                    </td>
                    <td>
                      <span className="badge bg-secondary-subtle text-secondary border">
                        {l.employee?.department}
                      </span>
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
                    <td>
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="small text-muted">
                      {l.reviewer ? `${l.reviewer.firstName} ${l.reviewer.lastName}` : '—'}
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
                          Review
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-xs py-1 px-2 rounded-pill"
                          onClick={() => {
                            setSelectedLeave(l);
                            setReviewModalOpen(true);
                          }}
                        >
                          Details
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

      <ReviewLeaveModal
        show={reviewModalOpen}
        leave={selectedLeave}
        onClose={() => setReviewModalOpen(false)}
        onSuccess={() => {
          setAlert({ type: 'success', message: 'Leave record updated successfully.' });
          fetchAllLeaves();
        }}
      />
    </div>
  );
};

export default LeaveManagementPage;
