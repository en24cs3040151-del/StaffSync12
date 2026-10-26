import React from 'react';

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="d-flex align-items-center justify-content-between p-3 border-top bg-white">
      <div className="text-muted small">
        Page <span className="fw-semibold text-dark">{currentPage}</span> of{' '}
        <span className="fw-semibold text-dark">{totalPages}</span>
      </div>
      <div className="btn-group btn-group-sm" role="group">
        <button
          type="button"
          className="btn btn-outline-secondary"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
