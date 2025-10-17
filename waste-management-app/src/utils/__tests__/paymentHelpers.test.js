/**
 * Payment Helpers Unit Tests
 * Tests for validation, formatting, and calculation functions
 * @module paymentHelpers.test
 */

import {
  formatCurrency,
  validateBillAmount,
  validateCreditAmount,
  validatePaymentMethod,
  isSessionExpired,
  calculateFinalAmount,
  calculateProcessingFee,
  generateTransactionId,
  generateReceiptId,
  generateSessionId,
  validateCardNumber,
  validateCVV,
  validateCardExpiry,
  maskCardNumber,
  getCardBrand,
  calculateTotalCredits,
  sortCreditsByExpiry,
  getPaymentUrgency,
  validateEmail,
  validatePhone,
} from '../paymentHelpers';

describe('Payment Helpers', () => {
  // ==================== FORMATTING TESTS ====================

  describe('formatCurrency', () => {
    test('formats positive numbers correctly', () => {
      expect(formatCurrency(1000)).toBe('Rs. 1,000');
      expect(formatCurrency(2500.50)).toBe('Rs. 2,500.5');
      expect(formatCurrency(100)).toBe('Rs. 100');
    });

    test('handles zero', () => {
      expect(formatCurrency(0)).toBe('Rs. 0');
    });

    test('handles invalid input', () => {
      expect(formatCurrency(NaN)).toBe('Rs. 0');
      expect(formatCurrency(null)).toBe('Rs. 0');
      expect(formatCurrency(undefined)).toBe('Rs. 0');
    });
  });

  // ==================== VALIDATION TESTS ====================

  describe('validateBillAmount', () => {
    test('validates positive amounts', () => {
      const result = validateBillAmount(1000);
      expect(result.valid).toBe(true);
    });

    test('rejects zero and negative amounts', () => {
      expect(validateBillAmount(0).valid).toBe(false);
      expect(validateBillAmount(-100).valid).toBe(false);
    });

    test('rejects invalid input', () => {
      expect(validateBillAmount(NaN).valid).toBe(false);
      expect(validateBillAmount(null).valid).toBe(false);
    });
  });

  describe('validateCreditAmount', () => {
    test('validates credit within bill amount', () => {
      const result = validateCreditAmount(500, 1000);
      expect(result.valid).toBe(true);
    });

    test('rejects credit exceeding bill amount', () => {
      const result = validateCreditAmount(1500, 1000);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('exceed');
    });

    test('rejects negative credits', () => {
      const result = validateCreditAmount(-100, 1000);
      expect(result.valid).toBe(false);
    });
  });

  describe('validatePaymentMethod', () => {
    test('validates active payment method', () => {
      const method = {
        id: 'PM001',
        type: 'card',
        isActive: true,
        expiryMonth: 12,
        expiryYear: 2026,
      };
      const result = validatePaymentMethod(method);
      expect(result.valid).toBe(true);
    });

    test('rejects inactive payment method', () => {
      const method = { id: 'PM001', isActive: false };
      const result = validatePaymentMethod(method);
      expect(result.valid).toBe(false);
    });

    test('rejects expired card', () => {
      const method = {
        type: 'card',
        isActive: true,
        expiryMonth: 1,
        expiryYear: 2020,
      };
      const result = validatePaymentMethod(method);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('expired');
    });

    test('rejects null payment method', () => {
      const result = validatePaymentMethod(null);
      expect(result.valid).toBe(false);
    });
  });

  describe('isSessionExpired', () => {
    test('detects expired session', () => {
      const pastDate = new Date(Date.now() - 1000000).toISOString();
      expect(isSessionExpired(pastDate)).toBe(true);
    });

    test('detects valid session', () => {
      const futureDate = new Date(Date.now() + 1000000).toISOString();
      expect(isSessionExpired(futureDate)).toBe(false);
    });

    test('handles null expiry', () => {
      expect(isSessionExpired(null)).toBe(true);
    });
  });

  // ==================== CALCULATION TESTS ====================

  describe('calculateFinalAmount', () => {
    test('calculates correct final amount', () => {
      expect(calculateFinalAmount(1000, 200)).toBe(800);
      expect(calculateFinalAmount(500, 100)).toBe(400);
    });

    test('handles credits exceeding bill', () => {
      expect(calculateFinalAmount(1000, 1500)).toBe(0);
    });

    test('handles zero credits', () => {
      expect(calculateFinalAmount(1000, 0)).toBe(1000);
    });
  });

  describe('calculateProcessingFee', () => {
    test('calculates 2% fee for cards', () => {
      expect(calculateProcessingFee(1000, 'card')).toBe(20);
      expect(calculateProcessingFee(500, 'card')).toBe(10);
    });

    test('returns zero fee for bank transfers', () => {
      expect(calculateProcessingFee(1000, 'bank')).toBe(0);
    });
  });

  describe('calculateTotalCredits', () => {
    test('sums active credits correctly', () => {
      const credits = [
        { amount: 500, status: 'active' },
        { amount: 300, status: 'active' },
        { amount: 200, status: 'expired' },
      ];
      expect(calculateTotalCredits(credits)).toBe(800);
    });

    test('handles empty array', () => {
      expect(calculateTotalCredits([])).toBe(0);
    });

    test('handles invalid input', () => {
      expect(calculateTotalCredits(null)).toBe(0);
    });
  });

  // ==================== GENERATION TESTS ====================

  describe('generateTransactionId', () => {
    test('generates unique transaction IDs', () => {
      const id1 = generateTransactionId();
      const id2 = generateTransactionId();

      expect(id1).toMatch(/^txn_/);
      expect(id2).toMatch(/^txn_/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateReceiptId', () => {
    test('generates receipt ID in correct format', () => {
      const id = generateReceiptId();
      expect(id).toMatch(/^REC_\d{5}$/);
    });

    test('generates unique receipt IDs', () => {
      const id1 = generateReceiptId();
      const id2 = generateReceiptId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateSessionId', () => {
    test('generates UUID-like session ID', () => {
      const id = generateSessionId();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });
  });

  // ==================== CARD VALIDATION TESTS ====================

  describe('validateCardNumber', () => {
    test('validates correct card numbers', () => {
      const result = validateCardNumber('4242424242424242');
      expect(result.valid).toBe(true);
    });

    test('rejects invalid card numbers', () => {
      const result = validateCardNumber('1234567890123456');
      expect(result.valid).toBe(false);
    });

    test('rejects incorrect length', () => {
      const result = validateCardNumber('123');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateCVV', () => {
    test('validates 3-digit CVV', () => {
      const result = validateCVV('123');
      expect(result.valid).toBe(true);
    });

    test('validates 4-digit CVV', () => {
      const result = validateCVV('1234');
      expect(result.valid).toBe(true);
    });

    test('rejects invalid CVV', () => {
      expect(validateCVV('12').valid).toBe(false);
      expect(validateCVV('12345').valid).toBe(false);
      expect(validateCVV('abc').valid).toBe(false);
    });
  });

  describe('validateCardExpiry', () => {
    test('validates future expiry date', () => {
      const result = validateCardExpiry(12, 2030);
      expect(result.valid).toBe(true);
    });

    test('rejects past expiry date', () => {
      const result = validateCardExpiry(1, 2020);
      expect(result.valid).toBe(false);
    });

    test('rejects invalid month', () => {
      expect(validateCardExpiry(0, 2030).valid).toBe(false);
      expect(validateCardExpiry(13, 2030).valid).toBe(false);
    });
  });

  describe('maskCardNumber', () => {
    test('masks card number correctly', () => {
      const masked = maskCardNumber('4242424242424242');
      expect(masked).toBe('**** **** **** 4242');
    });

    test('handles card number with spaces', () => {
      const masked = maskCardNumber('4242 4242 4242 4242');
      expect(masked).toBe('**** **** **** 4242');
    });
  });

  describe('getCardBrand', () => {
    test('detects Visa', () => {
      expect(getCardBrand('4242424242424242')).toBe('Visa');
    });

    test('detects Mastercard', () => {
      expect(getCardBrand('5555555555554444')).toBe('Mastercard');
    });

    test('detects Amex', () => {
      expect(getCardBrand('378282246310005')).toBe('Amex');
    });

    test('returns Unknown for unrecognized cards', () => {
      expect(getCardBrand('9999999999999999')).toBe('Unknown');
    });
  });

  // ==================== CREDIT TESTS ====================

  describe('sortCreditsByExpiry', () => {
    test('sorts credits by expiration date', () => {
      const credits = [
        { id: '1', expirationDate: '2025-12-31' },
        { id: '2', expirationDate: '2025-10-15' },
        { id: '3', expirationDate: '2025-11-20' },
      ];

      const sorted = sortCreditsByExpiry(credits);

      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('3');
      expect(sorted[2].id).toBe('1');
    });

    test('handles empty array', () => {
      expect(sortCreditsByExpiry([])).toEqual([]);
    });

    test('handles null input', () => {
      expect(sortCreditsByExpiry(null)).toEqual([]);
    });
  });

  // ==================== URGENCY TESTS ====================

  describe('getPaymentUrgency', () => {
    test('detects overdue payments', () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString();
      expect(getPaymentUrgency(pastDate)).toBe('overdue');
    });

    test('detects urgent payments (3 days)', () => {
      const urgentDate = new Date(Date.now() + 2 * 86400000).toISOString();
      expect(getPaymentUrgency(urgentDate)).toBe('urgent');
    });

    test('detects warning payments (7 days)', () => {
      const warningDate = new Date(Date.now() + 5 * 86400000).toISOString();
      expect(getPaymentUrgency(warningDate)).toBe('warning');
    });

    test('detects normal payments', () => {
      const normalDate = new Date(Date.now() + 10 * 86400000).toISOString();
      expect(getPaymentUrgency(normalDate)).toBe('normal');
    });
  });

  // ==================== CONTACT VALIDATION TESTS ====================

  describe('validateEmail', () => {
    test('validates correct email', () => {
      const result = validateEmail('test@example.com');
      expect(result.valid).toBe(true);
    });

    test('rejects invalid email', () => {
      expect(validateEmail('invalid').valid).toBe(false);
      expect(validateEmail('test@').valid).toBe(false);
      expect(validateEmail('@example.com').valid).toBe(false);
    });
  });

  describe('validatePhone', () => {
    test('validates correct Sri Lankan phone', () => {
      const result = validatePhone('+94701234567');
      expect(result.valid).toBe(true);
    });

    test('rejects invalid phone', () => {
      expect(validatePhone('0701234567').valid).toBe(false);
      expect(validatePhone('+941234').valid).toBe(false);
    });
  });
});
