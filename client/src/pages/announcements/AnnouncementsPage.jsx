import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { announcementApi } from '../../api/announcementApi.js';
import { ROLES } from '../../utils/constants.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import AlertBanner from '../../components/common/AlertBanner.jsx';
import AnnouncementModal from './AnnouncementModal.jsx';
import { formatDate } from '../../utils/formatters.js';

export const AnnouncementsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const isHR = user?.role === ROLES.HR;

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, [priorityFilter]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await announcementApi.getAnnouncements({
        priority: priorityFilter,
        limit: 20
      });
      setAnnouncements(res.data || []);
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to load announcements' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await announcementApi.deleteAnnouncement(id);
        setAlert({ type: 'success', message: 'Announcement deleted.' });
        fetchAnnouncements();
      } catch (err) {
        setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to delete' });
      }
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'URGENT':
        return <span className="badge bg-danger">URGENT</span>;
      case 'HIGH':
        return <span className="badge bg-warning text-dark">HIGH</span>;
      case 'NORMAL':
        return <span className="badge bg-info text-dark">NORMAL</span>;
      default:
        return <span className="badge bg-secondary">LOW</span>;
    }
  };

  return (
    <div className="vstack gap-4">
      {alert && (
        <AlertBanner
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Header */}
      <div className="card border shadow-sm rounded-3 p-3 bg-white">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-0">Corporate Announcements & Notices</h5>
            <small className="text-muted">Stay informed on company milestones, policies, and schedules</small>
          </div>

          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select form-select-sm"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="NORMAL">Normal</option>
              <option value="LOW">Low</option>
            </select>

            {isHR && (
              <button
                type="button"
                className="btn btn-primary btn-sm text-nowrap d-inline-flex align-items-center gap-1"
                onClick={() => {
                  setSelectedAnnouncement(null);
                  setModalOpen(true);
                }}
              >
                <i className="bi bi-plus-circle" /> Publish Notice
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <LoadingSpinner message="Loading bulletins..." />
      ) : announcements.length === 0 ? (
        <EmptyState
          icon="📢"
          title="No notices found"
          message="There are no active company announcements at this time."
        />
      ) : (
        <div className="row g-3">
          {announcements.map((a) => (
            <div key={a._id} className="col-12">
              <div className="card border shadow-sm rounded-4 p-4 bg-white">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                  <div className="d-flex align-items-center gap-2">
                    {getPriorityBadge(a.priority)}
                    <span className="badge bg-light text-secondary border">
                      Audience: {a.audience} {a.department ? `(${a.department})` : ''}
                    </span>
                  </div>
                  <div className="small text-muted">
                    {formatDate(a.publishDate || a.createdAt)}
                  </div>
                </div>

                <h5 className="fw-bold text-dark mb-2">{a.title}</h5>
                <p className="text-muted mb-3" style={{ whiteSpace: 'pre-line' }}>
                  {a.content}
                </p>

                <div className="d-flex align-items-center justify-content-between pt-3 border-top small text-muted">
                  <div>
                    Author: <span className="fw-medium text-dark">{a.author ? `${a.author.firstName} ${a.author.lastName}` : 'HR Team'}</span>
                  </div>

                  {isHR && (
                    <div className="btn-group btn-group-sm">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setSelectedAnnouncement(a);
                          setModalOpen(true);
                        }}
                      >
                        <i className="bi bi-pencil" /> Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => handleDelete(a._id)}
                      >
                        <i className="bi bi-trash" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnnouncementModal
        show={modalOpen}
        announcement={selectedAnnouncement}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setAlert({ type: 'success', message: 'Announcement saved successfully.' });
          fetchAnnouncements();
        }}
      />
    </div>
  );
};

export default AnnouncementsPage;
