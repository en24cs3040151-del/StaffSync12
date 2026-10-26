import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LEAVE_TYPES } from '../../utils/constants.js';
import { leaveApi } from '../../api/leaveApi.js';
import AlertBanner from '../../components/common/AlertBanner.jsx';

export const ApplyLeaveModal = ({ show, onClose, onSuccess }) => {
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      leaveType: LEAVE_TYPES[0],
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
      reason: ''
    }
  });

  const startDateVal = watch('startDate');

  const onSubmit = async (data) => {
    setSubmitting(true);
    setServerError(null);
    try {
      await leaveApi.applyLeave(data);
      reset();
      onSuccess();
      onClose();
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header border-bottom px-4 py-3">
            <h5 className="modal-title fw-bold text-dark">Submit Leave Application</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body px-4 py-3 vstack gap-3">
              {serverError && <AlertBanner type="danger" message={serverError} />}

              <div>
                <label className="form-label small fw-semibold text-secondary">Leave Category *</label>
                <select className="form-select" {...register('leaveType', { required: true })}>
                  {LEAVE_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label small fw-semibold text-secondary">Start Date *</label>
                  <input
                    type="date"
                    className={`form-control ${errors.startDate ? 'is-invalid' : ''}`}
                    {...register('startDate', { required: 'Start date is required' })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold text-secondary">End Date *</label>
                  <input
                    type="date"
                    className={`form-control ${errors.endDate ? 'is-invalid' : ''}`}
                    {...register('endDate', {
                      required: 'End date is required',
                      validate: (value) =>
                        new Date(value) >= new Date(startDateVal) ||
                        'End date cannot precede start date'
                    })}
                  />
                  {errors.endDate && <div className="invalid-feedback">{errors.endDate.message}</div>}
                </div>
              </div>

              <div>
                <label className="form-label small fw-semibold text-secondary">Reason for Absence *</label>
                <textarea
                  className={`form-control ${errors.reason ? 'is-invalid' : ''}`}
                  rows="3"
                  placeholder="Provide brief context for your supervisor or HR administrator..."
                  {...register('reason', {
                    required: 'Reason is required',
                    minLength: { value: 5, message: 'Please provide at least 5 characters' }
                  })}
                />
                {errors.reason && <div className="invalid-feedback">{errors.reason.message}</div>}
              </div>
            </div>

            <div className="modal-footer border-top px-4 py-3">
              <button type="button" className="btn btn-light" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeaveModal;
