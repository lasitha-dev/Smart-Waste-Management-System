/**
 * Error Handling Utilities
 * Comprehensive error handling system for the Smart Waste Management System
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module ErrorHandling
 */

import { Alert } from 'react-native';

/**
 * Error types and codes used throughout the application
 */
export const ErrorTypes = {
  // Network and API errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // Authentication and authorization
  AUTH_ERROR: 'AUTH_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  
  // Business logic errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  BUSINESS_RULE_ERROR: 'BUSINESS_RULE_ERROR',
  
  // Resource errors
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_UNAVAILABLE: 'RESOURCE_UNAVAILABLE',
  
  // System errors
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

/**
 * Error severity levels
 */
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  constructor(message, code = ErrorTypes.UNKNOWN_ERROR, severity = ErrorSeverity.MEDIUM, details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.severity = severity;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Error handling utilities
 */
export class ErrorHandler {
  /**
   * Handles and displays errors to the user
   * @param {Error|AppError} error - The error to handle
   * @param {Object} options - Options for error handling
   */
  static handleError(error, options = {}) {
    const {
      showAlert = true,
      logError = true,
      fallbackMessage = 'An unexpected error occurred',
      onRetry = null,
      onCancel = null
    } = options;

    // Log error for debugging
    if (logError) {
      ErrorHandler.logError(error);
    }

    // Determine user-friendly message
    const userMessage = ErrorHandler.getUserFriendlyMessage(error, fallbackMessage);
    
    // Show alert to user if requested
    if (showAlert) {
      ErrorHandler.showErrorAlert(userMessage, error, onRetry, onCancel);
    }

    return userMessage;
  }

  /**
   * Gets user-friendly error message
   * @param {Error|AppError} error - The error
   * @param {string} fallbackMessage - Fallback message
   * @returns {string} User-friendly message
   */
  static getUserFriendlyMessage(error, fallbackMessage) {
    if (error instanceof AppError) {
      return error.message;
    }

    // Handle specific error patterns
    if (error.message) {
      const message = error.message.toLowerCase();
      
      if (message.includes('network') || message.includes('fetch')) {
        return 'Please check your internet connection and try again.';
      }
      
      if (message.includes('timeout')) {
        return 'The request timed out. Please try again.';
      }
      
      if (message.includes('unauthorized') || message.includes('forbidden')) {
        return 'You do not have permission to perform this action.';
      }
      
      if (message.includes('not found')) {
        return 'The requested resource could not be found.';
      }
    }

    return fallbackMessage;
  }

  /**
   * Shows error alert to user
   * @param {string} message - Error message
   * @param {Error} error - Original error
   * @param {Function} onRetry - Retry callback
   * @param {Function} onCancel - Cancel callback
   */
  static showErrorAlert(message, error, onRetry = null, onCancel = null) {
    const buttons = [];
    
    if (onCancel) {
      buttons.push({ text: 'Cancel', style: 'cancel', onPress: onCancel });
    }
    
    if (onRetry) {
      buttons.push({ text: 'Retry', onPress: onRetry });
    }
    
    if (buttons.length === 0) {
      buttons.push({ text: 'OK', style: 'default' });
    }

    Alert.alert(
      'Error',
      message,
      buttons,
      { cancelable: false }
    );
  }

  /**
   * Logs error for debugging and analytics
   * @param {Error|AppError} error - The error to log
   */
  static logError(error) {
    const errorInfo = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };

    if (error instanceof AppError) {
      errorInfo.code = error.code;
      errorInfo.severity = error.severity;
      errorInfo.details = error.details;
    }

    // In development, log to console
    if (__DEV__) {
      console.error('🚨 Application Error:', errorInfo);
    }

    // In production, send to error tracking service
    // Example: Sentry, Bugsnag, etc.
    // ErrorTrackingService.logError(errorInfo);
  }

  /**
   * Creates a retry wrapper for async operations
   * @param {Function} operation - The operation to retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} delay - Delay between retries in ms
   * @returns {Promise} Promise that resolves/rejects after retries
   */
  static async withRetry(operation, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw new AppError(
            `Operation failed after ${maxRetries} attempts: ${error.message}`,
            ErrorTypes.SYSTEM_ERROR,
            ErrorSeverity.HIGH,
            { originalError: error, attempts: maxRetries }
          );
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    throw lastError;
  }

  /**
   * Creates a timeout wrapper for async operations
   * @param {Promise} promise - The promise to wrap
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise} Promise that rejects on timeout
   */
  static withTimeout(promise, timeout = 10000) {
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(new AppError(
            'Operation timed out',
            ErrorTypes.TIMEOUT_ERROR,
            ErrorSeverity.MEDIUM,
            { timeout }
          ));
        }, timeout);
      })
    ]);
  }
}

/**
 * Specific error handlers for different scenarios
 */
export class SchedulingErrorHandler extends ErrorHandler {
  /**
   * Handles bin loading errors
   * @param {Error} error - The error
   * @param {Function} onRetry - Retry callback
   */
  static handleBinLoadError(error, onRetry) {
    let message = 'Failed to load your bins.';
    let showRetry = true;

    if (error.code === 'INACTIVE_ACCOUNT') {
      message = 'Your account is inactive. Please contact support to reactivate your account.';
      showRetry = false;
    } else if (error.code === 'NO_LINKED_BINS') {
      message = 'No bins are linked to your account. Please contact support to add bins.';
      showRetry = false;
    }

    Alert.alert(
      'Unable to Load Bins',
      message,
      [
        { text: 'Contact Support', onPress: () => SchedulingErrorHandler.showSupportOptions() },
        ...(showRetry ? [{ text: 'Retry', onPress: onRetry }] : []),
        { text: 'OK', style: 'cancel' }
      ]
    );
  }

  /**
   * Handles booking submission errors
   * @param {Error} error - The error
   * @param {Function} onRetry - Retry callback
   */
  static handleBookingError(error, onRetry) {
    let message = 'Failed to submit your booking.';
    let actions = [];

    switch (error.code) {
      case 'SLOT_UNAVAILABLE':
        message = 'The selected time slot is no longer available. Please select a different time.';
        actions = [
          { text: 'Select Different Time', onPress: () => {} }, // Navigate back
          { text: 'OK', style: 'cancel' }
        ];
        break;
        
      case 'VALIDATION_ERROR':
        message = `Please check your booking details:\n${error.details?.join('\n') || error.message}`;
        actions = [
          { text: 'Fix Details', onPress: () => {} }, // Navigate back
          { text: 'OK', style: 'cancel' }
        ];
        break;
        
      case 'PAYMENT_ERROR':
        message = 'Payment could not be processed. Please check your payment method.';
        actions = [
          { text: 'Update Payment', onPress: () => {} },
          { text: 'Retry', onPress: onRetry },
          { text: 'Cancel', style: 'cancel' }
        ];
        break;
        
      default:
        actions = [
          { text: 'Retry', onPress: onRetry },
          { text: 'Cancel', style: 'cancel' }
        ];
    }

    Alert.alert('Booking Failed', message, actions);
  }

  /**
   * Handles feedback submission errors
   * @param {Error} error - The error
   * @param {Function} onRetry - Retry callback
   */
  static handleFeedbackError(error, onRetry) {
    let message = 'Failed to submit your feedback.';
    let actions = [];

    switch (error.code) {
      case 'BOOKING_NOT_FOUND':
        message = 'The booking information could not be found. This may be a system error.';
        actions = [
          { text: 'Contact Support', onPress: () => SchedulingErrorHandler.showSupportOptions() },
          { text: 'OK', style: 'cancel' }
        ];
        break;
        
      case 'FEEDBACK_EXISTS':
        message = 'You have already provided feedback for this collection. Thank you!';
        actions = [{ text: 'OK', style: 'default' }];
        break;
        
      case 'INVALID_BOOKING_STATUS':
        message = 'Feedback can only be provided after the waste collection has been completed.';
        actions = [{ text: 'OK', style: 'default' }];
        break;
        
      default:
        actions = [
          { text: 'Retry', onPress: onRetry },
          { text: 'Skip Feedback', style: 'cancel' }
        ];
    }

    Alert.alert('Feedback Error', message, actions);
  }

  /**
   * Shows support contact options
   */
  static showSupportOptions() {
    Alert.alert(
      'Contact Support',
      'Phone: +94 11 123 4567\nEmail: support@wastemanagement.lk\nWebsite: www.wastemanagement.lk\n\nHow would you like to contact us?',
      [
        { text: 'Call Now', onPress: () => console.log('📞 Calling support...') },
        { text: 'Send Email', onPress: () => console.log('📧 Opening email...') },
        { text: 'Visit Website', onPress: () => console.log('🌐 Opening website...') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  }
}

/**
 * Network error handler
 */
export class NetworkErrorHandler extends ErrorHandler {
  /**
   * Handles network connectivity issues
   * @param {Error} error - Network error
   * @param {Function} onRetry - Retry callback
   */
  static handleNetworkError(error, onRetry) {
    Alert.alert(
      'Connection Problem',
      'Unable to connect to our servers. Please check your internet connection and try again.',
      [
        { text: 'Retry', onPress: onRetry },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  }

  /**
   * Handles API timeout errors
   * @param {Error} error - Timeout error
   * @param {Function} onRetry - Retry callback
   */
  static handleTimeoutError(error, onRetry) {
    Alert.alert(
      'Request Timeout',
      'The request is taking longer than expected. This might be due to poor network conditions.',
      [
        { text: 'Retry', onPress: onRetry },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  }
}

/**
 * Validation error handler
 */
export class ValidationErrorHandler extends ErrorHandler {
  /**
   * Handles form validation errors
   * @param {Object} validationErrors - Object containing field errors
   * @param {string} title - Alert title
   */
  static handleValidationErrors(validationErrors, title = 'Please Fix These Issues') {
    const errorMessages = Object.values(validationErrors).flat();
    
    Alert.alert(
      title,
      errorMessages.join('\n'),
      [{ text: 'OK', style: 'default' }]
    );
  }

  /**
   * Handles single field validation error
   * @param {string} field - Field name
   * @param {string} error - Error message
   */
  static handleFieldError(field, error) {
    Alert.alert(
      'Invalid Input',
      `${field}: ${error}`,
      [{ text: 'OK', style: 'default' }]
    );
  }
}

/**
 * Business rule error handler
 */
export class BusinessRuleErrorHandler extends ErrorHandler {
  /**
   * Handles bin selection limit errors
   * @param {number} maxBins - Maximum allowed bins
   */
  static handleBinLimitError(maxBins) {
    Alert.alert(
      'Selection Limit Reached',
      `You can select a maximum of ${maxBins} bins per booking. Please deselect some bins to continue.`,
      [{ text: 'OK', style: 'default' }]
    );
  }

  /**
   * Handles scheduling time constraints
   * @param {number} minHours - Minimum hours in advance
   */
  static handleSchedulingConstraintError(minHours) {
    Alert.alert(
      'Scheduling Constraint',
      `Collections must be scheduled at least ${minHours} hours in advance. Please select a later date and time.`,
      [{ text: 'OK', style: 'default' }]
    );
  }

  /**
   * Handles automatic pickup requirements
   * @param {Array} urgentBins - Bins requiring urgent pickup
   */
  static handleUrgentPickupError(urgentBins) {
    const binList = urgentBins.map(bin => `• ${bin.type} (${bin.location})`).join('\n');
    
    Alert.alert(
      'Urgent Pickup Required',
      `The following bins are nearly full and require immediate pickup:\n\n${binList}\n\nThese bins have been automatically selected and cannot be deselected.`,
      [{ text: 'Understood', style: 'default' }]
    );
  }
}

/**
 * Recovery strategies for different error types
 */
export class ErrorRecovery {
  /**
   * Attempts to recover from network errors
   * @param {Function} operation - The failed operation
   * @param {number} maxAttempts - Maximum recovery attempts
   */
  static async recoverFromNetworkError(operation, maxAttempts = 3) {
    return ErrorHandler.withRetry(operation, maxAttempts, 2000);
  }

  /**
   * Attempts to recover from timeout errors
   * @param {Function} operation - The failed operation
   * @param {number} timeout - Increased timeout value
   */
  static async recoverFromTimeout(operation, timeout = 20000) {
    return ErrorHandler.withTimeout(operation(), timeout);
  }

  /**
   * Provides fallback data when primary data source fails
   * @param {Function} primaryOperation - Primary data source
   * @param {Function} fallbackOperation - Fallback data source
   */
  static async withFallback(primaryOperation, fallbackOperation) {
    try {
      return await primaryOperation();
    } catch (error) {
      console.warn('Primary operation failed, using fallback:', error.message);
      return await fallbackOperation();
    }
  }
}
