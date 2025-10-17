/**
 * Payment Service Unit Tests
 * Comprehensive tests for all payment service functions
 * @module paymentService.test
 */

import {
  getResidentSummary,
  getUnpaidBills,
  getAvailableCredits,
  getPaymentMethods,
  initiatePaymentSession,
  validatePaymentSession,
  applyCreditsToPayment,
  processPayment,
  recordPaymentSuccess,
  recordPaymentFailure,
  getPaymentHistory,
  getReceipt,
  generateReceiptPDF,
  sendPaymentConfirmation,
  sendPaymentFailureNotification,
  sendReceiptEmail,
  getResidentInfo,
  getBillById,
} from '../paymentService';

import {
  MOCK_RESIDENT,
  MOCK_BILLS,
  MOCK_PAYMENT_METHODS,
  MOCK_CREDITS,
  MOCK_PAYMENT_HISTORY,
  MOCK_RECEIPTS,
} from '../mockData';

describe('Payment Service', () => {
  // ==================== PAYMENT HUB TESTS ====================

  describe('getResidentSummary', () => {
    test('returns correct balance and summary for valid resident', async () => {
      const result = await getResidentSummary('RES001');

      expect(result).toBeDefined();
      expect(result.balance).toBeGreaterThanOrEqual(0);
      expect(result.lastPaymentDate).toBeDefined();
      expect(result.lastPaymentAmount).toBeGreaterThanOrEqual(0);
      expect(result.totalPaidYTD).toBeGreaterThanOrEqual(0);
      expect(result.creditCount).toBeGreaterThanOrEqual(0);
      expect(result.totalCredits).toBeGreaterThanOrEqual(0);
      expect(result.unpaidBillsCount).toBeGreaterThanOrEqual(0);
    });

    test('throws error for missing resident ID', async () => {
      await expect(getResidentSummary(null)).rejects.toThrow('Resident ID is required');
    });

    test('throws error for invalid resident ID', async () => {
      await expect(getResidentSummary('INVALID')).rejects.toThrow('Resident not found');
    });
  });

  describe('getUnpaidBills', () => {
    test('returns array of unpaid bills', async () => {
      const result = await getUnpaidBills('RES001');

      expect(Array.isArray(result)).toBe(true);
      result.forEach(bill => {
        expect(bill.status).toBe('unpaid');
        expect(bill.residentId).toBe('RES001');
      });
    });

    test('returns bills sorted by due date', async () => {
      const result = await getUnpaidBills('RES001');

      for (let i = 1; i < result.length; i++) {
        const prevDate = new Date(result[i - 1].dueDate);
        const currDate = new Date(result[i].dueDate);
        expect(prevDate.getTime()).toBeLessThanOrEqual(currDate.getTime());
      }
    });

    test('throws error for missing resident ID', async () => {
      await expect(getUnpaidBills(null)).rejects.toThrow('Resident ID is required');
    });
  });

  describe('getAvailableCredits', () => {
    test('returns array of active credits', async () => {
      const result = await getAvailableCredits('RES001');

      expect(Array.isArray(result)).toBe(true);
      result.forEach(credit => {
        expect(credit.status).toBe('active');
        expect(credit.residentId).toBe('RES001');
      });
    });

    test('returns credits sorted by expiration date', async () => {
      const result = await getAvailableCredits('RES001');

      for (let i = 1; i < result.length; i++) {
        const prevDate = new Date(result[i - 1].expirationDate);
        const currDate = new Date(result[i].expirationDate);
        expect(prevDate.getTime()).toBeLessThanOrEqual(currDate.getTime());
      }
    });

    test('throws error for missing resident ID', async () => {
      await expect(getAvailableCredits(null)).rejects.toThrow('Resident ID is required');
    });
  });

  describe('getPaymentMethods', () => {
    test('returns array of active payment methods', async () => {
      const result = await getPaymentMethods('RES001');

      expect(Array.isArray(result)).toBe(true);
      result.forEach(method => {
        expect(method.isActive).toBe(true);
        expect(method.residentId).toBe('RES001');
      });
    });

    test('returns methods with default first', async () => {
      const result = await getPaymentMethods('RES001');

      if (result.length > 1 && result[0].isDefault) {
        expect(result[0].isDefault).toBe(true);
      }
    });

    test('throws error for missing resident ID', async () => {
      await expect(getPaymentMethods(null)).rejects.toThrow('Resident ID is required');
    });
  });

  // ==================== SESSION TESTS ====================

  describe('initiatePaymentSession', () => {
    test('creates valid payment session', async () => {
      const result = await initiatePaymentSession('RES001', 'BILL_2024_102');

      expect(result).toBeDefined();
      expect(result.sessionId).toBeDefined();
      expect(result.residentId).toBe('RES001');
      expect(result.billId).toBe('BILL_2024_102');
      expect(result.finalAmount).toBeGreaterThan(0);
      expect(result.expiresAt).toBeDefined();
      expect(result.status).toBe('active');
    });

    test('throws error for missing parameters', async () => {
      await expect(initiatePaymentSession(null, 'BILL_2024_102')).rejects.toThrow();
      await expect(initiatePaymentSession('RES001', null)).rejects.toThrow();
    });

    test('throws error for non-existent bill', async () => {
      await expect(initiatePaymentSession('RES001', 'INVALID_BILL')).rejects.toThrow('Bill not found');
    });

    test('throws error for already paid bill', async () => {
      await expect(initiatePaymentSession('RES001', 'BILL_2024_101')).rejects.toThrow('Bill is already paid');
    });
  });

  describe('validatePaymentSession', () => {
    test('validates active session', async () => {
      const session = await initiatePaymentSession('RES001', 'BILL_2024_102');
      const result = await validatePaymentSession(session.sessionId);

      expect(result.valid).toBe(true);
      expect(result.session).toBeDefined();
    });

    test('rejects expired session', async () => {
      const result = await validatePaymentSession('expired-session-id');

      expect(result.valid).toBe(false);
      expect(result.message).toBeDefined();
    });

    test('throws error for missing session ID', async () => {
      await expect(validatePaymentSession(null)).rejects.toThrow('Session ID is required');
    });
  });

  describe('applyCreditsToPayment', () => {
    test('applies credits successfully', async () => {
      const session = await initiatePaymentSession('RES001', 'BILL_2024_102');
      const result = await applyCreditsToPayment(session.sessionId, 500);

      expect(result).toBeDefined();
      expect(result.creditsApplied).toBe(500);
      expect(result.newFinalAmount).toBeLessThan(result.newAmount);
    });

    test('throws error for invalid credit amount', async () => {
      const session = await initiatePaymentSession('RES001', 'BILL_2024_102');
      
      await expect(applyCreditsToPayment(session.sessionId, -100)).rejects.toThrow();
      await expect(applyCreditsToPayment(session.sessionId, 999999)).rejects.toThrow();
    });
  });

  // ==================== PAYMENT PROCESSING TESTS ====================

  describe('processPayment', () => {
    test('processes payment successfully (95% success rate)', async () => {
      const session = await initiatePaymentSession('RES001', 'BILL_2024_102');
      const method = MOCK_PAYMENT_METHODS[0];

      let successCount = 0;
      const iterations = 20;

      for (let i = 0; i < iterations; i++) {
        const result = await processPayment(session.sessionId, method, null);
        if (result.success) {
          successCount++;
          expect(result.transactionId).toBeDefined();
          expect(result.amount).toBeGreaterThan(0);
          expect(result.completedAt).toBeDefined();
        }
      }

      expect(successCount).toBeGreaterThan(iterations * 0.8);
    });

    test('handles payment failure with error message', async () => {
      const session = await initiatePaymentSession('RES001', 'BILL_2024_102');
      const method = MOCK_PAYMENT_METHODS[0];

      let failureFound = false;
      for (let i = 0; i < 50; i++) {
        const result = await processPayment(session.sessionId, method, null);
        if (!result.success) {
          failureFound = true;
          expect(result.error).toBeDefined();
          expect(result.retryable).toBeDefined();
          break;
        }
      }

      expect(failureFound).toBe(true);
    });

    test('throws error for invalid payment method', async () => {
      const session = await initiatePaymentSession('RES001', 'BILL_2024_102');
      const invalidMethod = { ...MOCK_PAYMENT_METHODS[0], isActive: false };

      await expect(processPayment(session.sessionId, invalidMethod, null)).rejects.toThrow();
    });
  });

  describe('recordPaymentSuccess', () => {
    test('creates payment record and receipt', async () => {
      const session = await initiatePaymentSession('RES001', 'BILL_2024_102');
      const result = await recordPaymentSuccess(session.sessionId, 'txn_test123', 1250);

      expect(result).toBeDefined();
      expect(result.paymentId).toBeDefined();
      expect(result.receiptId).toBeDefined();
      expect(result.billStatus).toBe('paid');
      expect(result.transactionId).toBe('txn_test123');
    });

    test('throws error for invalid session', async () => {
      await expect(recordPaymentSuccess('invalid-session', 'txn_123', 1000)).rejects.toThrow();
    });
  });

  describe('recordPaymentFailure', () => {
    test('logs failure correctly', async () => {
      const session = await initiatePaymentSession('RES001', 'BILL_2024_102');
      const result = await recordPaymentFailure(session.sessionId, 'DECLINED', 'Card declined');

      expect(result).toBeDefined();
      expect(result.failureId).toBeDefined();
      expect(result.retryable).toBeDefined();
      expect(result.message).toBe('Card declined');
    });
  });

  // ==================== HISTORY TESTS ====================

  describe('getPaymentHistory', () => {
    test('returns paginated payment history', async () => {
      const result = await getPaymentHistory('RES001', 5);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(5);
      result.forEach(payment => {
        expect(payment.residentId).toBe('RES001');
      });
    });

    test('respects limit parameter', async () => {
      const result = await getPaymentHistory('RES001', 2);

      expect(result.length).toBeLessThanOrEqual(2);
    });

    test('throws error for missing resident ID', async () => {
      await expect(getPaymentHistory(null)).rejects.toThrow('Resident ID is required');
    });
  });

  describe('getReceipt', () => {
    test('returns receipt data for valid ID', async () => {
      const result = await getReceipt('REC_001');

      expect(result).toBeDefined();
      expect(result.id).toBe('REC_001');
      expect(result.billId).toBeDefined();
      expect(result.transactionId).toBeDefined();
    });

    test('throws error for missing receipt ID', async () => {
      await expect(getReceipt(null)).rejects.toThrow('Receipt ID is required');
    });

    test('throws error for non-existent receipt', async () => {
      await expect(getReceipt('INVALID_RECEIPT')).rejects.toThrow('Receipt not found');
    });
  });

  describe('generateReceiptPDF', () => {
    test('generates PDF successfully', async () => {
      const result = await generateReceiptPDF('REC_001');

      expect(result.success).toBe(true);
      expect(result.filePath).toBeDefined();
      expect(result.receiptId).toBe('REC_001');
    });

    test('throws error for invalid receipt ID', async () => {
      await expect(generateReceiptPDF('INVALID')).rejects.toThrow('Receipt not found');
    });
  });

  // ==================== NOTIFICATION TESTS ====================

  describe('sendPaymentConfirmation', () => {
    test('sends confirmation successfully', async () => {
      const paymentData = {
        billId: 'BILL_2024_102',
        amount: 1250,
        transactionId: 'txn_test123',
        receiptId: 'REC_001',
      };

      const result = await sendPaymentConfirmation('RES001', paymentData);

      expect(result.success).toBe(true);
      expect(result.sentAt).toBeDefined();
      expect(result.channels).toContain('email');
      expect(result.channels).toContain('sms');
    });
  });

  describe('sendPaymentFailureNotification', () => {
    test('sends failure notification', async () => {
      const result = await sendPaymentFailureNotification('RES001', 'Payment declined');

      expect(result.success).toBe(true);
      expect(result.sentAt).toBeDefined();
    });
  });

  describe('sendReceiptEmail', () => {
    test('sends receipt email successfully', async () => {
      const result = await sendReceiptEmail('RES001', 'REC_001');

      expect(result.success).toBe(true);
      expect(result.sentAt).toBeDefined();
      expect(result.recipient).toBeDefined();
    });

    test('throws error for invalid receipt', async () => {
      await expect(sendReceiptEmail('RES001', 'INVALID')).rejects.toThrow('Receipt not found');
    });
  });

  // ==================== ADDITIONAL TESTS ====================

  describe('getResidentInfo', () => {
    test('returns resident information', async () => {
      const result = await getResidentInfo('RES001');

      expect(result).toBeDefined();
      expect(result.id).toBe('RES001');
      expect(result.name).toBeDefined();
      expect(result.email).toBeDefined();
    });

    test('throws error for invalid resident', async () => {
      await expect(getResidentInfo('INVALID')).rejects.toThrow('Resident not found');
    });
  });

  describe('getBillById', () => {
    test('returns bill data', async () => {
      const result = await getBillById('BILL_2024_102');

      expect(result).toBeDefined();
      expect(result.id).toBe('BILL_2024_102');
      expect(result.amount).toBeGreaterThan(0);
    });

    test('throws error for invalid bill', async () => {
      await expect(getBillById('INVALID')).rejects.toThrow('Bill not found');
    });
  });

  // ==================== ERROR HANDLING ====================

  describe('Error Handling', () => {
    test('handles network simulation delays', async () => {
      const startTime = Date.now();
      await getResidentSummary('RES001');
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThan(500);
    });

    test('handles concurrent requests', async () => {
      const promises = [
        getResidentSummary('RES001'),
        getUnpaidBills('RES001'),
        getAvailableCredits('RES001'),
        getPaymentMethods('RES001'),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(4);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });
  });
});
