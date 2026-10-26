import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../features/auth/authSlice.js';

export const LandingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleQuickDemo = async (email) => {
    const result = await dispatch(loginUser({ email, password: 'StaffSync2026!' }));
    if (loginUser.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-white">
      {/* Top Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light border-bottom py-3 px-4 px-md-5">
        <div className="container-fluid px-0">
          <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
            <div className="brand-icon">S</div>
            <div>
              <span className="fs-4 fw-bold text-dark tracking-tight">StaffSync</span>
              <div className="small text-muted" style={{ fontSize: '0.7rem', marginTop: '-4px' }}>
                People. Processes. Productivity.
              </div>
            </div>
          </Link>

          <div className="d-flex align-items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary px-4">
                Go to Dashboard &rarr;
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary px-4">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-5 px-4 px-md-5 bg-light flex-grow-1 d-flex align-items-center">
        <div className="container py-4">
          <div className="row align-items-center gy-5">
            <div className="col-lg-7">
              <span className="badge bg-indigo-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-semibold small mb-3">
                Modern Human Resource Management
              </span>
              <h1 className="display-4 fw-extrabold text-dark tracking-tight mb-3">
                People. Processes. <br />
                <span style={{ color: '#4f46e5' }}>Productivity.</span>
              </h1>
              <p className="lead text-muted mb-4" style={{ maxWidth: '580px' }}>
                StaffSync unifies employee records, attendance monitoring, structured leave workflows,
                upskilling programs, and executive analytics into one secure, intuitive MERN-stack platform.
              </p>

              {/* Demo Persona Quick-Launch Bar */}
              <div className="p-3 bg-white rounded-3 border shadow-sm mb-4" style={{ maxWidth: '600px' }}>
                <div className="small fw-semibold text-muted text-uppercase mb-2" style={{ letterSpacing: '0.05em' }}>
                  ⚡ Quick Demo Launch (Pre-configured Evaluation Accounts):
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary fw-medium"
                    onClick={() => handleQuickDemo('hr@staffsync.io')}
                  >
                    👑 HR Admin (Eleanor)
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary fw-medium"
                    onClick={() => handleQuickDemo('manager@staffsync.io')}
                  >
                    👔 Manager (Marcus)
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary fw-medium"
                    onClick={() => handleQuickDemo('employee@staffsync.io')}
                  >
                    💼 Employee (Sophia)
                  </button>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3">
                <Link to="/login" className="btn btn-primary btn-lg px-4 fs-6">
                  Access Portal &rarr;
                </Link>
                <a
                  href="#features"
                  className="btn btn-outline-secondary btn-lg px-4 fs-6"
                >
                  Explore Capabilities
                </a>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="p-4 bg-white rounded-4 border shadow-sm">
                <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
                  <span className="fw-semibold text-dark">StaffSync Enterprise Preview</span>
                  <span className="badge bg-success-subtle text-success border border-success-subtle">
                    Live System
                  </span>
                </div>
                <div className="vstack gap-3">
                  <div className="p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
                    <div>
                      <div className="small text-muted">Daily Attendance Rate</div>
                      <div className="fw-bold fs-5 text-dark">94.8% Active</div>
                    </div>
                    <span className="badge-status badge-present">Normal</span>
                  </div>
                  <div className="p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
                    <div>
                      <div className="small text-muted">Role Security</div>
                      <div className="fw-bold fs-6 text-dark">RBAC Enforced (HR, Mgr, Emp)</div>
                    </div>
                    <span className="badge bg-primary">JWT + Bcrypt</span>
                  </div>
                  <div className="p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
                    <div>
                      <div className="small text-muted">Leave Approvals</div>
                      <div className="fw-bold fs-6 text-dark">Zero-Conflict Lock</div>
                    </div>
                    <span className="badge-status badge-approved">Audit-logged</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section id="features" className="py-5 px-4 px-md-5">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark mb-2">Designed for High-Performing Teams</h2>
            <p className="text-muted">A balanced ecosystem providing exact controls for every stakeholder.</p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="p-4 bg-light rounded-3 border h-100">
                <div className="stat-icon mb-3 bg-primary text-white">
                  <i className="bi bi-clock-history" />
                </div>
                <h5 className="fw-bold text-dark">Attendance Precision</h5>
                <p className="text-muted small mb-0">
                  Daily check-in / check-out with automatic worked-minute derivations, duplicate prevention, and late arrival flags.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-4 bg-light rounded-3 border h-100">
                <div className="stat-icon mb-3 bg-success text-white">
                  <i className="bi bi-calendar-check" />
                </div>
                <h5 className="fw-bold text-dark">Structured Leave Workflows</h5>
                <p className="text-muted small mb-0">
                  Overlap collision prevention, mandatory rejection justifications, and instant manager-to-employee notifications.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-4 bg-light rounded-3 border h-100">
                <div className="stat-icon mb-3 bg-info text-white">
                  <i className="bi bi-graph-up-arrow" />
                </div>
                <h5 className="fw-bold text-dark">Executive Analytics</h5>
                <p className="text-muted small mb-0">
                  Real-time database-driven attendance trends, departmental workforce distributions, and utilization metrics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 border-top text-center text-muted small bg-light">
        StaffSync &bull; Modern Human Resource Management System &bull; Production individual IT portfolio project.
      </footer>
    </div>
  );
};

export default LandingPage;
