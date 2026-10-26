export const getTodayDateString = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const calculateWorkedMinutes = (checkInTime, checkOutTime) => {
  if (!checkInTime || !checkOutTime) return 0;
  const diffMs = new Date(checkOutTime) - new Date(checkInTime);
  return Math.max(0, Math.floor(diffMs / (1000 * 60)));
};

export const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return '0h 0m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
};

export const calculateDaysCount = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  // Strip time components for pure date comparison
  const utc1 = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const utc2 = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  const diffTime = utc2 - utc1;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
};
