/**
 * Payment Helper Utilities
 * Provides validation, formatting, and calculation functions for payment operations
 * @module paymentHelpers
 */

/**
 * Formats a number as currency in LKR (Sri Lankan Rupees)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string (e.g., "Rs. 2,500")
 */
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'Rs. 0';
  }
  return `Rs. ${amount.toLocaleString('en-LK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

/**
 * Validates that a bill amount is positive
 * @param {number} amount - The bill amount to validate
 * @returns {{valid: boolean, message: string}} Validation result
 */
export const validateBillAmount = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return { valid: false, message: 'Bill amount must be a valid number' };
  }
  if (amount <= 0) {
    return { valid: false, message: 'Bill amount must be greater than zero' };
  }
  return { valid: true, message: 'Valid bill amount' };
};

/**
 * Validates that credit amount does not exceed bill amount
 * @param {number} creditAmount - The credit amount to apply
 * @param {number} billAmount - The bill amount
 * @returns {{valid: boolean, message: string}} Validation result
 */
export const validateCreditAmount = (creditAmount, billAmount) => {
  if (typeof creditAmount !== 'number' || isNaN(creditAmount)) {
    return { valid: false, message: 'Credit amount must be a valid number' };
  }
  if (creditAmount < 0) {
    return { valid: false, message: 'Credit amount cannot be negative' };
  }
  if (creditAmount > billAmount) {
    return { valid: false, message: 'Credit amount cannot exceed bill amount' };
  }
  return { valid: true, message: 'Valid credit amount' };
};

/**
 * Validates that a payment method is active and not expired
 * @param {Object} paymentMethod - The payment method to validate
 * @returns {{valid: boolean, message: string}} Validation result
 */
export const validatePaymentMethod = (paymentMethod) => {
  if (!paymentMethod) {
    return { valid: false, message: 'Payment method is required' };
  }
  if (!paymentMethod.isActive) {
    return { valid: false, message: 'Payment method is inactive' };
  }
  
  // Check card expiry if it's a card
  if (paymentMethod.type === 'card') {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    if (paymentMethod.expiryYear < currentYear || 
        (paymentMethod.expiryYear === currentYear && paymentMethod.expiryMonth < currentMonth)) {
      return { valid: false, message: 'Card has expired' };
    }
  }
  
  return { valid: true, message: 'Valid payment method' };
};

/**
 * Checks if a payment session has expired
 * @param {string} expiresAt - ISO timestamp of session expiration
 * @returns {boolean} True if session is expired
 */
export const isSessionExpired = (expiresAt) => {
  if (!expiresAt) return true;
  const expiryTime = new Date(expiresAt).getTime();
  const currentTime = new Date().getTime();
  return currentTime > expiryTime;
};

/**
 * Calculates the final amount after applying credits
 * @param {number} billAmount - The original bill amount
 * @param {number} creditsApplied - The credits to apply
 * @returns {number} Final amount after credits
 */
export const calculateFinalAmount = (billAmount, creditsApplied) => {
  const finalAmount = billAmount - creditsApplied;
  return Math.max(0, finalAmount);
};

/**
 * Calculates processing fee (if applicable)
 * @param {number} amount - The payment amount
 * @param {string} paymentMethodType - Type of payment method
 * @returns {number} Processing fee amount
 */
export const calculateProcessingFee = (amount, paymentMethodType) => {
  // No processing fee for bank transfers, 2% for cards
  if (paymentMethodType === 'bank') {
    return 0;
  }
  return amount * 0.02; // 2% for card payments
};

/**
 * Generates a unique transaction ID
 * @returns {string} Transaction ID in format 'txn_xxxxxxxxxxxxx'
 */
export const generateTransactionId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `txn_${timestamp}${randomStr}`;
};

/**
 * Generates a unique receipt ID
 * @returns {string} Receipt ID in format 'REC_XXXXX'
 */
export const generateReceiptId = () => {
  const randomNum = Math.floor(Math.random() * 99999) + 1;
  return `REC_${randomNum.toString().padStart(5, '0')}`;
};

/**
 * Generates a unique session ID
 * @returns {string} Session ID (UUID-like)
 */
export const generateSessionId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Validates card number format (basic Luhn algorithm)
 * @param {string} cardNumber - The card number to validate
 * @returns {{valid: boolean, message: string}} Validation result
 */
export const validateCardNumber = (cardNumber) => {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  if (!/^\d{13,19}$/.test(cleanNumber)) {
    return { valid: false, message: 'Card number must be 13-19 digits' };
  }
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  if (sum % 10 !== 0) {
    return { valid: false, message: 'Invalid card number' };
  }
  
  return { valid: true, message: 'Valid card number' };
};

/**
 * Validates CVV format
 * @param {string} cvv - The CVV to validate
 * @returns {{valid: boolean, message: string}} Validation result
 */
export const validateCVV = (cvv) => {
  if (!/^\d{3,4}$/.test(cvv)) {
    return { valid: false, message: 'CVV must be 3 or 4 digits' };
  }
  return { valid: true, message: 'Valid CVV' };
};

/**
 * Validates card expiry date
 * @param {number} month - Expiry month (1-12)
 * @param {number} year - Expiry year (full year)
 * @returns {{valid: boolean, message: string}} Validation result
 */
export const validateCardExpiry = (month, year) => {
  if (!month || !year) {
    return { valid: false, message: 'Expiry date is required' };
  }
  
  if (month < 1 || month > 12) {
    return { valid: false, message: 'Invalid expiry month' };
  }
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { valid: false, message: 'Card has expired' };
  }
  
  return { valid: true, message: 'Valid expiry date' };
};

/**
 * Masks a card number for display
 * @param {string} cardNumber - The full card number
 * @returns {string} Masked card number (e.g., "**** **** **** 4242")
 */
export const maskCardNumber = (cardNumber) => {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  const last4 = cleanNumber.slice(-4);
  return `**** **** **** ${last4}`;
};

/**
 * Gets card brand from card number
 * @param {string} cardNumber - The card number
 * @returns {string} Card brand (Visa, Mastercard, Amex, etc.)
 */
export const getCardBrand = (cardNumber) => {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  if (/^4/.test(cleanNumber)) return 'Visa';
  if (/^5[1-5]/.test(cleanNumber)) return 'Mastercard';
  if (/^3[47]/.test(cleanNumber)) return 'Amex';
  if (/^6(?:011|5)/.test(cleanNumber)) return 'Discover';
  
  return 'Unknown';
};

/**
 * Calculates total available credits
 * @param {Array} credits - Array of credit objects
 * @returns {number} Total available credits
 */
export const calculateTotalCredits = (credits) => {
  if (!Array.isArray(credits)) return 0;
  return credits
    .filter(credit => credit.status === 'active')
    .reduce((total, credit) => total + credit.amount, 0);
};

/**
 * Sorts credits by expiration date (earliest first)
 * @param {Array} credits - Array of credit objects
 * @returns {Array} Sorted credits array
 */
export const sortCreditsByExpiry = (credits) => {
  if (!Array.isArray(credits)) return [];
  return [...credits].sort((a, b) => {
    return new Date(a.expirationDate) - new Date(b.expirationDate);
  });
};

/**
 * Determines payment urgency level based on due date
 * @param {string} dueDate - ISO timestamp of due date
 * @returns {string} Urgency level: 'urgent', 'warning', 'normal'
 */
export const getPaymentUrgency = (dueDate) => {
  const due = new Date(dueDate);
  const now = new Date();
  const daysUntilDue = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= 3) return 'urgent';
  if (daysUntilDue <= 7) return 'warning';
  return 'normal';
};

/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {{valid: boolean, message: string}} Validation result
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Invalid email format' };
  }
  return { valid: true, message: 'Valid email' };
};

/**
 * Validates phone number format (Sri Lankan)
 * @param {string} phone - Phone number to validate
 * @returns {{valid: boolean, message: string}} Validation result
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^\+94\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return { valid: false, message: 'Phone must be in format +94XXXXXXXXX' };
  }
  return { valid: true, message: 'Valid phone number' };
};
