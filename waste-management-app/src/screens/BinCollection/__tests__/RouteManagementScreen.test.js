/**
 * RouteManagementScreen Test Suite
 * Tests for the Route Management Screen component
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import RouteManagementScreen from '../RouteManagementScreen';

describe('RouteManagementScreen', () => {
  /**
   * Test: Screen renders with the title 'Route Management'
   */
  it('renders the screen and displays the title "Route Management"', () => {
    // Arrange & Act
    render(<RouteManagementScreen />);

    // Assert
    const title = screen.getByText('Route Management');
    expect(title).toBeVisible();
  });
});
