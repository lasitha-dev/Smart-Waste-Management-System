/**
 * RouteListItem Test Suite
 * Tests for the RouteListItem component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import RouteListItem from '../RouteListItem';

// Mock the navigation hook
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('RouteListItem', () => {
  /**
   * Mock stop object for testing
   */
  const mockStop = {
    id: 1,
    binId: 'BIN-001',
    address: '123 Main Street, Downtown',
    status: 'pending',
    priority: 'high',
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  /**
   * Test: Component renders and displays bin ID and address
   */
  it('renders the component and displays the bin ID and address', () => {
    // Arrange & Act
    render(<RouteListItem stop={mockStop} />);

    // Assert
    const binId = screen.getByText('BIN-001');
    const address = screen.getByText('123 Main Street, Downtown');

    expect(binId).toBeVisible();
    expect(address).toBeVisible();
  });

  /**
   * Test: Component navigates to ScanBin screen when pressed
   */
  it('navigates to ScanBin screen when pressed', () => {
    // Arrange
    render(<RouteListItem stop={mockStop} />);

    // Act
    const listItem = screen.getByTestId('route-item-1');
    fireEvent.press(listItem);

    // Assert
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('ScanBin', { stop: mockStop });
  });
});
