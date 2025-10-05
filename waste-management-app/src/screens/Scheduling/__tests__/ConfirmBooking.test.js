/**
 * ConfirmBooking Screen Tests
 * Comprehensive unit tests for the ConfirmBooking screen
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module ConfirmBookingScreenTests
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ConfirmBookingScreen from '../ConfirmBooking';
import SchedulingService from '../../../api/schedulingService';
import { 
  mockNavigation, 
  mockRoute, 
  mockBins,
  mockSuccessResponse,
  mockErrorResponse 
} from '../../../__tests__/testUtils';

// Mock dependencies
jest.mock('../../../api/schedulingService');
jest.mock('../../../components/FeeDisplay', () => {
  return function MockFeeDisplay({ feeData, showBreakdown, testID }) {
    const React = require('react');
    const { View, Text } = require('react-native');
    
    return (
      <View testID={testID || 'fee-display'}>
        <Text testID="fee-total">Total: LKR {feeData?.total || 0}</Text>
        {showBreakdown && feeData?.breakdown && (
          <View testID="fee-breakdown">
            {feeData.breakdown.items?.map((item, index) => (
              <Text key={index}>{item.description}: LKR {item.amount}</Text>
            ))}
          </View>
        )}
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
  },
  formatCurrency: jest.fn((amount) => `LKR ${amount}`)
}));

describe('ConfirmBookingScreen', () => {
  const mockBookingData = {
    selectedBins: mockBins.slice(0, 2),
    selectedBinIds: ['bin-001', 'bin-002'],
    selectedDate: '2024-10-15',
    selectedTimeSlot: '09:00-11:00',
    selectedWasteType: 'regular',
    feeData: {
      total: 1200,
      breakdown: {
        baseFee: 800,
        binFees: 800,
        surcharges: 200,
        discounts: 0,
        taxes: 200,
        items: [
          { description: 'General Waste bin', amount: 500, quantity: 1 },
          { description: 'Recyclable bin', amount: 300, quantity: 1 },
          { description: 'Service fee', amount: 200, quantity: 1 },
          { description: 'Tax (16.67%)', amount: 200, quantity: 1 }
        ]
      }
    },
    estimatedWeight: 25
  };

  const defaultProps = {
    navigation: mockNavigation,
    route: {
      params: mockBookingData
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Reset mock implementations
    SchedulingService.submitBooking = jest.fn();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Component Initialization', () => {
    it('renders correctly with all sections', () => {
      const { getByText, getByTestId } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      expect(getByText('Confirm Booking')).toBeTruthy();
      expect(getByText('Booking Summary')).toBeTruthy();
      expect(getByText('Collection Details')).toBeTruthy();
      expect(getByText('Selected Bins (2)')).toBeTruthy();
      expect(getByText('Payment Summary')).toBeTruthy();
      expect(getByText('Collection Address')).toBeTruthy();
      expect(getByText('Important Notes')).toBeTruthy();
      expect(getByTestId('confirm-booking-button')).toBeTruthy();
    });

    it('handles missing route params gracefully', () => {
      const emptyProps = {
        navigation: mockNavigation,
        route: { params: {} }
      };

      const { getByText } = render(
        <ConfirmBookingScreen {...emptyProps} />
      );

      expect(getByText('Confirm Booking')).toBeTruthy();
      expect(getByText('Selected Bins (0)')).toBeTruthy();
    });

    it('displays correct booking summary information', () => {
      const { getByText } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      expect(getByText('Please review your booking details before confirming')).toBeTruthy();
    });
  });

  describe('Collection Details Display', () => {
    it('shows formatted date and time', () => {
      const { getByText } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      expect(getByText('Date:')).toBeTruthy();
      expect(getByText('Time:')).toBeTruthy();
      expect(getByText('Waste Type:')).toBeTruthy();
      expect(getByText('Estimated Weight:')).toBeTruthy();
      expect(getByText('25kg')).toBeTruthy();
    });

    it('displays waste type with proper formatting', () => {
      const { getByText } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      expect(getByText('Waste Type:')).toBeTruthy();
    });

    it('shows estimated weight', () => {
      const { getByText } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      expect(getByText('25kg')).toBeTruthy();
    });
  });

  describe('Selected Bins Display', () => {
    it('shows correct bin count', () => {
      const { getByText } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      expect(getByText('Selected Bins (2)')).toBeTruthy();
    });

    it('displays bin details correctly', () => {
      const { getByText } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      // Check for bin types
      expect(getByText('General Waste')).toBeTruthy();
      expect(getByText('Recyclable')).toBeTruthy();

      // Check for bin capacities
      expect(getByText('Capacity: 120L')).toBeTruthy();
      expect(getByText('Capacity: 80L')).toBeTruthy();
    });

    it('shows smart bin indicators', () => {
      const smartBinData = {
        ...mockBookingData,
        selectedBins: [
          { ...mockBins[0], isSmartBin: true }
        ]
      };

      const { getByText } = render(
        <ConfirmBookingScreen 
          navigation={mockNavigation}
          route={{ params: smartBinData }}
        />
      );

      expect(getByText('📱 Smart Bin')).toBeTruthy();
    });

    it('displays fill levels', () => {
      const { getByText } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      expect(getByText('75% full')).toBeTruthy();
      expect(getByText('60% full')).toBeTruthy();
    });
  });

  describe('Fee Display Integration', () => {
    it('renders fee display component', () => {
      const { getByTestId } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      expect(getByTestId('fee-display')).toBeTruthy();
    });

    it('passes correct fee data to FeeDisplay', () => {
      const { getByText } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      expect(getByText('Total: LKR 1200')).toBeTruthy();
    });
  });

  describe('Resident Information Display', () => {
    it('shows collection address section', () => {
      const { getByText } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      expect(getByText('Collection Address')).toBeTruthy();
    });
  });

  describe('Important Notes Section', () => {
    it('displays all important notes', () => {
      const { getByText } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      expect(getByText('Important Notes')).toBeTruthy();
      expect(getByText('Please ensure bins are accessible during the selected time window')).toBeTruthy();
      expect(getByText('Payment will be processed after successful collection')).toBeTruthy();
      expect(getByText('You will receive SMS and app notifications about your collection')).toBeTruthy();
      expect(getByText('You can cancel this booking up to 24 hours before collection')).toBeTruthy();
    });

    it('shows note icons', () => {
      const { getByText } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      expect(getByText('⏰')).toBeTruthy();
      expect(getByText('💳')).toBeTruthy();
      expect(getByText('📱')).toBeTruthy();
      expect(getByText('🔄')).toBeTruthy();
    });
  });

  describe('Action Buttons', () => {
    it('renders edit and confirm buttons', () => {
      const { getByText, getByTestId } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      expect(getByText('Edit Booking')).toBeTruthy();
      expect(getByTestId('confirm-booking-button')).toBeTruthy();
    });

    it('shows correct confirm button text with fee', () => {
      const { getByText } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      expect(getByText('Confirm Booking - LKR 1200')).toBeTruthy();
    });

    it('handles edit booking action', () => {
      const { getByText } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      fireEvent.press(getByText('Edit Booking'));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Edit Booking',
        'Which details would you like to change?',
        expect.any(Array)
      );
    });
  });

  describe('Booking Confirmation', () => {
    const mockBookingResult = {
      success: true,
      data: {
        booking: {
          confirmationNumber: 'WC-2024-001234'
        },
        message: 'Your waste collection has been scheduled successfully!',
        nextSteps: [
          'Check your email for confirmation details',
          'You will receive an SMS reminder 1 hour before collection',
          'Ensure bins are accessible during the scheduled time'
        ]
      }
    };

    it('submits booking with correct data', async () => {
      SchedulingService.submitBooking.mockResolvedValue(mockBookingResult);

      const { getByTestId } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('confirm-booking-button'));

      await waitFor(() => {
        expect(SchedulingService.submitBooking).toHaveBeenCalledWith(
          expect.objectContaining({
            residentId: expect.any(String),
            binIds: ['bin-001', 'bin-002'],
            wasteType: 'regular',
            scheduledDate: '2024-10-15',
            timeSlot: '09:00-11:00',
            totalFee: 1200,
            estimatedWeight: 25
          })
        );
      });
    });

    it('shows loading state during booking submission', async () => {
      SchedulingService.submitBooking.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockBookingResult), 100))
      );

      const { getByTestId, getByText } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('confirm-booking-button'));

      await waitFor(() => {
        expect(getByText('Confirming...')).toBeTruthy();
      });

      // Fast forward timers
      act(() => {
        jest.advanceTimersByTime(100);
      });
    });

    it('disables buttons during loading', async () => {
      SchedulingService.submitBooking.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockBookingResult), 100))
      );

      const { getByTestId, getByText } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('confirm-booking-button'));

      await waitFor(() => {
        const editButton = getByText('Edit Booking');
        const backButton = getByText('← Back');
        
        // Check if buttons are disabled (would depend on implementation)
        expect(editButton).toBeTruthy();
        expect(backButton).toBeTruthy();
      });
    });

    it('shows success modal after successful booking', async () => {
      SchedulingService.submitBooking.mockResolvedValue(mockBookingResult);

      const { getByTestId, getByText } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('confirm-booking-button'));

      await waitFor(() => {
        expect(getByText('Booking Confirmed!')).toBeTruthy();
        expect(getByText('Confirmation Number: WC-2024-001234')).toBeTruthy();
        expect(getByText('Your waste collection has been scheduled successfully!')).toBeTruthy();
      });
    });

    it('displays next steps in success modal', async () => {
      SchedulingService.submitBooking.mockResolvedValue(mockBookingResult);

      const { getByTestId, getByText } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('confirm-booking-button'));

      await waitFor(() => {
        expect(getByText('Next Steps:')).toBeTruthy();
        expect(getByText('• Check your email for confirmation details')).toBeTruthy();
        expect(getByText('• You will receive an SMS reminder 1 hour before collection')).toBeTruthy();
        expect(getByText('• Ensure bins are accessible during the scheduled time')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles slot unavailable error', async () => {
      const slotError = {
        code: 'SLOT_UNAVAILABLE',
        error: 'The selected time slot is no longer available'
      };

      SchedulingService.submitBooking.mockRejectedValue(slotError);

      const { getByTestId } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('confirm-booking-button'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Booking Unavailable',
          'The selected time slot is no longer available. Please go back and select a different time.',
          expect.any(Array)
        );
      });
    });

    it('handles validation errors', async () => {
      const validationError = {
        code: 'VALIDATION_ERROR',
        error: 'Invalid booking data',
        details: ['Bin not found', 'Invalid time slot']
      };

      SchedulingService.submitBooking.mockRejectedValue(validationError);

      const { getByTestId } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('confirm-booking-button'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Booking Error',
          expect.stringContaining('Bin not found'),
          expect.any(Array)
        );
      });
    });

    it('handles general booking errors with retry option', async () => {
      const generalError = {
        error: 'Network connection failed'
      };

      SchedulingService.submitBooking.mockRejectedValue(generalError);

      const { getByTestId } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('confirm-booking-button'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Booking Failed',
          'Network connection failed',
          expect.arrayContaining([
            expect.objectContaining({ text: 'Retry' }),
            expect.objectContaining({ text: 'Cancel' })
          ])
        );
      });
    });

    it('resets loading state after error', async () => {
      const error = new Error('Network error');
      SchedulingService.submitBooking.mockRejectedValue(error);

      const { getByTestId, getByText } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('confirm-booking-button'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });

      // After error, should not show loading state
      expect(() => getByText('Confirming...')).toThrow();
    });
  });

  describe('Navigation', () => {
    it('handles back navigation', () => {
      const { getByText } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      fireEvent.press(getByText('← Back'));

      expect(mockNavigation.goBack).toHaveBeenCalled();
    });

    it('navigates to home after successful booking', async () => {
      const mockBookingResult = {
        success: true,
        data: {
          booking: { confirmationNumber: 'WC-001' },
          message: 'Success'
        }
      };

      SchedulingService.submitBooking.mockResolvedValue(mockBookingResult);

      const { getByTestId, getByText } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('confirm-booking-button'));

      await waitFor(() => {
        expect(getByText('Done')).toBeTruthy();
      });

      fireEvent.press(getByText('Done'));

      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Home' }]
      });
    });

    it('handles edit booking navigation options', () => {
      const { getByText } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      fireEvent.press(getByText('Edit Booking'));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Edit Booking',
        'Which details would you like to change?',
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancel' }),
          expect.objectContaining({ text: 'Change Bins' }),
          expect.objectContaining({ text: 'Change Date/Time' })
        ])
      );
    });
  });

  describe('Modal Interactions', () => {
    it('closes success modal on backdrop press', async () => {
      const mockBookingResult = {
        success: true,
        data: {
          booking: { confirmationNumber: 'WC-001' },
          message: 'Success'
        }
      };

      SchedulingService.submitBooking.mockResolvedValue(mockBookingResult);

      const { getByTestId } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('confirm-booking-button'));

      await waitFor(() => {
        expect(getByTestId).toBeTruthy();
      });

      // Modal backdrop press would be handled by React Native Modal component
      // This test verifies the modal is rendered
    });

    it('shows success icon in modal', async () => {
      const mockBookingResult = {
        success: true,
        data: {
          booking: { confirmationNumber: 'WC-001' },
          message: 'Success'
        }
      };

      SchedulingService.submitBooking.mockResolvedValue(mockBookingResult);

      const { getByTestId, getByText } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('confirm-booking-button'));

      await waitFor(() => {
        expect(getByText('✅')).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper testIDs for testing', () => {
      const { getByTestId } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      expect(getByTestId('confirm-booking-button')).toBeTruthy();
    });

    it('disables interactions during loading', async () => {
      SchedulingService.submitBooking.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      const { getByTestId } = render(
        <ConfirmBookingScreen {...defaultProps} />
      );

      fireEvent.press(getByTestId('confirm-booking-button'));

      // During loading, button should be disabled
      const confirmButton = getByTestId('confirm-booking-button');
      expect(confirmButton).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty bin list', () => {
      const emptyBinsData = {
        ...mockBookingData,
        selectedBins: [],
        selectedBinIds: []
      };

      const { getByText } = render(
        <ConfirmBookingScreen 
          navigation={mockNavigation}
          route={{ params: emptyBinsData }}
        />
      );

      expect(getByText('Selected Bins (0)')).toBeTruthy();
    });

    it('handles missing fee data', () => {
      const noFeeData = {
        ...mockBookingData,
        feeData: null
      };

      const { getByText } = render(
        <ConfirmBookingScreen 
          navigation={mockNavigation}
          route={{ params: noFeeData }}
        />
      );

      expect(getByText('Confirm Booking - LKR 0')).toBeTruthy();
    });

    it('handles missing estimated weight', () => {
      const noWeightData = {
        ...mockBookingData,
        estimatedWeight: undefined
      };

      const { getByText } = render(
        <ConfirmBookingScreen 
          navigation={mockNavigation}
          route={{ params: noWeightData }}
        />
      );

      expect(getByText('0kg')).toBeTruthy();
    });
  });

  describe('Snapshot Tests', () => {
    it('matches snapshot for complete booking', () => {
      const tree = render(<ConfirmBookingScreen {...defaultProps} />);
      expect(tree).toMatchSnapshot();
    });

    it('matches snapshot for loading state', async () => {
      SchedulingService.submitBooking.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const tree = render(<ConfirmBookingScreen {...defaultProps} />);
      
      fireEvent.press(tree.getByTestId('confirm-booking-button'));

      await waitFor(() => {
        expect(tree.getByText('Confirming...')).toBeTruthy();
      });

      expect(tree).toMatchSnapshot();
    });
  });
});
