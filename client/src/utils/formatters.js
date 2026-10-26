export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatTime = (dateString) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDurationMinutes = (minutes) => {
  if (!minutes || minutes <= 0) return '0h 0m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
};

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'PRESENT':
      return 'badge-present';
    case 'LATE':
      return 'badge-late';
    case 'HALF_DAY':
      return 'badge-half-day';
    case 'ABSENT':
      return 'badge-absent';
    case 'APPROVED':
      return 'badge-approved';
    case 'PENDING':
      return 'badge-pending';
    case 'REJECTED':
      return 'badge-rejected';
    case 'CANCELLED':
      return 'badge-cancelled';
    default:
      return 'badge-secondary';
  }
};
