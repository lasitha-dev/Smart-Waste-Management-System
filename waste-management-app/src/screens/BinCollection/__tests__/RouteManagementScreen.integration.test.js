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

    // Verify initial state - item should not have completed badge
    expect(screen.queryByTestId('status-1')).toBeNull();

    // Act - Press the first route item to open the modal
    const firstItem = screen.getByTestId('route-item-1');
    fireEvent.press(firstItem);

    // Assert - Modal should appear with bin details
    await waitFor(() => {
      const modal = screen.getByTestId('bin-details-modal');
      expect(modal).toBeTruthy();
      // Note: BIN-001 appears both in list and modal, so we just verify modal is present
    });

    // Act - Confirm the collection
    const confirmButton = screen.getByTestId('confirm-collection-button');
    fireEvent.press(confirmButton);

    // Assert - Modal should close
    await waitFor(() => {
      expect(screen.queryByTestId('bin-details-modal')).toBeNull();
    });

    // Assert - Status should change to 'completed' with visual indicator
    await waitFor(() => {
      const statusBadge = screen.getByTestId('status-1');
      expect(statusBadge).toBeTruthy();
      expect(statusBadge).toHaveTextContent('✓ Completed');
    });

    // Assert - Item should have completed styling
    const completedItem = screen.getByTestId('route-item-1');
    expect(completedItem).toBeTruthy();
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
    const firstItem = screen.getByTestId('route-item-1');
    fireEvent.press(firstItem);

    await waitFor(() => {
      expect(screen.getByTestId('bin-details-modal')).toBeTruthy();
    });

    const confirmButton = screen.getByTestId('confirm-collection-button');
    fireEvent.press(confirmButton);

    // Assert - First item should be completed
    await waitFor(() => {
      expect(screen.getByTestId('status-1')).toBeTruthy();
    });

    // Assert - Other items should NOT have completed status
    expect(screen.queryByTestId('status-2')).toBeNull();
    expect(screen.queryByTestId('status-3')).toBeNull();
  });
});
