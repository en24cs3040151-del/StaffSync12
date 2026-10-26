import React from 'react';
import { Link } from 'react-router-dom';

export const UnauthorizedPage = () => {
  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light p-4 text-center">
      <div
        className="rounded-circle bg-danger bg-opacity-10 text-danger d-inline-flex align-items-center justify-content-center mb-3"
        style={{ width: '80px', height: '80px', fontSize: '2.5rem' }}
      >
        <i className="bi bi-shield-lock-fill" />
      </div>
      <h2 className="fw-bold text-dark mb-2">Access Denied (403)</h2>
      <p className="text-muted mb-4" style={{ maxWidth: '440px' }}>
        You do not have the required role or administrative permissions to access this specific area.
        Please contact your HR administrator if you believe this is an error.
      </p>
      <div className="d-flex gap-2">
        <Link to="/dashboard" className="btn btn-primary px-4">
          Return to Dashboard
        </Link>
        <Link to="/profile" className="btn btn-outline-secondary px-4">
          View My Profile
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
