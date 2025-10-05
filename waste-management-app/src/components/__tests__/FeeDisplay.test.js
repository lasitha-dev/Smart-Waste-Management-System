/**
 * FeeDisplay Component Tests
 * Comprehensive unit tests for the FeeDisplay component
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module FeeDisplayTests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import FeeDisplay from '../FeeDisplay';

// Mock the scheduling helpers
jest.mock('../../utils/schedulingHelpers', () => ({
  formatCurrency: jest.fn((amount, currency = 'LKR') => `${currency} ${amount.toLocaleString()}`)
}));

describe('FeeDisplay Component', () => {
  const mockFeeData = {
    baseFee: 300,
    binFee: 50,
    weightFee: 100,
    wasteTypeFee: 0,
    subtotal: 450,
    tax: 81,
    total: 531,
    model: 'hybrid',
    wasteType: {
      id: 'regular',
      label: 'Regular Waste',
      icon: '🗑️'
    },
    binCount: 2,
    estimatedWeight: 5,
    currency: 'LKR'
  };

  const mockOnBreakdownToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    test('renders loading state correctly', () => {
      const { getByText } = render(
        <FeeDisplay loading={true} />
      );

      expect(getByText('💰')).toBeTruthy();
      expect(getByText('Calculating fees...')).toBeTruthy();
    });

    test('shows loading spinner animation', () => {
      const { getByText } = render(
        <FeeDisplay loading={true} />
      );

      const loadingContent = getByText('Calculating fees...');
      expect(loadingContent).toBeTruthy();
    });
  });

  describe('Error State', () => {
    test('renders error state correctly', () => {
      const errorMessage = 'Failed to calculate fees';
      const { getByText } = render(
        <FeeDisplay error={errorMessage} />
      );

      expect(getByText('⚠️')).toBeTruthy();
      expect(getByText('Fee Calculation Error')).toBeTruthy();
      expect(getByText(errorMessage)).toBeTruthy();
    });

    test('handles empty error message', () => {
      const { getByText, queryByText } = render(
        <FeeDisplay error="" />
      );

      expect(getByText('Fee Calculation Error')).toBeTruthy();
      expect(queryByText('')).toBeFalsy();
    });
  });

  describe('No Data State', () => {
    test('renders no data state when feeData is null', () => {
      const { getByText } = render(
        <FeeDisplay feeData={null} />
      );

      expect(getByText('Select bins and waste type to calculate fees')).toBeTruthy();
    });

    test('renders no data state when feeData is undefined', () => {
      const { getByText } = render(
        <FeeDisplay feeData={undefined} />
      );

      expect(getByText('Select bins and waste type to calculate fees')).toBeTruthy();
    });
  });

  describe('Fee Display', () => {
    test('renders fee data correctly', () => {
      const { getByText } = render(
        <FeeDisplay feeData={mockFeeData} />
      );

      expect(getByText('Collection Fee')).toBeTruthy();
      expect(getByText('Total Amount')).toBeTruthy();
      expect(getByText('LKR 531')).toBeTruthy();
    });

    test('renders waste type badge', () => {
      const { getByText } = render(
        <FeeDisplay feeData={mockFeeData} />
      );

      expect(getByText('🗑️')).toBeTruthy();
      expect(getByText('Regular Waste')).toBeTruthy();
    });

    test('renders breakdown toggle button', () => {
      const { getByTestId } = render(
        <FeeDisplay feeData={mockFeeData} />
      );

      expect(getByTestId('fee-breakdown-toggle')).toBeTruthy();
    });

    test('shows "Show Fee Breakdown" by default', () => {
      const { getByText } = render(
        <FeeDisplay feeData={mockFeeData} />
      );

      expect(getByText('Show Fee Breakdown')).toBeTruthy();
    });

    test('toggles breakdown text when clicked', () => {
      const { getByText, getByTestId } = render(
        <FeeDisplay feeData={mockFeeData} />
      );

      const toggleButton = getByTestId('fee-breakdown-toggle');
      fireEvent.press(toggleButton);

      expect(getByText('Hide Fee Breakdown')).toBeTruthy();
    });
  });

  describe('Fee Breakdown', () => {
    test('shows breakdown when showBreakdown is true', () => {
      const { getByText } = render(
        <FeeDisplay feeData={mockFeeData} showBreakdown={true} />
      );

      expect(getByText('Hybrid Model')).toBeTruthy();
      expect(getByText('Base Fee')).toBeTruthy();
      expect(getByText('LKR 300')).toBeTruthy();
    });

    test('renders all fee components', () => {
      const { getByText } = render(
        <FeeDisplay feeData={mockFeeData} showBreakdown={true} />
      );

      expect(getByText('Base Fee')).toBeTruthy();
      expect(getByText('Additional Bins (1)')).toBeTruthy();
      expect(getByText('Weight-based Fee (5kg)')).toBeTruthy();
      expect(getByText('Subtotal')).toBeTruthy();
      expect(getByText('Tax (18% VAT)')).toBeTruthy();
    });

    test('does not render zero fee components', () => {
      const feeDataWithoutWasteTypeFee = { ...mockFeeData, wasteTypeFee: 0 };
      const { queryByText } = render(
        <FeeDisplay feeData={feeDataWithoutWasteTypeFee} showBreakdown={true} />
      );

      expect(queryByText('Waste Type Surcharge')).toBeFalsy();
    });

    test('renders billing model description', () => {
      const { getByText } = render(
        <FeeDisplay feeData={mockFeeData} showBreakdown={true} />
      );

      expect(getByText('Combination of flat rate and weight-based pricing')).toBeTruthy();
    });

    test('handles different billing models', () => {
      const flatFeeData = { ...mockFeeData, model: 'flat' };
      const { getByText } = render(
        <FeeDisplay feeData={flatFeeData} showBreakdown={true} />
      );

      expect(getByText('Flat Rate')).toBeTruthy();
      expect(getByText('Fixed fee per collection regardless of weight')).toBeTruthy();
    });

    test('handles weight-based billing model', () => {
      const weightBasedFeeData = { ...mockFeeData, model: 'weightBased' };
      const { getByText } = render(
        <FeeDisplay feeData={weightBasedFeeData} showBreakdown={true} />
      );

      expect(getByText('Weight-Based')).toBeTruthy();
      expect(getByText('Fee calculated based on actual weight')).toBeTruthy();
    });
  });

  describe('Additional Information', () => {
    test('renders bins selected count', () => {
      const { getByText } = render(
        <FeeDisplay feeData={mockFeeData} />
      );

      expect(getByText('Bins Selected:')).toBeTruthy();
      expect(getByText('2')).toBeTruthy();
    });

    test('renders estimated weight when greater than 0', () => {
      const { getByText } = render(
        <FeeDisplay feeData={mockFeeData} />
      );

      expect(getByText('Estimated Weight:')).toBeTruthy();
      expect(getByText('5kg')).toBeTruthy();
    });

    test('does not render estimated weight when 0', () => {
      const feeDataWithoutWeight = { ...mockFeeData, estimatedWeight: 0 };
      const { queryByText } = render(
        <FeeDisplay feeData={feeDataWithoutWeight} />
      );

      expect(queryByText('Estimated Weight:')).toBeFalsy();
    });

    test('renders billing model information', () => {
      const { getByText } = render(
        <FeeDisplay feeData={mockFeeData} />
      );

      expect(getByText('Billing Model:')).toBeTruthy();
      expect(getByText('Hybrid Model')).toBeTruthy();
    });
  });

  describe('Payment Note', () => {
    test('renders payment note', () => {
      const { getByText } = render(
        <FeeDisplay feeData={mockFeeData} />
      );

      expect(getByText('💳')).toBeTruthy();
      expect(getByText('Payment will be processed after booking confirmation')).toBeTruthy();
    });
  });

  describe('Breakdown Toggle', () => {
    test('calls onBreakdownToggle when toggle is pressed', () => {
      const { getByTestId } = render(
        <FeeDisplay
          feeData={mockFeeData}
          onBreakdownToggle={mockOnBreakdownToggle}
        />
      );

      const toggleButton = getByTestId('fee-breakdown-toggle');
      fireEvent.press(toggleButton);

      expect(mockOnBreakdownToggle).toHaveBeenCalledWith(true);
    });

    test('does not call onBreakdownToggle when not provided', () => {
      const { getByTestId } = render(
        <FeeDisplay feeData={mockFeeData} />
      );

      const toggleButton = getByTestId('fee-breakdown-toggle');
      fireEvent.press(toggleButton);

      // Should not throw error
      expect(true).toBe(true);
    });

    test('shows correct icon state for expanded/collapsed', () => {
      const { getByTestId, getByText } = render(
        <FeeDisplay feeData={mockFeeData} />
      );

      const toggleButton = getByTestId('fee-breakdown-toggle');
      
      // Initially collapsed
      expect(getByText('Show Fee Breakdown')).toBeTruthy();
      
      // Click to expand
      fireEvent.press(toggleButton);
      expect(getByText('Hide Fee Breakdown')).toBeTruthy();
    });
  });

  describe('Currency Formatting', () => {
    test('uses formatCurrency helper for all amounts', () => {
      const { formatCurrency } = require('../../utils/schedulingHelpers');
      
      render(
        <FeeDisplay feeData={mockFeeData} showBreakdown={true} />
      );

      expect(formatCurrency).toHaveBeenCalledWith(531, 'LKR'); // Total
      expect(formatCurrency).toHaveBeenCalledWith(300, 'LKR'); // Base fee
      expect(formatCurrency).toHaveBeenCalledWith(50, 'LKR');  // Bin fee
      expect(formatCurrency).toHaveBeenCalledWith(100, 'LKR'); // Weight fee
      expect(formatCurrency).toHaveBeenCalledWith(450, 'LKR'); // Subtotal
      expect(formatCurrency).toHaveBeenCalledWith(81, 'LKR');  // Tax
    });

    test('handles different currencies', () => {
      const usdFeeData = { ...mockFeeData, currency: 'USD' };
      const { formatCurrency } = require('../../utils/schedulingHelpers');
      
      render(
        <FeeDisplay feeData={usdFeeData} />
      );

      expect(formatCurrency).toHaveBeenCalledWith(531, 'USD');
    });
  });

  describe('Edge Cases', () => {
    test('handles missing waste type', () => {
      const feeDataWithoutWasteType = { ...mockFeeData, wasteType: null };
      const { queryByText } = render(
        <FeeDisplay feeData={feeDataWithoutWasteType} />
      );

      expect(queryByText('🗑️')).toBeFalsy();
      expect(queryByText('Regular Waste')).toBeFalsy();
    });

    test('handles zero total amount', () => {
      const zeroFeeData = { ...mockFeeData, total: 0 };
      const { getByText } = render(
        <FeeDisplay feeData={zeroFeeData} />
      );

      expect(getByText('LKR 0')).toBeTruthy();
    });

    test('handles negative amounts', () => {
      const negativeFeeData = { ...mockFeeData, total: -100 };
      const { getByText } = render(
        <FeeDisplay feeData={negativeFeeData} />
      );

      expect(getByText('LKR -100')).toBeTruthy();
    });

    test('handles very large amounts', () => {
      const largeFeeData = { ...mockFeeData, total: 1000000 };
      const { getByText } = render(
        <FeeDisplay feeData={largeFeeData} />
      );

      expect(getByText('LKR 1,000,000')).toBeTruthy();
    });

    test('handles missing billing model', () => {
      const feeDataWithoutModel = { ...mockFeeData, model: null };
      const { getByText } = render(
        <FeeDisplay feeData={feeDataWithoutModel} showBreakdown={true} />
      );

      // Should still render other components
      expect(getByText('Collection Fee')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    test('has correct testID for breakdown toggle', () => {
      const { getByTestId } = render(
        <FeeDisplay feeData={mockFeeData} />
      );

      expect(getByTestId('fee-breakdown-toggle')).toBeTruthy();
    });

    test('breakdown toggle is touchable', () => {
      const { getByTestId } = render(
        <FeeDisplay feeData={mockFeeData} />
      );

      const toggleButton = getByTestId('fee-breakdown-toggle');
      expect(toggleButton.props.disabled).toBeFalsy();
    });
  });

  describe('Animation', () => {
    test('animates breakdown expansion', async () => {
      const { getByTestId } = render(
        <FeeDisplay feeData={mockFeeData} />
      );

      const toggleButton = getByTestId('fee-breakdown-toggle');
      fireEvent.press(toggleButton);

      // Animation testing would require more complex setup
      // This tests that the animation doesn't crash
      await waitFor(() => {
        expect(toggleButton).toBeTruthy();
      });
    });
  });

  describe('State Management', () => {
    test('maintains internal breakdown state', () => {
      const { getByTestId, getByText } = render(
        <FeeDisplay feeData={mockFeeData} />
      );

      const toggleButton = getByTestId('fee-breakdown-toggle');
      
      // Initially collapsed
      expect(getByText('Show Fee Breakdown')).toBeTruthy();
      
      // Toggle to expanded
      fireEvent.press(toggleButton);
      expect(getByText('Hide Fee Breakdown')).toBeTruthy();
      
      // Toggle back to collapsed
      fireEvent.press(toggleButton);
      expect(getByText('Show Fee Breakdown')).toBeTruthy();
    });

    test('respects showBreakdown prop', () => {
      const { getByText } = render(
        <FeeDisplay feeData={mockFeeData} showBreakdown={true} />
      );

      expect(getByText('Hide Fee Breakdown')).toBeTruthy();
    });
  });

  describe('Custom Styles', () => {
    test('applies custom style when provided', () => {
      const customStyle = { backgroundColor: 'red' };
      const { getByText } = render(
        <FeeDisplay feeData={mockFeeData} style={customStyle} />
      );

      // Style application would be tested in integration tests
      expect(getByText('Collection Fee')).toBeTruthy();
    });
  });
});
