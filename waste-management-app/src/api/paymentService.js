/**
 * Payment Service Layer
 * Handles all payment-related business logic and mock API calls
 * @module paymentService
 */

import {
  MOCK_RESIDENT,
  MOCK_BILLS,
  MOCK_PAYMENT_METHODS,
  MOCK_CREDITS,
  MOCK_PAYMENT_HISTORY,
  MOCK_PAYMENT_SESSIONS,
  MOCK_RECEIPTS,
  MOCK_PAYMENT_FAILURES,
} from './mockData';

import {
  validateBillAmount,
  validateCreditAmount,
  validatePaymentMethod,
  isSessionExpired,
  calculateFinalAmount,
  generateTransactionId,
  generateReceiptId,
  generateSessionId,
  calculateTotalCredits,
} from '../utils/paymentHelpers';

import { getCurrentTimestamp, addMinutes } from '../utils/dateFormatter';

/**
 * Simulates network delay for mock API calls
 * @param {number} minMs - Minimum delay in milliseconds
 * @param {number} maxMs - Maximum delay in milliseconds
 * @returns {Promise} Promise that resolves after delay
 */
const simulateNetworkDelay = (minMs = 500, maxMs = 2000) => {
  const delay = minMs + Math.random() * (maxMs - minMs);
  return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Simulates random payment gateway failures (5% failure rate)
 * @returns {boolean} True if payment should fail
 */
const shouldSimulateFailure = () => {
  return Math.random() < 0.05;
};

// ==================== PAYMENT HUB FUNCTIONS ====================

/**
 * Returns resident's account summary
 * @param {string} residentId - The resident's ID
 * @returns {Promise<Object>} Account summary data
 */
export const getResidentSummary = async (residentId) => {
  await simulateNetworkDelay();
  
  if (!residentId) {
    throw new Error('Resident ID is required');
  }
  
  if (residentId !== MOCK_RESIDENT.id) {
    throw new Error('Resident not found');
  }
  
  const unpaidBills = MOCK_BILLS.filter(
    bill => bill.residentId === residentId && bill.status === 'unpaid'
  );
  
  const totalDue = unpaidBills.reduce((sum, bill) => sum + bill.finalAmount, 0);
  
  const availableCredits = MOCK_CREDITS.filter(
    credit => credit.residentId === residentId && credit.status === 'active'
  );
  
  const totalCredits = calculateTotalCredits(availableCredits);
  
  return {
    balance: totalDue,
    lastPaymentDate: MOCK_RESIDENT.lastPaymentDate,
    lastPaymentAmount: MOCK_RESIDENT.lastPaymentAmount,
    totalPaidYTD: MOCK_RESIDENT.totalPaidYTD,
    creditCount: availableCredits.length,
    totalCredits,
    unpaidBillsCount: unpaidBills.length,
  };
};

/**
 * Returns unpaid bills for resident
 * @param {string} residentId - The resident's ID
 * @returns {Promise<Array>} Array of unpaid bills
 */
export const getUnpaidBills = async (residentId) => {
  await simulateNetworkDelay();
  
  if (!residentId) {
    throw new Error('Resident ID is required');
  }
  
  const unpaidBills = MOCK_BILLS.filter(
    bill => bill.residentId === residentId && bill.status === 'unpaid'
  );
  
  return unpaidBills.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
};

/**
 * Returns resident's available credits
 * @param {string} residentId - The resident's ID
 * @returns {Promise<Array>} Array of active credits
 */
export const getAvailableCredits = async (residentId) => {
  await simulateNetworkDelay();
  
  if (!residentId) {
    throw new Error('Resident ID is required');
  }
  
  const activeCredits = MOCK_CREDITS.filter(
    credit => credit.residentId === residentId && credit.status === 'active'
  );
  
  return activeCredits.sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));
};

/**
 * Returns resident's saved payment methods
 * @param {string} residentId - The resident's ID
 * @returns {Promise<Array>} Array of saved payment methods
 */
export const getPaymentMethods = async (residentId) => {
  await simulateNetworkDelay();
  
  if (!residentId) {
    throw new Error('Resident ID is required');
  }
  
  const methods = MOCK_PAYMENT_METHODS.filter(
    method => method.residentId === residentId && method.isActive
  );
  
  return methods.sort((a, b) => b.isDefault - a.isDefault);
};

// ==================== PAYMENT PROCESSING FUNCTIONS ====================

/**
 * Initiates payment session (15 min expiry)
 * @param {string} residentId - The resident's ID
 * @param {string} billId - The bill ID to pay
 * @returns {Promise<Object>} Payment session data
 */
export const initiatePaymentSession = async (residentId, billId) => {
  await simulateNetworkDelay();
  
  if (!residentId || !billId) {
    throw new Error('Resident ID and Bill ID are required');
  }
  
  const bill = MOCK_BILLS.find(b => b.id === billId);
  
  if (!bill) {
    throw new Error('Bill not found');
  }
  
  if (bill.residentId !== residentId) {
    throw new Error('Bill does not belong to this resident');
  }
  
  if (bill.status !== 'unpaid') {
    throw new Error('Bill is already paid');
  }
  
  const validation = validateBillAmount(bill.finalAmount);
  if (!validation.valid) {
    throw new Error(validation.message);
  }
  
  const sessionId = generateSessionId();
  const expiresAt = addMinutes(getCurrentTimestamp(), 15);
  
  const paymentMethods = await getPaymentMethods(residentId);
  
  const session = {
    sessionId,
    residentId,
    billId,
    billAmount: bill.amount,
    appliedCredits: bill.appliedCredits,
    finalAmount: bill.finalAmount,
    expiresAt,
    paymentMethods,
    createdAt: getCurrentTimestamp(),
    status: 'active',
  };
  
  MOCK_PAYMENT_SESSIONS[sessionId] = session;
  
  console.log(`[Payment Service] Session initiated: ${sessionId} for bill ${billId}`);
  
  return session;
};

/**
 * Validates payment session
 * @param {string} sessionId - The session ID to validate
 * @returns {Promise<Object>} Validation result
 */
export const validatePaymentSession = async (sessionId) => {
  await simulateNetworkDelay(200, 500);
  
  if (!sessionId) {
    throw new Error('Session ID is required');
  }
  
  const session = MOCK_PAYMENT_SESSIONS[sessionId];
  
  if (!session) {
    return { valid: false, message: 'Session not found' };
  }
  
  if (session.status !== 'active') {
    return { valid: false, message: 'Session is no longer active' };
  }
  
  if (isSessionExpired(session.expiresAt)) {
    session.status = 'expired';
    return { valid: false, message: 'Session has expired. Please start a new payment.' };
  }
  
  return { valid: true, message: 'Session is valid', session };
};

/**
 * Applies credits to bill before payment
 * @param {string} sessionId - The session ID
 * @param {number} creditAmount - The credits to apply
 * @returns {Promise<Object>} Updated payment amounts
 */
export const applyCreditsToPayment = async (sessionId, creditAmount) => {
  await simulateNetworkDelay();
  
  const validation = await validatePaymentSession(sessionId);
  
  if (!validation.valid) {
    throw new Error(validation.message);
  }
  
  const session = validation.session;
  
  const creditValidation = validateCreditAmount(creditAmount, session.billAmount);
  if (!creditValidation.valid) {
    throw new Error(creditValidation.message);
  }
  
  const newFinalAmount = calculateFinalAmount(session.billAmount, creditAmount);
  
  session.appliedCredits = creditAmount;
  session.finalAmount = newFinalAmount;
  
  console.log(`[Payment Service] Credits applied: ${creditAmount} to session ${sessionId}`);
  
  return {
    newAmount: session.billAmount,
    creditsApplied: creditAmount,
    newFinalAmount,
  };
};

/**
 * Processes payment through gateway
 * @param {string} sessionId - The session ID
 * @param {Object} paymentMethod - The payment method to use
 * @param {string} cardToken - Tokenized card data (if applicable)
 * @returns {Promise<Object>} Payment result
 */
export const processPayment = async (sessionId, paymentMethod, cardToken = null) => {
  await simulateNetworkDelay(1000, 2500);
  
  const validation = await validatePaymentSession(sessionId);
  
  if (!validation.valid) {
    throw new Error(validation.message);
  }
  
  const session = validation.session;
  
  const methodValidation = validatePaymentMethod(paymentMethod);
  if (!methodValidation.valid) {
    throw new Error(methodValidation.message);
  }
  
  // Simulate payment gateway processing
  console.log(`[Payment Gateway] Processing payment for session ${sessionId}`);
  console.log(`[Payment Gateway] Amount: Rs. ${session.finalAmount}`);
  console.log(`[Payment Gateway] Method: ${paymentMethod.type} ${paymentMethod.last4Digits || paymentMethod.accountLast4}`);
  
  // Simulate 5% random failures
  if (shouldSimulateFailure()) {
    const errorMessages = [
      'Payment declined by issuing bank',
      'Insufficient funds',
      'Card verification failed',
      'Payment gateway timeout',
      'Network error occurred',
    ];
    
    const errorMessage = errorMessages[Math.floor(Math.random() * errorMessages.length)];
    
    console.error(`[Payment Gateway] Payment failed: ${errorMessage}`);
    
    return {
      success: false,
      error: errorMessage,
      retryable: !errorMessage.includes('declined'),
    };
  }
  
  // Successful payment
  const transactionId = generateTransactionId();
  const completedAt = getCurrentTimestamp();
  
  console.log(`[Payment Gateway] Payment successful: ${transactionId}`);
  
  return {
    success: true,
    transactionId,
    amount: session.finalAmount,
    completedAt,
    sessionId,
    billId: session.billId,
    paymentMethod: paymentMethod.id,
  };
};

/**
 * Records successful payment
 * @param {string} sessionId - The session ID
 * @param {string} transactionId - The transaction ID from gateway
 * @param {number} amount - The payment amount
 * @returns {Promise<Object>} Payment record
 */
export const recordPaymentSuccess = async (sessionId, transactionId, amount) => {
  await simulateNetworkDelay();
  
  const session = MOCK_PAYMENT_SESSIONS[sessionId];
  
  if (!session) {
    throw new Error('Session not found');
  }
  
  const bill = MOCK_BILLS.find(b => b.id === session.billId);
  
  if (!bill) {
    throw new Error('Bill not found');
  }
  
  // Update bill status
  bill.status = 'paid';
  bill.paidAt = getCurrentTimestamp();
  bill.paidAmount = amount;
  bill.transactionId = transactionId;
  
  // Generate receipt
  const receiptId = generateReceiptId();
  
  const receipt = {
    id: receiptId,
    billId: bill.id,
    residentId: session.residentId,
    residentName: MOCK_RESIDENT.name,
    residentEmail: MOCK_RESIDENT.email,
    amount: bill.amount,
    creditsApplied: session.appliedCredits,
    finalAmount: amount,
    transactionId,
    paymentMethod: session.paymentMethods.find(m => m.isDefault)?.id || 'PM001',
    completedAt: getCurrentTimestamp(),
    billingPeriod: bill.billingPeriod,
    status: 'paid',
  };
  
  MOCK_RECEIPTS[receiptId] = receipt;
  
  // Add to payment history
  const paymentRecord = {
    id: `PAY${Date.now()}`,
    residentId: session.residentId,
    billId: bill.id,
    amount: bill.amount,
    creditsApplied: session.appliedCredits,
    finalAmount: amount,
    transactionId,
    paymentMethod: receipt.paymentMethod,
    paymentMethodDisplay: 'Visa **** 4242',
    status: 'completed',
    completedAt: getCurrentTimestamp(),
    receiptId,
  };
  
  MOCK_PAYMENT_HISTORY.unshift(paymentRecord);
  
  // Update session status
  session.status = 'completed';
  
  console.log(`[Payment Service] Payment recorded successfully: ${transactionId}`);
  console.log(`[Payment Service] Receipt generated: ${receiptId}`);
  
  return {
    paymentId: paymentRecord.id,
    receiptId,
    billStatus: 'paid',
    transactionId,
  };
};

/**
 * Handles failed payment
 * @param {string} sessionId - The session ID
 * @param {string} errorCode - Error code from gateway
 * @param {string} errorMessage - Error message
 * @returns {Promise<Object>} Failure record
 */
export const recordPaymentFailure = async (sessionId, errorCode, errorMessage) => {
  await simulateNetworkDelay();
  
  const session = MOCK_PAYMENT_SESSIONS[sessionId];
  
  if (!session) {
    throw new Error('Session not found');
  }
  
  const failureRecord = {
    id: `FAIL${Date.now()}`,
    sessionId,
    residentId: session.residentId,
    billId: session.billId,
    amount: session.finalAmount,
    errorCode,
    errorMessage,
    failedAt: getCurrentTimestamp(),
    retryable: !errorMessage.includes('declined'),
  };
  
  MOCK_PAYMENT_FAILURES.push(failureRecord);
  
  console.error(`[Payment Service] Payment failure recorded: ${errorMessage}`);
  
  return {
    failureId: failureRecord.id,
    retryable: failureRecord.retryable,
    message: errorMessage,
  };
};

// ==================== HISTORY & RECEIPT FUNCTIONS ====================

/**
 * Returns payment history for resident
 * @param {string} residentId - The resident's ID
 * @param {number} limit - Maximum number of records to return
 * @returns {Promise<Array>} Array of past payments
 */
export const getPaymentHistory = async (residentId, limit = 10) => {
  await simulateNetworkDelay();
  
  if (!residentId) {
    throw new Error('Resident ID is required');
  }
  
  const history = MOCK_PAYMENT_HISTORY.filter(
    payment => payment.residentId === residentId
  );
  
  return history.slice(0, limit);
};

/**
 * Returns receipt details
 * @param {string} receiptId - The receipt ID
 * @returns {Promise<Object>} Receipt data
 */
export const getReceipt = async (receiptId) => {
  await simulateNetworkDelay();
  
  if (!receiptId) {
    throw new Error('Receipt ID is required');
  }
  
  const receipt = MOCK_RECEIPTS[receiptId];
  
  if (!receipt) {
    throw new Error('Receipt not found');
  }
  
  return receipt;
};

/**
 * Generates receipt PDF (mock)
 * @param {string} receiptId - The receipt ID
 * @returns {Promise<Object>} PDF generation result
 */
export const generateReceiptPDF = async (receiptId) => {
  await simulateNetworkDelay(1000, 1500);
  
  if (!receiptId) {
    throw new Error('Receipt ID is required');
  }
  
  const receipt = MOCK_RECEIPTS[receiptId];
  
  if (!receipt) {
    throw new Error('Receipt not found');
  }
  
  const filePath = `/receipts/${receiptId}.pdf`;
  
  console.log(`[PDF Generator] Receipt PDF generated: ${filePath}`);
  
  return {
    success: true,
    filePath,
    receiptId,
  };
};

// ==================== NOTIFICATION FUNCTIONS ====================

/**
 * Sends payment confirmation
 * @param {string} residentId - The resident's ID
 * @param {Object} paymentData - Payment details
 * @returns {Promise<Object>} Notification result
 */
export const sendPaymentConfirmation = async (residentId, paymentData) => {
  await simulateNetworkDelay(500, 1000);
  
  const timestamp = getCurrentTimestamp();
  
  console.log('='.repeat(60));
  console.log('[NOTIFICATION] Payment Confirmation');
  console.log('='.repeat(60));
  console.log(`To: ${MOCK_RESIDENT.email}`);
  console.log(`Phone: ${MOCK_RESIDENT.phone}`);
  console.log(`Timestamp: ${timestamp}`);
  console.log('-'.repeat(60));
  console.log(`Bill ID: ${paymentData.billId}`);
  console.log(`Amount Paid: Rs. ${paymentData.amount}`);
  console.log(`Transaction ID: ${paymentData.transactionId}`);
  console.log(`Receipt ID: ${paymentData.receiptId}`);
  console.log(`Receipt Link: https://app.wastems.lk/receipts/${paymentData.receiptId}`);
  console.log('='.repeat(60));
  
  return {
    success: true,
    sentAt: timestamp,
    channels: ['email', 'sms', 'in-app'],
  };
};

/**
 * Sends payment failure notification
 * @param {string} residentId - The resident's ID
 * @param {string} errorMessage - Error message
 * @returns {Promise<Object>} Notification result
 */
export const sendPaymentFailureNotification = async (residentId, errorMessage) => {
  await simulateNetworkDelay(500, 1000);
  
  const timestamp = getCurrentTimestamp();
  
  console.log('='.repeat(60));
  console.log('[NOTIFICATION] Payment Failed');
  console.log('='.repeat(60));
  console.log(`To: ${MOCK_RESIDENT.email}`);
  console.log(`Phone: ${MOCK_RESIDENT.phone}`);
  console.log(`Timestamp: ${timestamp}`);
  console.log('-'.repeat(60));
  console.log(`Error: ${errorMessage}`);
  console.log(`Action Required: Please try again or contact support`);
  console.log('='.repeat(60));
  
  return {
    success: true,
    sentAt: timestamp,
    channels: ['email', 'in-app'],
  };
};

/**
 * Sends receipt via email
 * @param {string} residentId - The resident's ID
 * @param {string} receiptId - The receipt ID
 * @returns {Promise<Object>} Email result
 */
export const sendReceiptEmail = async (residentId, receiptId) => {
  await simulateNetworkDelay(500, 1000);
  
  const receipt = MOCK_RECEIPTS[receiptId];
  
  if (!receipt) {
    throw new Error('Receipt not found');
  }
  
  const timestamp = getCurrentTimestamp();
  
  console.log('='.repeat(60));
  console.log('[EMAIL] Receipt Sent');
  console.log('='.repeat(60));
  console.log(`To: ${MOCK_RESIDENT.email}`);
  console.log(`Subject: Payment Receipt - ${receiptId}`);
  console.log(`Timestamp: ${timestamp}`);
  console.log('-'.repeat(60));
  console.log(`Receipt ID: ${receiptId}`);
  console.log(`Bill ID: ${receipt.billId}`);
  console.log(`Amount: Rs. ${receipt.finalAmount}`);
  console.log(`Transaction ID: ${receipt.transactionId}`);
  console.log('='.repeat(60));
  
  return {
    success: true,
    sentAt: timestamp,
    recipient: MOCK_RESIDENT.email,
  };
};

/**
 * Gets resident information
 * @param {string} residentId - The resident's ID
 * @returns {Promise<Object>} Resident data
 */
export const getResidentInfo = async (residentId) => {
  await simulateNetworkDelay();
  
  if (!residentId) {
    throw new Error('Resident ID is required');
  }
  
  if (residentId !== MOCK_RESIDENT.id) {
    throw new Error('Resident not found');
  }
  
  return { ...MOCK_RESIDENT };
};

/**
 * Gets a specific bill by ID
 * @param {string} billId - The bill ID
 * @returns {Promise<Object>} Bill data
 */
export const getBillById = async (billId) => {
  await simulateNetworkDelay();
  
  if (!billId) {
    throw new Error('Bill ID is required');
  }
  
  const bill = MOCK_BILLS.find(b => b.id === billId);
  
  if (!bill) {
    throw new Error('Bill not found');
  }
  
  return { ...bill };
};
