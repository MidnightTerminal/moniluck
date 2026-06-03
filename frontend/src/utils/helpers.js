/**
 * Format price with currency symbol
 */
export const formatPrice = (price) => {
  return `Tk ${parseFloat(price).toFixed(2)}`;
};

/**
 * Calculate discount percentage
 */
export const calcDiscount = (price, comparePrice) => {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Generate slug from string
 */
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

/**
 * Format date
 */
export const formatDate = (dateStr) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString('en-US', options);
};

/**
 * Format a timestamp in Bangladesh local time.
 */
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

/**
 * Format a date in Bangladesh local time.
 */
export const formatDhakaDate = (dateStr) => {
  if (!dateStr) return '—';

  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Dhaka',
  }).format(new Date(dateStr));
};

/**
 * Format relative time
 */
export const timeAgo = (dateStr) => {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);

  const intervals = {
    year  : 31536000,
    month : 2592000,
    week  : 604800,
    day   : 86400,
    hour  : 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }
  return 'Just now';
};

/**
 * Validate email
 */
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validate password strength
 */
export const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8)           score++;
  if (password.length >= 12)          score++;
  if (/[A-Z]/.test(password))        score++;
  if (/[a-z]/.test(password))        score++;
  if (/\d/.test(password))           score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { level: 'weak',   label: 'Weak',   color: '#ef4444', percent: 33 };
  if (score <= 4) return { level: 'medium', label: 'Medium', color: '#f59e0b', percent: 66 };
  return { level: 'strong', label: 'Strong', color: '#10b981', percent: 100 };
};

/**
 * Generate star rating array
 */
export const generateStars = (rating) => {
  const stars = [];
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push('full');
    else if (i === full && half) stars.push('half');
    else stars.push('empty');
  }
  return stars;
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Debounce function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Get initials from name
 */
export const getInitials = (firstName, lastName) => {
  const f = firstName ? firstName.charAt(0).toUpperCase() : '';
  const l = lastName ? lastName.charAt(0).toUpperCase() : '';
  return f + l;
};

/**
 * Class names helper (simplified cn)
 */
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Resolve asset path to backend shared images origin.
 */
export const resolveAssetUrl = (assetPath) => {
  if (!assetPath) return '';
  if (/^https?:\/\//i.test(assetPath)) return assetPath;

  const normalized = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  const apiBase = process.env.REACT_APP_API_URL || '';

  if (/^https?:\/\//i.test(apiBase)) {
    try {
      const origin = new URL(apiBase).origin;
      return `${origin}${normalized}`;
    } catch (error) {
      // Ignore invalid URL and fallback below.
    }
  }

  return normalized;
};