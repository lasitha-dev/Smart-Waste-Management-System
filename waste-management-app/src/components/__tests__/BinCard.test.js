/**
 * BinCard Component Tests
 * Comprehensive unit tests for the enhanced BinCard component
 * 
 * @author Kumarasinghe S.S (IT22221414)
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import BinCard from '../components/BinCard';
import { mockBin, simulatePress } from '../__tests__/testUtils';

// Mock react-native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

describe('BinCard', () => {
  const defaultProps = {
    bin: mockBin,
    selected: false,
    onPress: jest.fn(),
    disabled: false,
    showWeight: false,
    loading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('renders correctly with default props', () => {
      const { getByText } = render(<BinCard {...defaultProps} />);
      
      expect(getByText('General Waste')).toBeTruthy();
      expect(getByText('Front Yard')).toBeTruthy();
      expect(getByText('120L')).toBeTruthy();
      expect(getByText('Active')).toBeTruthy();
    });

    it('does not render when bin is null', () => {
      const { container } = render(
        <BinCard {...defaultProps} bin={null} />
      );
      
      expect(container.children).toHaveLength(0);
    });

    it('does not render when bin is undefined', () => {
      const { container } = render(
        <BinCard {...defaultProps} bin={undefined} />
      );
      
      expect(container.children).toHaveLength(0);
    });
  });

  describe('Bin Information Display', () => {
    it('displays bin type with correct icon', () => {
      const { getByText } = render(<BinCard {...defaultProps} />);
      
      expect(getByText('🗑️')).toBeTruthy(); // General Waste icon
      expect(getByText('General Waste')).toBeTruthy();
    });

    it('displays different bin types with correct icons', () => {
      const recyclableBin = { ...mockBin, type: 'Recyclable' };
      
      const { getByText } = render(
        <BinCard {...defaultProps} bin={recyclableBin} />
      );
      
      expect(getByText('♻️')).toBeTruthy(); // Recyclable icon
      expect(getByText('Recyclable')).toBeTruthy();
    });

    it('displays bin location', () => {
      const { getByText } = render(<BinCard {...defaultProps} />);
      
      expect(getByText('Location:')).toBeTruthy();
      expect(getByText('Front Yard')).toBeTruthy();
    });

    it('displays bin capacity', () => {
      const { getByText } = render(<BinCard {...defaultProps} />);
      
      expect(getByText('Capacity:')).toBeTruthy();
      expect(getByText('120L')).toBeTruthy();
    });

    it('displays bin status', () => {
      const { getByText } = render(<BinCard {...defaultProps} />);
      
      expect(getByText('Status:')).toBeTruthy();
      expect(getByText('Active')).toBeTruthy();
    });

    it('displays estimated weight when showWeight is true', () => {
      const { getByText } = render(
        <BinCard {...defaultProps} showWeight={true} />
      );
      
      expect(getByText('Est. Weight:')).toBeTruthy();
      expect(getByText(/kg/)).toBeTruthy();
    });

    it('does not display estimated weight when showWeight is false', () => {
      const { queryByText } = render(
        <BinCard {...defaultProps} showWeight={false} />
      );
      
      expect(queryByText('Est. Weight:')).toBeNull();
    });
  });

  describe('Fill Level Display', () => {
    it('displays fill level percentage', () => {
      const { getByText } = render(<BinCard {...defaultProps} />);
      
      expect(getByText('Fill Level')).toBeTruthy();
      expect(getByText('75%')).toBeTruthy();
    });

    it('displays progress bar for fill level', () => {
      const { container } = render(<BinCard {...defaultProps} />);
      
      expect(container).toBeTruthy();
    });

    it('uses appropriate color for high fill level', () => {
      const highFillBin = { ...mockBin, currentFillLevel: 95 };
      
      const { container } = render(
        <BinCard {...defaultProps} bin={highFillBin} />
      );
      
      expect(container).toBeTruthy();
    });

    it('uses appropriate color for medium fill level', () => {
      const mediumFillBin = { ...mockBin, currentFillLevel: 60 };
      
      const { container } = render(
        <BinCard {...defaultProps} bin={mediumFillBin} />
      );
      
      expect(container).toBeTruthy();
    });

    it('uses appropriate color for low fill level', () => {
      const lowFillBin = { ...mockBin, currentFillLevel: 30 };
      
      const { container } = render(
        <BinCard {...defaultProps} bin={lowFillBin} />
      );
      
      expect(container).toBeTruthy();
    });
  });

  describe('Smart Bin Features', () => {
    it('displays smart bin badge when bin is smart', () => {
      const { getByText } = render(<BinCard {...defaultProps} />);
      
      expect(getByText('📱 Smart Bin')).toBeTruthy();
    });

    it('does not display smart bin badge when bin is not smart', () => {
      const regularBin = { ...mockBin, isSmartBin: false };
      
      const { queryByText } = render(
        <BinCard {...defaultProps} bin={regularBin} />
      );
      
      expect(queryByText('📱 Smart Bin')).toBeNull();
    });

    it('displays sensor status', () => {
      const { getByText } = render(<BinCard {...defaultProps} />);
      
      expect(getByText('Sensor: ON')).toBeTruthy();
    });

    it('displays sensor off status', () => {
      const binWithSensorOff = { ...mockBin, sensorEnabled: false };
      
      const { getByText } = render(
        <BinCard {...defaultProps} bin={binWithSensorOff} />
      );
      
      expect(getByText('Sensor: OFF')).toBeTruthy();
    });

    it('displays auto-pickup threshold', () => {
      const { getByText } = render(<BinCard {...defaultProps} />);
      
      expect(getByText('Auto-pickup at 85%')).toBeTruthy();
    });
  });

  describe('Auto-Pickup Badge', () => {
    it('shows auto-pickup badge for bins needing pickup', () => {
      const autoPickupBin = { 
        ...mockBin, 
        currentFillLevel: 90, 
        autoPickupThreshold: 85 
      };
      
      const { getByText } = render(
        <BinCard {...defaultProps} bin={autoPickupBin} />
      );
      
      expect(getByText('AUTO')).toBeTruthy();
    });

    it('does not show auto-pickup badge for bins not needing pickup', () => {
      const normalBin = { 
        ...mockBin, 
        currentFillLevel: 50, 
        autoPickupThreshold: 85 
      };
      
      const { queryByText } = render(
        <BinCard {...defaultProps} bin={normalBin} />
      );
      
      expect(queryByText('AUTO')).toBeNull();
    });
  });

  describe('Selection State', () => {
    it('shows checkmark when selected', () => {
      const { getByText } = render(
        <BinCard {...defaultProps} selected={true} />
      );
      
      expect(getByText('✓')).toBeTruthy();
    });

    it('does not show checkmark when not selected', () => {
      const { queryByText } = render(
        <BinCard {...defaultProps} selected={false} />
      );
      
      expect(queryByText('✓')).toBeNull();
    });

    it('applies selected styling when selected', () => {
      const { container } = render(
        <BinCard {...defaultProps} selected={true} />
      );
      
      expect(container).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('shows loading indicator when loading', () => {
      const { container } = render(
        <BinCard {...defaultProps} loading={true} />
      );
      
      expect(container).toBeTruthy();
    });

    it('shows loading overlay when loading', () => {
      const { getByText } = render(
        <BinCard {...defaultProps} loading={true} />
      );
      
      expect(getByText('Processing...')).toBeTruthy();
    });

    it('hides selection indicators when loading', () => {
      const { queryByText } = render(
        <BinCard {...defaultProps} selected={true} loading={true} />
      );
      
      expect(queryByText('✓')).toBeNull();
    });

    it('applies loading styling when loading', () => {
      const { container } = render(
        <BinCard {...defaultProps} loading={true} />
      );
      
      expect(container).toBeTruthy();
    });
  });

  describe('Disabled State', () => {
    it('shows disabled overlay when disabled', () => {
      const { getByText } = render(
        <BinCard {...defaultProps} disabled={true} />
      );
      
      expect(getByText('Unavailable')).toBeTruthy();
    });

    it('applies disabled styling when disabled', () => {
      const { container } = render(
        <BinCard {...defaultProps} disabled={true} />
      );
      
      expect(container).toBeTruthy();
    });

    it('does not respond to press when disabled', () => {
      const onPressMock = jest.fn();
      
      const { getByTestId } = render(
        <BinCard 
          {...defaultProps} 
          disabled={true} 
          onPress={onPressMock}
        />
      );
      
      fireEvent.press(getByTestId(`bin-card-${mockBin.id}`));
      
      expect(onPressMock).not.toHaveBeenCalled();
    });
  });

  describe('Inactive Bin Status', () => {
    it('displays inactive status with appropriate styling', () => {
      const inactiveBin = { ...mockBin, status: 'Inactive' };
      
      const { getByText } = render(
        <BinCard {...defaultProps} bin={inactiveBin} />
      );
      
      expect(getByText('Inactive')).toBeTruthy();
    });

    it('applies disabled color for inactive bins', () => {
      const inactiveBin = { ...mockBin, status: 'Inactive' };
      
      const { container } = render(
        <BinCard {...defaultProps} bin={inactiveBin} />
      );
      
      expect(container).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('calls onPress when card is pressed', () => {
      const onPressMock = jest.fn();
      
      const { getByTestId } = render(
        <BinCard {...defaultProps} onPress={onPressMock} />
      );
      
      fireEvent.press(getByTestId(`bin-card-${mockBin.id}`));
      
      expect(onPressMock).toHaveBeenCalledWith(mockBin);
    });

    it('does not call onPress when loading', () => {
      const onPressMock = jest.fn();
      
      const { getByTestId } = render(
        <BinCard 
          {...defaultProps} 
          loading={true} 
          onPress={onPressMock}
        />
      );
      
      fireEvent.press(getByTestId(`bin-card-${mockBin.id}`));
      
      expect(onPressMock).not.toHaveBeenCalled();
    });

    it('animates on press', async () => {
      const onPressMock = jest.fn();
      
      const { getByTestId } = render(
        <BinCard {...defaultProps} onPress={onPressMock} />
      );
      
      fireEvent.press(getByTestId(`bin-card-${mockBin.id}`));
      
      // Fast-forward animation time
      jest.advanceTimersByTime(200);
      
      await waitFor(() => {
        expect(onPressMock).toHaveBeenCalledWith(mockBin);
      });
    });

    it('handles missing onPress gracefully', () => {
      const { getByTestId } = render(
        <BinCard {...defaultProps} onPress={undefined} />
      );
      
      expect(() => {
        fireEvent.press(getByTestId(`bin-card-${mockBin.id}`));
      }).not.toThrow();
    });
  });

  describe('Last Emptied Information', () => {
    it('displays last emptied date when available', () => {
      const { getByText } = render(<BinCard {...defaultProps} />);
      
      expect(getByText(/Last emptied:/)).toBeTruthy();
      expect(getByText(/10\/1\/2023/)).toBeTruthy();
    });

    it('does not display last emptied when not available', () => {
      const binWithoutLastEmptied = { 
        ...mockBin, 
        lastEmptied: null 
      };
      
      const { queryByText } = render(
        <BinCard {...defaultProps} bin={binWithoutLastEmptied} />
      );
      
      expect(queryByText(/Last emptied:/)).toBeNull();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom styles', () => {
      const customStyle = { marginTop: 20 };
      
      const { container } = render(
        <BinCard {...defaultProps} style={customStyle} />
      );
      
      expect(container).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles bin with zero fill level', () => {
      const emptyBin = { ...mockBin, currentFillLevel: 0 };
      
      const { getByText } = render(
        <BinCard {...defaultProps} bin={emptyBin} />
      );
      
      expect(getByText('0%')).toBeTruthy();
    });

    it('handles bin with 100% fill level', () => {
      const fullBin = { ...mockBin, currentFillLevel: 100 };
      
      const { getByText } = render(
        <BinCard {...defaultProps} bin={fullBin} />
      );
      
      expect(getByText('100%')).toBeTruthy();
    });

    it('handles bin with missing optional properties', () => {
      const minimalBin = {
        id: 'minimal-bin',
        type: 'General Waste',
        location: 'Test Location',
        capacity: 100,
        currentFillLevel: 50,
        status: 'Active'
      };
      
      const { getByText } = render(
        <BinCard {...defaultProps} bin={minimalBin} />
      );
      
      expect(getByText('General Waste')).toBeTruthy();
      expect(getByText('Test Location')).toBeTruthy();
    });

    it('handles unknown bin type gracefully', () => {
      const unknownTypeBin = { ...mockBin, type: 'Unknown Type' };
      
      const { getByText } = render(
        <BinCard {...defaultProps} bin={unknownTypeBin} />
      );
      
      expect(getByText('🗑️')).toBeTruthy(); // Default icon
      expect(getByText('Unknown Type')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has proper testID for testing', () => {
      const { getByTestId } = render(<BinCard {...defaultProps} />);
      
      expect(getByTestId(`bin-card-${mockBin.id}`)).toBeTruthy();
    });

    it('is accessible to screen readers', () => {
      const { getByText } = render(<BinCard {...defaultProps} />);
      
      // Important information should be accessible
      expect(getByText('General Waste')).toBeTruthy();
      expect(getByText('Front Yard')).toBeTruthy();
      expect(getByText('Active')).toBeTruthy();
    });
  });

  describe('Snapshot Tests', () => {
    it('matches snapshot for active bin', () => {
      const tree = render(<BinCard {...defaultProps} />);
      expect(tree).toMatchSnapshot();
    });

    it('matches snapshot for selected bin', () => {
      const tree = render(
        <BinCard {...defaultProps} selected={true} />
      );
      expect(tree).toMatchSnapshot();
    });

    it('matches snapshot for loading bin', () => {
      const tree = render(
        <BinCard {...defaultProps} loading={true} />
      );
      expect(tree).toMatchSnapshot();
    });

    it('matches snapshot for disabled bin', () => {
      const tree = render(
        <BinCard {...defaultProps} disabled={true} />
      );
      expect(tree).toMatchSnapshot();
    });

    it('matches snapshot for auto-pickup bin', () => {
      const autoPickupBin = { 
        ...mockBin, 
        currentFillLevel: 90, 
        autoPickupThreshold: 85 
      };
      
      const tree = render(
        <BinCard {...defaultProps} bin={autoPickupBin} />
      );
      expect(tree).toMatchSnapshot();
    });

    it('matches snapshot with weight display', () => {
      const tree = render(
        <BinCard {...defaultProps} showWeight={true} />
      );
      expect(tree).toMatchSnapshot();
    });
  });
});