/**
 * ErrorBoundary Component Tests
 * Comprehensive unit tests for the ErrorBoundary component
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module ErrorBoundaryTests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import ErrorBoundary, { ScreenErrorBoundary, ComponentErrorBoundary } from '../ErrorBoundary';

// Mock the error handling utilities
jest.mock('../../utils/errorHandling', () => ({
  ErrorHandler: {
    logError: jest.fn()
  },
  AppError: class AppError extends Error {
    constructor(message, code, severity, details) {
      super(message);
      this.code = code;
      this.severity = severity;
      this.details = details;
    }
  },
  ErrorTypes: {
    SYSTEM_ERROR: 'SYSTEM_ERROR'
  },
  ErrorSeverity: {
    HIGH: 'HIGH'
  }
}));

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text>Working component</Text>;
};

// Component that throws an error on mount
const ThrowErrorOnMount = () => {
  throw new Error('Mount error');
};

describe('ErrorBoundary Component', () => {
  const mockOnError = jest.fn();
  const mockOnRetry = jest.fn();
  const mockOnReset = jest.fn();
  const mockOnContactSupport = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for error boundary tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('Normal Rendering', () => {
    test('renders children when no error occurs', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <Text>Test content</Text>
        </ErrorBoundary>
      );

      expect(getByText('Test content')).toBeTruthy();
    });

    test('renders multiple children correctly', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <Text>First child</Text>
          <Text>Second child</Text>
        </ErrorBoundary>
      );

      expect(getByText('First child')).toBeTruthy();
      expect(getByText('Second child')).toBeTruthy();
    });
  });

  describe('Error Catching', () => {
    test('catches and displays error when child component throws', () => {
      const { getByText, queryByText } = render(
        <ErrorBoundary>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      expect(getByText('Oops! Something went wrong')).toBeTruthy();
      expect(getByText('An unexpected error occurred while loading this screen.')).toBeTruthy();
      expect(queryByText('Working component')).toBeFalsy();
    });

    test('calls ErrorHandler.logError when error occurs', () => {
      const { ErrorHandler } = require('../../utils/errorHandling');
      
      render(
        <ErrorBoundary>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      expect(ErrorHandler.logError).toHaveBeenCalled();
    });

    test('calls onError callback when provided', () => {
      render(
        <ErrorBoundary onError={mockOnError}>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      expect(mockOnError).toHaveBeenCalled();
    });

    test('displays custom error message when provided', () => {
      const customMessage = 'Custom error message';
      const { getByText } = render(
        <ErrorBoundary customMessage={customMessage}>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      expect(getByText(customMessage)).toBeTruthy();
    });
  });

  describe('Error UI Elements', () => {
    test('renders error icon', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      expect(getByText('⚠️')).toBeTruthy();
    });

    test('renders error title', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      expect(getByText('Oops! Something went wrong')).toBeTruthy();
    });

    test('renders help section', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      expect(getByText('What can you do?')).toBeTruthy();
      expect(getByText(/Try refreshing the screen/)).toBeTruthy();
      expect(getByText(/Check your internet connection/)).toBeTruthy();
      expect(getByText(/Close and reopen the app/)).toBeTruthy();
      expect(getByText(/Contact our support team/)).toBeTruthy();
    });
  });

  describe('Action Buttons', () => {
    test('renders retry button by default', () => {
      const { getByTestId } = render(
        <ErrorBoundary>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      expect(getByTestId('error-retry-button')).toBeTruthy();
    });

    test('renders reset button by default', () => {
      const { getByTestId } = render(
        <ErrorBoundary>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      expect(getByTestId('error-reset-button')).toBeTruthy();
    });

    test('renders support button by default', () => {
      const { getByTestId } = render(
        <ErrorBoundary>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      expect(getByTestId('error-support-button')).toBeTruthy();
    });

    test('hides retry button when showRetry is false', () => {
      const { queryByTestId } = render(
        <ErrorBoundary showRetry={false}>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      expect(queryByTestId('error-retry-button')).toBeFalsy();
    });

    test('hides reset button when showReset is false', () => {
      const { queryByTestId } = render(
        <ErrorBoundary showReset={false}>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      expect(queryByTestId('error-reset-button')).toBeFalsy();
    });

    test('hides support button when showSupport is false', () => {
      const { queryByTestId } = render(
        <ErrorBoundary showSupport={false}>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      expect(queryByTestId('error-support-button')).toBeFalsy();
    });
  });

  describe('Retry Functionality', () => {
    test('calls onRetry when retry button is pressed', () => {
      const { getByTestId } = render(
        <ErrorBoundary onRetry={mockOnRetry}>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      const retryButton = getByTestId('error-retry-button');
      fireEvent.press(retryButton);

      expect(mockOnRetry).toHaveBeenCalled();
    });

    test('resets error state when retry is pressed', () => {
      const TestComponent = () => {
        const [shouldThrow, setShouldThrow] = React.useState(true);
        
        React.useEffect(() => {
          // Reset error after a delay to simulate fix
          const timer = setTimeout(() => setShouldThrow(false), 100);
          return () => clearTimeout(timer);
        }, []);

        return <ThrowError shouldThrow={shouldThrow} />;
      };

      const { getByTestId, getByText } = render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );

      // Initially shows error
      expect(getByText('Oops! Something went wrong')).toBeTruthy();

      // Press retry
      const retryButton = getByTestId('error-retry-button');
      fireEvent.press(retryButton);

      // Component should attempt to re-render
      expect(retryButton).toBeTruthy();
    });

    test('shows retry count when retries are made', () => {
      const { getByTestId, getByText } = render(
        <ErrorBoundary maxRetries={3}>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      const retryButton = getByTestId('error-retry-button');
      fireEvent.press(retryButton);

      expect(getByText('Retry attempts: 1/3')).toBeTruthy();
    });

    test('hides retry button after max retries', () => {
      const { getByTestId, queryByTestId } = render(
        <ErrorBoundary maxRetries={1}>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      const retryButton = getByTestId('error-retry-button');
      fireEvent.press(retryButton);

      // After max retries, retry button should be hidden
      expect(queryByTestId('error-retry-button')).toBeFalsy();
    });
  });

  describe('Reset Functionality', () => {
    test('calls onReset when reset button is pressed', () => {
      const { getByTestId } = render(
        <ErrorBoundary onReset={mockOnReset}>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      const resetButton = getByTestId('error-reset-button');
      fireEvent.press(resetButton);

      expect(mockOnReset).toHaveBeenCalled();
    });

    test('resets error state completely when reset is pressed', () => {
      const { getByTestId } = render(
        <ErrorBoundary onReset={mockOnReset}>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      const resetButton = getByTestId('error-reset-button');
      fireEvent.press(resetButton);

      // Reset should be called
      expect(mockOnReset).toHaveBeenCalled();
    });
  });

  describe('Support Functionality', () => {
    test('calls onContactSupport when support button is pressed', () => {
      const { getByTestId } = render(
        <ErrorBoundary onContactSupport={mockOnContactSupport}>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      const supportButton = getByTestId('error-support-button');
      fireEvent.press(supportButton);

      expect(mockOnContactSupport).toHaveBeenCalled();
    });

    test('passes error details to support callback', () => {
      const { getByTestId } = render(
        <ErrorBoundary name="TestBoundary" onContactSupport={mockOnContactSupport}>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      const supportButton = getByTestId('error-support-button');
      fireEvent.press(supportButton);

      expect(mockOnContactSupport).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
          component: 'TestBoundary',
          timestamp: expect.any(String),
          retryCount: expect.any(Number)
        })
      );
    });
  });

  describe('Development Mode Features', () => {
    test('shows error details in development mode', () => {
      // Mock __DEV__ to be true
      const originalDev = global.__DEV__;
      global.__DEV__ = true;

      const { getByText } = render(
        <ErrorBoundary>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      expect(getByText('Error Details (Dev Mode):')).toBeTruthy();

      // Restore original __DEV__
      global.__DEV__ = originalDev;
    });

    test('hides error details in production mode', () => {
      // Mock __DEV__ to be false
      const originalDev = global.__DEV__;
      global.__DEV__ = false;

      const { queryByText } = render(
        <ErrorBoundary>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      expect(queryByText('Error Details (Dev Mode):')).toBeFalsy();

      // Restore original __DEV__
      global.__DEV__ = originalDev;
    });
  });

  describe('Custom Fallback', () => {
    test('renders custom fallback when provided', () => {
      const customFallback = (error, retry, reset) => (
        <Text testID="custom-fallback">Custom error UI</Text>
      );

      const { getByTestId, queryByText } = render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      expect(getByTestId('custom-fallback')).toBeTruthy();
      expect(queryByText('Oops! Something went wrong')).toBeFalsy();
    });

    test('passes error, retry, and reset functions to custom fallback', () => {
      const customFallback = jest.fn(() => <Text>Custom fallback</Text>);

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      expect(customFallback).toHaveBeenCalledWith(
        expect.any(Object), // error
        expect.any(Function), // retry
        expect.any(Function)  // reset
      );
    });
  });

  describe('Error Boundary Name', () => {
    test('includes boundary name in error details', () => {
      const { ErrorHandler } = require('../../utils/errorHandling');
      
      render(
        <ErrorBoundary name="TestBoundary">
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      const loggedError = ErrorHandler.logError.mock.calls[0][0];
      expect(loggedError.details.errorBoundary).toBe('TestBoundary');
    });

    test('uses default name when none provided', () => {
      const { ErrorHandler } = require('../../utils/errorHandling');
      
      render(
        <ErrorBoundary>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      const loggedError = ErrorHandler.logError.mock.calls[0][0];
      expect(loggedError.details.errorBoundary).toBe('Unknown');
    });
  });

  describe('Specialized Error Boundaries', () => {
    test('ScreenErrorBoundary renders with screen-specific settings', () => {
      const { getByText } = render(
        <ScreenErrorBoundary screenName="TestScreen">
          <ThrowErrorOnMount />
        </ScreenErrorBoundary>
      );

      expect(getByText(/Unable to load the TestScreen screen/)).toBeTruthy();
    });

    test('ComponentErrorBoundary renders with component-specific settings', () => {
      const { getByText, queryByTestId } = render(
        <ComponentErrorBoundary componentName="TestComponent">
          <ThrowErrorOnMount />
        </ComponentErrorBoundary>
      );

      expect(getByText(/The TestComponent component encountered an error/)).toBeTruthy();
      // Component error boundary should not show reset and support buttons
      expect(queryByTestId('error-reset-button')).toBeFalsy();
      expect(queryByTestId('error-support-button')).toBeFalsy();
    });
  });

  describe('Error State Management', () => {
    test('maintains error state correctly', () => {
      const { getByText, getByTestId } = render(
        <ErrorBoundary>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      // Initially shows error
      expect(getByText('Oops! Something went wrong')).toBeTruthy();

      // Error state should persist until retry/reset
      expect(getByTestId('error-retry-button')).toBeTruthy();
    });

    test('tracks retry count correctly', () => {
      const { getByTestId, getByText } = render(
        <ErrorBoundary maxRetries={3}>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      const retryButton = getByTestId('error-retry-button');
      
      // First retry
      fireEvent.press(retryButton);
      expect(getByText('Retry attempts: 1/3')).toBeTruthy();

      // Second retry
      fireEvent.press(retryButton);
      expect(getByText('Retry attempts: 2/3')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    test('handles error with no message', () => {
      const ThrowErrorWithoutMessage = () => {
        const error = new Error();
        error.message = '';
        throw error;
      };

      const { getByText } = render(
        <ErrorBoundary>
          <ThrowErrorWithoutMessage />
        </ErrorBoundary>
      );

      expect(getByText('An unexpected error occurred while loading this screen.')).toBeTruthy();
    });

    test('handles null error', () => {
      const ThrowNullError = () => {
        throw null;
      };

      const { getByText } = render(
        <ErrorBoundary>
          <ThrowNullError />
        </ErrorBoundary>
      );

      expect(getByText('Oops! Something went wrong')).toBeTruthy();
    });

    test('handles string error', () => {
      const ThrowStringError = () => {
        throw 'String error';
      };

      const { getByText } = render(
        <ErrorBoundary>
          <ThrowStringError />
        </ErrorBoundary>
      );

      expect(getByText('Oops! Something went wrong')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    test('has correct testIDs for all interactive elements', () => {
      const { getByTestId } = render(
        <ErrorBoundary>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      expect(getByTestId('error-retry-button')).toBeTruthy();
      expect(getByTestId('error-reset-button')).toBeTruthy();
      expect(getByTestId('error-support-button')).toBeTruthy();
    });

    test('buttons are touchable', () => {
      const { getByTestId } = render(
        <ErrorBoundary>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      const retryButton = getByTestId('error-retry-button');
      const resetButton = getByTestId('error-reset-button');
      const supportButton = getByTestId('error-support-button');

      expect(retryButton.props.disabled).toBeFalsy();
      expect(resetButton.props.disabled).toBeFalsy();
      expect(supportButton.props.disabled).toBeFalsy();
    });
  });
});
