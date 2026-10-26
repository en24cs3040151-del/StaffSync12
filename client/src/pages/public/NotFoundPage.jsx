import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light p-4 text-center">
      <div
        className="rounded-circle bg-secondary bg-opacity-10 text-secondary d-inline-flex align-items-center justify-content-center mb-3"
        style={{ width: '80px', height: '80px', fontSize: '2.5rem' }}
      >
        <i className="bi bi-compass" />
      </div>
      <h2 className="fw-bold text-dark mb-2">Page Not Found (404)</h2>
      <p className="text-muted mb-4" style={{ maxWidth: '420px' }}>
        The page you are looking for does not exist or has been relocated within StaffSync.
      </p>
      <Link to="/dashboard" className="btn btn-primary px-4">
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
