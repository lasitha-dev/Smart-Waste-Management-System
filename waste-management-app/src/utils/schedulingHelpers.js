/**
 * Scheduling Helper Utilities
 * Contains utility functions for date validation, fee calculations, and other scheduling operations
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module SchedulingHelpers
 */

import { billingModels, systemConfig, unavailableDates } from '../api/mockData';

/**
 * Date validation and manipulation utilities
 */
export const DateUtils = {
  /**
   * Validates if a date is available for scheduling
   * @param {Date|string} date - The date to validate
   * @returns {Object} Validation result with isValid and reason
   */
  validateScheduleDate: (date) => {
    const targetDate = new Date(date);
    const today = new Date();
    const maxAdvanceDate = new Date();
    
    // Reset time to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    maxAdvanceDate.setDate(today.getDate() + systemConfig.maxAdvanceBookingDays);

    // Check if date is in the past
    if (targetDate < today) {
      return {
        isValid: false,
        reason: 'Cannot schedule collection for past dates'
      };
    }

    // Check minimum advance booking time
    const minAdvanceDate = new Date();
    minAdvanceDate.setHours(minAdvanceDate.getHours() + systemConfig.minAdvanceBookingHours);
    
    if (targetDate < minAdvanceDate) {
      return {
        isValid: false,
        reason: `Must schedule at least ${systemConfig.minAdvanceBookingHours} hours in advance`
      };
    }

    // Check maximum advance booking limit
    if (targetDate > maxAdvanceDate) {
      return {
        isValid: false,
        reason: `Cannot schedule more than ${systemConfig.maxAdvanceBookingDays} days in advance`
      };
    }

    // Check if date is weekend (assuming weekends are unavailable)
    const dayOfWeek = targetDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return {
        isValid: false,
        reason: 'Collection not available on weekends'
      };
    }

    // Check against unavailable dates list
    const dateString = DateUtils.formatDate(targetDate);
    if (unavailableDates.includes(dateString)) {
      return {
        isValid: false,
        reason: 'Collection not available on this date'
      };
    }

    return {
      isValid: true,
      reason: null
    };
  },

  /**
   * Formats date to YYYY-MM-DD string
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  formatDate: (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  },

  /**
   * Formats date for display (DD/MM/YYYY)
   * @param {Date|string} date - Date to format
   * @returns {string} Formatted date string
   */
  formatDisplayDate: (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-GB');
  },

  /**
   * Gets available dates for the next 30 days
   * @returns {Array} Array of available date objects
   */
  getAvailableDates: () => {
    const availableDates = [];
    const today = new Date();
    
    for (let i = 1; i <= systemConfig.maxAdvanceBookingDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const validation = DateUtils.validateScheduleDate(date);
      if (validation.isValid) {
        availableDates.push({
          date: DateUtils.formatDate(date),
          displayDate: DateUtils.formatDisplayDate(date),
          dayName: date.toLocaleDateString('en-US', { weekday: 'long' })
        });
      }
    }
    
    return availableDates;
  }
};

/**
 * Fee calculation utilities
 */
export const FeeCalculator = {
  /**
   * Calculates total fee based on billing model, waste type, and bin count
   * @param {string} billingModel - The billing model ('flat', 'weightBased', 'hybrid')
   * @param {string} wasteType - Type of waste
   * @param {number} binCount - Number of bins
   * @param {number} estimatedWeight - Estimated weight in kg (optional)
   * @returns {Object} Fee breakdown object
   */
  calculateTotalFee: (billingModel = 'hybrid', wasteType, binCount, estimatedWeight = 0) => {
    const model = billingModels[billingModel];
    const wasteTypeData = getWasteTypeData(wasteType);
    
    if (!model || !wasteTypeData) {
      throw new Error('Invalid billing model or waste type');
    }

    let breakdown = {
      baseFee: 0,
      binFee: 0,
      weightFee: 0,
      wasteTypeFee: 0,
      subtotal: 0,
      tax: 0,
      total: 0,
      model: billingModel
    };

    switch (billingModel) {
      case 'flat':
        breakdown = FeeCalculator.calculateFlatFee(model, wasteTypeData, binCount);
        break;
      case 'weightBased':
        breakdown = FeeCalculator.calculateWeightBasedFee(model, wasteTypeData, estimatedWeight);
        break;
      case 'hybrid':
        breakdown = FeeCalculator.calculateHybridFee(model, wasteTypeData, binCount, estimatedWeight);
        break;
      default:
        throw new Error('Unsupported billing model');
    }

    // Add tax (assuming 18% VAT)
    breakdown.tax = Math.round(breakdown.subtotal * 0.18);
    breakdown.total = breakdown.subtotal + breakdown.tax;

    return breakdown;
  },

  /**
   * Calculates fee using flat rate model
   * @param {Object} model - Billing model configuration
   * @param {Object} wasteTypeData - Waste type data
   * @param {number} binCount - Number of bins
   * @returns {Object} Fee breakdown
   */
  calculateFlatFee: (model, wasteTypeData, binCount) => {
    const baseFee = wasteTypeData.baseFee;
    const binFee = (binCount - 1) * model.perBinCharge; // First bin included in base fee
    const subtotal = baseFee + binFee;

    return {
      baseFee,
      binFee,
      weightFee: 0,
      wasteTypeFee: 0,
      subtotal,
      tax: 0,
      total: 0,
      model: 'flat'
    };
  },

  /**
   * Calculates fee using weight-based model
   * @param {Object} model - Billing model configuration
   * @param {Object} wasteTypeData - Waste type data
   * @param {number} weight - Weight in kg
   * @returns {Object} Fee breakdown
   */
  calculateWeightBasedFee: (model, wasteTypeData, weight) => {
    const baseFee = model.baseRate;
    const weightFee = weight * model.perKgRate * wasteTypeData.weightMultiplier;
    const subtotal = Math.max(baseFee + weightFee, model.minimumCharge);

    return {
      baseFee,
      binFee: 0,
      weightFee,
      wasteTypeFee: 0,
      subtotal,
      tax: 0,
      total: 0,
      model: 'weightBased'
    };
  },

  /**
   * Calculates fee using hybrid model
   * @param {Object} model - Billing model configuration
   * @param {Object} wasteTypeData - Waste type data
   * @param {number} binCount - Number of bins
   * @param {number} weight - Weight in kg
   * @returns {Object} Fee breakdown
   */
  calculateHybridFee: (model, wasteTypeData, binCount, weight) => {
    const baseFee = model.baseRate;
    const binFee = (binCount - 1) * model.perBinCharge;
    
    // Apply weight-based pricing if weight exceeds threshold
    const weightFee = weight > model.weightThreshold 
      ? (weight - model.weightThreshold) * model.perKgRate * wasteTypeData.weightMultiplier
      : 0;
    
    const subtotal = baseFee + binFee + weightFee;

    return {
      baseFee,
      binFee,
      weightFee,
      wasteTypeFee: 0,
      subtotal,
      tax: 0,
      total: 0,
      model: 'hybrid'
    };
  }
};

/**
 * Validation utilities
 */
export const ValidationUtils = {
  /**
   * Validates booking data before submission
   * @param {Object} bookingData - Booking data to validate
   * @returns {Object} Validation result
   */
  validateBookingData: (bookingData) => {
    const errors = [];

    // Check required fields
    if (!bookingData.residentId) {
      errors.push('Resident ID is required');
    }

    if (!bookingData.binIds || bookingData.binIds.length === 0) {
      errors.push('At least one bin must be selected');
    }

    if (bookingData.binIds && bookingData.binIds.length > systemConfig.maxBinsPerBooking) {
      errors.push(`Maximum ${systemConfig.maxBinsPerBooking} bins allowed per booking`);
    }

    if (!bookingData.wasteType) {
      errors.push('Waste type is required');
    }

    if (!bookingData.scheduledDate) {
      errors.push('Scheduled date is required');
    }

    if (!bookingData.timeSlot) {
      errors.push('Time slot is required');
    }

    // Validate date if provided
    if (bookingData.scheduledDate) {
      const dateValidation = DateUtils.validateScheduleDate(bookingData.scheduledDate);
      if (!dateValidation.isValid) {
        errors.push(dateValidation.reason);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validates feedback data
   * @param {Object} feedbackData - Feedback data to validate
   * @returns {Object} Validation result
   */
  validateFeedbackData: (feedbackData) => {
    const errors = [];

    if (!feedbackData.bookingId) {
      errors.push('Booking ID is required');
    }

    if (!feedbackData.rating || feedbackData.rating < 1 || feedbackData.rating > 5) {
      errors.push('Rating must be between 1 and 5');
    }

    if (feedbackData.comment && feedbackData.comment.length > 500) {
      errors.push('Comment must be less than 500 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

/**
 * Utility functions
 */

/**
 * Gets waste type data by ID
 * @param {string} wasteTypeId - Waste type ID
 * @returns {Object|null} Waste type data
 */
const getWasteTypeData = (wasteTypeId) => {
  // Import here to avoid circular dependency
  const { wasteTypes } = require('../api/mockData');
  return wasteTypes.find(type => type.id === wasteTypeId) || null;
};

/**
 * Generates unique booking ID
 * @returns {string} Unique booking ID
 */
export const generateBookingId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `BOOK${timestamp}${random}`;
};

/**
 * Generates unique feedback ID
 * @returns {string} Unique feedback ID
 */
export const generateFeedbackId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `FB${timestamp}${random}`;
};

/**
 * Formats currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: LKR)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'LKR') => {
  return `${currency} ${amount.toLocaleString()}`;
};

/**
 * Calculates estimated weight based on bin type and fill level
 * @param {Object} bin - Bin data
 * @returns {number} Estimated weight in kg
 */
export const estimateBinWeight = (bin) => {
  // Simple estimation based on bin type and capacity
  const densityFactors = {
    'General Waste': 0.3, // kg per liter
    'Recyclable': 0.1,
    'Organic': 0.5,
    'Bulky Items': 0.2
  };

  const density = densityFactors[bin.type] || 0.3;
  const fillVolume = (bin.currentFillLevel / 100) * bin.capacity;
  return Math.round(fillVolume * density * 100) / 100; // Round to 2 decimal places
};

/**
 * Checks if a bin needs automatic pickup based on fill level
 * @param {Object} bin - Bin data
 * @returns {boolean} True if automatic pickup is needed
 */
export const needsAutoPickup = (bin) => {
  return bin.isSmartBin && 
         bin.sensorEnabled && 
         bin.autoPickupThreshold && 
         bin.currentFillLevel >= bin.autoPickupThreshold;
};

/**
 * Gets next available date for scheduling
 * @returns {string} Next available date in YYYY-MM-DD format
 */
export const getNextAvailableDate = () => {
  const availableDates = DateUtils.getAvailableDates();
  return availableDates.length > 0 ? availableDates[0].date : null;
};
