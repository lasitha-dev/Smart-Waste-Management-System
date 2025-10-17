/**
 * Date Formatting Utilities
 * Provides functions to format dates and timestamps for display
 * @module dateFormatter
 */

/**
 * Formats an ISO timestamp to a readable date string
 * @param {string} isoTimestamp - ISO 8601 timestamp
 * @param {string} format - Format type: 'full', 'date', 'time', 'short'
 * @returns {string} Formatted date string
 */
export const formatTimestamp = (isoTimestamp, format = 'full') => {
  if (!isoTimestamp) return 'N/A';
  
  const date = new Date(isoTimestamp);
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  const options = {
    full: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    },
    date: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
    time: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    },
    short: {
      month: 'short',
      day: 'numeric',
    },
  };
  
  return date.toLocaleString('en-US', options[format] || options.full);
};

/**
 * Calculates days until a due date
 * @param {string} dueDate - ISO timestamp of due date
 * @returns {number} Number of days until due (negative if overdue)
 */
export const daysUntilDue = (dueDate) => {
  if (!dueDate) return 0;
  
  const due = new Date(dueDate);
  const now = new Date();
  
  // Reset time to midnight for accurate day calculation
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Gets a human-readable due date status
 * @param {string} dueDate - ISO timestamp of due date
 * @returns {string} Status message (e.g., "Due in 3 days", "Overdue by 2 days")
 */
export const getDueDateStatus = (dueDate) => {
  const days = daysUntilDue(dueDate);
  
  if (days < 0) {
    const overdueDays = Math.abs(days);
    return `Overdue by ${overdueDays} ${overdueDays === 1 ? 'day' : 'days'}`;
  }
  
  if (days === 0) {
    return 'Due today';
  }
  
  if (days === 1) {
    return 'Due tomorrow';
  }
  
  return `Due in ${days} days`;
};

/**
 * Gets urgency indicator color based on due date
 * @param {string} dueDate - ISO timestamp of due date
 * @returns {string} Color code for urgency
 */
export const getUrgencyColor = (dueDate) => {
  const days = daysUntilDue(dueDate);
  
  if (days < 0) return '#EF4444'; // Red - Overdue
  if (days <= 3) return '#F87171'; // Light Red - Urgent
  if (days <= 7) return '#FF9800'; // Orange - Warning
  return '#34D399'; // Green - Normal
};

/**
 * Formats a date range (e.g., "Oct 1-31, 2025")
 * @param {string} startDate - ISO timestamp of start date
 * @param {string} endDate - ISO timestamp of end date
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return 'N/A';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 'Invalid Date Range';
  }
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const startMonth = monthNames[start.getMonth()];
  const startDay = start.getDate();
  const endDay = end.getDate();
  const year = end.getFullYear();
  
  return `${startMonth} ${startDay}-${endDay}, ${year}`;
};

/**
 * Formats a timestamp to relative time (e.g., "2 hours ago")
 * @param {string} isoTimestamp - ISO timestamp
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (isoTimestamp) => {
  if (!isoTimestamp) return 'N/A';
  
  const date = new Date(isoTimestamp);
  const now = new Date();
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) {
    return 'Just now';
  }
  
  if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  }
  
  return formatTimestamp(isoTimestamp, 'date');
};

/**
 * Checks if a date is in the past
 * @param {string} isoTimestamp - ISO timestamp
 * @returns {boolean} True if date is in the past
 */
export const isPastDate = (isoTimestamp) => {
  if (!isoTimestamp) return false;
  const date = new Date(isoTimestamp);
  const now = new Date();
  return date < now;
};

/**
 * Checks if a date is today
 * @param {string} isoTimestamp - ISO timestamp
 * @returns {boolean} True if date is today
 */
export const isToday = (isoTimestamp) => {
  if (!isoTimestamp) return false;
  
  const date = new Date(isoTimestamp);
  const now = new Date();
  
  return date.getDate() === now.getDate() &&
         date.getMonth() === now.getMonth() &&
         date.getFullYear() === now.getFullYear();
};

/**
 * Formats a timestamp for receipt display
 * @param {string} isoTimestamp - ISO timestamp
 * @returns {string} Formatted timestamp for receipt
 */
export const formatReceiptTimestamp = (isoTimestamp) => {
  if (!isoTimestamp) return 'N/A';
  
  const date = new Date(isoTimestamp);
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  };
  
  return date.toLocaleString('en-US', options);
};

/**
 * Gets the current timestamp in ISO format
 * @returns {string} Current timestamp
 */
export const getCurrentTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Adds minutes to a timestamp
 * @param {string} isoTimestamp - ISO timestamp
 * @param {number} minutes - Minutes to add
 * @returns {string} New timestamp
 */
export const addMinutes = (isoTimestamp, minutes) => {
  const date = new Date(isoTimestamp);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
};

/**
 * Formats month and year for card expiry display
 * @param {number} month - Month (1-12)
 * @param {number} year - Full year
 * @returns {string} Formatted expiry (e.g., "12/26")
 */
export const formatCardExpiry = (month, year) => {
  if (!month || !year) return 'N/A';
  const shortYear = year.toString().slice(-2);
  const paddedMonth = month.toString().padStart(2, '0');
  return `${paddedMonth}/${shortYear}`;
};
