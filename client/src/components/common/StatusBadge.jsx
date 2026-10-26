import React from 'react';
import { getStatusBadgeClass } from '../../utils/formatters.js';

export const StatusBadge = ({ status }) => {
  if (!status) return null;
  const badgeClass = getStatusBadgeClass(status);

  return (
    <span className={`badge-status ${badgeClass}`}>
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'currentColor'
        }}
      />
      {status}
    </span>
  );
};

export default StatusBadge;
