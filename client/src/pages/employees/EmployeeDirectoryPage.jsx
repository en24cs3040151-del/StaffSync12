import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { employeeApi } from '../../api/employeeApi.js';
import { ROLES, DEPARTMENTS } from '../../utils/constants.js';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import AlertBanner from '../../components/common/AlertBanner.jsx';
import EmployeeModal from './EmployeeModal.jsx';

export const EmployeeDirectoryPage = ({ teamOnly = false }) => {
  const { user } = useSelector((state) => state.auth);
  const isHR = user?.role === ROLES.HR;

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, [page, department, employmentStatus, teamOnly]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await employeeApi.getEmployees({
        page,
        limit: 10,
        search,
        department,
        employmentStatus,
        teamOnly: teamOnly ? 'true' : 'false'
      });
      setEmployees(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalCount(res.meta?.total || 0);
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to fetch directory' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEmployees();
  };

  const handleDeactivate = async (id, empId) => {
    if (window.confirm(`Are you sure you want to deactivate employee account ${empId}?`)) {
      try {
        await employeeApi.deactivateEmployee(id);
        setAlert({ type: 'success', message: `Employee ${empId} deactivated successfully.` });
        fetchEmployees();
      } catch (err) {
        setAlert({ type: 'danger', message: err.response?.data?.message || 'Deactivation failed' });
      }
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

      {/* Header bar */}
      <div className="card border shadow-sm rounded-3 p-3 bg-white">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-0">
              {teamOnly ? 'My Assigned Team Directory' : 'Organization Employee Directory'}
            </h5>
            <small className="text-muted">
              {totalCount} total registered active members
            </small>
          </div>

          {isHR && !teamOnly && (
            <button
              type="button"
              className="btn btn-primary d-inline-flex align-items-center gap-2"
              onClick={() => {
                setSelectedEmployee(null);
                setModalOpen(true);
              }}
            >
              <i className="bi bi-person-plus-fill" />
              <span>Add Employee</span>
            </button>
          )}
        </div>

        {/* Filter controls */}
        <div className="row g-2 mt-3 pt-3 border-top">
          <div className="col-12 col-md-5">
            <form onSubmit={handleSearchSubmit} className="input-group input-group-sm">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, ID, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-outline-secondary" type="submit">
                <i className="bi bi-search" />
              </button>
            </form>
          </div>

          <div className="col-6 col-md-3">
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
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-sm"
              value={employmentStatus}
              onChange={(e) => {
                setEmploymentStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ON_LEAVE">On Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="card border shadow-sm rounded-3 overflow-hidden bg-white">
        {loading ? (
          <LoadingSpinner message="Fetching employee records..." />
        ) : employees.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No employees found"
            message="No employees match your search criteria. Try modifying your filters."
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="small text-muted">EMPLOYEE</th>
                  <th className="small text-muted">ID</th>
                  <th className="small text-muted">DESIGNATION</th>
                  <th className="small text-muted">DEPARTMENT</th>
                  <th className="small text-muted">MANAGER</th>
                  <th className="small text-muted">STATUS</th>
                  <th className="small text-muted text-end">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold"
                          style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}
                        >
                          {emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}
                        </div>
                        <div>
                          <div className="fw-semibold text-dark">
                            {emp.firstName} {emp.lastName}
                          </div>
                          <div className="small text-muted">{emp.workEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border font-monospace">
                        {emp.employeeId}
                      </span>
                    </td>
                    <td>
                      <div className="small fw-medium text-dark">{emp.designation}</div>
                    </td>
                    <td>
                      <span className="badge bg-secondary-subtle text-secondary border">
                        {emp.department}
                      </span>
                    </td>
                    <td className="small text-muted">
                      {emp.manager ? `${emp.manager.firstName} ${emp.manager.lastName}` : '—'}
                    </td>
                    <td>
                      <StatusBadge status={emp.employmentStatus} />
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <Link
                          to={`/employees/${emp._id}`}
                          className="btn btn-outline-secondary"
                          title="View Profile Details"
                        >
                          <i className="bi bi-eye" />
                        </Link>
                        {isHR && (
                          <>
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              title="Edit Record"
                              onClick={() => {
                                setSelectedEmployee(emp);
                                setModalOpen(true);
                              }}
                            >
                              <i className="bi bi-pencil" />
                            </button>
                            {emp.employmentStatus === 'ACTIVE' && (
                              <button
                                type="button"
                                className="btn btn-outline-danger"
                                title="Deactivate"
                                onClick={() => handleDeactivate(emp._id, emp.employeeId)}
                              >
                                <i className="bi bi-person-x" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
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

      <EmployeeModal
        show={modalOpen}
        employee={selectedEmployee}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setAlert({ type: 'success', message: 'Employee record successfully updated!' });
          fetchEmployees();
        }}
      />
    </div>
  );
};

export default EmployeeDirectoryPage;
