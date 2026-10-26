import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { DEPARTMENTS } from '../../utils/constants.js';
import { trainingApi } from '../../api/trainingApi.js';
import AlertBanner from '../../components/common/AlertBanner.jsx';

export const TrainingModal = ({ show, training, onClose, onSuccess }) => {
  const isEdit = !!training;
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      instructor: '',
      scheduleDate: '',
      durationHours: 2,
      capacity: 30,
      department: 'All'
    }
  });

  useEffect(() => {
    if (show) {
      if (training) {
        reset({
          title: training.title || '',
          description: training.description || '',
          instructor: training.instructor || '',
          scheduleDate: training.scheduleDate ? new Date(training.scheduleDate).toISOString().slice(0, 16) : '',
          durationHours: training.durationHours || 2,
          capacity: training.capacity || 30,
          department: training.department || 'All'
        });
      } else {
        reset({
          title: '',
          description: '',
          instructor: '',
          scheduleDate: '',
          durationHours: 2,
          capacity: 30,
          department: 'All'
        });
      }
      setServerError(null);
    }
  }, [show, training, reset]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setServerError(null);
    try {
      if (isEdit) {
        await trainingApi.updateTraining(training._id, data);
      } else {
        await trainingApi.createTraining(data);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to save training program');
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header border-bottom px-4 py-3">
            <h5 className="modal-title fw-bold text-dark">
              {isEdit ? 'Edit Training Program' : 'Schedule Training Program'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body px-4 py-3 vstack gap-3">
              {serverError && <AlertBanner type="danger" message={serverError} />}

              <div>
                <label className="form-label small fw-semibold text-secondary">Program Title *</label>
                <input
                  type="text"
                  className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                  placeholder="e.g. Microservices Architecture with Kubernetes"
                  {...register('title', { required: 'Title is required' })}
                />
                {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
              </div>

              <div>
                <label className="form-label small fw-semibold text-secondary">Course Syllabus & Description *</label>
                <textarea
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  rows="3"
                  placeholder="What skills will participants acquire in this workshop?"
                  {...register('description', { required: 'Description is required' })}
                />
                {errors.description && <div className="invalid-feedback">{errors.description.message}</div>}
              </div>

              <div className="row g-2">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Instructor / Speaker *</label>
                  <input
                    type="text"
                    className={`form-control ${errors.instructor ? 'is-invalid' : ''}`}
                    placeholder="e.g. Dr. Arvind Rao"
                    {...register('instructor', { required: 'Instructor name required' })}
                  />
                  {errors.instructor && <div className="invalid-feedback">{errors.instructor.message}</div>}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Schedule Date & Time *</label>
                  <input
                    type="datetime-local"
                    className={`form-control ${errors.scheduleDate ? 'is-invalid' : ''}`}
                    {...register('scheduleDate', { required: 'Schedule time is required' })}
                  />
                  {errors.scheduleDate && <div className="invalid-feedback">{errors.scheduleDate.message}</div>}
                </div>
              </div>

              <div className="row g-2">
                <div className="col-4">
                  <label className="form-label small fw-semibold text-secondary">Duration (Hours) *</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-control"
                    {...register('durationHours', { required: true, min: 0.5 })}
                  />
                </div>

                <div className="col-4">
                  <label className="form-label small fw-semibold text-secondary">Seat Capacity *</label>
                  <input
                    type="number"
                    className="form-control"
                    {...register('capacity', { required: true, min: 1 })}
                  />
                </div>

                <div className="col-4">
                  <label className="form-label small fw-semibold text-secondary">Target Department</label>
                  <select className="form-select" {...register('department')}>
                    <option value="All">All Departments</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top px-4 py-3">
              <button type="button" className="btn btn-light" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : isEdit ? 'Update Program' : 'Schedule Workshop'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TrainingModal;
