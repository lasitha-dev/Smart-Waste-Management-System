/**
 * Mock Data for Payment & Rewards Management Module
 * Provides realistic test data for residents, bills, payment methods, and credits
 * @module mockData
 */

/**
 * Mock Resident Data
 * Represents a resident user in the system
 */
export const MOCK_RESIDENT = {
  id: 'RES001',
  name: 'Kumari Silva',
  email: 'kumari@email.com',
  phone: '+94701234567',
  address: '45 Green Lane, Colombo 3',
  accountStatus: 'active',
  balance: 2500,
  linkedBins: ['BIN001', 'BIN002'],
  autopayEnabled: false,
  lastPaymentDate: '2025-09-14T10:30:00.000Z',
  lastPaymentAmount: 2200,
  totalPaidYTD: 18500,
};

/**
 * Mock Bills Data
 * Represents billing records for the resident
 */
export const MOCK_BILLS = [
  {
    id: 'BILL_2024_102',
    residentId: 'RES001',
    amount: 2500,
    appliedCredits: 1250,
    finalAmount: 1250,
    status: 'unpaid',
    billingPeriod: 'Oct 1-31, 2025',
    dueDate: '2025-10-15T23:59:59.000Z',
    createdAt: '2025-10-01T00:00:00.000Z',
    taxes: 250,
    subtotal: 2750,
  },
  {
    id: 'BILL_2024_103',
    residentId: 'RES001',
    amount: 1800,
    appliedCredits: 0,
    finalAmount: 1800,
    status: 'unpaid',
    billingPeriod: 'Nov 1-30, 2025',
    dueDate: '2025-11-15T23:59:59.000Z',
    createdAt: '2025-11-01T00:00:00.000Z',
    taxes: 180,
    subtotal: 1980,
  },
  {
    id: 'BILL_2024_101',
    residentId: 'RES001',
    amount: 2200,
    appliedCredits: 0,
    finalAmount: 2200,
    status: 'paid',
    billingPeriod: 'Sep 1-30, 2025',
    dueDate: '2025-09-15T23:59:59.000Z',
    createdAt: '2025-09-01T00:00:00.000Z',
    paidAt: '2025-09-14T10:30:00.000Z',
    paidAmount: 2200,
    taxes: 220,
    subtotal: 2420,
    transactionId: 'txn_sep_001',
    paymentMethod: 'PM001',
  },
  {
    id: 'BILL_2024_100',
    residentId: 'RES001',
    amount: 2100,
    appliedCredits: 500,
    finalAmount: 1600,
    status: 'paid',
    billingPeriod: 'Aug 1-31, 2025',
    dueDate: '2025-08-15T23:59:59.000Z',
    createdAt: '2025-08-01T00:00:00.000Z',
    paidAt: '2025-08-12T14:20:00.000Z',
    paidAmount: 1600,
    taxes: 210,
    subtotal: 2310,
    transactionId: 'txn_aug_001',
    paymentMethod: 'PM002',
  },
  {
    id: 'BILL_2024_099',
    residentId: 'RES001',
    amount: 1950,
    appliedCredits: 0,
    finalAmount: 1950,
    status: 'paid',
    billingPeriod: 'Jul 1-31, 2025',
    dueDate: '2025-07-15T23:59:59.000Z',
    createdAt: '2025-07-01T00:00:00.000Z',
    paidAt: '2025-07-13T09:15:00.000Z',
    paidAmount: 1950,
    taxes: 195,
    subtotal: 2145,
    transactionId: 'txn_jul_001',
    paymentMethod: 'PM001',
  },
];

/**
 * Mock Payment Methods
 * Represents saved payment methods for the resident
 */
export const MOCK_PAYMENT_METHODS = [
  {
    id: 'PM001',
    residentId: 'RES001',
    type: 'card',
    cardBrand: 'Visa',
    last4Digits: '4242',
    expiryMonth: 12,
    expiryYear: 2026,
    isDefault: true,
    isActive: true,
    holderName: 'Kumari Silva',
    createdAt: '2024-01-15T10:00:00.000Z',
  },
  {
    id: 'PM002',
    residentId: 'RES001',
    type: 'bank',
    bankName: 'Commercial Bank',
    accountLast4: '1234',
    isDefault: false,
    isActive: true,
    holderName: 'Kumari Silva',
    createdAt: '2024-03-20T14:30:00.000Z',
  },
  {
    id: 'PM003',
    residentId: 'RES001',
    type: 'card',
    cardBrand: 'Mastercard',
    last4Digits: '5555',
    expiryMonth: 8,
    expiryYear: 2027,
    isDefault: false,
    isActive: true,
    holderName: 'Kumari Silva',
    createdAt: '2024-06-10T11:45:00.000Z',
  },
];

/**
 * Mock Credits Data
 * Represents available credits for the resident
 */
export const MOCK_CREDITS = [
  {
    id: 'CREDIT001',
    residentId: 'RES001',
    amount: 500,
    source: 'recyclable',
    sourceDescription: 'Recyclable Waste Collection',
    earnedDate: '2025-10-01T08:00:00.000Z',
    expirationDate: '2025-12-31T23:59:59.000Z',
    status: 'active',
  },
  {
    id: 'CREDIT002',
    residentId: 'RES001',
    amount: 750,
    source: 'ewaste',
    sourceDescription: 'E-Waste Disposal',
    earnedDate: '2025-09-15T10:30:00.000Z',
    expirationDate: '2025-11-15T23:59:59.000Z',
    status: 'active',
  },
  {
    id: 'CREDIT003',
    residentId: 'RES001',
    amount: 300,
    source: 'recyclable',
    sourceDescription: 'Recyclable Waste Collection',
    earnedDate: '2025-09-20T14:15:00.000Z',
    expirationDate: '2025-12-20T23:59:59.000Z',
    status: 'active',
  },
];

/**
 * Mock Payment History
 * Represents past payment transactions
 */
export const MOCK_PAYMENT_HISTORY = [
  {
    id: 'PAY001',
    residentId: 'RES001',
    billId: 'BILL_2024_101',
    amount: 2200,
    creditsApplied: 0,
    finalAmount: 2200,
    transactionId: 'txn_sep_001',
    paymentMethod: 'PM001',
    paymentMethodDisplay: 'Visa **** 4242',
    status: 'completed',
    completedAt: '2025-09-14T10:30:00.000Z',
    receiptId: 'REC_001',
  },
  {
    id: 'PAY002',
    residentId: 'RES001',
    billId: 'BILL_2024_100',
    amount: 2100,
    creditsApplied: 500,
    finalAmount: 1600,
    transactionId: 'txn_aug_001',
    paymentMethod: 'PM002',
    paymentMethodDisplay: 'Commercial Bank **** 1234',
    status: 'completed',
    completedAt: '2025-08-12T14:20:00.000Z',
    receiptId: 'REC_002',
  },
  {
    id: 'PAY003',
    residentId: 'RES001',
    billId: 'BILL_2024_099',
    amount: 1950,
    creditsApplied: 0,
    finalAmount: 1950,
    transactionId: 'txn_jul_001',
    paymentMethod: 'PM001',
    paymentMethodDisplay: 'Visa **** 4242',
    status: 'completed',
    completedAt: '2025-07-13T09:15:00.000Z',
    receiptId: 'REC_003',
  },
];

/**
 * Mock Payment Sessions
 * In-memory storage for active payment sessions
 */
export const MOCK_PAYMENT_SESSIONS = {};

/**
 * Mock Receipts
 * Storage for generated receipts
 */
export const MOCK_RECEIPTS = {
  REC_001: {
    id: 'REC_001',
    billId: 'BILL_2024_101',
    residentId: 'RES001',
    residentName: 'Kumari Silva',
    residentEmail: 'kumari@email.com',
    amount: 2200,
    creditsApplied: 0,
    finalAmount: 2200,
    transactionId: 'txn_sep_001',
    paymentMethod: 'Visa **** 4242',
    completedAt: '2025-09-14T10:30:00.000Z',
    billingPeriod: 'Sep 1-30, 2025',
    status: 'paid',
  },
  REC_002: {
    id: 'REC_002',
    billId: 'BILL_2024_100',
    residentId: 'RES001',
    residentName: 'Kumari Silva',
    residentEmail: 'kumari@email.com',
    amount: 2100,
    creditsApplied: 500,
    finalAmount: 1600,
    transactionId: 'txn_aug_001',
    paymentMethod: 'Commercial Bank **** 1234',
    completedAt: '2025-08-12T14:20:00.000Z',
    billingPeriod: 'Aug 1-31, 2025',
    status: 'paid',
  },
  REC_003: {
    id: 'REC_003',
    billId: 'BILL_2024_099',
    residentId: 'RES001',
    residentName: 'Kumari Silva',
    residentEmail: 'kumari@email.com',
    amount: 1950,
    creditsApplied: 0,
    finalAmount: 1950,
    transactionId: 'txn_jul_001',
    paymentMethod: 'Visa **** 4242',
    completedAt: '2025-07-13T09:15:00.000Z',
    billingPeriod: 'Jul 1-31, 2025',
    status: 'paid',
  },
};

/**
 * Mock Payment Failures
 * Storage for failed payment attempts
 */
export const MOCK_PAYMENT_FAILURES = [];
