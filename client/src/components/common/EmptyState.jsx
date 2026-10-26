import React from 'react';

export const EmptyState = ({
  icon,
  title = 'No records found',
  message = 'There is currently no data matching your criteria.',
  action = null
}) => {
  return (
    <div className="text-center py-5 px-3">
      <div
        className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle"
        style={{ width: '64px', height: '64px', backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '1.75rem' }}
      >
        {icon || '📁'}
      </div>
      <h5 className="fw-semibold text-dark mb-1">{title}</h5>
      <p className="text-muted small mx-auto" style={{ maxWidth: '400px' }}>
        {message}
      </p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
};

export default EmptyState;
