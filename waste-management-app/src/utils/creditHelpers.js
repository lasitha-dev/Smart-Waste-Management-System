/**
 * Credit Helpers - Validation and calculation utilities for credits/points
 * @module creditHelpers
 */

/**
 * Validates a credit item for correctness and consistency
 * @param {Object} credit - Credit object to validate
 * @returns {Object} Validation result with valid flag and error details
 */
export const validateCreditItem = (credit) => {
  // Validate core fields
  if (!credit || typeof credit !== 'object') {
    return { valid: false, error: 'INVALID_CREDIT_OBJECT', message: 'Credit must be an object' };
  }

  if (!credit.id || typeof credit.id !== 'string') {
    return { valid: false, error: 'INVALID_ID', message: 'Credit ID is required' };
  }

  if (typeof credit.amount !== 'number' || credit.amount <= 0) {
    return { valid: false, error: 'INVALID_AMOUNT', message: 'Credit amount must be positive' };
  }

  if (!credit.currency || typeof credit.currency !== 'string') {
    return { valid: false, error: 'INVALID_CURRENCY', message: 'Invalid currency code' };
  }

  const validSources = ['recyclable', 'ewaste', 'referral', 'promotion', 'manual'];
  if (!credit.source || !validSources.includes(credit.source)) {
    return { valid: false, error: 'INVALID_SOURCE', message: 'Invalid credit source' };
  }

  const validStatuses = ['active', 'redeemed', 'expired', 'cancelled'];
  if (!credit.status || !validStatuses.includes(credit.status)) {
    return { valid: false, error: 'INVALID_STATUS', message: 'Invalid credit status' };
  }

  // Validate dates
  if (!credit.earnedDate) {
    return { valid: false, error: 'MISSING_EARNED_DATE', message: 'Earned date is required' };
  }

  const earnedDate = new Date(credit.earnedDate);
  const now = new Date();

  if (isNaN(earnedDate.getTime())) {
    return { valid: false, error: 'INVALID_EARNED_DATE', message: 'Invalid earned date format' };
  }

  if (earnedDate > now) {
    return { valid: false, error: 'FUTURE_EARNED_DATE', message: 'Earned date cannot be in the future' };
  }

  // Validate expiration date logic
  if (credit.expirationDate) {
    const expirationDate = new Date(credit.expirationDate);
    
    if (isNaN(expirationDate.getTime())) {
      return { valid: false, error: 'INVALID_EXPIRATION_DATE', message: 'Invalid expiration date format' };
    }

    if (expirationDate < earnedDate) {
      return { valid: false, error: 'INVALID_DATE_RANGE', message: 'Expiration date cannot be before earned date' };
    }

    // Auto-correct expired status
    if (expirationDate < now && credit.status !== 'expired') {
      console.warn(`Credit ${credit.id} expired but not marked as expired`);
      credit.status = 'expired';
    }
  }

  // Validate status consistency
  if (credit.status === 'redeemed') {
    if (!credit.redeemedDate) {
      return { valid: false, error: 'MISSING_REDEEMED_DATE', message: 'Redeemed date required for redeemed credits' };
    }
    if (!credit.redeemedBillId) {
      return { valid: false, error: 'MISSING_BILL_ID', message: 'Bill ID required for redeemed credits' };
    }
    if (typeof credit.redeemedAmount !== 'number' || credit.redeemedAmount <= 0) {
      return { valid: false, error: 'INVALID_REDEEMED_AMOUNT', message: 'Invalid redeemed amount' };
    }
    if (credit.redeemedAmount > credit.amount) {
      return { valid: false, error: 'REDEEMED_EXCEEDS_AMOUNT', message: 'Redeemed amount exceeds credit amount' };
    }
  }

  if (credit.status === 'active') {
    if (credit.redeemedDate) {
      return { valid: false, error: 'ACTIVE_WITH_REDEEMED_DATE', message: 'Active credit cannot have redeemed date' };
    }
    if (credit.expirationDate && new Date(credit.expirationDate) < now) {
      return { valid: false, error: 'ACTIVE_BUT_EXPIRED', message: 'Active credit has expired' };
    }
  }

  if (credit.status === 'expired') {
    if (!credit.expirationDate || new Date(credit.expirationDate) >= now) {
      return { valid: false, error: 'EXPIRED_NOT_PAST_DATE', message: 'Expired credit must have past expiration date' };
    }
  }

  return { valid: true, data: credit };
};

/**
 * Calculates expiration status and days remaining for a credit
 * @param {string|null} expirationDate - ISO date string or null
 * @returns {Object} Expiration status details
 */
export const calculateExpirationStatus = (expirationDate) => {
  if (!expirationDate) {
    return {
      status: 'no_expiration',
      daysRemaining: null,
      label: 'No expiration',
      color: '#6B7280'
    };
  }

  const expDate = new Date(expirationDate);
  const now = new Date();
  const diffTime = expDate - now;
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return {
      status: 'expired',
      daysRemaining,
      label: `Expired on ${formatDate(expirationDate)}`,
      color: '#9CA3AF'
    };
  }

  if (daysRemaining === 0) {
    return {
      status: 'expiring_today',
      daysRemaining: 0,
      label: 'Expires TODAY',
      color: '#EF4444'
    };
  }

  if (daysRemaining <= 7) {
    return {
      status: 'expiring_soon',
      daysRemaining,
      label: `Expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} (URGENT)`,
      color: '#F59E0B'
    };
  }

  if (daysRemaining <= 30) {
    return {
      status: 'expiring_soon',
      daysRemaining,
      label: `Expires in ${daysRemaining} days`,
      color: '#F59E0B'
    };
  }

  return {
    status: 'valid',
    daysRemaining,
    label: `Expires on ${formatDate(expirationDate)}`,
    color: '#6B7280'
  };
};

/**
 * Formats a date string to readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

/**
 * Processes and categorizes credits for display
 * @param {Array} allCredits - Array of all credit objects
 * @returns {Object} Processed credits data with categories and summary
 */
export const processCreditsForDisplay = (allCredits) => {
  if (!Array.isArray(allCredits)) {
    return {
      validCreditsCount: 0,
      invalidCreditsCount: 0,
      activeCredits: [],
      redeemedCredits: [],
      expiredCredits: [],
      summary: {
        totalActive: 0,
        countActive: 0,
        totalRedeemed: 0,
        countRedeemed: 0,
        totalExpired: 0,
        countExpired: 0,
        expiringCount: 0,
        expiringAmount: 0
      },
      breakdown: {}
    };
  }

  // Step 1: Validate all credits
  const validatedCredits = [];
  let invalidCount = 0;

  allCredits.forEach((credit) => {
    const validation = validateCreditItem(credit);
    if (validation.valid) {
      // Add calculated fields
      const creditWithStatus = {
        ...credit,
        expirationStatus: calculateExpirationStatus(credit.expirationDate),
        daysRemaining: calculateExpirationStatus(credit.expirationDate).daysRemaining
      };
      validatedCredits.push(creditWithStatus);
    } else {
      console.warn(`Invalid credit: ${credit?.id} - ${validation.error}`);
      invalidCount++;
    }
  });

  // Step 2: Categorize by status
  const activeCredits = validatedCredits.filter(c => c.status === 'active');
  const redeemedCredits = validatedCredits.filter(c => c.status === 'redeemed');
  const expiredCredits = validatedCredits.filter(c => c.status === 'expired');

  // Step 3: Sort each category
  activeCredits.sort((a, b) => {
    // Sort by expiration date (expiring soon first), then by earned date (recent first)
    if (a.expirationDate && b.expirationDate) {
      const dateCompare = new Date(a.expirationDate) - new Date(b.expirationDate);
      if (dateCompare !== 0) return dateCompare;
    } else if (a.expirationDate) {
      return -1; // a has expiration, b doesn't - a comes first
    } else if (b.expirationDate) {
      return 1; // b has expiration, a doesn't - b comes first
    }
    return new Date(b.earnedDate) - new Date(a.earnedDate);
  });

  redeemedCredits.sort((a, b) => 
    new Date(b.redeemedDate) - new Date(a.redeemedDate)
  );

  expiredCredits.sort((a, b) => 
    new Date(b.expirationDate) - new Date(a.expirationDate)
  );

  // Step 4: Calculate totals
  const totalActive = activeCredits.reduce((sum, c) => sum + c.amount, 0);
  const totalRedeemed = redeemedCredits.reduce((sum, c) => sum + (c.redeemedAmount || c.amount), 0);
  const totalExpired = expiredCredits.reduce((sum, c) => sum + c.amount, 0);

  const expiringCredits = activeCredits.filter(c => c.daysRemaining !== null && c.daysRemaining <= 7);
  const expiringAmount = expiringCredits.reduce((sum, c) => sum + c.amount, 0);

  // Step 5: Break down by source
  const sourceBreakdown = {};
  activeCredits.forEach((credit) => {
    if (!sourceBreakdown[credit.source]) {
      sourceBreakdown[credit.source] = 0;
    }
    sourceBreakdown[credit.source] += credit.amount;
  });

  return {
    validCreditsCount: validatedCredits.length,
    invalidCreditsCount: invalidCount,
    activeCredits,
    redeemedCredits,
    expiredCredits,
    summary: {
      totalActive,
      countActive: activeCredits.length,
      totalRedeemed,
      countRedeemed: redeemedCredits.length,
      totalExpired,
      countExpired: expiredCredits.length,
      expiringCount: expiringCredits.length,
      expiringAmount
    },
    breakdown: sourceBreakdown
  };
};

/**
 * Gets a human-readable label for a credit source
 * @param {string} source - Credit source type
 * @returns {string} Display label
 */
export const getSourceLabel = (source) => {
  const labels = {
    recyclable: 'Recyclable Waste',
    ewaste: 'E-waste Pickup',
    referral: 'Referral Bonus',
    promotion: 'Promotional Credit',
    manual: 'Manual Credit'
  };
  return labels[source] || source;
};

/**
 * Gets an icon for a credit source
 * @param {string} source - Credit source type
 * @returns {string} Emoji icon
 */
export const getSourceIcon = (source) => {
  const icons = {
    recyclable: '♻️',
    ewaste: '🔌',
    referral: '👥',
    promotion: '🎯',
    manual: '✏️'
  };
  return icons[source] || '🎁';
};

/**
 * Calculates automatic credit application using FIFO strategy
 * @param {Array} availableCredits - Array of available credits
 * @param {number} billAmount - Bill amount to cover
 * @returns {Object} Application calculation result
 */
export const calculateAutomaticApplication = (availableCredits, billAmount) => {
  // Step 1: Filter only valid, non-expired credits
  const validCredits = availableCredits.filter(credit => 
    credit.status === 'active' &&
    (!credit.expirationDate || new Date(credit.expirationDate) > new Date())
  );

  // Step 2: Sort by expiration date (expiring soon first - FIFO strategy)
  const sortedCredits = [...validCredits].sort((a, b) => {
    if (a.expirationDate && b.expirationDate) {
      const dateCompare = new Date(a.expirationDate) - new Date(b.expirationDate);
      if (dateCompare !== 0) return dateCompare;
    } else if (a.expirationDate) {
      return -1;
    } else if (b.expirationDate) {
      return 1;
    }
    return new Date(a.earnedDate) - new Date(b.earnedDate);
  });

  // Step 3: Apply credits up to bill amount
  const creditsToUse = [];
  let remainingBillAmount = billAmount;
  let totalApplied = 0;

  for (const credit of sortedCredits) {
    if (remainingBillAmount <= 0) break;

    const amountFromThisCredit = Math.min(credit.amount, remainingBillAmount);

    creditsToUse.push({
      creditId: credit.id,
      amount: amountFromThisCredit,
      source: credit.source,
      expirationDate: credit.expirationDate
    });

    remainingBillAmount -= amountFromThisCredit;
    totalApplied += amountFromThisCredit;
  }

  // Step 4: Calculate results
  const newBillAmount = Math.max(0, billAmount - totalApplied);
  const totalRemaining = validCredits.reduce((sum, c) => sum + c.amount, 0) - totalApplied;

  return {
    creditsToApply: totalApplied,
    creditsUsed: creditsToUse,
    newBillAmount,
    creditsRemaining: totalRemaining,
    fullyPaid: newBillAmount === 0
  };
};

/**
 * Calculates manual credit application
 * @param {Array} selectedCreditIds - Array of selected credit IDs
 * @param {Array} availableCredits - Array of all available credits
 * @param {number} billAmount - Bill amount
 * @returns {Object} Application calculation result
 */
export const calculateManualApplication = (selectedCreditIds, availableCredits, billAmount) => {
  const creditsToUse = [];
  let totalApplied = 0;

  for (const creditId of selectedCreditIds) {
    const credit = availableCredits.find(c => c.id === creditId);

    if (!credit) {
      console.warn(`Credit not found: ${creditId}`);
      continue;
    }

    // Validate credit is still valid
    if (credit.status !== 'active') {
      return {
        valid: false,
        error: 'INVALID_CREDIT_STATUS',
        message: `Credit ${creditId} is not active`,
        creditId
      };
    }

    if (credit.expirationDate && new Date(credit.expirationDate) < new Date()) {
      return {
        valid: false,
        error: 'CREDIT_EXPIRED',
        message: `Credit ${creditId} has expired`,
        creditId
      };
    }

    creditsToUse.push(credit);
    totalApplied += credit.amount;
  }

  // Validate total doesn't exceed bill
  if (totalApplied > billAmount) {
    return {
      valid: false,
      error: 'CREDITS_EXCEED_BILL',
      message: `Selected credits (Rs. ${totalApplied}) exceed bill amount (Rs. ${billAmount})`
    };
  }

  const newBillAmount = billAmount - totalApplied;
  const totalRemaining = availableCredits.reduce((sum, c) => sum + c.amount, 0) - totalApplied;

  return {
    valid: true,
    creditsToApply: totalApplied,
    creditsUsed: creditsToUse,
    newBillAmount,
    creditsRemaining: totalRemaining,
    fullyPaid: newBillAmount === 0
  };
};

/**
 * Validates custom amount input
 * @param {string|number} inputAmount - Input amount value
 * @param {number} availableTotal - Total available credits
 * @param {number} billAmount - Bill amount
 * @returns {Object} Validation result
 */
export const validateCustomAmountInput = (inputAmount, availableTotal, billAmount) => {
  // Type and format validation
  if (inputAmount === null || inputAmount === undefined || inputAmount === '') {
    return { valid: false, error: 'EMPTY_INPUT', message: 'Please enter an amount' };
  }

  const parsedAmount = typeof inputAmount === 'string' ? parseFloat(inputAmount) : inputAmount;

  if (isNaN(parsedAmount)) {
    return { valid: false, error: 'NON_NUMERIC', message: 'Amount must be a number' };
  }

  // Range validation
  if (parsedAmount < 0) {
    return { valid: false, error: 'NEGATIVE_AMOUNT', message: 'Amount cannot be negative' };
  }

  if (parsedAmount === 0) {
    return { valid: false, error: 'ZERO_AMOUNT', message: 'Please enter a valid amount' };
  }

  if (parsedAmount > availableTotal) {
    return {
      valid: false,
      error: 'INSUFFICIENT_CREDITS',
      message: `You only have Rs. ${availableTotal} available`
    };
  }

  if (parsedAmount > billAmount) {
    return {
      valid: false,
      error: 'EXCEEDS_BILL',
      message: `Amount cannot exceed bill (Rs. ${billAmount})`
    };
  }

  // Precision validation (allow 2 decimal places)
  const decimalPlaces = (parsedAmount.toString().split('.')[1] || '').length;
  if (decimalPlaces > 2) {
    return {
      valid: false,
      error: 'INVALID_PRECISION',
      message: 'Amount can have maximum 2 decimal places'
    };
  }

  return { valid: true, amount: parsedAmount };
};

/**
 * Validates a bill for credit application
 * @param {Object} bill - Bill object
 * @returns {Object} Validation result
 */
export const validateBillForCreditApplication = (bill) => {
  if (!bill || typeof bill !== 'object') {
    return { valid: false, error: 'INVALID_BILL', message: 'Invalid bill object' };
  }

  if (!bill.id || typeof bill.id !== 'string') {
    return { valid: false, error: 'INVALID_BILL_ID', message: 'Invalid bill ID' };
  }

  if (typeof bill.amount !== 'number' || bill.amount <= 0) {
    return { valid: false, error: 'INVALID_AMOUNT', message: 'Invalid bill amount' };
  }

  if (bill.status !== 'unpaid') {
    return { valid: false, error: 'BILL_NOT_UNPAID', message: 'Bill is already paid' };
  }

  // Check if heavily overdue (warning, not error)
  if (bill.dueDate && bill.daysOverdue > 30) {
    return {
      valid: true,
      warning: 'HEAVILY_OVERDUE',
      message: `Bill is ${bill.daysOverdue} days overdue`,
      data: bill
    };
  }

  return { valid: true, data: bill };
};
