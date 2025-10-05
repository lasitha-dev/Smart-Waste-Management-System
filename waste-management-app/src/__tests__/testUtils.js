/**
 * Test Setup and Utilities
 * Common test utilities, mocks, and setup for the Smart Waste Management System
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module TestUtils
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Mock React Native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock console warnings
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
});

// Common test props and data
export const mockBin = {
  id: 'bin-001',
  type: 'General Waste',
  location: 'Front Yard',
  capacity: 120,
  currentFillLevel: 75,
  status: 'Active',
  isSmartBin: true,
  sensorEnabled: true,
  autoPickupThreshold: 85,
  lastEmptied: '2023-10-01T10:00:00Z'
};

export const mockBins = [
  mockBin,
  {
    id: 'bin-002',
    type: 'Recyclable',
    location: 'Back Yard',
    capacity: 100,
    currentFillLevel: 45,
    status: 'Active',
    isSmartBin: false,
    sensorEnabled: false,
    lastEmptied: '2023-09-28T08:00:00Z'
  },
  {
    id: 'bin-003',
    type: 'Organic',
    location: 'Kitchen',
    capacity: 80,
    currentFillLevel: 90,
    status: 'Active',
    isSmartBin: true,
    sensorEnabled: true,
    autoPickupThreshold: 80,
    lastEmptied: '2023-09-30T12:00:00Z'
  }
];

export const mockBookingInfo = {
  id: 'booking-001',
  scheduledDate: '2023-10-15',
  timeSlot: 'morning',
  wasteType: 'regular',
  binIds: ['bin-001', 'bin-002'],
  binCount: 2,
  residentId: 'resident-001'
};

export const mockFeeData = {
  baseFee: 500,
  binFee: 200,
  weightFee: 150,
  wasteTypeFee: 0,
  subtotal: 850,
  tax: 153,
  total: 1003,
  currency: 'LKR',
  model: 'hybrid',
  binCount: 2,
  estimatedWeight: 15,
  wasteType: {
    id: 'regular',
    label: 'Regular Waste',
    icon: '🗑️'
  }
};

// Mock navigation
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
  isFocused: jest.fn(() => true)
};

// Mock route
export const mockRoute = {
  params: {},
  key: 'test-route',
  name: 'TestScreen'
};

// Test wrapper component for providers
export const TestWrapper = ({ children }) => {
  return React.createElement(React.Fragment, null, children);
};

// Custom render function with wrapper
export const renderWithWrapper = (component, options = {}) => {
  return render(component, {
    wrapper: TestWrapper,
    ...options
  });
};

// Helper to wait for async operations
export const waitForAsync = (callback, timeout = 1000) => {
  return waitFor(callback, { timeout });
};

// Helper to simulate user interactions
export const simulatePress = (element) => {
  act(() => {
    fireEvent.press(element);
  });
};

export const simulateTextInput = (element, text) => {
  act(() => {
    fireEvent.changeText(element, text);
  });
};

// Mock API responses
export const mockSuccessResponse = (data) => ({
  success: true,
  data
});

export const mockErrorResponse = (error, code = 'UNKNOWN_ERROR') => ({
  success: false,
  error,
  code
});

// Mock timers helper
export const setupMockTimers = () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
};

// Animation test helper
export const mockAnimations = () => {
  jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native');
    return {
      ...RN,
      Animated: {
        ...RN.Animated,
        timing: jest.fn(() => ({
          start: jest.fn((callback) => callback && callback()),
        })),
        sequence: jest.fn(() => ({
          start: jest.fn((callback) => callback && callback()),
        })),
        parallel: jest.fn(() => ({
          start: jest.fn((callback) => callback && callback()),
        })),
        loop: jest.fn(() => ({
          start: jest.fn(),
          stop: jest.fn()
        })),
        Value: jest.fn(() => ({
          setValue: jest.fn(),
          interpolate: jest.fn(() => 0),
          addListener: jest.fn(),
          removeListener: jest.fn(),
        })),
      },
    };
  });
};

// Snapshot test helper
export const expectToMatchSnapshot = (component) => {
  const tree = render(component);
  expect(tree).toMatchSnapshot();
};

// Accessibility test helper
export const testAccessibility = (component) => {
  const { getByRole, getByA11yLabel, getByTestId } = render(component);
  
  return {
    getByRole,
    getByA11yLabel,
    getByTestId,
    // Add more accessibility helpers as needed
  };
};

// Performance test helper
export const measureRenderTime = (component, iterations = 100) => {
  const startTime = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    render(component);
  }
  
  const endTime = performance.now();
  return (endTime - startTime) / iterations;
};

// Mock fetch for API tests
global.fetch = jest.fn();

// Reset mocks after each test
afterEach(() => {
  jest.clearAllMocks();
  fetch.mockClear();
});

export default {
  mockBin,
  mockBins,
  mockBookingInfo,
  mockFeeData,
  mockNavigation,
  mockRoute,
  renderWithWrapper,
  waitForAsync,
  simulatePress,
  simulateTextInput,
  mockSuccessResponse,
  mockErrorResponse,
  setupMockTimers,
  mockAnimations,
  expectToMatchSnapshot,
  testAccessibility,
  measureRenderTime
};
