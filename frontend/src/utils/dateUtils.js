/**
 * Safely parse date string from backend (UTC ISO or SQL datetime format)
 * and convert it to local browser Date object.
 */
export function parseUtcDate(dateString) {
  if (!dateString) return null;
  let raw = String(dateString).trim();
  // If string format is "YYYY-MM-DD HH:mm:ss" without offset/timezone marker, append "Z" for UTC parsing
  if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/.test(raw)) {
    raw = raw.replace(' ', 'T') + 'Z';
  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(raw)) {
    raw = raw + 'Z';
  }
  const date = new Date(raw);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Format notification timestamp e.g. "Aug 18, 08:15 AM"
 */
export function formatNotificationTime(dateString) {
  const date = parseUtcDate(dateString);
  if (!date) return dateString || '';

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds >= 0 && diffInSeconds < 45) {
    return 'Just now';
  }

  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format relative time e.g. "2m ago", "1h ago"
 */
export function formatRelativeTime(dateString) {
  const date = parseUtcDate(dateString);
  if (!date) return dateString || '';

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 30) return 'Just now';
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
}
