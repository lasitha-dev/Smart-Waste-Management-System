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

// Mock RouteContext
jest.mock('../../../context/RouteContext', () => ({
  useRoute: () => ({
    getStatistics: () => ({
      completed: 24,
      pending: 8,
      efficiency: '92%',
      issues: 2,
      total: 32,
    }),
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

  /**
   * Test: Screen displays dynamic values from context
   */
  it('displays dynamic statistics from RouteContext', () => {
    // Arrange & Act
    render(<DashboardScreen />);

    // Assert - Check for dynamic values from mocked context
    expect(screen.getByText('24')).toBeVisible(); // Completed count
    expect(screen.getByText('8')).toBeVisible(); // Pending count
    expect(screen.getByText('92%')).toBeVisible(); // Efficiency percentage
    expect(screen.getByText('2')).toBeVisible(); // Issues count
  });
});
