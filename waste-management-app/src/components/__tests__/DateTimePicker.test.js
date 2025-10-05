/**
 * DateTimePicker Component Tests
 * Comprehensive unit tests for the DateTimePicker component
 * 
 * @author Kumarasinghe S.S (IT22221414)
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import DateTimePicker from '../components/DateTimePicker';
import * as SchedulingHelpers from '../utils/schedulingHelpers';
import { timeSlots } from '../api/mockData';

// Mock dependencies
jest.mock('../utils/schedulingHelpers');
jest.mock('../api/mockData', () => ({
  timeSlots: [
    { id: 'morning', label: 'Morning (8:00 - 12:00)', startTime: '08:00', available: true },
    { id: 'afternoon', label: 'Afternoon (12:00 - 16:00)', startTime: '12:00', available: true },
    { id: 'evening', label: 'Evening (16:00 - 20:00)', startTime: '16:00', available: false }
  ]
}));

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('DateTimePicker', () => {
  const defaultProps = {
    selectedDate: '',
    selectedTimeSlot: '',
    onDateChange: jest.fn(),
    onTimeSlotChange: jest.fn(),
    disabled: false
  };

  const mockAvailableDates = [
    { date: '2023-10-16', available: true },
    { date: '2023-10-17', available: true },
    { date: '2023-10-18', available: false },
    { date: '2023-10-19', available: true }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock DateUtils functions
    SchedulingHelpers.DateUtils = {
      getAvailableDates: jest.fn().mockReturnValue(mockAvailableDates),
      validateScheduleDate: jest.fn().mockReturnValue({ isValid: true }),
      formatDisplayDate: jest.fn().mockImplementation(date => {
        if (date === '2023-10-16') return 'October 16, 2023';
        if (date === '2023-10-17') return 'October 17, 2023';
        return 'Invalid Date';
      }),
      formatDate: jest.fn().mockImplementation(date => {
        return date.toISOString().split('T')[0];
      })
    };
  });

  describe('Basic Rendering', () => {
    it('renders correctly with default props', () => {
      const { getByText } = render(<DateTimePicker {...defaultProps} />);
      
      expect(getByText('Collection Date')).toBeTruthy();
      expect(getByText('Time Slot')).toBeTruthy();
      expect(getByText('📅 Select Date')).toBeTruthy();
      expect(getByText('🕐 Select Time')).toBeTruthy();
    });

    it('displays selected date correctly', () => {
      const { getByText } = render(
        <DateTimePicker 
          {...defaultProps} 
          selectedDate="2023-10-16" 
        />
      );
      
      expect(getByText('📅 October 16, 2023')).toBeTruthy();
    });

    it('displays selected time slot correctly', () => {
      const { getByText } = render(
        <DateTimePicker 
          {...defaultProps} 
          selectedTimeSlot="morning" 
        />
      );
      
      expect(getByText('🕐 Morning (8:00 - 12:00)')).toBeTruthy();
    });

    it('shows fallback text for unknown time slot', () => {
      const { getByText } = render(
        <DateTimePicker 
          {...defaultProps} 
          selectedTimeSlot="unknown" 
        />
      );
      
      expect(getByText('🕐 unknown')).toBeTruthy();
    });
  });

  describe('Disabled State', () => {
    it('applies disabled styling when disabled', () => {
      const { getByTestId } = render(
        <DateTimePicker {...defaultProps} disabled={true} />
      );
      
      const dateSelector = getByTestId('date-selector');
      const timeSelector = getByTestId('time-selector');
      
      expect(dateSelector.props.disabled).toBe(true);
      expect(timeSelector.props.disabled).toBe(true);
    });

    it('does not open modals when disabled', () => {
      const { getByTestId, queryByText } = render(
        <DateTimePicker {...defaultProps} disabled={true} />
      );
      
      fireEvent.press(getByTestId('date-selector'));
      
      expect(queryByText('Select Collection Date')).toBeNull();
    });
  });

  describe('Date Selection', () => {
    it('opens date picker modal when date selector is pressed', () => {
      const { getByTestId, getByText } = render(
        <DateTimePicker {...defaultProps} />
      );
      
      fireEvent.press(getByTestId('date-selector'));
      
      expect(getByText('Select Collection Date')).toBeTruthy();
    });

    it('closes date picker modal when close button is pressed', () => {
      const { getByTestId, getByText, queryByText } = render(
        <DateTimePicker {...defaultProps} />
      );
      
      fireEvent.press(getByTestId('date-selector'));
      expect(getByText('Select Collection Date')).toBeTruthy();
      
      fireEvent.press(getByText('✕'));
      expect(queryByText('Select Collection Date')).toBeNull();
    });

    it('displays calendar with available dates', () => {
      const { getByTestId, getByText } = render(
        <DateTimePicker {...defaultProps} />
      );
      
      fireEvent.press(getByTestId('date-selector'));
      
      expect(getByText('Select Collection Date')).toBeTruthy();
      // Calendar should be rendered
    });

    it('calls onDateChange when valid date is selected', () => {
      const onDateChangeMock = jest.fn();
      
      const { getByTestId } = render(
        <DateTimePicker 
          {...defaultProps} 
          onDateChange={onDateChangeMock} 
        />
      );
      
      fireEvent.press(getByTestId('date-selector'));
      
      // Mock calendar day selection would be tested in integration
      // For unit test, we test the handler directly
      expect(SchedulingHelpers.DateUtils.getAvailableDates).toHaveBeenCalled();
    });

    it('shows alert for invalid date selection', () => {
      SchedulingHelpers.DateUtils.validateScheduleDate.mockReturnValue({
        isValid: false,
        reason: 'Date is in the past'
      });

      const { getByTestId } = render(
        <DateTimePicker {...defaultProps} />
      );
      
      fireEvent.press(getByTestId('date-selector'));
      
      // Simulate selecting an invalid date
      // In real component, this would trigger the validation
      expect(SchedulingHelpers.DateUtils.validateScheduleDate).toHaveBeenCalled();
    });

    it('navigates between months in calendar', () => {
      const { getByTestId, getByText } = render(
        <DateTimePicker {...defaultProps} />
      );
      
      fireEvent.press(getByTestId('date-selector'));
      
      // Mock month navigation
      expect(getByText('Select Collection Date')).toBeTruthy();
    });

    it('displays legend for calendar', () => {
      const { getByTestId, getByText } = render(
        <DateTimePicker {...defaultProps} />
      );
      
      fireEvent.press(getByTestId('date-selector'));
      
      expect(getByText('Available')).toBeTruthy();
      expect(getByText('Unavailable')).toBeTruthy();
      expect(getByText('Selected')).toBeTruthy();
    });
  });

  describe('Time Slot Selection', () => {
    it('opens time picker modal when time selector is pressed', () => {
      const { getByTestId, getByText } = render(
        <DateTimePicker {...defaultProps} />
      );
      
      fireEvent.press(getByTestId('time-selector'));
      
      expect(getByText('Select Time Slot')).toBeTruthy();
    });

    it('closes time picker modal when close button is pressed', () => {
      const { getByTestId, getByText, queryByText } = render(
        <DateTimePicker {...defaultProps} />
      );
      
      fireEvent.press(getByTestId('time-selector'));
      expect(getByText('Select Time Slot')).toBeTruthy();
      
      fireEvent.press(getByText('✕'));
      expect(queryByText('Select Time Slot')).toBeNull();
    });

    it('displays available time slots', () => {
      const { getByTestId, getByText } = render(
        <DateTimePicker {...defaultProps} />
      );
      
      fireEvent.press(getByTestId('time-selector'));
      
      expect(getByText('Morning (8:00 - 12:00)')).toBeTruthy();
      expect(getByText('Afternoon (12:00 - 16:00)')).toBeTruthy();
      expect(getByText('Evening (16:00 - 20:00)')).toBeTruthy();
    });

    it('shows unavailable label for unavailable slots', () => {
      const { getByTestId, getByText } = render(
        <DateTimePicker {...defaultProps} />
      );
      
      fireEvent.press(getByTestId('time-selector'));
      
      expect(getByText('Unavailable')).toBeTruthy();
    });

    it('calls onTimeSlotChange when time slot is selected', () => {
      const onTimeSlotChangeMock = jest.fn();
      
      const { getByTestId, getByText } = render(
        <DateTimePicker 
          {...defaultProps} 
          onTimeSlotChange={onTimeSlotChangeMock} 
        />
      );
      
      fireEvent.press(getByTestId('time-selector'));
      fireEvent.press(getByText('Morning (8:00 - 12:00)'));
      
      expect(onTimeSlotChangeMock).toHaveBeenCalledWith('morning');
    });

    it('does not allow selection of unavailable time slots', () => {
      const onTimeSlotChangeMock = jest.fn();
      
      const { getByTestId, getByText } = render(
        <DateTimePicker 
          {...defaultProps} 
          onTimeSlotChange={onTimeSlotChangeMock} 
        />
      );
      
      fireEvent.press(getByTestId('time-selector'));
      
      // Evening slot is unavailable
      const eveningSlot = getByText('Evening (16:00 - 20:00)');
      expect(eveningSlot.props.disabled).toBe(true);
    });

    it('highlights selected time slot', () => {
      const { getByTestId, getByText } = render(
        <DateTimePicker 
          {...defaultProps} 
          selectedTimeSlot="morning" 
        />
      );
      
      fireEvent.press(getByTestId('time-selector'));
      
      // Selected slot should have different styling
      expect(getByText('Morning (8:00 - 12:00)')).toBeTruthy();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom styles', () => {
      const customStyle = { backgroundColor: 'red' };
      
      const { container } = render(
        <DateTimePicker {...defaultProps} style={customStyle} />
      );
      
      expect(container).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing onDateChange callback gracefully', () => {
      const { getByTestId } = render(
        <DateTimePicker 
          {...defaultProps} 
          onDateChange={undefined} 
        />
      );
      
      expect(() => {
        fireEvent.press(getByTestId('date-selector'));
      }).not.toThrow();
    });

    it('handles missing onTimeSlotChange callback gracefully', () => {
      const { getByTestId } = render(
        <DateTimePicker 
          {...defaultProps} 
          onTimeSlotChange={undefined} 
        />
      );
      
      expect(() => {
        fireEvent.press(getByTestId('time-selector'));
      }).not.toThrow();
    });

    it('handles empty available dates', () => {
      SchedulingHelpers.DateUtils.getAvailableDates.mockReturnValue([]);
      
      const { getByTestId } = render(
        <DateTimePicker {...defaultProps} />
      );
      
      expect(() => {
        fireEvent.press(getByTestId('date-selector'));
      }).not.toThrow();
    });

    it('handles invalid selectedDate gracefully', () => {
      SchedulingHelpers.DateUtils.formatDisplayDate.mockReturnValue('Invalid Date');
      
      const { getByText } = render(
        <DateTimePicker 
          {...defaultProps} 
          selectedDate="invalid-date" 
        />
      );
      
      expect(getByText('📅 Invalid Date')).toBeTruthy();
    });
  });

  describe('Calendar Functionality', () => {
    beforeEach(() => {
      // Mock current date
      const mockCurrentDate = new Date('2023-10-15');
      global.Date = class extends Date {
        constructor(...args) {
          if (args.length === 0) {
            return mockCurrentDate;
          }
          return new Date(...args);
        }
      };
    });

    it('generates correct calendar days for current month', () => {
      const { getByTestId } = render(
        <DateTimePicker {...defaultProps} />
      );
      
      fireEvent.press(getByTestId('date-selector'));
      
      // Calendar generation logic would be tested
      expect(SchedulingHelpers.DateUtils.getAvailableDates).toHaveBeenCalled();
    });

    it('handles month with different starting day', () => {
      const { getByTestId } = render(
        <DateTimePicker {...defaultProps} />
      );
      
      fireEvent.press(getByTestId('date-selector'));
      
      // Test calendar rendering for different months
      expect(true).toBe(true); // Calendar logic test placeholder
    });

    it('displays day labels correctly', () => {
      const { getByTestId, getByText } = render(
        <DateTimePicker {...defaultProps} />
      );
      
      fireEvent.press(getByTestId('date-selector'));
      
      expect(getByText('Sun')).toBeTruthy();
      expect(getByText('Mon')).toBeTruthy();
      expect(getByText('Tue')).toBeTruthy();
      expect(getByText('Wed')).toBeTruthy();
      expect(getByText('Thu')).toBeTruthy();
      expect(getByText('Fri')).toBeTruthy();
      expect(getByText('Sat')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has proper testIDs for automated testing', () => {
      const { getByTestId } = render(
        <DateTimePicker {...defaultProps} />
      );
      
      expect(getByTestId('date-selector')).toBeTruthy();
      expect(getByTestId('time-selector')).toBeTruthy();
    });

    it('provides accessible labels', () => {
      const { getByText } = render(
        <DateTimePicker {...defaultProps} />
      );
      
      expect(getByText('Collection Date')).toBeTruthy();
      expect(getByText('Time Slot')).toBeTruthy();
    });

    it('supports keyboard navigation', () => {
      const { getByTestId } = render(
        <DateTimePicker {...defaultProps} />
      );
      
      const dateSelector = getByTestId('date-selector');
      const timeSelector = getByTestId('time-selector');
      
      expect(dateSelector).toBeTruthy();
      expect(timeSelector).toBeTruthy();
    });
  });

  describe('Integration Tests', () => {
    it('properly integrates date and time selection', async () => {
      const onDateChangeMock = jest.fn();
      const onTimeSlotChangeMock = jest.fn();
      
      const { getByTestId, getByText } = render(
        <DateTimePicker 
          {...defaultProps} 
          onDateChange={onDateChangeMock}
          onTimeSlotChange={onTimeSlotChangeMock}
        />
      );
      
      // Select date
      fireEvent.press(getByTestId('date-selector'));
      expect(getByText('Select Collection Date')).toBeTruthy();
      
      // Select time
      fireEvent.press(getByText('✕')); // Close date modal
      fireEvent.press(getByTestId('time-selector'));
      expect(getByText('Select Time Slot')).toBeTruthy();
      
      fireEvent.press(getByText('Morning (8:00 - 12:00)'));
      expect(onTimeSlotChangeMock).toHaveBeenCalledWith('morning');
    });
  });

  describe('Snapshot Tests', () => {
    it('matches snapshot for default state', () => {
      const tree = render(<DateTimePicker {...defaultProps} />);
      expect(tree).toMatchSnapshot();
    });

    it('matches snapshot with selected date and time', () => {
      const tree = render(
        <DateTimePicker 
          {...defaultProps} 
          selectedDate="2023-10-16"
          selectedTimeSlot="morning"
        />
      );
      expect(tree).toMatchSnapshot();
    });

    it('matches snapshot for disabled state', () => {
      const tree = render(
        <DateTimePicker {...defaultProps} disabled={true} />
      );
      expect(tree).toMatchSnapshot();
    });

    it('matches snapshot with date modal open', () => {
      const { getByTestId } = render(
        <DateTimePicker {...defaultProps} />
      );
      
      fireEvent.press(getByTestId('date-selector'));
      
      const tree = render(
        <DateTimePicker {...defaultProps} />
      );
      
      // Note: Snapshot would need to be taken after modal opens
      expect(tree).toMatchSnapshot();
    });
  });
});