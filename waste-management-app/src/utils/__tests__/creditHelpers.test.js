/**
 * Unit tests for credit helper functions
 */

import {
  validateCreditItem,
  calculateExpirationStatus,
  processCreditsForDisplay,
  getSourceLabel,
  getSourceIcon,
  calculateAutomaticApplication,
  calculateManualApplication,
  validateCustomAmountInput,
  validateBillForCreditApplication
} from '../creditHelpers';

describe('validateCreditItem', () => {
  const validCredit = {
    id: 'CREDIT001',
    userId: 'RES001',
    amount: 500,
    currency: 'LKR',
    source: 'recyclable',
    sourceDescription: 'Recyclable Waste Collection',
    earnedDate: '2025-10-01T10:30:00Z',
    expirationDate: '2025-12-31T23:59:59Z',
    status: 'active',
    createdAt: '2025-10-01T10:30:00Z',
    updatedAt: '2025-10-01T10:30:00Z'
  };

  test('accepts valid credit', () => {
    const result = validateCreditItem(validCredit);
    expect(result.valid).toBe(true);
    expect(result.data).toBeDefined();
  });

  test('rejects null or undefined credit', () => {
    expect(validateCreditItem(null).valid).toBe(false);
    expect(validateCreditItem(undefined).valid).toBe(false);
  });

  test('rejects credit with negative amount', () => {
    const result = validateCreditItem({ ...validCredit, amount: -100 });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('INVALID_AMOUNT');
  });

  test('rejects credit with zero amount', () => {
    const result = validateCreditItem({ ...validCredit, amount: 0 });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('INVALID_AMOUNT');
  });

  test('rejects credit with invalid source', () => {
    const result = validateCreditItem({ ...validCredit, source: 'invalid' });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('INVALID_SOURCE');
  });

  test('rejects credit with invalid status', () => {
    const result = validateCreditItem({ ...validCredit, status: 'invalid' });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('INVALID_STATUS');
  });

  test('rejects credit with future earned date', () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    const result = validateCreditItem({ ...validCredit, earnedDate: futureDate });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('FUTURE_EARNED_DATE');
  });

  test('rejects credit with expiration before earned date', () => {
    const result = validateCreditItem({
      ...validCredit,
      earnedDate: '2025-12-31T00:00:00Z',
      expirationDate: '2025-10-01T00:00:00Z'
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('INVALID_DATE_RANGE');
  });

  test('validates redeemed credit has required fields', () => {
    const redeemedCredit = {
      ...validCredit,
      status: 'redeemed',
      redeemedDate: '2025-10-15T10:00:00Z',
      redeemedBillId: 'BILL_001',
      redeemedAmount: 500
    };
    const result = validateCreditItem(redeemedCredit);
    expect(result.valid).toBe(true);
  });

  test('rejects redeemed credit without redeemed date', () => {
    const result = validateCreditItem({
      ...validCredit,
      status: 'redeemed',
      redeemedBillId: 'BILL_001',
      redeemedAmount: 500
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('MISSING_REDEEMED_DATE');
  });

  test('rejects redeemed amount exceeding credit amount', () => {
    const result = validateCreditItem({
      ...validCredit,
      status: 'redeemed',
      redeemedDate: '2025-10-15T10:00:00Z',
      redeemedBillId: 'BILL_001',
      redeemedAmount: 600
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('REDEEMED_EXCEEDS_AMOUNT');
  });
});

describe('calculateExpirationStatus', () => {
  test('returns no_expiration for null date', () => {
    const result = calculateExpirationStatus(null);
    expect(result.status).toBe('no_expiration');
    expect(result.daysRemaining).toBeNull();
  });

  test('returns expired for past date', () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString();
    const result = calculateExpirationStatus(pastDate);
    expect(result.status).toBe('expired');
    expect(result.daysRemaining).toBeLessThan(0);
  });

  test('returns expiring_today for today', () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const result = calculateExpirationStatus(today.toISOString());
    expect(result.status).toBe('expiring_today');
    expect(result.daysRemaining).toBe(0);
  });

  test('returns expiring_soon for dates within 7 days', () => {
    const soon = new Date(Date.now() + 5 * 86400000).toISOString();
    const result = calculateExpirationStatus(soon);
    expect(result.status).toBe('expiring_soon');
    expect(result.daysRemaining).toBeLessThanOrEqual(7);
  });

  test('returns valid for dates beyond 30 days', () => {
    const future = new Date(Date.now() + 60 * 86400000).toISOString();
    const result = calculateExpirationStatus(future);
    expect(result.status).toBe('valid');
    expect(result.daysRemaining).toBeGreaterThan(30);
  });
});

describe('processCreditsForDisplay', () => {
  const mockCredits = [
    {
      id: 'CREDIT001',
      amount: 500,
      currency: 'LKR',
      source: 'recyclable',
      earnedDate: '2025-10-01T00:00:00Z',
      expirationDate: '2025-11-15T00:00:00Z',
      status: 'active'
    },
    {
      id: 'CREDIT002',
      amount: 750,
      currency: 'LKR',
      source: 'ewaste',
      earnedDate: '2025-09-15T00:00:00Z',
      expirationDate: '2025-12-31T00:00:00Z',
      status: 'active'
    },
    {
      id: 'CREDIT003',
      amount: 300,
      currency: 'LKR',
      source: 'referral',
      earnedDate: '2025-08-01T00:00:00Z',
      status: 'redeemed',
      redeemedDate: '2025-10-10T00:00:00Z',
      redeemedBillId: 'BILL_001',
      redeemedAmount: 300
    }
  ];

  test('processes credits correctly', () => {
    const result = processCreditsForDisplay(mockCredits);
    expect(result.validCreditsCount).toBe(3);
    expect(result.activeCredits.length).toBe(2);
    expect(result.redeemedCredits.length).toBe(1);
  });

  test('sorts active credits by expiration date', () => {
    const result = processCreditsForDisplay(mockCredits);
    const activeCredits = result.activeCredits;
    
    if (activeCredits.length > 1) {
      const firstExpiration = new Date(activeCredits[0].expirationDate);
      const secondExpiration = new Date(activeCredits[1].expirationDate);
      expect(firstExpiration.getTime()).toBeLessThanOrEqual(secondExpiration.getTime());
    }
  });

  test('calculates summary correctly', () => {
    const result = processCreditsForDisplay(mockCredits);
    expect(result.summary.totalActive).toBe(1250);
    expect(result.summary.countActive).toBe(2);
    expect(result.summary.totalRedeemed).toBe(300);
    expect(result.summary.countRedeemed).toBe(1);
  });

  test('creates source breakdown', () => {
    const result = processCreditsForDisplay(mockCredits);
    expect(result.breakdown.recyclable).toBe(500);
    expect(result.breakdown.ewaste).toBe(750);
  });

  test('handles empty array', () => {
    const result = processCreditsForDisplay([]);
    expect(result.validCreditsCount).toBe(0);
    expect(result.activeCredits.length).toBe(0);
  });

  test('handles invalid input', () => {
    const result = processCreditsForDisplay(null);
    expect(result.validCreditsCount).toBe(0);
  });
});

describe('getSourceLabel', () => {
  test('returns correct labels for known sources', () => {
    expect(getSourceLabel('recyclable')).toBe('Recyclable Waste');
    expect(getSourceLabel('ewaste')).toBe('E-waste Pickup');
    expect(getSourceLabel('referral')).toBe('Referral Bonus');
  });

  test('returns source itself for unknown source', () => {
    expect(getSourceLabel('unknown')).toBe('unknown');
  });
});

describe('getSourceIcon', () => {
  test('returns correct icons for known sources', () => {
    expect(getSourceIcon('recyclable')).toBe('♻️');
    expect(getSourceIcon('ewaste')).toBe('🔌');
    expect(getSourceIcon('referral')).toBe('👥');
  });

  test('returns default icon for unknown source', () => {
    expect(getSourceIcon('unknown')).toBe('🎁');
  });
});

describe('calculateAutomaticApplication', () => {
  const mockCredits = [
    {
      id: 'CREDIT001',
      amount: 500,
      source: 'recyclable',
      earnedDate: '2025-10-01T00:00:00Z',
      expirationDate: '2025-11-15T00:00:00Z',
      status: 'active'
    },
    {
      id: 'CREDIT002',
      amount: 750,
      source: 'ewaste',
      earnedDate: '2025-09-15T00:00:00Z',
      expirationDate: '2025-12-31T00:00:00Z',
      status: 'active'
    },
    {
      id: 'CREDIT003',
      amount: 300,
      source: 'referral',
      earnedDate: '2025-08-01T00:00:00Z',
      status: 'active'
    }
  ];

  test('applies credits using FIFO strategy', () => {
    const result = calculateAutomaticApplication(mockCredits, 1000);
    expect(result.creditsToApply).toBe(1000);
    expect(result.creditsUsed.length).toBeGreaterThan(0);
    
    // First credit used should be the one expiring soonest
    const firstCredit = result.creditsUsed[0];
    expect(firstCredit.creditId).toBe('CREDIT001');
  });

  test('applies only up to bill amount', () => {
    const result = calculateAutomaticApplication(mockCredits, 600);
    expect(result.creditsToApply).toBe(600);
    expect(result.newBillAmount).toBe(0);
  });

  test('marks bill as fully paid when covered', () => {
    const result = calculateAutomaticApplication(mockCredits, 500);
    expect(result.fullyPaid).toBe(true);
    expect(result.newBillAmount).toBe(0);
  });

  test('calculates remaining credits correctly', () => {
    const result = calculateAutomaticApplication(mockCredits, 500);
    expect(result.creditsRemaining).toBe(1050);
  });

  test('handles bill amount exceeding total credits', () => {
    const result = calculateAutomaticApplication(mockCredits, 2000);
    expect(result.creditsToApply).toBe(1550);
    expect(result.newBillAmount).toBe(450);
    expect(result.fullyPaid).toBe(false);
  });
});

describe('calculateManualApplication', () => {
  const mockCredits = [
    {
      id: 'CREDIT001',
      amount: 500,
      source: 'recyclable',
      earnedDate: '2025-10-01T00:00:00Z',
      expirationDate: '2025-12-31T00:00:00Z',
      status: 'active'
    },
    {
      id: 'CREDIT002',
      amount: 750,
      source: 'ewaste',
      earnedDate: '2025-09-15T00:00:00Z',
      expirationDate: '2025-12-31T00:00:00Z',
      status: 'active'
    }
  ];

  test('calculates manual selection correctly', () => {
    const result = calculateManualApplication(['CREDIT001'], mockCredits, 1000);
    expect(result.valid).toBe(true);
    expect(result.creditsToApply).toBe(500);
    expect(result.newBillAmount).toBe(500);
  });

  test('rejects selection exceeding bill amount', () => {
    const result = calculateManualApplication(['CREDIT001', 'CREDIT002'], mockCredits, 1000);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('CREDITS_EXCEED_BILL');
  });

  test('handles non-existent credit ID', () => {
    const result = calculateManualApplication(['CREDIT999'], mockCredits, 1000);
    expect(result.valid).toBe(true);
    expect(result.creditsToApply).toBe(0);
  });

  test('rejects expired credit', () => {
    const expiredCredit = {
      ...mockCredits[0],
      id: 'CREDIT003',
      expirationDate: '2020-01-01T00:00:00Z'
    };
    const result = calculateManualApplication(
      ['CREDIT003'],
      [...mockCredits, expiredCredit],
      1000
    );
    expect(result.valid).toBe(false);
    expect(result.error).toBe('CREDIT_EXPIRED');
  });
});

describe('validateCustomAmountInput', () => {
  test('accepts valid amount', () => {
    const result = validateCustomAmountInput(500, 1000, 1500);
    expect(result.valid).toBe(true);
    expect(result.amount).toBe(500);
  });

  test('rejects empty input', () => {
    const result = validateCustomAmountInput('', 1000, 1500);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('EMPTY_INPUT');
  });

  test('rejects non-numeric input', () => {
    const result = validateCustomAmountInput('abc', 1000, 1500);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('NON_NUMERIC');
  });

  test('rejects negative amount', () => {
    const result = validateCustomAmountInput(-100, 1000, 1500);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('NEGATIVE_AMOUNT');
  });

  test('rejects zero amount', () => {
    const result = validateCustomAmountInput(0, 1000, 1500);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('ZERO_AMOUNT');
  });

  test('rejects amount exceeding available credits', () => {
    const result = validateCustomAmountInput(1500, 1000, 2000);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('INSUFFICIENT_CREDITS');
  });

  test('rejects amount exceeding bill', () => {
    const result = validateCustomAmountInput(1600, 2000, 1500);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('EXCEEDS_BILL');
  });

  test('rejects amount with too many decimal places', () => {
    const result = validateCustomAmountInput(100.123, 1000, 1500);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('INVALID_PRECISION');
  });

  test('accepts amount with 2 decimal places', () => {
    const result = validateCustomAmountInput(100.50, 1000, 1500);
    expect(result.valid).toBe(true);
  });
});

describe('validateBillForCreditApplication', () => {
  const validBill = {
    id: 'BILL_001',
    amount: 1250,
    status: 'unpaid',
    dueDate: '2025-10-15T00:00:00Z'
  };

  test('accepts valid unpaid bill', () => {
    const result = validateBillForCreditApplication(validBill);
    expect(result.valid).toBe(true);
  });

  test('rejects null or undefined bill', () => {
    expect(validateBillForCreditApplication(null).valid).toBe(false);
    expect(validateBillForCreditApplication(undefined).valid).toBe(false);
  });

  test('rejects bill with invalid amount', () => {
    const result = validateBillForCreditApplication({ ...validBill, amount: -100 });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('INVALID_AMOUNT');
  });

  test('rejects paid bill', () => {
    const result = validateBillForCreditApplication({ ...validBill, status: 'paid' });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('BILL_NOT_UNPAID');
  });

  test('warns about heavily overdue bill', () => {
    const result = validateBillForCreditApplication({
      ...validBill,
      daysOverdue: 45
    });
    expect(result.valid).toBe(true);
    expect(result.warning).toBe('HEAVILY_OVERDUE');
  });
});
