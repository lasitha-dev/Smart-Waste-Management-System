/**
 * RouteManagementScreen Integration Test Suite
 * Tests the complete bin collection workflow
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import RouteManagementScreen from '../RouteManagementScreen';
import { RouteProvider } from '../../../context/RouteContext';

// Mock the navigation hook
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

// Mock BinDetailsModal to simplify testing the flow
jest.mock('../../../components/BinDetailsModal', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return ({ visible, binId, location, onConfirm, onClose }) => {
    if (!visible) return null;
    return (
      <View testID="bin-details-modal">
        <Text>{binId}</Text>
        <Text>{location}</Text>
        <TouchableOpacity testID="confirm-collection-button" onPress={onConfirm}>
          <Text>Confirm Collection</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="close-modal-button" onPress={onClose}>
          <Text>Close</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

// Mock the mockData import with test data
jest.mock('../../../api/mockData', () => ({
  MOCK_STOPS: [
    {
      id: 1,
      binId: 'BIN-001',
      address: '123 Main Street, Downtown',
      status: 'pending',
      priority: 'high',
    },
    {
      id: 2,
      binId: 'BIN-002',
      address: '456 Oak Avenue, Westside',
      status: 'pending',
      priority: 'medium',
    },
    {
      id: 3,
      binId: 'BIN-003',
      address: '789 Pine Road, Eastside',
      status: 'pending',
      priority: 'low',
    },
  ],
  MOCK_ROUTE_INFO: {
    routeNumber: 'Route #12',
    district: 'Central District',
    assignedTo: 'Alex',
  },
  MOCK_IMPACT_METRICS: {
    recycled: { value: 1.2, unit: 'tons' },
    co2Saved: { value: 89, unit: 'kg' },
    treesSaved: { value: 3.2, unit: '' },
  },
  MOCK_COLLECTIONS: [
    { id: 1, type: 'General', icon: 'trash', count: 28 },
    { id: 2, type: 'Recyclable', icon: 'recycle', count: 15 },
    { id: 3, type: 'Organic', icon: 'leaf', count: 10 },
  ],
}));

describe('RouteManagementScreen Integration Tests', () => {
  /**
   * Integration Test: Simulate successful bin collection and verify status change
   */
  it('updates the first item status to completed after confirming collection', async () => {
    // Arrange - Render the full screen with RouteProvider
    render(
      <RouteProvider>
        <RouteManagementScreen />
      </RouteProvider>
    );

    // Verify initial state - check completed count is 0
    const completedCard = screen.getByTestId('stat-card-completed');
    expect(completedCard).toHaveTextContent('0');
    expect(completedCard).toHaveTextContent('Completed');

    // Act - Press the first route item to open the modal
    const firstItem = screen.getByTestId('next-stop-card-1');
    fireEvent.press(firstItem);

    // Assert - Modal should appear with bin details
    await waitFor(() => {
      const modal = screen.getByTestId('bin-details-modal');
      expect(modal).toBeTruthy();
    });

    // Act - Confirm the collection
    const confirmButton = screen.getByTestId('confirm-collection-button');
    fireEvent.press(confirmButton);

    // Assert - Modal should close
    await waitFor(() => {
      expect(screen.queryByTestId('bin-details-modal')).toBeNull();
    });

    // Assert - Completed count should increase to 1
    await waitFor(() => {
      const updatedCompletedCard = screen.getByTestId('stat-card-completed');
      expect(updatedCompletedCard).toHaveTextContent('1');
    });

    // Assert - Remaining count should decrease to 2
    const remainingCard = screen.getByTestId('stat-card-remaining');
    expect(remainingCard).toHaveTextContent('2');
  });

  /**
   * Integration Test: Verify other items remain unchanged
   */
  it('only updates the selected item status, leaving others unchanged', async () => {
    // Arrange
    render(
      <RouteProvider>
        <RouteManagementScreen />
      </RouteProvider>
    );

    // Act - Complete the first item
    const firstItem = screen.getByTestId('next-stop-card-1');
    fireEvent.press(firstItem);

    await waitFor(() => {
      expect(screen.getByTestId('bin-details-modal')).toBeTruthy();
    });

    const confirmButton = screen.getByTestId('confirm-collection-button');
    fireEvent.press(confirmButton);

    // Wait for modal to close
    await waitFor(() => {
      expect(screen.queryByTestId('bin-details-modal')).toBeNull();
    });

    // Assert - Completed count should be 1
    await waitFor(() => {
      const completedCard = screen.getByTestId('stat-card-completed');
      expect(completedCard).toHaveTextContent('1');
    });

    // Assert - Remaining count should be 2 (other items still pending)
    const remainingCard = screen.getByTestId('stat-card-remaining');
    expect(remainingCard).toHaveTextContent('2');

    // Assert - Other stop cards should still be visible (not removed from list)
    expect(screen.getByTestId('next-stop-card-2')).toBeTruthy();
    expect(screen.getByTestId('next-stop-card-3')).toBeTruthy();
  });
});
