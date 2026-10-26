import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { trainingApi } from '../../api/trainingApi.js';
import { ROLES, DEPARTMENTS } from '../../utils/constants.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import AlertBanner from '../../components/common/AlertBanner.jsx';
import TrainingModal from './TrainingModal.jsx';
import { formatDate } from '../../utils/formatters.js';

export const TrainingsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const isHR = user?.role === ROLES.HR;
  const isManager = user?.role === ROLES.MANAGER;
  const canManage = isHR || isManager;
  const currentEmployeeId = user?.employee?._id || user?.employee;

  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchTrainings();
  }, [departmentFilter]);

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const res = await trainingApi.getTrainings({
        department: departmentFilter,
        search,
        limit: 20
      });
      setTrainings(res.data || []);
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to load trainings' });
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (id) => {
    setActionLoadingId(id);
    try {
      await trainingApi.enroll(id);
      setAlert({ type: 'success', message: 'You have enrolled in this training successfully!' });
      fetchTrainings();
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Enrollment failed' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelEnrollment = async (id) => {
    setActionLoadingId(id);
    try {
      await trainingApi.cancelEnrollment(id);
      setAlert({ type: 'success', message: 'Enrollment cancelled.' });
      fetchTrainings();
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to cancel enrollment' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this training program?')) {
      try {
        await trainingApi.deleteTraining(id);
        setAlert({ type: 'success', message: 'Training program deleted.' });
        fetchTrainings();
      } catch (err) {
        setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to delete program' });
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

      {/* Header and Filter */}
      <div className="card border shadow-sm rounded-3 p-3 bg-white">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-0">Professional Training & Upskilling</h5>
            <small className="text-muted">Explore internal workshops, technical certifications, and leadership clinics</small>
          </div>

          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select form-select-sm"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              <option value="All">Company-wide</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {canManage && (
              <button
                type="button"
                className="btn btn-primary btn-sm text-nowrap d-inline-flex align-items-center gap-1"
                onClick={() => {
                  setSelectedTraining(null);
                  setModalOpen(true);
                }}
              >
                <i className="bi bi-plus-circle" /> Schedule Workshop
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Training Programs Grid */}
      {loading ? (
        <LoadingSpinner message="Loading courses and workshops..." />
      ) : trainings.length === 0 ? (
        <EmptyState
          icon="🎓"
          title="No training programs found"
          message="There are currently no training workshops scheduled matching your filters."
        />
      ) : (
        <div className="row g-4">
          {trainings.map((t) => {
            const activeEnrollments = (t.enrollments || []).filter((e) => e.status === 'ENROLLED');
            const isEnrolled = activeEnrollments.some(
              (e) => (e.employee?._id || e.employee) === currentEmployeeId
            );
            const isFull = activeEnrollments.length >= t.capacity;

            return (
              <div key={t._id} className="col-12 col-md-6 col-xl-4">
                <div className="card border shadow-sm rounded-4 h-100 p-4 bg-white d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                        {t.department || 'All Departments'}
                      </span>
                      <span className="small text-muted font-monospace">
                        {t.durationHours} hrs
                      </span>
                    </div>

                    <h5 className="fw-bold text-dark mb-2">{t.title}</h5>
                    <p className="text-muted small mb-3" style={{ minHeight: '48px' }}>
                      {t.description}
                    </p>

                    <div className="small vstack gap-1 p-3 bg-light rounded-3 mb-3 border">
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Instructor:</span>
                        <span className="fw-semibold text-dark">{t.instructor}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Schedule:</span>
                        <span className="fw-medium text-dark">{formatDate(t.scheduleDate)}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Capacity:</span>
                        <span className="fw-semibold text-dark">
                          {activeEnrollments.length} / {t.capacity} Seats
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-top d-flex align-items-center justify-content-between">
                    <div>
                      {isEnrolled ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          disabled={actionLoadingId === t._id}
                          onClick={() => handleCancelEnrollment(t._id)}
                        >
                          <i className="bi bi-x-circle me-1" /> Cancel Enrollment
                        </button>
                      ) : isFull ? (
                        <span className="badge bg-secondary p-2">Class Full</span>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          disabled={actionLoadingId === t._id}
                          onClick={() => handleEnroll(t._id)}
                        >
                          <i className="bi bi-check-circle me-1" /> Enroll in Class
                        </button>
                      )}
                    </div>

                    {isHR && (
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className="btn btn-light"
                          onClick={() => {
                            setSelectedTraining(t);
                            setModalOpen(true);
                          }}
                        >
                          <i className="bi bi-pencil" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-light text-danger"
                          onClick={() => handleDelete(t._id)}
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TrainingModal
        show={modalOpen}
        training={selectedTraining}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setAlert({ type: 'success', message: 'Training program saved successfully.' });
          fetchTrainings();
        }}
      />
    </div>
  );
};

export default TrainingsPage;
