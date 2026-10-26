import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginUser, clearError } from '../../features/auth/authSlice.js';
import AlertBanner from '../../components/common/AlertBanner.jsx';

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const isExpired = new URLSearchParams(location.search).get('expired') === 'true';

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!email.trim() || !password) {
      setValidationError('Please enter both email and password.');
      return;
    }

    const result = await dispatch(loginUser({ email: email.trim(), password }));
    if (loginUser.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  const handleFillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('StaffSync2026!');
    setValidationError('');
    dispatch(clearError());
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light py-5 px-3">
      <div className="text-center mb-4">
        <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none">
          <div className="brand-icon">S</div>
          <span className="fs-3 fw-bold text-dark tracking-tight">StaffSync</span>
        </Link>
        <p className="text-muted small mt-1">People. Processes. Productivity.</p>
      </div>

      <div className="card border shadow-sm p-4 p-md-5 rounded-4 bg-white" style={{ maxWidth: '440px', width: '100%' }}>
        <h4 className="fw-bold text-dark mb-1">Sign In</h4>
        <p className="text-muted small mb-4">Access your workspace using your corporate credentials.</p>

        {isExpired && (
          <AlertBanner
            type="warning"
            message="Your session has expired. Please sign in again."
          />
        )}

        {(error || validationError) && (
          <AlertBanner
            type="danger"
            message={error || validationError}
            onClose={() => {
              setValidationError('');
              dispatch(clearError());
            }}
          />
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Work Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. hr@staffsync.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label small fw-semibold text-secondary mb-0">Password</label>
            </div>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Evaluation Preset Selector */}
        <div className="mt-4 pt-3 border-top">
          <div className="text-center text-muted small fw-semibold text-uppercase mb-2" style={{ fontSize: '0.7rem' }}>
            ⚡ Fast Evaluation Logins:
          </div>
          <div className="d-grid gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary text-start d-flex justify-content-between align-items-center"
              onClick={() => handleFillDemo('hr@staffsync.io')}
            >
              <span>👑 <strong>HR Admin</strong> (Eleanor Vance)</span>
              <span className="badge bg-light text-dark border">Fill</span>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary text-start d-flex justify-content-between align-items-center"
              onClick={() => handleFillDemo('manager@staffsync.io')}
            >
              <span>👔 <strong>Manager</strong> (Marcus Brody)</span>
              <span className="badge bg-light text-dark border">Fill</span>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary text-start d-flex justify-content-between align-items-center"
              onClick={() => handleFillDemo('employee@staffsync.io')}
            >
              <span>💼 <strong>Employee</strong> (Sophia Chen)</span>
              <span className="badge bg-light text-dark border">Fill</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center text-muted small">
        <Link to="/" className="text-decoration-none text-muted">
          &larr; Back to Landing Page
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
