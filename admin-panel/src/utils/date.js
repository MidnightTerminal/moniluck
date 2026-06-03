export const formatDhakaDateTime = (dateStr) => {
  if (!dateStr) return '—';

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Dhaka',
  }).format(new Date(dateStr));
};

export const formatDhakaDate = (dateStr) => {
  if (!dateStr) return '—';

  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Dhaka',
  }).format(new Date(dateStr));
};