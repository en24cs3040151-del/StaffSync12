import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { DEPARTMENTS } from '../../utils/constants.js';
import { announcementApi } from '../../api/announcementApi.js';
import AlertBanner from '../../components/common/AlertBanner.jsx';

export const AnnouncementModal = ({ show, announcement, onClose, onSuccess }) => {
  const isEdit = !!announcement;
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
      title: '',
      content: '',
      audience: 'ALL',
      department: '',
      priority: 'NORMAL',
      publicationStatus: 'PUBLISHED'
    }
  });

  const audienceVal = watch('audience');

  useEffect(() => {
    if (show) {
      if (announcement) {
        reset({
          title: announcement.title || '',
          content: announcement.content || '',
          audience: announcement.audience || 'ALL',
          department: announcement.department || '',
          priority: announcement.priority || 'NORMAL',
          publicationStatus: announcement.publicationStatus || 'PUBLISHED'
        });
      } else {
        reset({
          title: '',
          content: '',
          audience: 'ALL',
          department: '',
          priority: 'NORMAL',
          publicationStatus: 'PUBLISHED'
        });
      }
      setServerError(null);
    }
  }, [show, announcement, reset]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setServerError(null);
    try {
      if (isEdit) {
        await announcementApi.updateAnnouncement(announcement._id, data);
      } else {
        await announcementApi.createAnnouncement(data);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to save announcement');
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
            <h5 className="modal-title fw-bold text-dark">
              {isEdit ? 'Edit Announcement' : 'Publish New Announcement'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body px-4 py-3 vstack gap-3">
              {serverError && <AlertBanner type="danger" message={serverError} />}

              <div>
                <label className="form-label small fw-semibold text-secondary">Title *</label>
                <input
                  type="text"
                  className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                  placeholder="e.g. Q4 Company All-Hands Town Hall"
                  {...register('title', { required: 'Title is required' })}
                />
                {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
              </div>

              <div>
                <label className="form-label small fw-semibold text-secondary">Content *</label>
                <textarea
                  className={`form-control ${errors.content ? 'is-invalid' : ''}`}
                  rows="4"
                  placeholder="Detailed announcement text..."
                  {...register('content', { required: 'Content is required' })}
                />
                {errors.content && <div className="invalid-feedback">{errors.content.message}</div>}
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label small fw-semibold text-secondary">Target Audience</label>
                  <select className="form-select" {...register('audience')}>
                    <option value="ALL">Everyone (Organization-wide)</option>
                    <option value="MANAGERS">Managers Only</option>
                    <option value="DEPARTMENT">Specific Department</option>
                  </select>
                </div>

                <div className="col-6">
                  <label className="form-label small fw-semibold text-secondary">Priority Level</label>
                  <select className="form-select" {...register('priority')}>
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              {audienceVal === 'DEPARTMENT' && (
                <div>
                  <label className="form-label small fw-semibold text-secondary">Target Department</label>
                  <select className="form-select" {...register('department')}>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="modal-footer border-top px-4 py-3">
              <button type="button" className="btn btn-light" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : isEdit ? 'Update Notice' : 'Publish Notice'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;
