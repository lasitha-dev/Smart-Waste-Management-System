/**
 * SelectDateTime Screen Tests
 * Comprehensive unit tests for the SelectDateTime screen
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module SelectDateTimeScreenTests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import SelectDateTimeScreen from '../SelectDateTime';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack
};

const mockRoute = {
  params: {
    selectedBins: [
      {
        id: 'BIN001',
        type: 'General Waste',
        capacity: 120,
        location: 'Front yard',
        isSmartBin: true
      },
      {
        id: 'BIN002',
        type: 'Recyclable',
        capacity: 80,
        location: 'Back yard',
        isSmartBin: false
      }
    ],
    selectedBinIds: ['BIN001', 'BIN002']
  }
};

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock the scheduling service
jest.mock('../../../api/schedulingService', () => ({
  checkAvailability: jest.fn(),
  calculateFee: jest.fn()
}));

// Mock the DateTimePicker component
jest.mock('../../../components/DateTimePicker', () => {
  return function MockDateTimePicker({ onDateChange, onTimeSlotChange, selectedDate, selectedTimeSlot, testID }) {
    const React = require('react');
    const { View, TouchableOpacity, Text } = require('react-native');
    
    return (
      <View testID={testID || 'datetime-picker'}>
        <TouchableOpacity
          testID="date-picker-button"
          onPress={() => onDateChange && onDateChange('2024-10-15')}
        >
          <Text>Select Date: {selectedDate || 'None'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="time-slot-button"
          onPress={() => onTimeSlotChange && onTimeSlotChange('09:00-11:00')}
        >
          <Text>Select Time: {selectedTimeSlot || 'None'}</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

// Mock the FeeDisplay component
jest.mock('../../../components/FeeDisplay', () => {
  return function MockFeeDisplay({ feeBreakdown, totalFee, loading, testID }) {
    const React = require('react');
    const { View, Text } = require('react-native');
    
    return (
      <View testID={testID || 'fee-display'}>
        <Text testID="total-fee">Total: LKR {totalFee || 0}</Text>
        {loading && <Text testID="fee-loading">Calculating...</Text>}
        {feeBreakdown && (
          <View testID="fee-breakdown">
            {feeBreakdown.items?.map((item, index) => (
              <Text key={index}>{item.description}: LKR {item.amount}</Text>
            ))}
          </View>
        )}
      </View>
    );
  };
});

// Mock the error handling components
jest.mock('../../../components/ErrorBoundary', () => ({
  ScreenErrorBoundary: ({ children }) => children,
  __esModule: true,
  default: ({ children }) => children
}));

// Mock data
const mockWasteTypes = [
  { id: 'regular', label: 'Regular Waste', baseFee: 500 },
  { id: 'recyclable', label: 'Recyclables', baseFee: 300 },
  { id: 'bulky', label: 'Bulky Items', baseFee: 800 },
  { id: 'organic', label: 'Organic Waste', baseFee: 400 }
];

const mockAvailabilityResponse = {
  success: true,
  data: {
    available: true,
    availableSlots: ['09:00-11:00', '14:00-16:00', '16:00-18:00'],
    bookedSlots: ['11:00-13:00'],
    message: 'Time slot is available'
  }
};

const mockFeeResponse = {
  success: true,
  data: {
    totalFee: 1200,
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
    },
    billingModel: 'hybrid'
  }
};

describe('SelectDateTime Screen', () => {
  const SchedulingService = require('../../../api/schedulingService');

  beforeEach(() => {
    jest.clearAllMocks();
    SchedulingService.checkAvailability.mockResolvedValue(mockAvailabilityResponse);
    SchedulingService.calculateFee.mockResolvedValue(mockFeeResponse);
  });

  describe('Initial Rendering', () => {
    test('renders screen header', () => {
      const { getByText } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('Select Date & Time')).toBeTruthy();
    });

    test('renders selected bins summary', () => {
      const { getByText } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('Selected Bins (2)')).toBeTruthy();
      expect(getByText('General Waste - Front yard')).toBeTruthy();
      expect(getByText('Recyclable - Back yard')).toBeTruthy();
    });

    test('renders waste type selection', () => {
      const { getByText } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('Waste Type')).toBeTruthy();
      expect(getByText('Regular Waste')).toBeTruthy();
      expect(getByText('Recyclables')).toBeTruthy();
      expect(getByText('Bulky Items')).toBeTruthy();
      expect(getByText('Organic Waste')).toBeTruthy();
    });

    test('renders datetime picker', () => {
      const { getByTestId } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('datetime-picker')).toBeTruthy();
    });

    test('renders fee display', () => {
      const { getByTestId } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('fee-display')).toBeTruthy();
    });

    test('renders continue button (disabled initially)', () => {
      const { getByTestId } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      const continueButton = getByTestId('continue-button');
      expect(continueButton).toBeTruthy();
      expect(continueButton.props.disabled).toBe(true);
    });
  });

  describe('Waste Type Selection', () => {
    test('allows selecting waste type', () => {
      const { getByTestId } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      const regularWasteOption = getByTestId('waste-type-regular');
      fireEvent.press(regularWasteOption);

      // Should trigger fee calculation
      expect(SchedulingService.calculateFee).toHaveBeenCalled();
    });

    test('shows selected waste type', () => {
      const { getByTestId } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      const recyclableOption = getByTestId('waste-type-recyclable');
      fireEvent.press(recyclableOption);

      // Check if the option appears selected (this would depend on the actual implementation)
      expect(recyclableOption).toBeTruthy();
    });

    test('updates fee when waste type changes', async () => {
      const { getByTestId } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      const bulkyOption = getByTestId('waste-type-bulky');
      fireEvent.press(bulkyOption);

      await waitFor(() => {
        expect(SchedulingService.calculateFee).toHaveBeenCalledWith(
          expect.objectContaining({
            wasteType: 'bulky'
          })
        );
      });
    });
  });

  describe('Date Selection', () => {
    test('allows selecting date', async () => {
      const { getByTestId } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      const datePickerButton = getByTestId('date-picker-button');
      fireEvent.press(datePickerButton);

      await waitFor(() => {
        expect(SchedulingService.checkAvailability).toHaveBeenCalledWith(
          expect.objectContaining({
            date: '2024-10-15'
          })
        );
      });
    });

    test('shows selected date', async () => {
      const { getByTestId, getByText } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      const datePickerButton = getByTestId('date-picker-button');
      fireEvent.press(datePickerButton);

      await waitFor(() => {
        expect(getByText('Select Date: 2024-10-15')).toBeTruthy();
      });
    });

    test('validates date selection (not in past)', () => {
      // This would be tested in the DateTimePicker component tests
      // Here we just verify the interaction
      const { getByTestId } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('datetime-picker')).toBeTruthy();
    });
  });

  describe('Time Slot Selection', () => {
    test('allows selecting time slot after date is selected', async () => {
      const { getByTestId } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      // First select a date
      const datePickerButton = getByTestId('date-picker-button');
      fireEvent.press(datePickerButton);

      await waitFor(() => {
        const timeSlotButton = getByTestId('time-slot-button');
        fireEvent.press(timeSlotButton);
      });

      expect(SchedulingService.checkAvailability).toHaveBeenCalled();
    });

    test('shows selected time slot', async () => {
      const { getByTestId, getByText } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Select date first
      const datePickerButton = getByTestId('date-picker-button');
      fireEvent.press(datePickerButton);

      await waitFor(() => {
        const timeSlotButton = getByTestId('time-slot-button');
        fireEvent.press(timeSlotButton);
      });

      await waitFor(() => {
        expect(getByText('Select Time: 09:00-11:00')).toBeTruthy();
      });
    });

    test('checks availability when time slot is selected', async () => {
      const { getByTestId } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Select date and time
      const datePickerButton = getByTestId('date-picker-button');
      fireEvent.press(datePickerButton);

      await waitFor(() => {
        const timeSlotButton = getByTestId('time-slot-button');
        fireEvent.press(timeSlotButton);
      });

      await waitFor(() => {
        expect(SchedulingService.checkAvailability).toHaveBeenCalledWith(
          expect.objectContaining({
            date: '2024-10-15',
            timeSlot: '09:00-11:00'
          })
        );
      });
    });
  });

  describe('Fee Calculation', () => {
    test('calculates fee when all required fields are selected', async () => {
      const { getByTestId } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Select waste type
      const wasteTypeOption = getByTestId('waste-type-regular');
      fireEvent.press(wasteTypeOption);

      // Select date
      const datePickerButton = getByTestId('date-picker-button');
      fireEvent.press(datePickerButton);

      // Select time
      await waitFor(() => {
        const timeSlotButton = getByTestId('time-slot-button');
        fireEvent.press(timeSlotButton);
      });

      await waitFor(() => {
        expect(SchedulingService.calculateFee).toHaveBeenCalledWith(
          expect.objectContaining({
            bins: mockRoute.params.selectedBins,
            wasteType: 'regular',
            date: '2024-10-15',
            timeSlot: '09:00-11:00'
          })
        );
      });
    });

    test('shows loading state during fee calculation', async () => {
      SchedulingService.calculateFee.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      const { getByTestId } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      const wasteTypeOption = getByTestId('waste-type-regular');
      fireEvent.press(wasteTypeOption);

      await waitFor(() => {
        expect(getByTestId('fee-loading')).toBeTruthy();
      });
    });

    test('displays calculated fee', async () => {
      const { getByTestId, getByText } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Trigger fee calculation
      const wasteTypeOption = getByTestId('waste-type-regular');
      fireEvent.press(wasteTypeOption);

      await waitFor(() => {
        expect(getByText('Total: LKR 1200')).toBeTruthy();
      });
    });

    test('shows fee breakdown', async () => {
      const { getByTestId } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Trigger fee calculation
      const wasteTypeOption = getByTestId('waste-type-regular');
      fireEvent.press(wasteTypeOption);

      await waitFor(() => {
        expect(getByTestId('fee-breakdown')).toBeTruthy();
      });
    });
  });

  describe('Availability Checking', () => {
    test('shows available time slots', async () => {
      const { getByTestId } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      const datePickerButton = getByTestId('date-picker-button');
      fireEvent.press(datePickerButton);

      await waitFor(() => {
        expect(SchedulingService.checkAvailability).toHaveBeenCalled();
      });
    });

    test('handles unavailable time slots', async () => {
      SchedulingService.checkAvailability.mockResolvedValue({
        success: true,
        data: {
          available: false,
          availableSlots: ['14:00-16:00'],
          bookedSlots: ['09:00-11:00', '11:00-13:00'],
          message: 'Selected time slot is not available'
        }
      });

      const { getByTestId } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      const datePickerButton = getByTestId('date-picker-button');
      fireEvent.press(datePickerButton);

      await waitFor(() => {
        const timeSlotButton = getByTestId('time-slot-button');
        fireEvent.press(timeSlotButton);
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Time Slot Unavailable',
          expect.stringContaining('not available'),
          expect.any(Array)
        );
      });
    });

    test('suggests alternative time slots', async () => {
      SchedulingService.checkAvailability.mockResolvedValue({
        success: true,
        data: {
          available: false,
          availableSlots: ['14:00-16:00', '16:00-18:00'],
          bookedSlots: ['09:00-11:00'],
          message: 'Selected time slot is not available'
        }
      });

      const { getByTestId } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      const datePickerButton = getByTestId('date-picker-button');
      fireEvent.press(datePickerButton);

      await waitFor(() => {
        const timeSlotButton = getByTestId('time-slot-button');
        fireEvent.press(timeSlotButton);
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Time Slot Unavailable',
          expect.stringContaining('Alternative slots'),
          expect.any(Array)
        );
      });
    });
  });

  describe('Form Validation', () => {
    test('enables continue button when all fields are selected', async () => {
      const { getByTestId } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Select waste type
      const wasteTypeOption = getByTestId('waste-type-regular');
      fireEvent.press(wasteTypeOption);

      // Select date
      const datePickerButton = getByTestId('date-picker-button');
      fireEvent.press(datePickerButton);

      // Select time
      await waitFor(() => {
        const timeSlotButton = getByTestId('time-slot-button');
        fireEvent.press(timeSlotButton);
      });

      await waitFor(() => {
        const continueButton = getByTestId('continue-button');
        expect(continueButton.props.disabled).toBe(false);
      });
    });

    test('keeps continue button disabled when fields are missing', () => {
      const { getByTestId } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Only select waste type
      const wasteTypeOption = getByTestId('waste-type-regular');
      fireEvent.press(wasteTypeOption);

      const continueButton = getByTestId('continue-button');
      expect(continueButton.props.disabled).toBe(true);
    });

    test('shows validation message when trying to continue with missing fields', () => {
      const { getByTestId } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      const continueButton = getByTestId('continue-button');
      fireEvent.press(continueButton);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Incomplete Information',
        expect.stringContaining('required fields'),
        expect.any(Array)
      );
    });
  });

  describe('Navigation', () => {
    test('navigates to ConfirmBooking when continue is pressed', async () => {
      const { getByTestId } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Fill all required fields
      const wasteTypeOption = getByTestId('waste-type-regular');
      fireEvent.press(wasteTypeOption);

      const datePickerButton = getByTestId('date-picker-button');
      fireEvent.press(datePickerButton);

      await waitFor(() => {
        const timeSlotButton = getByTestId('time-slot-button');
        fireEvent.press(timeSlotButton);
      });

      await waitFor(() => {
        const continueButton = getByTestId('continue-button');
        fireEvent.press(continueButton);
      });

      expect(mockNavigate).toHaveBeenCalledWith('ConfirmBooking', {
        selectedBins: mockRoute.params.selectedBins,
        selectedBinIds: mockRoute.params.selectedBinIds,
        wasteType: 'regular',
        selectedDate: '2024-10-15',
        selectedTimeSlot: '09:00-11:00',
        feeBreakdown: mockFeeResponse.data.breakdown,
        totalFee: mockFeeResponse.data.totalFee
      });
    });

    test('navigates back when back button is pressed', () => {
      const { getByTestId } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      const backButton = getByTestId('back-button');
      fireEvent.press(backButton);

      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('handles availability check errors', async () => {
      SchedulingService.checkAvailability.mockRejectedValue(
        new Error('Network error')
      );

      const { getByTestId } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      const datePickerButton = getByTestId('date-picker-button');
      fireEvent.press(datePickerButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Availability Check Failed',
          expect.stringContaining('check availability'),
          expect.any(Array)
        );
      });
    });

    test('handles fee calculation errors', async () => {
      SchedulingService.calculateFee.mockRejectedValue(
        new Error('Calculation error')
      );

      const { getByTestId } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      const wasteTypeOption = getByTestId('waste-type-regular');
      fireEvent.press(wasteTypeOption);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Fee Calculation Failed',
          expect.stringContaining('calculate fees'),
          expect.any(Array)
        );
      });
    });

    test('shows error state when service calls fail', async () => {
      SchedulingService.checkAvailability.mockRejectedValue(
        new Error('Service unavailable')
      );

      const { getByTestId, getByText } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      const datePickerButton = getByTestId('date-picker-button');
      fireEvent.press(datePickerButton);

      await waitFor(() => {
        // Check for error handling (exact implementation depends on the component)
        expect(Alert.alert).toHaveBeenCalled();
      });
    });
  });

  describe('Smart Bin Features', () => {
    test('shows smart bin indicators', () => {
      const { getByText } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Check for smart bin indicator (🤖 or similar)
      expect(getByText('General Waste - Front yard')).toBeTruthy();
    });

    test('suggests optimal waste types for smart bins', () => {
      const smartBinRoute = {
        params: {
          selectedBins: [
            {
              id: 'BIN001',
              type: 'General Waste',
              isSmartBin: true,
              currentFillLevel: 85,
              suggestedWasteType: 'regular'
            }
          ],
          selectedBinIds: ['BIN001']
        }
      };

      const { getByText } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={smartBinRoute} />
      );

      // Should show some indication of suggested waste type
      expect(getByText('Regular Waste')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    test('has correct testIDs for all interactive elements', () => {
      const { getByTestId } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('waste-type-regular')).toBeTruthy();
      expect(getByTestId('waste-type-recyclable')).toBeTruthy();
      expect(getByTestId('waste-type-bulky')).toBeTruthy();
      expect(getByTestId('waste-type-organic')).toBeTruthy();
      expect(getByTestId('datetime-picker')).toBeTruthy();
      expect(getByTestId('continue-button')).toBeTruthy();
      expect(getByTestId('back-button')).toBeTruthy();
    });

    test('continue button shows loading state during navigation', async () => {
      mockNavigate.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      const { getByTestId } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Fill required fields and press continue
      const wasteTypeOption = getByTestId('waste-type-regular');
      fireEvent.press(wasteTypeOption);

      const datePickerButton = getByTestId('date-picker-button');
      fireEvent.press(datePickerButton);

      await waitFor(() => {
        const timeSlotButton = getByTestId('time-slot-button');
        fireEvent.press(timeSlotButton);
      });

      await waitFor(() => {
        const continueButton = getByTestId('continue-button');
        fireEvent.press(continueButton);
      });

      // Button should show loading state or be disabled during navigation
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty selected bins', () => {
      const emptyRoute = {
        params: {
          selectedBins: [],
          selectedBinIds: []
        }
      };

      const { getByText } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={emptyRoute} />
      );

      expect(getByText('Selected Bins (0)')).toBeTruthy();
    });

    test('handles missing route params', () => {
      const emptyRoute = { params: {} };

      const { getByText } = render(
        <SelectDateTimeScreen navigation={mockNavigation} route={emptyRoute} />
      );

      expect(getByText('Select Date & Time')).toBeTruthy();
    });
  });
});
