import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROLES } from '../../utils/constants.js';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role || ROLES.EMPLOYEE;

  const handleLinkClick = () => {
    if (window.innerWidth < 992 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay d-lg-none" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'show' : ''}`}>
        <NavLink to="/dashboard" className="sidebar-brand" onClick={handleLinkClick}>
          <div className="brand-icon">S</div>
          <div>
            <div className="brand-text">StaffSync</div>
            <div className="brand-tagline">People. Processes. Productivity.</div>
          </div>
        </NavLink>

        <div className="sidebar-nav">
          <div className="nav-section-title">Core</div>
          <NavLink to="/dashboard" className="nav-item-link" onClick={handleLinkClick}>
            <i className="bi bi-grid-fill" />
            <span>Dashboard</span>
          </NavLink>

          {/* HR SPECIFIC NAVIGATION */}
          {role === ROLES.HR && (
            <>
              <div className="nav-section-title">People & Org</div>
              <NavLink to="/employees" className="nav-item-link" onClick={handleLinkClick}>
                <i className="bi bi-people-fill" />
                <span>Employee Directory</span>
              </NavLink>
              <NavLink to="/attendance/org" className="nav-item-link" onClick={handleLinkClick}>
                <i className="bi bi-calendar2-check-fill" />
                <span>Org Attendance</span>
              </NavLink>
              <NavLink to="/leaves/manage" className="nav-item-link" onClick={handleLinkClick}>
                <i className="bi bi-file-earmark-text-fill" />
                <span>Leave Management</span>
              </NavLink>
              <NavLink to="/reports" className="nav-item-link" onClick={handleLinkClick}>
                <i className="bi bi-bar-chart-line-fill" />
                <span>Reports & Analytics</span>
              </NavLink>
            </>
          )}

          {/* MANAGER SPECIFIC NAVIGATION */}
          {role === ROLES.MANAGER && (
            <>
              <div className="nav-section-title">Team Management</div>
              <NavLink to="/team" className="nav-item-link" onClick={handleLinkClick}>
                <i className="bi bi-person-lines-fill" />
                <span>Team Directory</span>
              </NavLink>
              <NavLink to="/attendance/team" className="nav-item-link" onClick={handleLinkClick}>
                <i className="bi bi-calendar-check-fill" />
                <span>Team Attendance</span>
              </NavLink>
              <NavLink to="/leaves/team" className="nav-item-link" onClick={handleLinkClick}>
                <i className="bi bi-clipboard2-check-fill" />
                <span>Team Leaves</span>
              </NavLink>
            </>
          )}

          {/* EMPLOYEE WORKSPACE NAVIGATION */}
          <div className="nav-section-title">Self Service</div>
          <NavLink to="/attendance/my" className="nav-item-link" onClick={handleLinkClick}>
            <i className="bi bi-clock-history" />
            <span>My Attendance</span>
          </NavLink>
          <NavLink to="/leaves/my" className="nav-item-link" onClick={handleLinkClick}>
            <i className="bi bi-calendar-minus-fill" />
            <span>My Leaves</span>
          </NavLink>

          {/* COLLABORATION & GROWTH */}
          <div className="nav-section-title">Engagement</div>
          <NavLink to="/announcements" className="nav-item-link" onClick={handleLinkClick}>
            <i className="bi bi-megaphone-fill" />
            <span>Announcements</span>
          </NavLink>
          <NavLink to="/trainings" className="nav-item-link" onClick={handleLinkClick}>
            <i className="bi bi-mortarboard-fill" />
            <span>Training & Upskilling</span>
          </NavLink>
          <NavLink to="/notifications" className="nav-item-link" onClick={handleLinkClick}>
            <i className="bi bi-bell-fill" />
            <span>Notifications</span>
          </NavLink>
        </div>

        {/* User Mini Profile Footer */}
        <div className="p-3 border-top border-secondary border-opacity-25 d-flex align-items-center gap-2">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
            style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}
          >
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden" style={{ lineHeight: 1.2 }}>
            <div className="text-white small fw-semibold text-truncate">{user?.name}</div>
            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
              <span className="badge bg-secondary text-uppercase" style={{ fontSize: '0.65rem' }}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
