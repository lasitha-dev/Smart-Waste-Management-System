/**
 * Advanced Validation System
 * Comprehensive validation rules and handlers for all app inputs
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module AdvancedValidation
 */

import { Alert } from 'react-native';
import { DateUtils } from './schedulingHelpers';
import { AppError, ErrorTypes, ErrorSeverity, ValidationErrorHandler } from './errorHandling';

/**
 * Validation rule types
 */
export const ValidationRules = {
  REQUIRED: 'required',
  MIN_LENGTH: 'minLength',
  MAX_LENGTH: 'maxLength',
  EMAIL: 'email',
  PHONE: 'phone',
  DATE: 'date',
  FUTURE_DATE: 'futureDate',
  RATING: 'rating',
  POSITIVE_NUMBER: 'positiveNumber',
  ARRAY_MIN_LENGTH: 'arrayMinLength',
  ARRAY_MAX_LENGTH: 'arrayMaxLength',
  CUSTOM: 'custom'
};

/**
 * Validation error messages
 */
const ValidationMessages = {
  [ValidationRules.REQUIRED]: (field) => `${field} is required`,
  [ValidationRules.MIN_LENGTH]: (field, min) => `${field} must be at least ${min} characters`,
  [ValidationRules.MAX_LENGTH]: (field, max) => `${field} must not exceed ${max} characters`,
  [ValidationRules.EMAIL]: (field) => `${field} must be a valid email address`,
  [ValidationRules.PHONE]: (field) => `${field} must be a valid phone number`,
  [ValidationRules.DATE]: (field) => `${field} must be a valid date`,
  [ValidationRules.FUTURE_DATE]: (field) => `${field} must be a future date`,
  [ValidationRules.RATING]: (field) => `${field} must be between 1 and 5`,
  [ValidationRules.POSITIVE_NUMBER]: (field) => `${field} must be a positive number`,
  [ValidationRules.ARRAY_MIN_LENGTH]: (field, min) => `${field} must have at least ${min} items`,
  [ValidationRules.ARRAY_MAX_LENGTH]: (field, max) => `${field} must not have more than ${max} items`
};

/**
 * Individual validation functions
 */
const Validators = {
  [ValidationRules.REQUIRED]: (value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== null && value !== undefined && String(value).trim() !== '';
  },

  [ValidationRules.MIN_LENGTH]: (value, minLength) => {
    return String(value).length >= minLength;
  },

  [ValidationRules.MAX_LENGTH]: (value, maxLength) => {
    return String(value).length <= maxLength;
  },

  [ValidationRules.EMAIL]: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(value));
  },

  [ValidationRules.PHONE]: (value) => {
    // Sri Lankan phone number format
    const phoneRegex = /^(\+94|0)?[1-9][0-9]{8}$/;
    return phoneRegex.test(String(value).replace(/\s/g, ''));
  },

  [ValidationRules.DATE]: (value) => {
    const date = new Date(value);
    return date instanceof Date && !isNaN(date);
  },

  [ValidationRules.FUTURE_DATE]: (value) => {
    const date = new Date(value);
    const now = new Date();
    return date > now;
  },

  [ValidationRules.RATING]: (value) => {
    const num = Number(value);
    return !isNaN(num) && num >= 1 && num <= 5;
  },

  [ValidationRules.POSITIVE_NUMBER]: (value) => {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  },

  [ValidationRules.ARRAY_MIN_LENGTH]: (value, minLength) => {
    return Array.isArray(value) && value.length >= minLength;
  },

  [ValidationRules.ARRAY_MAX_LENGTH]: (value, maxLength) => {
    return Array.isArray(value) && value.length <= maxLength;
  }
};

/**
 * Main validation class
 */
export class AdvancedValidator {
  /**
   * Validates a single field
   * @param {any} value - Value to validate
   * @param {Array} rules - Array of validation rules
   * @param {string} fieldName - Name of the field for error messages
   * @returns {Object} Validation result
   */
  static validateField(value, rules, fieldName) {
    const errors = [];

    for (const rule of rules) {
      const { type, params = [], message } = typeof rule === 'string' ? { type: rule } : rule;
      
      const validator = Validators[type];
      if (!validator) {
        console.warn(`Unknown validation rule: ${type}`);
        continue;
      }

      if (!validator(value, ...params)) {
        const errorMessage = message || ValidationMessages[type](fieldName, ...params);
        errors.push(errorMessage);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates multiple fields
   * @param {Object} data - Data object to validate
   * @param {Object} schema - Validation schema
   * @returns {Object} Validation result
   */
  static validateObject(data, schema) {
    const errors = {};
    let isValid = true;

    for (const [fieldName, rules] of Object.entries(schema)) {
      const fieldValue = data[fieldName];
      const fieldResult = AdvancedValidator.validateField(fieldValue, rules, fieldName);
      
      if (!fieldResult.isValid) {
        errors[fieldName] = fieldResult.errors;
        isValid = false;
      }
    }

    return {
      isValid,
      errors,
      errorCount: Object.keys(errors).length
    };
  }

  /**
   * Validates with custom error handling
   * @param {Object} data - Data to validate
   * @param {Object} schema - Validation schema
   * @param {Object} options - Validation options
   * @returns {Promise<boolean>} Whether validation passed
   */
  static async validateWithErrorHandling(data, schema, options = {}) {
    const {
      showAlert = true,
      throwOnError = false,
      alertTitle = 'Validation Error'
    } = options;

    const result = AdvancedValidator.validateObject(data, schema);

    if (!result.isValid) {
      if (showAlert) {
        ValidationErrorHandler.handleValidationErrors(result.errors, alertTitle);
      }

      if (throwOnError) {
        throw new AppError(
          'Validation failed',
          ErrorTypes.VALIDATION_ERROR,
          ErrorSeverity.LOW,
          { validationErrors: result.errors }
        );
      }
    }

    return result.isValid;
  }
}

/**
 * Predefined validation schemas for common forms
 */
export const ValidationSchemas = {
  /**
   * Booking validation schema
   */
  booking: {
    residentId: [ValidationRules.REQUIRED],
    binIds: [
      ValidationRules.REQUIRED,
      { type: ValidationRules.ARRAY_MIN_LENGTH, params: [1] },
      { type: ValidationRules.ARRAY_MAX_LENGTH, params: [5] }
    ],
    wasteType: [ValidationRules.REQUIRED],
    scheduledDate: [
      ValidationRules.REQUIRED,
      ValidationRules.DATE,
      {
        type: ValidationRules.CUSTOM,
        params: [(date) => {
          const validation = DateUtils.validateScheduleDate(date);
          return validation.isValid;
        }],
        message: 'Selected date is not available for scheduling'
      }
    ],
    timeSlot: [ValidationRules.REQUIRED],
    totalFee: [ValidationRules.REQUIRED, ValidationRules.POSITIVE_NUMBER]
  },

  /**
   * Feedback validation schema
   */
  feedback: {
    bookingId: [ValidationRules.REQUIRED],
    rating: [ValidationRules.REQUIRED, ValidationRules.RATING],
    comment: [
      { type: ValidationRules.MAX_LENGTH, params: [500] }
    ]
  },

  /**
   * Contact form validation schema
   */
  contact: {
    name: [
      ValidationRules.REQUIRED,
      { type: ValidationRules.MIN_LENGTH, params: [2] },
      { type: ValidationRules.MAX_LENGTH, params: [50] }
    ],
    email: [ValidationRules.REQUIRED, ValidationRules.EMAIL],
    phone: [ValidationRules.PHONE],
    message: [
      ValidationRules.REQUIRED,
      { type: ValidationRules.MIN_LENGTH, params: [10] },
      { type: ValidationRules.MAX_LENGTH, params: [1000] }
    ]
  },

  /**
   * Profile update validation schema
   */
  profile: {
    name: [
      ValidationRules.REQUIRED,
      { type: ValidationRules.MIN_LENGTH, params: [2] },
      { type: ValidationRules.MAX_LENGTH, params: [100] }
    ],
    email: [ValidationRules.REQUIRED, ValidationRules.EMAIL],
    phone: [ValidationRules.REQUIRED, ValidationRules.PHONE],
    address: [
      ValidationRules.REQUIRED,
      { type: ValidationRules.MIN_LENGTH, params: [10] },
      { type: ValidationRules.MAX_LENGTH, params: [200] }
    ]
  }
};

/**
 * Real-time validation for form fields
 */
export class RealTimeValidator {
  constructor(schema) {
    this.schema = schema;
    this.errors = {};
    this.listeners = [];
  }

  /**
   * Validates a field in real-time
   * @param {string} fieldName - Field name
   * @param {any} value - Field value
   */
  validateField(fieldName, value) {
    const rules = this.schema[fieldName];
    if (!rules) return;

    const result = AdvancedValidator.validateField(value, rules, fieldName);
    
    if (result.isValid) {
      delete this.errors[fieldName];
    } else {
      this.errors[fieldName] = result.errors;
    }

    // Notify listeners
    this.listeners.forEach(listener => {
      listener(fieldName, result, this.errors);
    });
  }

  /**
   * Adds validation listener
   * @param {Function} listener - Validation listener
   */
  addListener(listener) {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Gets current validation state
   */
  getValidationState() {
    return {
      isValid: Object.keys(this.errors).length === 0,
      errors: { ...this.errors },
      hasErrors: Object.keys(this.errors).length > 0
    };
  }

  /**
   * Clears all errors
   */
  clearErrors() {
    this.errors = {};
    this.listeners.forEach(listener => {
      listener(null, { isValid: true, errors: [] }, this.errors);
    });
  }
}

/**
 * Specialized validators for specific use cases
 */
export class SpecializedValidators {
  /**
   * Validates bin selection for booking
   * @param {Array} selectedBins - Selected bins
   * @param {Array} allBins - All available bins
   * @returns {Object} Validation result
   */
  static validateBinSelection(selectedBins, allBins) {
    const errors = [];

    if (!selectedBins || selectedBins.length === 0) {
      errors.push('At least one bin must be selected');
    }

    if (selectedBins && selectedBins.length > 5) {
      errors.push('Maximum 5 bins can be selected per booking');
    }

    // Check if all selected bins are valid and active
    if (selectedBins && allBins) {
      const invalidBins = selectedBins.filter(binId => {
        const bin = allBins.find(b => b.id === binId);
        return !bin || bin.status !== 'Active';
      });

      if (invalidBins.length > 0) {
        errors.push('Some selected bins are no longer available');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates scheduling constraints
   * @param {string} date - Selected date
   * @param {string} timeSlot - Selected time slot
   * @returns {Object} Validation result
   */
  static validateSchedulingConstraints(date, timeSlot) {
    const errors = [];

    // Validate date
    const dateValidation = DateUtils.validateScheduleDate(date);
    if (!dateValidation.isValid) {
      errors.push(dateValidation.reason);
    }

    // Validate time slot
    if (!timeSlot) {
      errors.push('Time slot must be selected');
    }

    // Check for conflicting schedules (mock implementation)
    const dayOfWeek = new Date(date).getDay();
    if (dayOfWeek === 0 && timeSlot === 'morning') {
      errors.push('Morning slots are not available on Sundays');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates fee calculation inputs
   * @param {Object} feeInputs - Fee calculation inputs
   * @returns {Object} Validation result
   */
  static validateFeeInputs(feeInputs) {
    const errors = [];
    const { wasteType, binCount, estimatedWeight, billingModel } = feeInputs;

    if (!wasteType) {
      errors.push('Waste type is required for fee calculation');
    }

    if (!binCount || binCount < 1) {
      errors.push('At least one bin must be selected');
    }

    if (binCount > 5) {
      errors.push('Maximum 5 bins allowed per booking');
    }

    if (billingModel === 'weightBased' && (!estimatedWeight || estimatedWeight < 0)) {
      errors.push('Valid weight estimate is required for weight-based billing');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Form validation helper hook (for React components)
 */
export class FormValidationHelper {
  constructor(schema, options = {}) {
    this.validator = new RealTimeValidator(schema);
    this.options = {
      validateOnChange: true,
      validateOnBlur: true,
      showErrorsImmediately: false,
      ...options
    };
    this.touched = {};
  }

  /**
   * Handles field change
   * @param {string} fieldName - Field name
   * @param {any} value - New value
   */
  handleFieldChange = (fieldName, value) => {
    if (this.options.validateOnChange) {
      this.validator.validateField(fieldName, value);
    }
  };

  /**
   * Handles field blur
   * @param {string} fieldName - Field name
   */
  handleFieldBlur = (fieldName) => {
    this.touched[fieldName] = true;
    
    if (this.options.validateOnBlur) {
      // Re-validate the field if it has a value
      const currentErrors = this.validator.errors[fieldName];
      if (currentErrors) {
        // Field already has errors, keep them visible
      }
    }
  };

  /**
   * Gets field error (only if touched or showErrorsImmediately is true)
   * @param {string} fieldName - Field name
   * @returns {Array|null} Field errors
   */
  getFieldError = (fieldName) => {
    const shouldShowError = this.options.showErrorsImmediately || this.touched[fieldName];
    return shouldShowError ? this.validator.errors[fieldName] : null;
  };

  /**
   * Validates entire form
   * @param {Object} data - Form data
   * @returns {boolean} Whether form is valid
   */
  validateForm = (data) => {
    const result = AdvancedValidator.validateObject(data, this.validator.schema);
    
    // Mark all fields as touched
    Object.keys(this.validator.schema).forEach(field => {
      this.touched[field] = true;
    });

    // Update validator errors
    this.validator.errors = result.errors;

    return result.isValid;
  };

  /**
   * Resets form validation state
   */
  reset = () => {
    this.validator.clearErrors();
    this.touched = {};
  };
}
