import React from 'react';

export const StatCard = ({ title, value, icon, iconBg = '#eef2ff', iconColor = '#4f46e5', subtitle = null }) => {
  return (
    <div className="stat-card h-100">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <span className="text-muted fw-medium text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
          {title}
        </span>
        <div className="stat-icon" style={{ backgroundColor: iconBg, color: iconColor }}>
          {icon}
        </div>
      </div>
      <div className="d-flex align-items-baseline">
        <h3 className="fw-bold mb-0 text-dark" style={{ letterSpacing: '-0.02em' }}>
          {value}
        </h3>
      </div>
      {subtitle && (
        <div className="mt-2 text-muted" style={{ fontSize: '0.8rem' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default StatCard;
