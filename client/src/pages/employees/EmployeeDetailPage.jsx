import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { employeeApi } from '../../api/employeeApi.js';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import AlertBanner from '../../components/common/AlertBanner.jsx';
import { formatDate } from '../../utils/formatters.js';

export const EmployeeDetailPage = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    setLoading(true);
    try {
      const res = await employeeApi.getEmployeeById(id);
      setEmployee(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Employee not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading employee profile..." />;
  if (error) return <AlertBanner type="danger" message={error} />;
  if (!employee) return null;

  return (
    <div className="vstack gap-4">
      <div className="d-flex align-items-center justify-content-between">
        <Link to="/employees" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1">
          <i className="bi bi-arrow-left" /> Back to Directory
        </Link>
      </div>

      <div className="row g-4">
        {/* Profile Summary Card */}
        <div className="col-12 col-lg-4">
          <div className="card border shadow-sm rounded-4 p-4 text-center bg-white h-100">
            <div
              className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center fw-bold fs-2 mx-auto mb-3"
              style={{ width: '90px', height: '90px' }}
            >
              {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
            </div>
            <h5 className="fw-bold text-dark mb-1">
              {employee.firstName} {employee.lastName}
            </h5>
            <div className="text-muted small mb-2">{employee.designation}</div>
            <div className="d-flex justify-content-center gap-2 mb-3">
              <span className="badge bg-light text-dark border font-monospace">
                {employee.employeeId}
              </span>
              <StatusBadge status={employee.employmentStatus} />
            </div>

            <div className="border-top pt-3 text-start small vstack gap-2">
              <div>
                <span className="text-muted">Work Email:</span>
                <div className="fw-medium text-dark">{employee.workEmail}</div>
              </div>
              <div>
                <span className="text-muted">Phone:</span>
                <div className="fw-medium text-dark">{employee.phone || '—'}</div>
              </div>
              <div>
                <span className="text-muted">Department:</span>
                <div className="fw-medium text-dark">{employee.department}</div>
              </div>
              <div>
                <span className="text-muted">Reporting Manager:</span>
                <div className="fw-medium text-dark">
                  {employee.manager
                    ? `${employee.manager.firstName} ${employee.manager.lastName}`
                    : 'None (Direct to Executive)'}
                </div>
              </div>
              <div>
                <span className="text-muted">Joining Date:</span>
                <div className="fw-medium text-dark">{formatDate(employee.joiningDate)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs / Information */}
        <div className="col-12 col-lg-8">
          <div className="vstack gap-4">
            {/* Contact & Address */}
            <div className="card border shadow-sm rounded-4 p-4 bg-white">
              <h6 className="fw-bold text-dark mb-3">Residential Address</h6>
              <div className="row g-3 small">
                <div className="col-12 col-sm-6">
                  <span className="text-muted">Street:</span>
                  <div className="fw-medium text-dark">{employee.address?.street || 'Not provided'}</div>
                </div>
                <div className="col-12 col-sm-6">
                  <span className="text-muted">City & State:</span>
                  <div className="fw-medium text-dark">
                    {employee.address?.city || '—'}, {employee.address?.state || '—'}
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <span className="text-muted">Postal Code:</span>
                  <div className="fw-medium text-dark">{employee.address?.postalCode || '—'}</div>
                </div>
                <div className="col-12 col-sm-6">
                  <span className="text-muted">Country:</span>
                  <div className="fw-medium text-dark">{employee.address?.country || 'USA'}</div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="card border shadow-sm rounded-4 p-4 bg-white">
              <h6 className="fw-bold text-dark mb-3">Emergency Contact</h6>
              <div className="row g-3 small">
                <div className="col-12 col-sm-4">
                  <span className="text-muted">Contact Name:</span>
                  <div className="fw-medium text-dark">
                    {employee.emergencyContact?.name || 'Not provided'}
                  </div>
                </div>
                <div className="col-12 col-sm-4">
                  <span className="text-muted">Relationship:</span>
                  <div className="fw-medium text-dark">
                    {employee.emergencyContact?.relationship || '—'}
                  </div>
                </div>
                <div className="col-12 col-sm-4">
                  <span className="text-muted">Contact Phone:</span>
                  <div className="fw-medium text-dark">
                    {employee.emergencyContact?.phone || '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* System Account Info */}
            <div className="card border shadow-sm rounded-4 p-4 bg-white">
              <h6 className="fw-bold text-dark mb-3">System Account & Security</h6>
              <div className="row g-3 small">
                <div className="col-12 col-sm-4">
                  <span className="text-muted">Role:</span>
                  <div>
                    <span className="badge bg-primary text-uppercase">
                      {employee.user?.role || 'EMPLOYEE'}
                    </span>
                  </div>
                </div>
                <div className="col-12 col-sm-4">
                  <span className="text-muted">Account Status:</span>
                  <div>
                    <StatusBadge status={employee.user?.accountStatus || 'ACTIVE'} />
                  </div>
                </div>
                <div className="col-12 col-sm-4">
                  <span className="text-muted">Last Login:</span>
                  <div className="fw-medium text-dark">
                    {employee.user?.lastLogin ? formatDate(employee.user.lastLogin) : 'Never'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailPage;
