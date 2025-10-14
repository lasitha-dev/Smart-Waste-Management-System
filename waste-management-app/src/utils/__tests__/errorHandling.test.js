/**
 * Comprehensive Unit Tests for Error Handling Utilities
 * Tests for all error handling classes and functions with >80% coverage target
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module ErrorHandlingTests
 */

import {
  ErrorTypes,
  ErrorSeverity,
  AppError,
  ErrorHandler,
  SchedulingErrorHandler,
  NetworkErrorHandler,
  ValidationErrorHandler,
  BusinessRuleErrorHandler,
  ErrorRecovery
} from '../errorHandling';

// Mock React Native Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn()
  }
}));

import { Alert } from 'react-native';

// Mock console methods to avoid cluttering test output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
  // Mock __DEV__ global
  global.__DEV__ = true;
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ErrorHandling', () => {

  describe('ErrorTypes', () => {
    test('should contain all expected error type constants', () => {
      expect(ErrorTypes.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(ErrorTypes.API_ERROR).toBe('API_ERROR');
      expect(ErrorTypes.TIMEOUT_ERROR).toBe('TIMEOUT_ERROR');
      expect(ErrorTypes.AUTH_ERROR).toBe('AUTH_ERROR');
      expect(ErrorTypes.PERMISSION_DENIED).toBe('PERMISSION_DENIED');
      expect(ErrorTypes.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ErrorTypes.BUSINESS_RULE_ERROR).toBe('BUSINESS_RULE_ERROR');
      expect(ErrorTypes.RESOURCE_NOT_FOUND).toBe('RESOURCE_NOT_FOUND');
      expect(ErrorTypes.RESOURCE_UNAVAILABLE).toBe('RESOURCE_UNAVAILABLE');
      expect(ErrorTypes.SYSTEM_ERROR).toBe('SYSTEM_ERROR');
      expect(ErrorTypes.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
    });
  });

  describe('ErrorSeverity', () => {
    test('should contain all expected severity levels', () => {
      expect(ErrorSeverity.LOW).toBe('low');
      expect(ErrorSeverity.MEDIUM).toBe('medium');
      expect(ErrorSeverity.HIGH).toBe('high');
      expect(ErrorSeverity.CRITICAL).toBe('critical');
    });
  });

  describe('AppError', () => {
    test('should create AppError with default values', () => {
      const error = new AppError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('AppError');
      expect(error.code).toBe(ErrorTypes.UNKNOWN_ERROR);
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.details).toBeNull();
      expect(error.timestamp).toBeDefined();
      expect(error instanceof Error).toBe(true);
    });

    test('should create AppError with custom values', () => {
      const details = { field: 'email', value: 'invalid' };
      const error = new AppError(
        'Validation failed',
        ErrorTypes.VALIDATION_ERROR,
        ErrorSeverity.LOW,
        details
      );
      
      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe(ErrorTypes.VALIDATION_ERROR);
      expect(error.severity).toBe(ErrorSeverity.LOW);
      expect(error.details).toEqual(details);
    });

    test('should have valid timestamp format', () => {
      const error = new AppError('Test');
      const timestamp = new Date(error.timestamp);
      
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });
  });

  describe('ErrorHandler', () => {
    describe('handleError', () => {
      test('should handle AppError with default options', () => {
        const error = new AppError('Test error', ErrorTypes.API_ERROR);
        const result = ErrorHandler.handleError(error);
        
        expect(result).toBe('Test error');
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Test error',
          [{ text: 'OK', style: 'default' }],
          { cancelable: false }
        );
      });

      test('should handle regular Error with default options', () => {
        const error = new Error('Network failed');
        const result = ErrorHandler.handleError(error);
        
        expect(result).toBe('Please check your internet connection and try again.');
        expect(Alert.alert).toHaveBeenCalled();
      });

      test('should handle error without showing alert', () => {
        const error = new AppError('Test error');
        const result = ErrorHandler.handleError(error, { showAlert: false });
        
        expect(result).toBe('Test error');
        expect(Alert.alert).not.toHaveBeenCalled();
      });

      test('should handle error without logging', () => {
        const error = new AppError('Test error');
        const result = ErrorHandler.handleError(error, { logError: false });
        
        expect(result).toBe('Test error');
        expect(console.error).not.toHaveBeenCalled();
      });

      test('should use fallback message for unknown error', () => {
        const error = new Error('Some unknown error');
        const fallbackMessage = 'Custom fallback message';
        const result = ErrorHandler.handleError(error, { fallbackMessage });
        
        expect(result).toBe(fallbackMessage);
      });

      test('should handle error with retry callback', () => {
        const error = new AppError('Test error');
        const onRetry = jest.fn();
        const onCancel = jest.fn();
        
        ErrorHandler.handleError(error, { onRetry, onCancel });
        
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Test error',
          expect.arrayContaining([
            { text: 'Cancel', style: 'cancel', onPress: onCancel },
            { text: 'Retry', onPress: onRetry }
          ]),
          { cancelable: false }
        );
      });

      test('should handle error with only retry callback', () => {
        const error = new AppError('Test error');
        const onRetry = jest.fn();
        
        ErrorHandler.handleError(error, { onRetry });
        
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Test error',
          [{ text: 'Retry', onPress: onRetry }],
          { cancelable: false }
        );
      });
    });

    describe('getUserFriendlyMessage', () => {
      test('should return AppError message directly', () => {
        const error = new AppError('Custom app error message');
        const result = ErrorHandler.getUserFriendlyMessage(error, 'Fallback');
        
        expect(result).toBe('Custom app error message');
      });

      test('should handle network error messages', () => {
        const error = new Error('Network request failed');
        const result = ErrorHandler.getUserFriendlyMessage(error, 'Fallback');
        
        expect(result).toBe('Please check your internet connection and try again.');
      });

      test('should handle fetch error messages', () => {
        const error = new Error('fetch failed');
        const result = ErrorHandler.getUserFriendlyMessage(error, 'Fallback');
        
        expect(result).toBe('Please check your internet connection and try again.');
      });

      test('should handle timeout error messages', () => {
        const error = new Error('Request timeout occurred');
        const result = ErrorHandler.getUserFriendlyMessage(error, 'Fallback');
        
        expect(result).toBe('The request timed out. Please try again.');
      });

      test('should handle unauthorized error messages', () => {
        const error = new Error('Unauthorized access');
        const result = ErrorHandler.getUserFriendlyMessage(error, 'Fallback');
        
        expect(result).toBe('You do not have permission to perform this action.');
      });

      test('should handle forbidden error messages', () => {
        const error = new Error('Forbidden operation');
        const result = ErrorHandler.getUserFriendlyMessage(error, 'Fallback');
        
        expect(result).toBe('You do not have permission to perform this action.');
      });

      test('should handle not found error messages', () => {
        const error = new Error('Resource not found');
        const result = ErrorHandler.getUserFriendlyMessage(error, 'Fallback');
        
        expect(result).toBe('The requested resource could not be found.');
      });

      test('should return fallback message for unknown errors', () => {
        const error = new Error('Some random error');
        const fallback = 'Custom fallback';
        const result = ErrorHandler.getUserFriendlyMessage(error, fallback);
        
        expect(result).toBe(fallback);
      });

      test('should handle error without message', () => {
        const error = {};
        const fallback = 'No message fallback';
        const result = ErrorHandler.getUserFriendlyMessage(error, fallback);
        
        expect(result).toBe(fallback);
      });
    });

    describe('showErrorAlert', () => {
      test('should show alert with only OK button by default', () => {
        ErrorHandler.showErrorAlert('Test message', new Error());
        
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Test message',
          [{ text: 'OK', style: 'default' }],
          { cancelable: false }
        );
      });

      test('should show alert with cancel button when onCancel provided', () => {
        const onCancel = jest.fn();
        ErrorHandler.showErrorAlert('Test message', new Error(), null, onCancel);
        
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Test message',
          [
            { text: 'Cancel', style: 'cancel', onPress: onCancel },
            { text: 'OK', style: 'default' }
          ],
          { cancelable: false }
        );
      });

      test('should show alert with retry button when onRetry provided', () => {
        const onRetry = jest.fn();
        ErrorHandler.showErrorAlert('Test message', new Error(), onRetry);
        
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Test message',
          [{ text: 'Retry', onPress: onRetry }],
          { cancelable: false }
        );
      });

      test('should show alert with both cancel and retry buttons', () => {
        const onRetry = jest.fn();
        const onCancel = jest.fn();
        ErrorHandler.showErrorAlert('Test message', new Error(), onRetry, onCancel);
        
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Test message',
          [
            { text: 'Cancel', style: 'cancel', onPress: onCancel },
            { text: 'Retry', onPress: onRetry }
          ],
          { cancelable: false }
        );
      });
    });

    describe('logError', () => {
      test('should log regular error in development', () => {
        const error = new Error('Test error');
        error.stack = 'Error stack trace';
        
        ErrorHandler.logError(error);
        
        expect(console.error).toHaveBeenCalledWith(
          '🚨 Application Error:',
          expect.objectContaining({
            message: 'Test error',
            name: 'Error',
            stack: 'Error stack trace',
            timestamp: expect.any(String)
          })
        );
      });

      test('should log AppError with additional properties', () => {
        const error = new AppError(
          'App error',
          ErrorTypes.API_ERROR,
          ErrorSeverity.HIGH,
          { details: 'test' }
        );
        
        ErrorHandler.logError(error);
        
        expect(console.error).toHaveBeenCalledWith(
          '🚨 Application Error:',
          expect.objectContaining({
            message: 'App error',
            name: 'AppError',
            code: ErrorTypes.API_ERROR,
            severity: ErrorSeverity.HIGH,
            details: { details: 'test' }
          })
        );
      });

      test('should not log in production', () => {
        global.__DEV__ = false;
        const error = new Error('Test error');
        
        ErrorHandler.logError(error);
        
        expect(console.error).not.toHaveBeenCalled();
        
        // Reset to development mode
        global.__DEV__ = true;
      });
    });

    describe('withRetry', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      test('should succeed on first attempt', async () => {
        const operation = jest.fn().mockResolvedValue('success');
        
        const promise = ErrorHandler.withRetry(operation, 3, 1000);
        const result = await promise;
        
        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(1);
      });

      test('should retry on failure and eventually succeed', async () => {
        const operation = jest.fn()
          .mockRejectedValueOnce(new Error('Attempt 1 failed'))
          .mockRejectedValueOnce(new Error('Attempt 2 failed'))
          .mockResolvedValue('success');
        
        const promise = ErrorHandler.withRetry(operation, 3, 1000);
        
        // Fast-forward timers for delays
        setTimeout(() => {
          jest.advanceTimersByTime(1000);
        }, 10);
        setTimeout(() => {
          jest.advanceTimersByTime(2000);
        }, 20);
        
        const result = await promise;
        
        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(3);
      });

      test('should throw AppError after max retries', async () => {
        const originalError = new Error('Persistent failure');
        const operation = jest.fn().mockRejectedValue(originalError);
        
        const promise = ErrorHandler.withRetry(operation, 2, 100);
        
        // Fast-forward timers
        setTimeout(() => {
          jest.advanceTimersByTime(100);
        }, 10);
        setTimeout(() => {
          jest.advanceTimersByTime(200);
        }, 20);
        
        await expect(promise).rejects.toMatchObject({
          message: 'Operation failed after 2 attempts: Persistent failure',
          code: ErrorTypes.SYSTEM_ERROR,
          severity: ErrorSeverity.HIGH
        });
        
        expect(operation).toHaveBeenCalledTimes(2);
      });

      test('should use default retry parameters', async () => {
        const operation = jest.fn().mockResolvedValue('success');
        
        const result = await ErrorHandler.withRetry(operation);
        
        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(1);
      });
    });

    describe('withTimeout', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      test('should resolve before timeout', async () => {
        const promise = Promise.resolve('success');
        
        const result = await ErrorHandler.withTimeout(promise, 5000);
        
        expect(result).toBe('success');
      });

      test('should timeout with AppError', async () => {
        const slowPromise = new Promise(resolve => {
          setTimeout(() => resolve('too late'), 15000);
        });
        
        const promise = ErrorHandler.withTimeout(slowPromise, 10000);
        
        // Fast-forward past timeout
        jest.advanceTimersByTime(10000);
        
        await expect(promise).rejects.toMatchObject({
          message: 'Operation timed out',
          code: ErrorTypes.TIMEOUT_ERROR,
          severity: ErrorSeverity.MEDIUM
        });
      });

      test('should use default timeout', async () => {
        const promise = Promise.resolve('success');
        
        const result = await ErrorHandler.withTimeout(promise);
        
        expect(result).toBe('success');
      });
    });
  });

  describe('SchedulingErrorHandler', () => {
    describe('handleBinLoadError', () => {
      test('should handle inactive account error', () => {
        const error = { code: 'INACTIVE_ACCOUNT' };
        const onRetry = jest.fn();
        
        SchedulingErrorHandler.handleBinLoadError(error, onRetry);
        
        expect(Alert.alert).toHaveBeenCalledWith(
          'Unable to Load Bins',
          'Your account is inactive. Please contact support to reactivate your account.',
          expect.arrayContaining([
            expect.objectContaining({ text: 'Contact Support' }),
            { text: 'OK', style: 'cancel' }
          ])
        );
      });

      test('should handle no linked bins error', () => {
        const error = { code: 'NO_LINKED_BINS' };
        const onRetry = jest.fn();
        
        SchedulingErrorHandler.handleBinLoadError(error, onRetry);
        
        expect(Alert.alert).toHaveBeenCalledWith(
          'Unable to Load Bins',
          'No bins are linked to your account. Please contact support to add bins.',
          expect.arrayContaining([
            expect.objectContaining({ text: 'Contact Support' }),
            { text: 'OK', style: 'cancel' }
          ])
        );
      });

      test('should handle generic error with retry option', () => {
        const error = { code: 'NETWORK_ERROR' };
        const onRetry = jest.fn();
        
        SchedulingErrorHandler.handleBinLoadError(error, onRetry);
        
        expect(Alert.alert).toHaveBeenCalledWith(
          'Unable to Load Bins',
          'Failed to load your bins.',
          expect.arrayContaining([
            expect.objectContaining({ text: 'Contact Support' }),
            { text: 'Retry', onPress: onRetry },
            { text: 'OK', style: 'cancel' }
          ])
        );
      });
    });

    describe('handleBookingError', () => {
      test('should handle slot unavailable error', () => {
        const error = { code: 'SLOT_UNAVAILABLE' };
        
        SchedulingErrorHandler.handleBookingError(error, jest.fn());
        
        expect(Alert.alert).toHaveBeenCalledWith(
          'Booking Failed',
          'The selected time slot is no longer available. Please select a different time.',
          expect.arrayContaining([
            { text: 'Select Different Time', onPress: expect.any(Function) },
            { text: 'OK', style: 'cancel' }
          ])
        );
      });

      test('should handle validation error', () => {
        const error = { 
          code: 'VALIDATION_ERROR',
          details: ['Field 1 error', 'Field 2 error']
        };
        
        SchedulingErrorHandler.handleBookingError(error, jest.fn());
        
        expect(Alert.alert).toHaveBeenCalledWith(
          'Booking Failed',
          'Please check your booking details:\nField 1 error\nField 2 error',
          expect.arrayContaining([
            { text: 'Fix Details', onPress: expect.any(Function) },
            { text: 'OK', style: 'cancel' }
          ])
        );
      });

      test('should handle validation error without details', () => {
        const error = { 
          code: 'VALIDATION_ERROR',
          message: 'Validation failed'
        };
        
        SchedulingErrorHandler.handleBookingError(error, jest.fn());
        
        expect(Alert.alert).toHaveBeenCalledWith(
          'Booking Failed',
          'Please check your booking details:\nValidation failed',
          expect.any(Array)
        );
      });

      test('should handle payment error', () => {
        const error = { code: 'PAYMENT_ERROR' };
        const onRetry = jest.fn();
        
        SchedulingErrorHandler.handleBookingError(error, onRetry);
        
        expect(Alert.alert).toHaveBeenCalledWith(
          'Booking Failed',
          'Payment could not be processed. Please check your payment method.',
          expect.arrayContaining([
            { text: 'Update Payment', onPress: expect.any(Function) },
            { text: 'Retry', onPress: onRetry },
            { text: 'Cancel', style: 'cancel' }
          ])
        );
      });

      test('should handle generic booking error', () => {
        const error = { code: 'UNKNOWN_ERROR' };
        const onRetry = jest.fn();
        
        SchedulingErrorHandler.handleBookingError(error, onRetry);
        
        expect(Alert.alert).toHaveBeenCalledWith(
          'Booking Failed',
          'Failed to submit your booking.',
          expect.arrayContaining([
            { text: 'Retry', onPress: onRetry },
            { text: 'Cancel', style: 'cancel' }
          ])
        );
      });
    });

    describe('handleFeedbackError', () => {
      test('should handle booking not found error', () => {
        const error = { code: 'BOOKING_NOT_FOUND' };
        
        SchedulingErrorHandler.handleFeedbackError(error, jest.fn());
        
        expect(Alert.alert).toHaveBeenCalledWith(
          'Feedback Error',
          'The booking information could not be found. This may be a system error.',
          expect.arrayContaining([
            expect.objectContaining({ text: 'Contact Support' }),
            { text: 'OK', style: 'cancel' }
          ])
        );
      });

      test('should handle feedback already exists error', () => {
        const error = { code: 'FEEDBACK_EXISTS' };
        
        SchedulingErrorHandler.handleFeedbackError(error, jest.fn());
        
        expect(Alert.alert).toHaveBeenCalledWith(
          'Feedback Error',
          'You have already provided feedback for this collection. Thank you!',
          [{ text: 'OK', style: 'default' }]
        );
      });

      test('should handle invalid booking status error', () => {
        const error = { code: 'INVALID_BOOKING_STATUS' };
        
        SchedulingErrorHandler.handleFeedbackError(error, jest.fn());
        
        expect(Alert.alert).toHaveBeenCalledWith(
          'Feedback Error',
          'Feedback can only be provided after the waste collection has been completed.',
          [{ text: 'OK', style: 'default' }]
        );
      });

      test('should handle generic feedback error', () => {
        const error = { code: 'UNKNOWN_ERROR' };
        const onRetry = jest.fn();
        
        SchedulingErrorHandler.handleFeedbackError(error, onRetry);
        
        expect(Alert.alert).toHaveBeenCalledWith(
          'Feedback Error',
          'Failed to submit your feedback.',
          expect.arrayContaining([
            { text: 'Retry', onPress: onRetry },
            { text: 'Skip Feedback', style: 'cancel' }
          ])
        );
      });
    });

    describe('showSupportOptions', () => {
      test('should show support contact options', () => {
        SchedulingErrorHandler.showSupportOptions();
        
        expect(Alert.alert).toHaveBeenCalledWith(
          'Contact Support',
          expect.stringContaining('Phone: +94 11 123 4567'),
          expect.arrayContaining([
            { text: 'Call Now', onPress: expect.any(Function) },
            { text: 'Send Email', onPress: expect.any(Function) },
            { text: 'Visit Website', onPress: expect.any(Function) },
            { text: 'Cancel', style: 'cancel' }
          ])
        );
      });

      test('should log actions when buttons are pressed', () => {
        SchedulingErrorHandler.showSupportOptions();
        
        const alertCall = Alert.alert.mock.calls[0];
        const buttons = alertCall[2];
        
        // Test call button
        buttons[0].onPress();
        expect(console.log).toHaveBeenCalledWith('📞 Calling support...');
        
        // Test email button
        buttons[1].onPress();
        expect(console.log).toHaveBeenCalledWith('📧 Opening email...');
        
        // Test website button  
        buttons[2].onPress();
        expect(console.log).toHaveBeenCalledWith('🌐 Opening website...');
      });
    });
  });

  describe('NetworkErrorHandler', () => {
    describe('handleNetworkError', () => {
      test('should show network error alert with retry option', () => {
        const error = new Error('Network failed');
        const onRetry = jest.fn();
        
        NetworkErrorHandler.handleNetworkError(error, onRetry);
        
        expect(Alert.alert).toHaveBeenCalledWith(
          'Connection Problem',
          'Unable to connect to our servers. Please check your internet connection and try again.',
          [
            { text: 'Retry', onPress: onRetry },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      });
    });

    describe('handleTimeoutError', () => {
      test('should show timeout error alert with retry option', () => {
        const error = new Error('Request timeout');
        const onRetry = jest.fn();
        
        NetworkErrorHandler.handleTimeoutError(error, onRetry);
        
        expect(Alert.alert).toHaveBeenCalledWith(
          'Request Timeout',
          'The request is taking longer than expected. This might be due to poor network conditions.',
          [
            { text: 'Retry', onPress: onRetry },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      });
    });
  });

  describe('ValidationErrorHandler', () => {
    describe('handleValidationErrors', () => {
      test('should handle validation errors object', () => {
        const validationErrors = {
          email: ['Email is required', 'Email format is invalid'],
          password: ['Password must be at least 8 characters']
        };
        
        ValidationErrorHandler.handleValidationErrors(validationErrors);
        
        expect(Alert.alert).toHaveBeenCalledWith(
          'Please Fix These Issues',
          'Email is required\nEmail format is invalid\nPassword must be at least 8 characters',
          [{ text: 'OK', style: 'default' }]
        );
      });

      test('should handle validation errors with custom title', () => {
        const validationErrors = {
          field1: ['Error 1'],
          field2: ['Error 2']
        };
        const customTitle = 'Custom Validation Title';
        
        ValidationErrorHandler.handleValidationErrors(validationErrors, customTitle);
        
        expect(Alert.alert).toHaveBeenCalledWith(
          customTitle,
          'Error 1\nError 2',
          [{ text: 'OK', style: 'default' }]
        );
      });

      test('should handle empty validation errors', () => {
        const validationErrors = {};
        
        ValidationErrorHandler.handleValidationErrors(validationErrors);
        
        expect(Alert.alert).toHaveBeenCalledWith(
          'Please Fix These Issues',
          '',
          [{ text: 'OK', style: 'default' }]
        );
      });
    });

    describe('handleFieldError', () => {
      test('should handle single field error', () => {
        const field = 'Email';
        const error = 'Invalid email format';
        
        ValidationErrorHandler.handleFieldError(field, error);
        
        expect(Alert.alert).toHaveBeenCalledWith(
          'Invalid Input',
          'Email: Invalid email format',
          [{ text: 'OK', style: 'default' }]
        );
      });
    });
  });

  describe('BusinessRuleErrorHandler', () => {
    describe('handleBinLimitError', () => {
      test('should handle bin selection limit error', () => {
        const maxBins = 5;
        
        BusinessRuleErrorHandler.handleBinLimitError(maxBins);
        
        expect(Alert.alert).toHaveBeenCalledWith(
          'Selection Limit Reached',
          'You can select a maximum of 5 bins per booking. Please deselect some bins to continue.',
          [{ text: 'OK', style: 'default' }]
        );
      });
    });

    describe('handleSchedulingConstraintError', () => {
      test('should handle scheduling constraint error', () => {
        const minHours = 24;
        
        BusinessRuleErrorHandler.handleSchedulingConstraintError(minHours);
        
        expect(Alert.alert).toHaveBeenCalledWith(
          'Scheduling Constraint',
          'Collections must be scheduled at least 24 hours in advance. Please select a later date and time.',
          [{ text: 'OK', style: 'default' }]
        );
      });
    });

    describe('handleUrgentPickupError', () => {
      test('should handle urgent pickup error', () => {
        const urgentBins = [
          { type: 'General Waste', location: 'Front Yard' },
          { type: 'Organic', location: 'Kitchen' }
        ];
        
        BusinessRuleErrorHandler.handleUrgentPickupError(urgentBins);
        
        expect(Alert.alert).toHaveBeenCalledWith(
          'Urgent Pickup Required',
          expect.stringContaining('• General Waste (Front Yard)'),
          [{ text: 'Understood', style: 'default' }]
        );
        
        const alertCall = Alert.alert.mock.calls[0];
        expect(alertCall[1]).toContain('• Organic (Kitchen)');
      });

      test('should handle empty urgent bins array', () => {
        const urgentBins = [];
        
        BusinessRuleErrorHandler.handleUrgentPickupError(urgentBins);
        
        expect(Alert.alert).toHaveBeenCalledWith(
          'Urgent Pickup Required',
          expect.stringContaining('automatically selected'),
          [{ text: 'Understood', style: 'default' }]
        );
      });
    });
  });

  describe('ErrorRecovery', () => {
    describe('recoverFromNetworkError', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      test('should recover from network error successfully', async () => {
        const operation = jest.fn()
          .mockRejectedValueOnce(new Error('Network failed'))
          .mockResolvedValue('success');
        
        const promise = ErrorRecovery.recoverFromNetworkError(operation, 2);
        
        // Fast-forward timers
        setTimeout(() => {
          jest.advanceTimersByTime(2000);
        }, 10);
        
        const result = await promise;
        
        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(2);
      });

      test('should use default max attempts', async () => {
        const operation = jest.fn().mockResolvedValue('success');
        
        const result = await ErrorRecovery.recoverFromNetworkError(operation);
        
        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(1);
      });
    });

    describe('recoverFromTimeout', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      test('should recover from timeout with increased timeout', async () => {
        const operation = () => Promise.resolve('success');
        
        const result = await ErrorRecovery.recoverFromTimeout(operation, 30000);
        
        expect(result).toBe('success');
      });

      test('should use default timeout', async () => {
        const operation = () => Promise.resolve('success');
        
        const result = await ErrorRecovery.recoverFromTimeout(operation);
        
        expect(result).toBe('success');
      });
    });

    describe('withFallback', () => {
      test('should use primary operation when successful', async () => {
        const primaryOperation = jest.fn().mockResolvedValue('primary result');
        const fallbackOperation = jest.fn().mockResolvedValue('fallback result');
        
        const result = await ErrorRecovery.withFallback(primaryOperation, fallbackOperation);
        
        expect(result).toBe('primary result');
        expect(primaryOperation).toHaveBeenCalledTimes(1);
        expect(fallbackOperation).not.toHaveBeenCalled();
      });

      test('should use fallback operation when primary fails', async () => {
        const primaryOperation = jest.fn().mockRejectedValue(new Error('Primary failed'));
        const fallbackOperation = jest.fn().mockResolvedValue('fallback result');
        
        const result = await ErrorRecovery.withFallback(primaryOperation, fallbackOperation);
        
        expect(result).toBe('fallback result');
        expect(primaryOperation).toHaveBeenCalledTimes(1);
        expect(fallbackOperation).toHaveBeenCalledTimes(1);
        expect(console.warn).toHaveBeenCalledWith(
          'Primary operation failed, using fallback:',
          'Primary failed'
        );
      });

      test('should throw error when both operations fail', async () => {
        const primaryOperation = jest.fn().mockRejectedValue(new Error('Primary failed'));
        const fallbackOperation = jest.fn().mockRejectedValue(new Error('Fallback failed'));
        
        await expect(
          ErrorRecovery.withFallback(primaryOperation, fallbackOperation)
        ).rejects.toThrow('Fallback failed');
        
        expect(primaryOperation).toHaveBeenCalledTimes(1);
        expect(fallbackOperation).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Edge Cases and Error Conditions', () => {
    test('should handle null error in handleError', () => {
      const result = ErrorHandler.handleError(null);
      
      expect(result).toBe('An unexpected error occurred');
      expect(Alert.alert).toHaveBeenCalled();
    });

    test('should handle undefined error in handleError', () => {
      const result = ErrorHandler.handleError(undefined);
      
      expect(result).toBe('An unexpected error occurred');
    });

    test('should handle error with empty message', () => {
      const error = new Error('');
      const result = ErrorHandler.getUserFriendlyMessage(error, 'Fallback');
      
      expect(result).toBe('Fallback');
    });

    test('should handle error with null message', () => {
      const error = { message: null };
      const result = ErrorHandler.getUserFriendlyMessage(error, 'Fallback');
      
      expect(result).toBe('Fallback');
    });

    test('should handle AppError with null details', () => {
      const error = new AppError('Test', ErrorTypes.API_ERROR, ErrorSeverity.LOW, null);
      
      ErrorHandler.logError(error);
      
      expect(console.error).toHaveBeenCalledWith(
        '🚨 Application Error:',
        expect.objectContaining({
          details: null
        })
      );
    });

    test('should handle withRetry with immediate success', async () => {
      const operation = jest.fn().mockResolvedValue('immediate success');
      
      const result = await ErrorHandler.withRetry(operation, 1, 100);
      
      expect(result).toBe('immediate success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    test('should handle very large timeout values', async () => {
      const promise = Promise.resolve('success');
      
      const result = await ErrorHandler.withTimeout(promise, 999999);
      
      expect(result).toBe('success');
    });
  });
});

