import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { DEPARTMENTS, ROLES } from '../../utils/constants.js';
import { employeeApi } from '../../api/employeeApi.js';
import AlertBanner from '../../components/common/AlertBanner.jsx';

export const EmployeeModal = ({ show, onClose, onSuccess, employee = null }) => {
  const isEdit = !!employee;
  const [managers, setManagers] = useState([]);
  const [serverError, setServerError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      employeeId: '',
      firstName: '',
      lastName: '',
      workEmail: '',
      phone: '',
      department: DEPARTMENTS[0],
      designation: '',
      manager: '',
      role: ROLES.EMPLOYEE,
      password: ''
    }
  });

  useEffect(() => {
    if (show) {
      loadPotentialManagers();
      if (employee) {
        reset({
          employeeId: employee.employeeId || '',
          firstName: employee.firstName || '',
          lastName: employee.lastName || '',
          workEmail: employee.workEmail || '',
          phone: employee.phone || '',
          department: employee.department || DEPARTMENTS[0],
          designation: employee.designation || '',
          manager: employee.manager?._id || employee.manager || '',
          role: employee.user?.role || ROLES.EMPLOYEE,
          employmentStatus: employee.employmentStatus || 'ACTIVE'
        });
      } else {
        reset({
          employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
          firstName: '',
          lastName: '',
          workEmail: '',
          phone: '',
          department: DEPARTMENTS[0],
          designation: '',
          manager: '',
          role: ROLES.EMPLOYEE,
          password: 'StaffSync2026!'
        });
      }
      setServerError(null);
    }
  }, [show, employee, reset]);

  const loadPotentialManagers = async () => {
    try {
      const res = await employeeApi.getEmployees({ limit: 100 });
      setManagers(res.data || []);
    } catch {
      // Non-fatal
    }
  };

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      if (isEdit) {
        await employeeApi.updateEmployee(employee._id, formData);
      } else {
        await employeeApi.createEmployee(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setServerError(err.response?.data?.message || 'Operation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header border-bottom px-4 py-3">
            <h5 className="modal-title fw-bold text-dark">
              {isEdit ? 'Edit Employee Record' : 'Register New Employee'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body px-4 py-3">
              {serverError && <AlertBanner type="danger" message={serverError} />}

              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold text-secondary">Employee ID *</label>
                  <input
                    type="text"
                    className={`form-control ${errors.employeeId ? 'is-invalid' : ''}`}
                    disabled={isEdit}
                    {...register('employeeId', { required: 'Employee ID is required' })}
                  />
                  {errors.employeeId && <div className="invalid-feedback">{errors.employeeId.message}</div>}
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold text-secondary">First Name *</label>
                  <input
                    type="text"
                    className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                    {...register('firstName', { required: 'First name is required' })}
                  />
                  {errors.firstName && <div className="invalid-feedback">{errors.firstName.message}</div>}
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold text-secondary">Last Name *</label>
                  <input
                    type="text"
                    className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                    {...register('lastName', { required: 'Last name is required' })}
                  />
                  {errors.lastName && <div className="invalid-feedback">{errors.lastName.message}</div>}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Corporate Work Email *</label>
                  <input
                    type="email"
                    className={`form-control ${errors.workEmail ? 'is-invalid' : ''}`}
                    disabled={isEdit}
                    {...register('workEmail', {
                      required: 'Work email is required',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' }
                    })}
                  />
                  {errors.workEmail && <div className="invalid-feedback">{errors.workEmail.message}</div>}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Contact Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="+1 (555) 000-0000"
                    {...register('phone')}
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold text-secondary">Department *</label>
                  <select className="form-select" {...register('department', { required: true })}>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold text-secondary">Designation *</label>
                  <input
                    type="text"
                    className={`form-control ${errors.designation ? 'is-invalid' : ''}`}
                    placeholder="e.g. Senior Software Engineer"
                    {...register('designation', { required: 'Designation is required' })}
                  />
                  {errors.designation && <div className="invalid-feedback">{errors.designation.message}</div>}
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold text-secondary">System Access Role *</label>
                  <select className="form-select" {...register('role')}>
                    <option value={ROLES.EMPLOYEE}>Employee</option>
                    <option value={ROLES.MANAGER}>Manager</option>
                    <option value={ROLES.HR}>HR Administrator</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Assigned Reporting Manager</label>
                  <select className="form-select" {...register('manager')}>
                    <option value="">None (Top-level executive)</option>
                    {managers
                      .filter((m) => !isEdit || m._id !== employee?._id)
                      .map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.firstName} {m.lastName} ({m.designation} &bull; {m.department})
                        </option>
                      ))}
                  </select>
                </div>

                {!isEdit && (
                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Initial Account Password</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="StaffSync2026!"
                      {...register('password')}
                    />
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                      Default is StaffSync2026!
                    </small>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer border-top px-4 py-3">
              <button type="button" className="btn btn-light" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Saving...
                  </>
                ) : isEdit ? (
                  'Update Employee'
                ) : (
                  'Create Employee'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;
