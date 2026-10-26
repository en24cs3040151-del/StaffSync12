import React, { useEffect, useState } from 'react';
import { attendanceApi } from '../../api/attendanceApi.js';
import { employeeApi } from '../../api/employeeApi.js';
import { DEPARTMENTS } from '../../utils/constants.js';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import AlertBanner from '../../components/common/AlertBanner.jsx';
import { formatTime, formatDurationMinutes } from '../../utils/formatters.js';

export const OrgAttendancePage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [alert, setAlert] = useState(null);

  // Manual Attendance modal state
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [employeesList, setEmployeesList] = useState([]);
  const [manualEmpId, setManualEmpId] = useState('');
  const [manualStatus, setManualStatus] = useState('PRESENT');
  const [manualDate, setManualDate] = useState(new Date().toISOString().slice(0, 10));
  const [manualNotes, setManualNotes] = useState('');

  useEffect(() => {
    fetchOrgAttendance();
  }, [selectedDate, department, status, page]);

  const fetchOrgAttendance = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getOrgAttendance({
        date: selectedDate,
        department,
        status,
        search,
        page,
        limit: 15
      });
      setRecords(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to load organization attendance' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrgAttendance();
  };

  const handleOpenManualModal = async () => {
    try {
      const res = await employeeApi.getEmployees({ limit: 100 });
      setEmployeesList(res.data || []);
      if (res.data?.length > 0) {
        setManualEmpId(res.data[0]._id);
      }
      setManualModalOpen(true);
    } catch {
      setAlert({ type: 'danger', message: 'Could not load employees for manual recording' });
    }
  };

  const handleSaveManual = async (e) => {
    e.preventDefault();
    try {
      await attendanceApi.recordManual({
        employeeId: manualEmpId,
        attendanceDate: manualDate,
        status: manualStatus,
        notes: manualNotes
      });
      setAlert({ type: 'success', message: 'Manual attendance record saved successfully.' });
      setManualModalOpen(false);
      fetchOrgAttendance();
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to record manual attendance' });
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

      {/* Header and Controls */}
      <div className="card border shadow-sm rounded-3 p-3 bg-white">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-0">Organization Attendance Records</h5>
            <small className="text-muted">Master attendance ledger across all corporate business units</small>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-2"
            onClick={handleOpenManualModal}
          >
            <i className="bi bi-pencil-square" />
            <span>Record Manual Entry</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="row g-2 mt-3 pt-3 border-top">
          <div className="col-12 col-md-4">
            <form onSubmit={handleSearchSubmit} className="input-group input-group-sm">
              <input
                type="text"
                className="form-control"
                placeholder="Search by employee name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-outline-secondary" type="submit">
                <i className="bi bi-search" />
              </button>
            </form>
          </div>

          <div className="col-4 col-md-3">
            <input
              type="date"
              className="form-control form-control-sm"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="col-4 col-md-3">
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

          <div className="col-4 col-md-2">
            <select
              className="form-select form-select-sm"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="HALF_DAY">Half Day</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border shadow-sm rounded-3 overflow-hidden bg-white">
        {loading ? (
          <LoadingSpinner message="Querying organization attendance..." />
        ) : records.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No records found"
            message={`No attendance records found for ${selectedDate}.`}
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="small text-muted">EMPLOYEE</th>
                  <th className="small text-muted">ID</th>
                  <th className="small text-muted">DEPARTMENT</th>
                  <th className="small text-muted">CHECK-IN</th>
                  <th className="small text-muted">CHECK-OUT</th>
                  <th className="small text-muted">DURATION</th>
                  <th className="small text-muted">STATUS</th>
                  <th className="small text-muted">NOTES</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div className="fw-semibold text-dark">
                        {r.employee?.firstName} {r.employee?.lastName}
                      </div>
                      <div className="small text-muted">{r.employee?.designation}</div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border font-monospace">
                        {r.employee?.employeeId}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-secondary-subtle text-secondary border">
                        {r.employee?.department}
                      </span>
                    </td>
                    <td className="small">{formatTime(r.checkInTime)}</td>
                    <td className="small">{formatTime(r.checkOutTime)}</td>
                    <td>
                      <span className="fw-semibold text-indigo">
                        {formatDurationMinutes(r.workedMinutes)}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="small text-muted">{r.notes || '—'}</td>
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

      {/* Manual Entry Modal */}
      {manualModalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom px-4 py-3">
                <h5 className="modal-title fw-bold text-dark">Record Manual Attendance</h5>
                <button type="button" className="btn-close" onClick={() => setManualModalOpen(false)} />
              </div>
              <form onSubmit={handleSaveManual}>
                <div className="modal-body px-4 py-3 vstack gap-3">
                  <div>
                    <label className="form-label small fw-semibold text-secondary">Employee</label>
                    <select
                      className="form-select"
                      value={manualEmpId}
                      onChange={(e) => setManualEmpId(e.target.value)}
                      required
                    >
                      {employeesList.map((e) => (
                        <option key={e._id} value={e._id}>
                          {e.firstName} {e.lastName} ({e.employeeId} - {e.department})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label small fw-semibold text-secondary">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={manualDate}
                      onChange={(e) => setManualDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label small fw-semibold text-secondary">Status</label>
                    <select
                      className="form-select"
                      value={manualStatus}
                      onChange={(e) => setManualStatus(e.target.value)}
                    >
                      <option value="PRESENT">Present</option>
                      <option value="LATE">Late</option>
                      <option value="HALF_DAY">Half Day</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label small fw-semibold text-secondary">Administrative Notes</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="e.g. Remote work approved, or manual system timecard adjustment"
                      value={manualNotes}
                      onChange={(e) => setManualNotes(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top px-4 py-3">
                  <button type="button" className="btn btn-light" onClick={() => setManualModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgAttendancePage;
