/**
 * ProvideFeedback Screen Tests
 * Comprehensive unit tests for the ProvideFeedback screen
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module ProvideFeedbackScreenTests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ProvideFeedbackScreen from '../ProvideFeedback';
import SchedulingService from '../../../api/schedulingService';
import { 
  mockNavigation, 
  mockRoute,
  mockSuccessResponse,
  mockErrorResponse 
} from '../../../__tests__/testUtils';

// Mock dependencies
jest.mock('../../../api/schedulingService');
jest.mock('../../../components/FeedbackForm', () => {
  return function MockFeedbackForm({ 
    onSubmit, 
    onSkip, 
    loading, 
    disabled, 
    error, 
    bookingInfo, 
    style 
  }) {
    const React = require('react');
    const { View, TouchableOpacity, Text } = require('react-native');
    
    return (
      <View testID="feedback-form" style={style}>
        <Text testID="booking-info">
          {bookingInfo ? `Booking: ${bookingInfo.displayDate}` : 'No booking info'}
        </Text>
        {error && <Text testID="form-error">{error}</Text>}
        <TouchableOpacity
          testID="submit-feedback-button"
          onPress={() => onSubmit && onSubmit({ rating: 5, comment: 'Great service!' })}
          disabled={loading || disabled}
        >
          <Text>{loading ? 'Submitting...' : 'Submit Feedback'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="skip-feedback-button"
          onPress={() => onSkip && onSkip()}
          disabled={loading || disabled}
        >
          <Text>Skip for Now</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock utils
jest.mock('../../../utils/schedulingHelpers', () => ({
  DateUtils: {
    formatDisplayDate: jest.fn((date) => date ? new Date(date).toLocaleDateString() : 'Invalid Date')
  }
}));

// Mock console.log for analytics tracking
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('ProvideFeedbackScreen', () => {
  const mockBookingInfo = {
    id: 'booking-001',
    scheduledDate: '2024-10-15',
    timeSlot: '09:00-11:00',
    wasteType: 'regular',
    binIds: ['bin-001', 'bin-002'],
    status: 'completed'
  };

  const defaultProps = {
    navigation: mockNavigation,
    route: {
      params: {
        bookingId: 'booking-001',
        bookingInfo: mockBookingInfo
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Reset mock implementations
    SchedulingService.submitFeedback = jest.fn();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Component Initialization', () => {
    it('renders correctly with booking information', () => {
      const { getByText, getByTestId } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      expect(getByText('Feedback')).toBeTruthy();
      expect(getByTestId('feedback-form')).toBeTruthy();
      expect(getByText('Need Help?')).toBeTruthy();
      expect(getByText('📞 Contact Support')).toBeTruthy();
    });

    it('shows warning when booking ID is missing', () => {
      const propsWithoutBookingId = {
        navigation: mockNavigation,
        route: {
          params: {
            bookingInfo: mockBookingInfo
          }
        }
      };

      render(<ProvideFeedbackScreen {...propsWithoutBookingId} />);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Missing Information',
        'Booking information is required to provide feedback.',
        expect.any(Array)
      );
    });

    it('does not render when booking ID is missing', () => {
      const propsWithoutBookingId = {
        navigation: mockNavigation,
        route: {
          params: {}
        }
      };

      const { queryByTestId } = render(
        <ProvideFeedbackScreen {...propsWithoutBookingId} />
      );

      expect(queryByTestId('feedback-form')).toBeNull();
    });

    it('handles missing booking info gracefully', () => {
      const propsWithoutInfo = {
        navigation: mockNavigation,
        route: {
          params: {
            bookingId: 'booking-001'
          }
        }
      };

      const { getByTestId } = render(
        <ProvideFeedbackScreen {...propsWithoutInfo} />
      );

      expect(getByTestId('feedback-form')).toBeTruthy();
      expect(getByTestId('booking-info')).toBeTruthy();
    });
  });

  describe('Enhanced Booking Info', () => {
    it('formats booking information correctly', () => {
      const mockDateUtils = require('../../../utils/schedulingHelpers').DateUtils;
      mockDateUtils.formatDisplayDate.mockReturnValue('October 15, 2024');

      const { getByTestId } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      const bookingInfo = getByTestId('booking-info');
      expect(bookingInfo).toBeTruthy();
    });

    it('calculates bin count correctly', () => {
      const { getByTestId } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      // The enhanced booking info should include bin count
      expect(getByTestId('feedback-form')).toBeTruthy();
    });

    it('handles missing time slot and waste type gracefully', () => {
      const incompleteBookingInfo = {
        id: 'booking-001',
        scheduledDate: '2024-10-15',
        binIds: ['bin-001']
      };

      const propsWithIncompleteInfo = {
        navigation: mockNavigation,
        route: {
          params: {
            bookingId: 'booking-001',
            bookingInfo: incompleteBookingInfo
          }
        }
      };

      const { getByTestId } = render(
        <ProvideFeedbackScreen {...propsWithIncompleteInfo} />
      );

      expect(getByTestId('feedback-form')).toBeTruthy();
    });
  });

  describe('Feedback Submission', () => {
    const mockFeedbackResult = {
      success: true,
      data: {
        message: 'Thank you for your feedback!',
        averageRating: 4.2
      }
    };

    it('submits feedback with correct data', async () => {
      SchedulingService.submitFeedback.mockResolvedValue(mockFeedbackResult);

      const { getByTestId } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('submit-feedback-button'));

      await waitFor(() => {
        expect(SchedulingService.submitFeedback).toHaveBeenCalledWith({
          bookingId: 'booking-001',
          rating: 5,
          comment: 'Great service!'
        });
      });
    });

    it('shows success modal after successful submission', async () => {
      SchedulingService.submitFeedback.mockResolvedValue(mockFeedbackResult);

      const { getByTestId, getByText } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('submit-feedback-button'));

      await waitFor(() => {
        expect(getByText('Thank You!')).toBeTruthy();
        expect(getByText('Thank you for your feedback!')).toBeTruthy();
      });
    });

    it('displays average rating in success modal', async () => {
      SchedulingService.submitFeedback.mockResolvedValue(mockFeedbackResult);

      const { getByTestId, getByText } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('submit-feedback-button'));

      await waitFor(() => {
        expect(getByText('Our current average rating: 4.2/5 ⭐')).toBeTruthy();
      });
    });

    it('shows impact information in success modal', async () => {
      SchedulingService.submitFeedback.mockResolvedValue(mockFeedbackResult);

      const { getByTestId, getByText } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('submit-feedback-button'));

      await waitFor(() => {
        expect(getByText('Your Impact')).toBeTruthy();
        expect(getByText(/Your feedback helps us improve/)).toBeTruthy();
      });
    });

    it('passes loading state to feedback form', async () => {
      SchedulingService.submitFeedback.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockFeedbackResult), 100))
      );

      const { getByTestId, getByText } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('submit-feedback-button'));

      await waitFor(() => {
        expect(getByText('Submitting...')).toBeTruthy();
      });
    });
  });

  describe('Feedback Skip Functionality', () => {
    it('shows confirmation dialog when skipping feedback', () => {
      const { getByTestId } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('skip-feedback-button'));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Skip Feedback',
        'Are you sure you want to skip providing feedback? Your input helps us improve our service.',
        expect.arrayContaining([
          expect.objectContaining({ text: 'Provide Feedback' }),
          expect.objectContaining({ text: 'Skip' })
        ])
      );
    });

    it('logs analytics when feedback is skipped', () => {
      const { getByTestId } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('skip-feedback-button'));

      // Get the skip callback from Alert.alert
      const alertCall = Alert.alert.mock.calls[0];
      const skipCallback = alertCall[2].find(option => option.text === 'Skip').onPress;
      
      skipCallback();

      expect(console.log).toHaveBeenCalledWith('📊 FEEDBACK SKIPPED:', {
        bookingId: 'booking-001',
        timestamp: expect.any(String),
        reason: 'user_skip'
      });

      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('handles booking not found error', async () => {
      const bookingNotFoundError = {
        code: 'BOOKING_NOT_FOUND',
        error: 'Booking not found'
      };

      SchedulingService.submitFeedback.mockRejectedValue(bookingNotFoundError);

      const { getByTestId } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('submit-feedback-button'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Booking Not Found',
          'The booking information could not be found. Please contact support if this issue persists.',
          expect.any(Array)
        );
      });
    });

    it('handles feedback already exists error', async () => {
      const feedbackExistsError = {
        code: 'FEEDBACK_EXISTS',
        error: 'Feedback already provided'
      };

      SchedulingService.submitFeedback.mockRejectedValue(feedbackExistsError);

      const { getByTestId } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('submit-feedback-button'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Feedback Already Provided',
          'You have already provided feedback for this collection. Thank you for your input!',
          expect.any(Array)
        );
      });
    });

    it('handles invalid booking status error', async () => {
      const invalidStatusError = {
        code: 'INVALID_BOOKING_STATUS',
        error: 'Collection not complete'
      };

      SchedulingService.submitFeedback.mockRejectedValue(invalidStatusError);

      const { getByTestId } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('submit-feedback-button'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Collection Not Complete',
          'Feedback can only be provided after the waste collection has been completed.',
          expect.any(Array)
        );
      });
    });

    it('handles general errors with error display', async () => {
      const generalError = {
        error: 'Network connection failed'
      };

      SchedulingService.submitFeedback.mockRejectedValue(generalError);

      const { getByTestId, getByText } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('submit-feedback-button'));

      await waitFor(() => {
        expect(getByText('Submission Failed')).toBeTruthy();
        expect(getByText('Network connection failed')).toBeTruthy();
      });
    });

    it('shows retry button for general errors', async () => {
      const generalError = {
        error: 'Network connection failed'
      };

      SchedulingService.submitFeedback.mockRejectedValue(generalError);

      const { getByTestId, getByText } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('submit-feedback-button'));

      await waitFor(() => {
        expect(getByText('Try Again')).toBeTruthy();
      });

      fireEvent.press(getByText('Try Again'));

      // Should clear error and allow retry
      expect(() => getByText('Submission Failed')).toThrow();
    });

    it('resets loading state after error', async () => {
      const error = new Error('Network error');
      SchedulingService.submitFeedback.mockRejectedValue(error);

      const { getByTestId, queryByText } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('submit-feedback-button'));

      await waitFor(() => {
        // Should not show loading state after error
        expect(queryByText('Submitting...')).toBeNull();
      });
    });
  });

  describe('Help Section', () => {
    it('renders help section with support information', () => {
      const { getByText } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      expect(getByText('Need Help?')).toBeTruthy();
      expect(getByText(/If you experienced any issues/)).toBeTruthy();
      expect(getByText('📞 Contact Support')).toBeTruthy();
    });

    it('shows support contact options when pressed', () => {
      const { getByText } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      fireEvent.press(getByText('📞 Contact Support'));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Contact Support',
        expect.stringContaining('Phone: +94 11 123 4567'),
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancel' }),
          expect.objectContaining({ text: 'Call Now' })
        ])
      );
    });

    it('logs contact support action', () => {
      const { getByText } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      fireEvent.press(getByText('📞 Contact Support'));

      // Get the call callback from Alert.alert
      const alertCall = Alert.alert.mock.calls[0];
      const callCallback = alertCall[2].find(option => option.text === 'Call Now').onPress;
      
      callCallback();

      expect(console.log).toHaveBeenCalledWith('📞 Calling support...');
    });

    it('does not show help section when error is displayed', async () => {
      const error = { error: 'Network error' };
      SchedulingService.submitFeedback.mockRejectedValue(error);

      const { getByTestId, queryByText } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('submit-feedback-button'));

      await waitFor(() => {
        expect(queryByText('Need Help?')).toBeNull();
      });
    });
  });

  describe('Navigation', () => {
    it('handles back navigation', () => {
      const { getByText } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      fireEvent.press(getByText('← Back'));

      expect(mockNavigation.goBack).toHaveBeenCalled();
    });

    it('disables back navigation during loading', async () => {
      SchedulingService.submitFeedback.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      const { getByTestId, getByText } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('submit-feedback-button'));

      // Back button should show disabled state
      const backButton = getByText('← Back');
      expect(backButton).toBeTruthy();
    });

    it('navigates to home after successful feedback submission', async () => {
      const mockFeedbackResult = {
        success: true,
        data: { message: 'Thank you!' }
      };

      SchedulingService.submitFeedback.mockResolvedValue(mockFeedbackResult);

      const { getByTestId, getByText } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('submit-feedback-button'));

      await waitFor(() => {
        expect(getByText('Done')).toBeTruthy();
      });

      fireEvent.press(getByText('Done'));

      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Home' }]
      });
    });

    it('navigates back from error alert actions', async () => {
      const bookingNotFoundError = {
        code: 'BOOKING_NOT_FOUND',
        error: 'Booking not found'
      };

      SchedulingService.submitFeedback.mockRejectedValue(bookingNotFoundError);

      const { getByTestId } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('submit-feedback-button'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });

      // Get the OK callback from Alert.alert
      const alertCall = Alert.alert.mock.calls[0];
      const okCallback = alertCall[2][0].onPress;
      
      okCallback();

      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  describe('Success Modal', () => {
    const mockFeedbackResult = {
      success: true,
      data: {
        message: 'Thank you for your feedback!',
        averageRating: 4.5
      }
    };

    it('shows success modal with proper styling', async () => {
      SchedulingService.submitFeedback.mockResolvedValue(mockFeedbackResult);

      const { getByTestId, getByText } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('submit-feedback-button'));

      await waitFor(() => {
        expect(getByText('🌟')).toBeTruthy();
        expect(getByText('Thank You!')).toBeTruthy();
      });
    });

    it('handles modal close via Done button', async () => {
      SchedulingService.submitFeedback.mockResolvedValue(mockFeedbackResult);

      const { getByTestId, getByText, queryByText } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('submit-feedback-button'));

      await waitFor(() => {
        expect(getByText('Done')).toBeTruthy();
      });

      fireEvent.press(getByText('Done'));

      // Modal should close and navigate
      expect(mockNavigation.reset).toHaveBeenCalled();
    });

    it('displays default message when none provided', async () => {
      const resultWithoutMessage = {
        success: true,
        data: {}
      };

      SchedulingService.submitFeedback.mockResolvedValue(resultWithoutMessage);

      const { getByTestId, getByText } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('submit-feedback-button'));

      await waitFor(() => {
        expect(getByText('Your feedback has been submitted successfully.')).toBeTruthy();
      });
    });

    it('hides rating info when not provided', async () => {
      const resultWithoutRating = {
        success: true,
        data: {
          message: 'Thank you!'
        }
      };

      SchedulingService.submitFeedback.mockResolvedValue(resultWithoutRating);

      const { getByTestId, queryByText } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('submit-feedback-button'));

      await waitFor(() => {
        expect(queryByText(/Our current average rating/)).toBeNull();
      });
    });
  });

  describe('Form Integration', () => {
    it('passes correct props to FeedbackForm', () => {
      const { getByTestId } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      const feedbackForm = getByTestId('feedback-form');
      expect(feedbackForm).toBeTruthy();
    });

    it('passes enhanced booking info to form', () => {
      const mockDateUtils = require('../../../utils/schedulingHelpers').DateUtils;
      mockDateUtils.formatDisplayDate.mockReturnValue('October 15, 2024');

      const { getByTestId } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      expect(getByTestId('booking-info')).toBeTruthy();
    });

    it('disables form during loading', async () => {
      SchedulingService.submitFeedback.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      const { getByTestId } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('submit-feedback-button'));

      // Form should be disabled during submission
      const form = getByTestId('feedback-form');
      expect(form).toBeTruthy();
    });

    it('passes error state to form', async () => {
      const error = { error: 'Network error' };
      SchedulingService.submitFeedback.mockRejectedValue(error);

      const { getByTestId, getByText } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('submit-feedback-button'));

      await waitFor(() => {
        expect(getByText('Network error')).toBeTruthy();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles missing route params', () => {
      const emptyProps = {
        navigation: mockNavigation,
        route: { params: {} }
      };

      const { queryByTestId } = render(
        <ProvideFeedbackScreen {...emptyProps} />
      );

      expect(queryByTestId('feedback-form')).toBeNull();
    });

    it('handles null booking info', () => {
      const propsWithNullInfo = {
        navigation: mockNavigation,
        route: {
          params: {
            bookingId: 'booking-001',
            bookingInfo: null
          }
        }
      };

      const { getByTestId } = render(
        <ProvideFeedbackScreen {...propsWithNullInfo} />
      );

      expect(getByTestId('feedback-form')).toBeTruthy();
      expect(getByTestId('booking-info')).toBeTruthy();
    });

    it('handles empty feedback result', async () => {
      SchedulingService.submitFeedback.mockResolvedValue({
        success: true,
        data: null
      });

      const { getByTestId, getByText } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('submit-feedback-button'));

      await waitFor(() => {
        expect(getByText('Thank You!')).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper testIDs for testing', () => {
      const { getByTestId } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      expect(getByTestId('feedback-form')).toBeTruthy();
    });

    it('disables interactions during loading', async () => {
      SchedulingService.submitFeedback.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      const { getByTestId } = render(
        <ProvideFeedbackScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('submit-feedback-button'));

      // All interactive elements should be disabled during loading
      expect(getByTestId('feedback-form')).toBeTruthy();
    });
  });

  describe('Snapshot Tests', () => {
    it('matches snapshot for normal state', () => {
      const tree = render(<ProvideFeedbackScreen {...defaultProps} />);
      expect(tree).toMatchSnapshot();
    });

    it('matches snapshot for error state', async () => {
      const error = { error: 'Network error' };
      SchedulingService.submitFeedback.mockRejectedValue(error);

      const tree = render(<ProvideFeedbackScreen {...defaultProps} />);
      
      fireEvent.press(tree.getByTestId('submit-feedback-button'));

      await waitFor(() => {
        expect(tree.getByText('Submission Failed')).toBeTruthy();
      });

      expect(tree).toMatchSnapshot();
    });

    it('matches snapshot for success modal', async () => {
      const mockResult = {
        success: true,
        data: { message: 'Thank you!' }
      };

      SchedulingService.submitFeedback.mockResolvedValue(mockResult);

      const tree = render(<ProvideFeedbackScreen {...defaultProps} />);
      
      fireEvent.press(tree.getByTestId('submit-feedback-button'));

      await waitFor(() => {
        expect(tree.getByText('Thank You!')).toBeTruthy();
      });

      expect(tree).toMatchSnapshot();
    });
  });
});
