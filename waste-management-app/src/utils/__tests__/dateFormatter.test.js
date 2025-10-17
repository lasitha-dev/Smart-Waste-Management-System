/**
 * Date Formatter Unit Tests
 * Tests for date formatting and manipulation functions
 * @module dateFormatter.test
 */

import {
  formatTimestamp,
  daysUntilDue,
  getDueDateStatus,
  getUrgencyColor,
  formatDateRange,
  formatRelativeTime,
  isPastDate,
  isToday,
  formatReceiptTimestamp,
  getCurrentTimestamp,
  addMinutes,
  formatCardExpiry,
} from '../dateFormatter';

describe('Date Formatter', () => {
  // ==================== FORMATTING TESTS ====================

  describe('formatTimestamp', () => {
    test('formats full timestamp correctly', () => {
      const timestamp = '2025-10-17T14:30:00.000Z';
      const result = formatTimestamp(timestamp, 'full');
      expect(result).toContain('Oct');
      expect(result).toContain('17');
      expect(result).toContain('2025');
    });

    test('formats date only', () => {
      const timestamp = '2025-10-17T14:30:00.000Z';
      const result = formatTimestamp(timestamp, 'date');
      expect(result).toContain('Oct');
      expect(result).toContain('17');
      expect(result).not.toContain(':');
    });

    test('formats time only', () => {
      const timestamp = '2025-10-17T14:30:00.000Z';
      const result = formatTimestamp(timestamp, 'time');
      expect(result).toContain(':');
    });

    test('handles invalid timestamp', () => {
      expect(formatTimestamp('invalid')).toBe('Invalid Date');
      expect(formatTimestamp(null)).toBe('N/A');
    });
  });

  describe('daysUntilDue', () => {
    test('calculates positive days correctly', () => {
      const futureDate = new Date(Date.now() + 5 * 86400000).toISOString();
      const days = daysUntilDue(futureDate);
      expect(days).toBeGreaterThanOrEqual(4);
      expect(days).toBeLessThanOrEqual(6);
    });

    test('calculates negative days for overdue', () => {
      const pastDate = new Date(Date.now() - 2 * 86400000).toISOString();
      const days = daysUntilDue(pastDate);
      expect(days).toBeLessThan(0);
    });

    test('handles null input', () => {
      expect(daysUntilDue(null)).toBe(0);
    });
  });

  describe('getDueDateStatus', () => {
    test('returns overdue status', () => {
      const pastDate = new Date(Date.now() - 2 * 86400000).toISOString();
      const status = getDueDateStatus(pastDate);
      expect(status).toContain('Overdue');
      expect(status).toContain('2 days');
    });

    test('returns due today status', () => {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const status = getDueDateStatus(today.toISOString());
      expect(status).toBe('Due today');
    });

    test('returns due tomorrow status', () => {
      const tomorrow = new Date(Date.now() + 86400000).toISOString();
      const status = getDueDateStatus(tomorrow);
      expect(status).toBe('Due tomorrow');
    });

    test('returns due in X days status', () => {
      const futureDate = new Date(Date.now() + 5 * 86400000).toISOString();
      const status = getDueDateStatus(futureDate);
      expect(status).toContain('Due in');
      expect(status).toContain('days');
    });
  });

  describe('getUrgencyColor', () => {
    test('returns red for overdue', () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString();
      expect(getUrgencyColor(pastDate)).toBe('#EF4444');
    });

    test('returns light red for urgent (3 days)', () => {
      const urgentDate = new Date(Date.now() + 2 * 86400000).toISOString();
      expect(getUrgencyColor(urgentDate)).toBe('#F87171');
    });

    test('returns orange for warning (7 days)', () => {
      const warningDate = new Date(Date.now() + 5 * 86400000).toISOString();
      expect(getUrgencyColor(warningDate)).toBe('#FF9800');
    });

    test('returns green for normal', () => {
      const normalDate = new Date(Date.now() + 10 * 86400000).toISOString();
      expect(getUrgencyColor(normalDate)).toBe('#34D399');
    });
  });

  describe('formatDateRange', () => {
    test('formats date range correctly', () => {
      const start = '2025-10-01T00:00:00.000Z';
      const end = '2025-10-31T23:59:59.000Z';
      const result = formatDateRange(start, end);
      expect(result).toContain('Oct');
      expect(result).toContain('1-31');
      expect(result).toContain('2025');
    });

    test('handles invalid dates', () => {
      expect(formatDateRange('invalid', 'invalid')).toBe('Invalid Date Range');
      expect(formatDateRange(null, null)).toBe('N/A');
    });
  });

  describe('formatRelativeTime', () => {
    test('returns "Just now" for recent times', () => {
      const recent = new Date(Date.now() - 30000).toISOString();
      expect(formatRelativeTime(recent)).toBe('Just now');
    });

    test('returns minutes ago', () => {
      const minutes = new Date(Date.now() - 5 * 60000).toISOString();
      const result = formatRelativeTime(minutes);
      expect(result).toContain('minute');
      expect(result).toContain('ago');
    });

    test('returns hours ago', () => {
      const hours = new Date(Date.now() - 3 * 3600000).toISOString();
      const result = formatRelativeTime(hours);
      expect(result).toContain('hour');
      expect(result).toContain('ago');
    });

    test('returns days ago', () => {
      const days = new Date(Date.now() - 2 * 86400000).toISOString();
      const result = formatRelativeTime(days);
      expect(result).toContain('day');
      expect(result).toContain('ago');
    });

    test('handles null input', () => {
      expect(formatRelativeTime(null)).toBe('N/A');
    });
  });

  // ==================== DATE CHECKING TESTS ====================

  describe('isPastDate', () => {
    test('detects past dates', () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString();
      expect(isPastDate(pastDate)).toBe(true);
    });

    test('detects future dates', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      expect(isPastDate(futureDate)).toBe(false);
    });

    test('handles null input', () => {
      expect(isPastDate(null)).toBe(false);
    });
  });

  describe('isToday', () => {
    test('detects today', () => {
      const today = new Date().toISOString();
      expect(isToday(today)).toBe(true);
    });

    test('detects not today', () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString();
      expect(isToday(yesterday)).toBe(false);
    });

    test('handles null input', () => {
      expect(isToday(null)).toBe(false);
    });
  });

  // ==================== SPECIAL FORMATTING TESTS ====================

  describe('formatReceiptTimestamp', () => {
    test('formats receipt timestamp with full details', () => {
      const timestamp = '2025-10-17T14:30:45.000Z';
      const result = formatReceiptTimestamp(timestamp);
      expect(result).toContain('October');
      expect(result).toContain('17');
      expect(result).toContain('2025');
      expect(result).toContain(':');
    });

    test('handles invalid timestamp', () => {
      expect(formatReceiptTimestamp('invalid')).toBe('Invalid Date');
      expect(formatReceiptTimestamp(null)).toBe('N/A');
    });
  });

  describe('getCurrentTimestamp', () => {
    test('returns valid ISO timestamp', () => {
      const timestamp = getCurrentTimestamp();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    test('returns current time', () => {
      const timestamp = getCurrentTimestamp();
      const date = new Date(timestamp);
      const now = new Date();
      expect(Math.abs(date.getTime() - now.getTime())).toBeLessThan(1000);
    });
  });

  describe('addMinutes', () => {
    test('adds minutes correctly', () => {
      const start = '2025-10-17T14:00:00.000Z';
      const result = addMinutes(start, 15);
      const startDate = new Date(start);
      const resultDate = new Date(result);
      expect(resultDate.getTime() - startDate.getTime()).toBe(15 * 60000);
    });

    test('handles negative minutes', () => {
      const start = '2025-10-17T14:00:00.000Z';
      const result = addMinutes(start, -30);
      const startDate = new Date(start);
      const resultDate = new Date(result);
      expect(startDate.getTime() - resultDate.getTime()).toBe(30 * 60000);
    });
  });

  describe('formatCardExpiry', () => {
    test('formats card expiry correctly', () => {
      expect(formatCardExpiry(12, 2026)).toBe('12/26');
      expect(formatCardExpiry(5, 2025)).toBe('05/25');
    });

    test('handles invalid input', () => {
      expect(formatCardExpiry(null, null)).toBe('N/A');
      expect(formatCardExpiry(0, 0)).toBe('N/A');
    });
  });
});
