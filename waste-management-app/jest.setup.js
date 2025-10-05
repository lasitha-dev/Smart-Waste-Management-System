/**
 * Jest Setup Configuration
 * Configuration and global mocks for Jest testing environment
 * 
 * @author Kumarasinghe S.S (IT22221414)
 */

import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock react-native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    WebView: View,
    TapGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    LongPressGestureHandler: View,
    ForceTouchGestureHandler: View,
    FlingGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    TouchableOpacity: View,
    TouchableHighlight: View,
    TouchableWithoutFeedback: View,
    gestureHandlerRootHOC: jest.fn(component => component),
    Directions: {}
  };
});

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn().mockReturnValue({ width: 375, height: 667 }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
}));

// Mock StatusBar
jest.mock('react-native/Libraries/Components/StatusBar/StatusBar', () => ({
  setBarStyle: jest.fn(),
  setBackgroundColor: jest.fn(),
  setTranslucent: jest.fn()
}));

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn()
}));

// Mock Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn().mockResolvedValue(true),
  canOpenURL: jest.fn().mockResolvedValue(true)
}));

// Mock PermissionsAndroid
jest.mock('react-native/Libraries/PermissionsAndroid/PermissionsAndroid', () => ({
  request: jest.fn().mockResolvedValue('granted'),
  check: jest.fn().mockResolvedValue(true),
  PERMISSIONS: {
    CAMERA: 'android.permission.CAMERA',
    READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
    WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE'
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    NEVER_ASK_AGAIN: 'never_ask_again'
  }
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn().mockResolvedValue({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi'
  }),
  addEventListener: jest.fn()
}));

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  useSafeAreaFrame: () => ({ x: 0, y: 0, width: 375, height: 667 })
}));

// Mock date functions for consistent testing
const mockDate = new Date('2023-10-15T10:00:00.000Z');
global.Date = class extends Date {
  constructor(...args) {
    if (args.length === 0) {
      return mockDate;
    }
    return new Date(...args);
  }

  static now() {
    return mockDate.getTime();
  }
};

// Mock performance for performance tests
global.performance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => []),
  getEntriesByType: jest.fn(() => [])
};

// Mock fetch
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test configuration
jest.setTimeout(10000); // 10 second timeout for async tests

// Mock timers for animation tests
jest.useFakeTimers();

// Custom matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Export common test utilities
export const flushPromises = () => new Promise(resolve => setImmediate(resolve));

export const mockAnimatedValue = (initialValue = 0) => ({
  setValue: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
  hasListeners: jest.fn(() => false),
  interpolate: jest.fn(() => initialValue),
  stopAnimation: jest.fn(),
  resetAnimation: jest.fn(),
  extractOffset: jest.fn(),
  flattenOffset: jest.fn(),
  __getValue: jest.fn(() => initialValue)
});

export const mockAnimatedTiming = {
  start: jest.fn(callback => callback && callback({ finished: true })),
  stop: jest.fn(),
  reset: jest.fn()
};

// Mock Animated module
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Animated: {
      ...RN.Animated,
      timing: jest.fn(() => mockAnimatedTiming),
      sequence: jest.fn(() => mockAnimatedTiming),
      parallel: jest.fn(() => mockAnimatedTiming),
      loop: jest.fn(() => mockAnimatedTiming),
      spring: jest.fn(() => mockAnimatedTiming),
      decay: jest.fn(() => mockAnimatedTiming),
      Value: jest.fn(() => mockAnimatedValue()),
      ValueXY: jest.fn(() => ({
        x: mockAnimatedValue(),
        y: mockAnimatedValue(),
        setValue: jest.fn(),
        extractOffset: jest.fn(),
        flattenOffset: jest.fn(),
        stopAnimation: jest.fn(),
        resetAnimation: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        removeAllListeners: jest.fn()
      })),
      createAnimatedComponent: jest.fn(component => component),
      View: RN.View,
      Text: RN.Text,
      ScrollView: RN.ScrollView,
      Image: RN.Image
    }
  };
});

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
  fetch.mockClear();
});

// Silence the warning about act() wrapping
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    return originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
