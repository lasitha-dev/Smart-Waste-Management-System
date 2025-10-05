/**
 * SchedulePickup Screen Tests  
 * Comprehensive unit tests for the enhanced SchedulePickup screen
 * 
 * @author Kumarasinghe S.S (IT22221414)
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import SchedulePickupScreen from '../screens/Scheduling/SchedulePickup';
import SchedulingService from '../api/schedulingService';
import { ToastManager } from '../components/Toast';
import { 
  mockNavigation, 
  mockRoute, 
  mockBins, 
  mockSuccessResponse, 
  mockErrorResponse 
} from '../__tests__/testUtils';

// Mock dependencies
jest.mock('../api/schedulingService');
jest.mock('../components/Toast');
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('SchedulePickupScreen', () => {
  const defaultProps = {
    navigation: mockNavigation,
    route: mockRoute
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Reset mock implementations
    SchedulingService.getResidentBins = jest.fn();
    ToastManager.success = jest.fn();
    ToastManager.error = jest.fn();
    ToastManager.warning = jest.fn();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Component Initialization', () => {
    it('renders correctly', () => {
      SchedulingService.getResidentBins.mockResolvedValue(
        mockSuccessResponse({ bins: mockBins, autoPickupBins: [] })
      );

      const { getByText } = render(
        <SchedulePickupScreen {...defaultProps} />
      );

      expect(getByText('Schedule Waste Collection')).toBeTruthy();
    });

    it('loads bins on mount', () => {
      SchedulingService.getResidentBins.mockResolvedValue(
        mockSuccessResponse({ bins: mockBins, autoPickupBins: [] })
      );

      render(<SchedulePickupScreen {...defaultProps} />);

      expect(SchedulingService.getResidentBins).toHaveBeenCalledWith('resident-001');
    });

    it('shows loading state initially', () => {
      SchedulingService.getResidentBins.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { getByText } = render(
        <SchedulePickupScreen {...defaultProps} />
      );

      expect(getByText('Loading your bins...')).toBeTruthy();
    });
  });

  describe('Successful Bin Loading', () => {
    beforeEach(() => {
      SchedulingService.getResidentBins.mockResolvedValue(
        mockSuccessResponse({ 
          bins: mockBins, 
          autoPickupBins: [],
          hasAutoPickup: false
        })
      );
    });

    it('displays bins after successful load', async () => {
      const { getByText } = render(
        <SchedulePickupScreen {...defaultProps} />
      );

      await waitFor(() => {
        expect(getByText('General Waste')).toBeTruthy();
        expect(getByText('Recyclable')).toBeTruthy();
      });
    });

    it('shows correct bin count in header', async () => {
      const { getByText } = render(
        <SchedulePickupScreen {...defaultProps} />
      );

      await waitFor(() => {
        expect(getByText('Select bins for collection (0 selected)')).toBeTruthy();
      });
    });

    it('displays progress indicator', async () => {
      const { getByText } = render(
        <SchedulePickupScreen {...defaultProps} />
      );

      await waitFor(() => {
        expect(getByText('Step 1 of 3')).toBeTruthy();
      });
    });
  });

  describe('Auto-Pickup Functionality', () => {
    const autoPickupBins = [mockBins[2]]; // Organic bin with high fill level

    beforeEach(() => {
      SchedulingService.getResidentBins.mockResolvedValue(
        mockSuccessResponse({ 
          bins: mockBins, 
          autoPickupBins,
          hasAutoPickup: true
        })
      );
    });

    it('shows auto-pickup alert when bins need urgent pickup', async () => {
      render(<SchedulePickupScreen {...defaultProps} />);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          '🚨 Urgent Collection Required',
          expect.stringContaining('1 of your smart bins are nearly full'),
          expect.any(Array)
        );
      });
    });

    it('displays urgent notification in header', async () => {
      const { getByText } = render(
        <SchedulePickupScreen {...defaultProps} />
      );

      await waitFor(() => {
        expect(getByText('1 bin(s) need immediate pickup')).toBeTruthy();
      });
    });

    it('auto-selects bins that need pickup', async () => {
      const { getByText } = render(
        <SchedulePickupScreen {...defaultProps} />
      );

      await waitFor(() => {
        expect(getByText('Select bins for collection (1 selected)')).toBeTruthy();
      });
    });
  });

  describe('Bin Selection', () => {
    beforeEach(() => {
      SchedulingService.getResidentBins.mockResolvedValue(
        mockSuccessResponse({ 
          bins: mockBins, 
          autoPickupBins: [],
          hasAutoPickup: false
        })
      );
    });

    it('allows bin selection', async () => {
      const { getByTestId, getByText } = render(
        <SchedulePickupScreen {...defaultProps} />
      );

      await waitFor(() => {
        expect(getByTestId('bin-card-bin-001')).toBeTruthy();
      });

      fireEvent.press(getByTestId('bin-card-bin-001'));

      await waitFor(() => {
        expect(getByText('Select bins for collection (1 selected)')).toBeTruthy();
      });
    });

    it('allows bin deselection', async () => {
      const { getByTestId, getByText } = render(
        <SchedulePickupScreen {...defaultProps} />
      );

      await waitFor(() => {
        expect(getByTestId('bin-card-bin-001')).toBeTruthy();
      });

      // Select bin
      fireEvent.press(getByTestId('bin-card-bin-001'));

      await waitFor(() => {
        expect(getByText('Select bins for collection (1 selected)')).toBeTruthy();
      });

      // Deselect bin
      fireEvent.press(getByTestId('bin-card-bin-001'));

      await waitFor(() => {
        expect(getByText('Select bins for collection (0 selected)')).toBeTruthy();
      });
    });

    it('prevents selection of inactive bins', async () => {
      const inactiveBin = { ...mockBins[0], status: 'Inactive' };
      const binsWithInactive = [inactiveBin, ...mockBins.slice(1)];

      SchedulingService.getResidentBins.mockResolvedValue(
        mockSuccessResponse({ 
          bins: binsWithInactive, 
          autoPickupBins: [],
          hasAutoPickup: false
        })
      );

      const { getByTestId } = render(
        <SchedulePickupScreen {...defaultProps} />
      );

      await waitFor(() => {
        expect(getByTestId('bin-card-bin-001')).toBeTruthy();
      });

      fireEvent.press(getByTestId('bin-card-bin-001'));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Bin Unavailable',
        expect.stringContaining('inactive'),
        expect.any(Array)
      );
    });

    it('limits selection to maximum 5 bins', async () => {
      const manyBins = Array.from({ length: 6 }, (_, i) => ({
        ...mockBins[0],
        id: `bin-${i + 1}`,
        location: `Location ${i + 1}`
      }));

      SchedulingService.getResidentBins.mockResolvedValue(
        mockSuccessResponse({ 
          bins: manyBins, 
          autoPickupBins: [],
          hasAutoPickup: false
        })
      );

      const { getByTestId } = render(
        <SchedulePickupScreen {...defaultProps} />
      );

      await waitFor(() => {
        expect(getByTestId('bin-card-bin-1')).toBeTruthy();
      });

      // Select 5 bins
      for (let i = 1; i <= 5; i++) {
        fireEvent.press(getByTestId(`bin-card-bin-${i}`));
      }

      // Try to select 6th bin
      fireEvent.press(getByTestId('bin-card-bin-6'));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Selection Limit',
        'You can select a maximum of 5 bins per booking.',
        expect.any(Array)
      );
    });
  });

  describe('Continue Navigation', () => {
    beforeEach(() => {
      SchedulingService.getResidentBins.mockResolvedValue(
        mockSuccessResponse({ 
          bins: mockBins, 
          autoPickupBins: [],
          hasAutoPickup: false
        })
      );
    });

    it('shows warning when trying to continue without selection', async () => {
      const { getByTestId } = render(
        <SchedulePickupScreen {...defaultProps} />
      );

      await waitFor(() => {
        expect(getByTestId('continue-button')).toBeTruthy();
      });

      fireEvent.press(getByTestId('continue-button'));

      expect(ToastManager.warning).toHaveBeenCalledWith(
        'Please select at least one bin for collection.',
        'No Bins Selected'
      );
    });

    it('navigates to next screen when bins are selected', async () => {
      const { getByTestId } = render(
        <SchedulePickupScreen {...defaultProps} />
      );

      await waitFor(() => {
        expect(getByTestId('bin-card-bin-001')).toBeTruthy();
      });

      // Select a bin
      fireEvent.press(getByTestId('bin-card-bin-001'));

      await waitFor(() => {
        expect(getByTestId('continue-button')).toBeTruthy();
      });

      fireEvent.press(getByTestId('continue-button'));

      expect(ToastManager.success).toHaveBeenCalledWith(
        '1 bin selected successfully'
      );

      expect(mockNavigation.navigate).toHaveBeenCalledWith(
        'SelectDateTime',
        expect.objectContaining({
          selectedBinIds: ['bin-001']
        })
      );
    });

    it('disables continue button when no bins selected', async () => {
      const { getByTestId } = render(
        <SchedulePickupScreen {...defaultProps} />
      );

      await waitFor(() => {
        const continueButton = getByTestId('continue-button');
        expect(continueButton.props.accessibilityState?.disabled).toBe(true);
      });
    });

    it('enables continue button when bins are selected', async () => {
      const { getByTestId } = render(
        <SchedulePickupScreen {...defaultProps} />
      );

      await waitFor(() => {
        expect(getByTestId('bin-card-bin-001')).toBeTruthy();
      });

      fireEvent.press(getByTestId('bin-card-bin-001'));

      await waitFor(() => {
        const continueButton = getByTestId('continue-button');
        expect(continueButton.props.accessibilityState?.disabled).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error state when bin loading fails', async () => {
      SchedulingService.getResidentBins.mockRejectedValue(
        new Error('Network error')
      );

      const { getByText } = render(
        <SchedulePickupScreen {...defaultProps} />
      );

      await waitFor(() => {
        expect(getByText('Unable to Load Bins')).toBeTruthy();
      });
    });

    it('handles network errors specifically', async () => {
      const networkError = {
        code: 'NETWORK_ERROR',
        message: 'Network connection failed'
      };

      SchedulingService.getResidentBins.mockRejectedValue(networkError);

      render(<SchedulePickupScreen {...defaultProps} />);

      await waitFor(() => {
        expect(ToastManager.error).toHaveBeenCalledWith(
          'Please check your internet connection and try again.',
          'Connection Error'
        );
      });
    });

    it('handles business rule errors', async () => {
      const businessError = {
        code: 'BUSINESS_RULE_ERROR',
        message: 'Account inactive',
        details: {
          supportActions: ['Call +94 11 123 4567', 'Email support']
        }
      };

      SchedulingService.getResidentBins.mockRejectedValue(businessError);

      render(<SchedulePickupScreen {...defaultProps} />);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Account Support Required',
          'Account inactive',
          expect.any(Array)
        );
      });
    });

    it('handles timeout errors', async () => {
      const timeoutError = {
        code: 'TIMEOUT_ERROR',
        message: 'Request timed out'
      };

      SchedulingService.getResidentBins.mockRejectedValue(timeoutError);

      render(<SchedulePickupScreen {...defaultProps} />);

      await waitFor(() => {
        expect(ToastManager.error).toHaveBeenCalledWith(
          'The request is taking longer than expected. Please try again.',
          'Timeout Error'
        );
      });
    });

    it('shows retry options in error state', async () => {
      SchedulingService.getResidentBins.mockRejectedValue(
        new Error('Load failed')
      );

      const { getByText } = render(
        <SchedulePickupScreen {...defaultProps} />
      );

      await waitFor(() => {
        expect(getByText('Try Again')).toBeTruthy();
        expect(getByText('Contact Support')).toBeTruthy();
      });
    });

    it('retries loading when retry button is pressed', async () => {
      SchedulingService.getResidentBins
        .mockRejectedValueOnce(new Error('Load failed'))
        .mockResolvedValueOnce(
          mockSuccessResponse({ 
            bins: mockBins, 
            autoPickupBins: [],
            hasAutoPickup: false
          })
        );

      const { getByText } = render(
        <SchedulePickupScreen {...defaultProps} />
      );

      await waitFor(() => {
        expect(getByText('Try Again')).toBeTruthy();
      });

      fireEvent.press(getByText('Try Again'));

      await waitFor(() => {
        expect(getByText('General Waste')).toBeTruthy();
      });

      expect(SchedulingService.getResidentBins).toHaveBeenCalledTimes(2);
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no bins are available', async () => {
      SchedulingService.getResidentBins.mockResolvedValue(
        mockSuccessResponse({ 
          bins: [], 
          autoPickupBins: [],
          hasAutoPickup: false
        })
      );

      const { getByText } = render(
        <SchedulePickupScreen {...defaultProps} />
      );

      await waitFor(() => {
        expect(getByText('No Bins Available')).toBeTruthy();
        expect(getByText('Contact Support')).toBeTruthy();
      });
    });

    it('handles contact support action', async () => {
      SchedulingService.getResidentBins.mockResolvedValue(
        mockSuccessResponse({ 
          bins: [], 
          autoPickupBins: [],
          hasAutoPickup: false
        })
      );

      const { getByText } = render(
        <SchedulePickupScreen {...defaultProps} />
      );

      await waitFor(() => {
        expect(getByText('Contact Support')).toBeTruthy();
      });

      fireEvent.press(getByText('Contact Support'));

      expect(ToastManager.info).toHaveBeenCalledWith('Opening support...');
    });
  });

  describe('Pull to Refresh', () => {
    beforeEach(() => {
      SchedulingService.getResidentBins.mockResolvedValue(
        mockSuccessResponse({ 
          bins: mockBins, 
          autoPickupBins: [],
          hasAutoPickup: false
        })
      );
    });

    it('supports pull to refresh', async () => {
      const { getByTestId } = render(
        <SchedulePickupScreen {...defaultProps} />
      );

      await waitFor(() => {
        expect(getByText('General Waste')).toBeTruthy();
      });

      // Simulate pull to refresh
      const scrollView = getByTestId('bins-scroll-view');
      fireEvent(scrollView, 'refresh');

      await waitFor(() => {
        expect(ToastManager.success).toHaveBeenCalledWith(
          'Bins refreshed successfully'
        );
      });

      expect(SchedulingService.getResidentBins).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      SchedulingService.getResidentBins.mockResolvedValue(
        mockSuccessResponse({ 
          bins: mockBins, 
          autoPickupBins: [],
          hasAutoPickup: false
        })
      );
    });

    it('has proper accessibility labels', async () => {
      const { getByTestId } = render(
        <SchedulePickupScreen {...defaultProps} />
      );

      await waitFor(() => {
        expect(getByTestId('continue-button')).toBeTruthy();
      });

      const continueButton = getByTestId('continue-button');
      expect(continueButton).toBeTruthy();
    });

    it('announces selection changes to screen readers', async () => {
      const { getByTestId, getByText } = render(
        <SchedulePickupScreen {...defaultProps} />
      );

      await waitFor(() => {
        expect(getByTestId('bin-card-bin-001')).toBeTruthy();
      });

      fireEvent.press(getByTestId('bin-card-bin-001'));

      await waitFor(() => {
        expect(getByText('Select bins for collection (1 selected)')).toBeTruthy();
      });
    });
  });

  describe('Snapshot Tests', () => {
    it('matches snapshot for loading state', () => {
      SchedulingService.getResidentBins.mockImplementation(
        () => new Promise(() => {})
      );

      const tree = render(<SchedulePickupScreen {...defaultProps} />);
      expect(tree).toMatchSnapshot();
    });

    it('matches snapshot for successful state', async () => {
      SchedulingService.getResidentBins.mockResolvedValue(
        mockSuccessResponse({ 
          bins: mockBins, 
          autoPickupBins: [],
          hasAutoPickup: false
        })
      );

      const tree = render(<SchedulePickupScreen {...defaultProps} />);
      
      await waitFor(() => {
        expect(tree.getByText('General Waste')).toBeTruthy();
      });

      expect(tree).toMatchSnapshot();
    });

    it('matches snapshot for error state', async () => {
      SchedulingService.getResidentBins.mockRejectedValue(
        new Error('Load failed')
      );

      const tree = render(<SchedulePickupScreen {...defaultProps} />);
      
      await waitFor(() => {
        expect(tree.getByText('Unable to Load Bins')).toBeTruthy();
      });

      expect(tree).toMatchSnapshot();
    });

    it('matches snapshot for empty state', async () => {
      SchedulingService.getResidentBins.mockResolvedValue(
        mockSuccessResponse({ 
          bins: [], 
          autoPickupBins: [],
          hasAutoPickup: false
        })
      );

      const tree = render(<SchedulePickupScreen {...defaultProps} />);
      
      await waitFor(() => {
        expect(tree.getByText('No Bins Available')).toBeTruthy();
      });

      expect(tree).toMatchSnapshot();
    });
  });
});