import React from 'react';

export const AlertBanner = ({ type = 'danger', message, onClose = null }) => {
  if (!message) return null;

  return (
    <div
      className={`alert alert-${type} alert-dismissible fade show d-flex align-items-center justify-content-between mb-4 border-0 shadow-sm`}
      role="alert"
    >
      <div className="d-flex align-items-center gap-2">
        <i className={`bi ${type === 'danger' ? 'bi-exclamation-triangle-fill' : type === 'success' ? 'bi-check-circle-fill' : 'bi-info-circle-fill'}`} />
        <span className="small fw-medium">{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={onClose}
        />
      )}
    </div>
  );
};

export default AlertBanner;
