import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { authApi } from '../../api/authApi.js';
import AlertBanner from '../../components/common/AlertBanner.jsx';

export const AccountSettingsPage = () => {
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const newPasswordVal = watch('newPassword');

  const onSubmit = async (data) => {
    setSubmitting(true);
    setAlert(null);
    try {
      await authApi.changePassword(data.currentPassword, data.newPassword);
      setAlert({ type: 'success', message: 'Password updated successfully!' });
      reset();
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Password change failed' });
    } finally {
      setSubmitting(false);
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

      <div className="card border shadow-sm rounded-4 p-4 bg-white" style={{ maxWidth: '600px' }}>
        <h5 className="fw-bold text-dark mb-1">Security & Password Management</h5>
        <p className="text-muted small mb-4">
          Update your corporate account password. Choose a strong combination of uppercase, numbers, and symbols.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Current Password *</label>
            <input
              type="password"
              className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
              placeholder="••••••••••••"
              {...register('currentPassword', { required: 'Current password is required' })}
            />
            {errors.currentPassword && (
              <div className="invalid-feedback">{errors.currentPassword.message}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">New Password *</label>
            <input
              type="password"
              className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
              placeholder="••••••••••••"
              {...register('newPassword', {
                required: 'New password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
            />
            {errors.newPassword && (
              <div className="invalid-feedback">{errors.newPassword.message}</div>
            )}
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold text-secondary">Confirm New Password *</label>
            <input
              type="password"
              className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
              placeholder="••••••••••••"
              {...register('confirmPassword', {
                required: 'Please confirm your new password',
                validate: (val) => val === newPasswordVal || 'Passwords do not match'
              })}
            />
            {errors.confirmPassword && (
              <div className="invalid-feedback">{errors.confirmPassword.message}</div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary px-4 py-2"
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
