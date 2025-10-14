/**
 * DashboardScreen Test Suite
 * Tests for the Dashboard Screen component
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import DashboardScreen from '../DashboardScreen';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

describe('DashboardScreen', () => {
  /**
   * Test: Screen renders with the greeting title
   */
  it('renders the screen and displays the title "Good Morning, Alex!"', () => {
    // Arrange & Act
    render(<DashboardScreen />);

    // Assert
    const title = screen.getByText('Good Morning, Alex!');
    expect(title).toBeVisible();
  });

  /**
   * Test: Screen displays summary cards
   */
  it('displays summary cards for Completed and Efficiency', () => {
    // Arrange & Act
    render(<DashboardScreen />);

    // Assert - Completed card
    const completedCard = screen.getByText('Completed');
    expect(completedCard).toBeVisible();

    // Assert - Efficiency card
    const efficiencyCard = screen.getByText('Efficiency');
    expect(efficiencyCard).toBeVisible();
  });

  /**
   * Test: Screen displays all summary cards
   */
  it('displays all summary stat cards', () => {
    // Arrange & Act
    render(<DashboardScreen />);

    // Assert - Check for all expected cards
    expect(screen.getByText('Completed')).toBeVisible();
    expect(screen.getByText('Pending')).toBeVisible();
    expect(screen.getByText('Efficiency')).toBeVisible();
    expect(screen.getByText('Issues')).toBeVisible();
  });
});
