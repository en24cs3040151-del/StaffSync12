import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { employeeApi } from '../../api/employeeApi.js';
import { updateProfileSuccess } from '../../features/auth/authSlice.js';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import AlertBanner from '../../components/common/AlertBanner.jsx';
import { formatDate } from '../../utils/formatters.js';

export const MyProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const employee = user?.employee || {};

  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      phone: employee.phone || '',
      street: employee.address?.street || '',
      city: employee.address?.city || '',
      state: employee.address?.state || '',
      postalCode: employee.address?.postalCode || '',
      emergencyName: employee.emergencyContact?.name || '',
      emergencyRelationship: employee.emergencyContact?.relationship || '',
      emergencyPhone: employee.emergencyContact?.phone || ''
    }
  });

  const onSubmit = async (data) => {
    if (!employee._id) return;
    setSubmitting(true);
    setAlert(null);
    try {
      const payload = {
        phone: data.phone,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: 'USA'
        },
        emergencyContact: {
          name: data.emergencyName,
          relationship: data.emergencyRelationship,
          phone: data.emergencyPhone
        }
      };

      const res = await employeeApi.updateEmployee(employee._id, payload);
      dispatch(updateProfileSuccess(res.data));
      setAlert({ type: 'success', message: 'Profile information updated successfully.' });
      setIsEditing(false);
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to update profile' });
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

      {/* Header Profile Card */}
      <div className="card border shadow-sm rounded-4 p-4 bg-white">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-2"
              style={{ width: '80px', height: '80px' }}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h4 className="fw-bold text-dark mb-1">{user?.name}</h4>
              <div className="text-muted small mb-2">{employee.designation || 'Staff Member'} &bull; {employee.department || 'General'}</div>
              <div className="d-flex gap-2">
                <span className="badge bg-light text-dark border font-monospace">
                  {employee.employeeId || 'EMP-ID'}
                </span>
                <span className="badge bg-primary text-uppercase">
                  Role: {user?.role}
                </span>
              </div>
            </div>
          </div>

          <div>
            {!isEditing ? (
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => setIsEditing(true)}
              >
                <i className="bi bi-pencil me-1" /> Edit Contact Info
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  setIsEditing(false);
                  reset();
                }}
              >
                Cancel Editing
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Form / Details View */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row g-4">
          {/* Work Details (Read-only) */}
          <div className="col-12 col-lg-6">
            <div className="card border shadow-sm rounded-4 p-4 bg-white h-100">
              <h6 className="fw-bold text-dark mb-3">Organizational Information</h6>
              <div className="vstack gap-3 small">
                <div className="d-flex justify-content-between border-bottom pb-2">
                  <span className="text-muted">Work Email:</span>
                  <span className="fw-medium text-dark">{employee.workEmail || user?.email}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom pb-2">
                  <span className="text-muted">Department:</span>
                  <span className="fw-medium text-dark">{employee.department}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom pb-2">
                  <span className="text-muted">Designation:</span>
                  <span className="fw-medium text-dark">{employee.designation}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom pb-2">
                  <span className="text-muted">Reporting Manager:</span>
                  <span className="fw-medium text-dark">
                    {employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : 'Direct Report to Board / HR'}
                  </span>
                </div>
                <div className="d-flex justify-content-between border-bottom pb-2">
                  <span className="text-muted">Joining Date:</span>
                  <span className="fw-medium text-dark">{formatDate(employee.joiningDate)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Employment Status:</span>
                  <div><StatusBadge status={employee.employmentStatus || 'ACTIVE'} /></div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details (Editable) */}
          <div className="col-12 col-lg-6">
            <div className="card border shadow-sm rounded-4 p-4 bg-white h-100">
              <h6 className="fw-bold text-dark mb-3">Personal Contact & Address</h6>
              <div className="vstack gap-3 small">
                <div>
                  <label className="form-label text-muted mb-1">Phone Number</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    disabled={!isEditing}
                    {...register('phone')}
                  />
                </div>
                <div className="row g-2">
                  <div className="col-12">
                    <label className="form-label text-muted mb-1">Street Address</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      disabled={!isEditing}
                      {...register('street')}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label text-muted mb-1">City</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      disabled={!isEditing}
                      {...register('city')}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label text-muted mb-1">State & Zip</label>
                    <div className="d-flex gap-1">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="State"
                        disabled={!isEditing}
                        {...register('state')}
                      />
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Zip"
                        disabled={!isEditing}
                        {...register('postalCode')}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-top">
                  <div className="fw-semibold text-dark mb-2">Emergency Contact</div>
                  <div className="row g-2">
                    <div className="col-6">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Name"
                        disabled={!isEditing}
                        {...register('emergencyName')}
                      />
                    </div>
                    <div className="col-6">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Relationship"
                        disabled={!isEditing}
                        {...register('emergencyRelationship')}
                      />
                    </div>
                    <div className="col-12">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Emergency Phone"
                        disabled={!isEditing}
                        {...register('emergencyPhone')}
                      />
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="pt-3 border-top text-end">
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm px-4"
                      disabled={submitting}
                    >
                      {submitting ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MyProfilePage;
