import React, { useState } from 'react';
import { leaveApi } from '../../api/leaveApi.js';
import AlertBanner from '../../components/common/AlertBanner.jsx';
import { formatDate } from '../../utils/formatters.js';

export const ReviewLeaveModal = ({ show, leave, onClose, onSuccess }) => {
  const [status, setStatus] = useState('APPROVED');
  const [reviewReason, setReviewReason] = useState('');
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!show || !leave) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'REJECTED' && (!reviewReason.trim() || reviewReason.trim().length < 3)) {
      setServerError('A rejection justification of at least 3 characters is required.');
      return;
    }

    setSubmitting(true);
    setServerError(null);
    try {
      await leaveApi.reviewLeave(leave._id, status, reviewReason.trim());
      onSuccess();
      onClose();
    } catch (err) {
      setServerError(err.response?.data?.message || 'Review submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header border-bottom px-4 py-3">
            <h5 className="modal-title fw-bold text-dark">Review Leave Request</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body px-4 py-3 vstack gap-3">
              {serverError && <AlertBanner type="danger" message={serverError} />}

              {/* Request Details Box */}
              <div className="p-3 bg-light rounded-3 small vstack gap-1 border">
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Applicant:</span>
                  <span className="fw-semibold text-dark">
                    {leave.employee?.firstName} {leave.employee?.lastName} ({leave.employee?.employeeId})
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Department:</span>
                  <span className="fw-medium text-dark">{leave.employee?.department}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Type:</span>
                  <span className="badge bg-secondary">{leave.leaveType}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Duration:</span>
                  <span className="fw-semibold text-dark">
                    {formatDate(leave.startDate)} &rarr; {formatDate(leave.endDate)} ({leave.daysCount} days)
                  </span>
                </div>
                <div className="mt-2 pt-2 border-top">
                  <span className="text-muted">Applicant Reason:</span>
                  <div className="p-2 bg-white rounded border mt-1 text-dark fst-italic">
                    "{leave.reason}"
                  </div>
                </div>
              </div>

              {/* Decision Toggle */}
              <div>
                <label className="form-label small fw-semibold text-secondary">Decision *</label>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className={`btn flex-fill py-2 fw-semibold ${
                      status === 'APPROVED' ? 'btn-success text-white' : 'btn-outline-secondary'
                    }`}
                    onClick={() => setStatus('APPROVED')}
                  >
                    <i className="bi bi-check-circle me-1" /> Approve Request
                  </button>
                  <button
                    type="button"
                    className={`btn flex-fill py-2 fw-semibold ${
                      status === 'REJECTED' ? 'btn-danger text-white' : 'btn-outline-secondary'
                    }`}
                    onClick={() => setStatus('REJECTED')}
                  >
                    <i className="bi bi-x-circle me-1" /> Reject Request
                  </button>
                </div>
              </div>

              {/* Review Comments */}
              <div>
                <label className="form-label small fw-semibold text-secondary">
                  Reviewer Notes {status === 'REJECTED' && <span className="text-danger">*</span>}
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder={
                    status === 'APPROVED'
                      ? 'Optional note (e.g. Approved. Team coverage confirmed.)'
                      : 'Mandatory justification for rejecting this application...'
                  }
                  value={reviewReason}
                  onChange={(e) => setReviewReason(e.target.value)}
                  required={status === 'REJECTED'}
                />
              </div>
            </div>

            <div className="modal-footer border-top px-4 py-3">
              <button type="button" className="btn btn-light" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button
                type="submit"
                className={`btn ${status === 'APPROVED' ? 'btn-success' : 'btn-danger'}`}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Submitting...
                  </>
                ) : (
                  `Confirm ${status === 'APPROVED' ? 'Approval' : 'Rejection'}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewLeaveModal;
