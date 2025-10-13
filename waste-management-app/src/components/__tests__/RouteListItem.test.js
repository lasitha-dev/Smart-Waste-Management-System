/**
 * RouteListItem Test Suite
 * Tests for the RouteListItem component
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import RouteListItem from '../RouteListItem';

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
});
