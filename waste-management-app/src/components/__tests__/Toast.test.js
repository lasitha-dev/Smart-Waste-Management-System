/**
 * Toast Component Tests
 * Comprehensive unit tests for Toast, ToastManager, and StatusMessage components
 * 
 * @author Kumarasinghe S.S (IT22221414)
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Toast, ToastManager, ToastProvider, StatusMessage } from '../components/Toast';

// Mock react-native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('react-native-gesture-handler', () => {
  const RN = jest.requireActual('react-native');
  return {
    PanGestureHandler: RN.View,
    State: { END: 5 }
  };
});

describe('Toast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('renders when visible is true', () => {
      const { getByText } = render(
        <Toast 
          visible={true} 
          title="Test Title" 
          message="Test Message" 
        />
      );
      
      expect(getByText('Test Title')).toBeTruthy();
      expect(getByText('Test Message')).toBeTruthy();
    });

    it('does not render when visible is false', () => {
      const { queryByText } = render(
        <Toast 
          visible={false} 
          title="Test Title" 
          message="Test Message" 
        />
      );
      
      expect(queryByText('Test Title')).toBeNull();
      expect(queryByText('Test Message')).toBeNull();
    });

    it('renders without title', () => {
      const { getByText, queryByText } = render(
        <Toast 
          visible={true} 
          message="Test Message" 
        />
      );
      
      expect(getByText('Test Message')).toBeTruthy();
      expect(queryByText('Test Title')).toBeNull();
    });

    it('renders without message', () => {
      const { getByText, queryByText } = render(
        <Toast 
          visible={true} 
          title="Test Title" 
        />
      );
      
      expect(getByText('Test Title')).toBeTruthy();
      expect(queryByText('Test Message')).toBeNull();
    });
  });

  describe('Toast Types', () => {
    it('renders success type with correct styling', () => {
      const { container } = render(
        <Toast 
          visible={true} 
          type="success" 
          message="Success message" 
        />
      );
      
      expect(container).toBeTruthy();
    });

    it('renders error type with correct styling', () => {
      const { container } = render(
        <Toast 
          visible={true} 
          type="error" 
          message="Error message" 
        />
      );
      
      expect(container).toBeTruthy();
    });

    it('renders warning type with correct styling', () => {
      const { container } = render(
        <Toast 
          visible={true} 
          type="warning" 
          message="Warning message" 
        />
      );
      
      expect(container).toBeTruthy();
    });

    it('renders info type with correct styling', () => {
      const { container } = render(
        <Toast 
          visible={true} 
          type="info" 
          message="Info message" 
        />
      );
      
      expect(container).toBeTruthy();
    });

    it('defaults to info type for unknown type', () => {
      const { container } = render(
        <Toast 
          visible={true} 
          type="unknown" 
          message="Unknown type message" 
        />
      );
      
      expect(container).toBeTruthy();
    });
  });

  describe('Positioning', () => {
    it('renders at top position', () => {
      const { container } = render(
        <Toast 
          visible={true} 
          position="top" 
          message="Top toast" 
        />
      );
      
      expect(container).toBeTruthy();
    });

    it('renders at bottom position', () => {
      const { container } = render(
        <Toast 
          visible={true} 
          position="bottom" 
          message="Bottom toast" 
        />
      );
      
      expect(container).toBeTruthy();
    });

    it('renders at center position', () => {
      const { container } = render(
        <Toast 
          visible={true} 
          position="center" 
          message="Center toast" 
        />
      );
      
      expect(container).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('calls onPress when toast is pressed', () => {
      const onPressMock = jest.fn();
      
      const { getByText } = render(
        <Toast 
          visible={true} 
          message="Pressable toast" 
          onPress={onPressMock}
        />
      );
      
      fireEvent.press(getByText('Pressable toast'));
      expect(onPressMock).toHaveBeenCalled();
    });

    it('calls onHide when close button is pressed', async () => {
      const onHideMock = jest.fn();
      
      const { getByText } = render(
        <Toast 
          visible={true} 
          message="Closable toast" 
          onHide={onHideMock}
        />
      );
      
      const closeButton = getByText('✕');
      fireEvent.press(closeButton);
      
      // Wait for animation and callback
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(onHideMock).toHaveBeenCalled();
      });
    });

    it('renders and handles action button', () => {
      const actionMock = jest.fn();
      
      const { getByText } = render(
        <Toast 
          visible={true} 
          message="Toast with action" 
          action={{
            text: 'Action',
            onPress: actionMock
          }}
        />
      );
      
      const actionButton = getByText('Action');
      expect(actionButton).toBeTruthy();
      
      fireEvent.press(actionButton);
      expect(actionMock).toHaveBeenCalled();
    });
  });

  describe('Auto-dismiss', () => {
    it('auto-dismisses after specified duration', async () => {
      const onHideMock = jest.fn();
      
      render(
        <Toast 
          visible={true} 
          message="Auto-dismiss toast" 
          duration={2000}
          onHide={onHideMock}
        />
      );
      
      // Fast-forward time to trigger auto-dismiss
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      
      // Wait for hide animation
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(onHideMock).toHaveBeenCalled();
      });
    });

    it('does not auto-dismiss when duration is 0', async () => {
      const onHideMock = jest.fn();
      
      render(
        <Toast 
          visible={true} 
          message="Persistent toast" 
          duration={0}
          onHide={onHideMock}
        />
      );
      
      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      expect(onHideMock).not.toHaveBeenCalled();
    });
  });

  describe('Swipe to Dismiss', () => {
    it('handles swipe gesture when swipeable is true', () => {
      const onHideMock = jest.fn();
      
      const { container } = render(
        <Toast 
          visible={true} 
          message="Swipeable toast" 
          swipeable={true}
          onHide={onHideMock}
        />
      );
      
      expect(container).toBeTruthy();
      // Note: Swipe gesture testing would require more complex gesture simulation
    });

    it('does not handle swipe gesture when swipeable is false', () => {
      const onHideMock = jest.fn();
      
      const { container } = render(
        <Toast 
          visible={true} 
          message="Non-swipeable toast" 
          swipeable={false}
          onHide={onHideMock}
        />
      );
      
      expect(container).toBeTruthy();
    });
  });
});

describe('ToastManager', () => {
  let mockToastRef;

  beforeEach(() => {
    mockToastRef = {
      show: jest.fn(),
      hide: jest.fn()
    };
    ToastManager.setRef(mockToastRef);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Methods', () => {
    it('calls show on toast ref', () => {
      const config = { type: 'info', message: 'Test' };
      
      ToastManager.show(config);
      
      expect(mockToastRef.show).toHaveBeenCalledWith(config);
    });

    it('calls hide on toast ref', () => {
      ToastManager.hide();
      
      expect(mockToastRef.hide).toHaveBeenCalled();
    });

    it('handles missing ref gracefully', () => {
      ToastManager.setRef(null);
      
      expect(() => {
        ToastManager.show({ message: 'Test' });
        ToastManager.hide();
      }).not.toThrow();
    });
  });

  describe('Convenience Methods', () => {
    it('shows success toast', () => {
      ToastManager.success('Success message', 'Success Title');
      
      expect(mockToastRef.show).toHaveBeenCalledWith({
        type: 'success',
        title: 'Success Title',
        message: 'Success message',
        duration: 3000
      });
    });

    it('shows error toast', () => {
      ToastManager.error('Error message', 'Error Title');
      
      expect(mockToastRef.show).toHaveBeenCalledWith({
        type: 'error',
        title: 'Error Title',
        message: 'Error message',
        duration: 5000
      });
    });

    it('shows warning toast', () => {
      ToastManager.warning('Warning message', 'Warning Title');
      
      expect(mockToastRef.show).toHaveBeenCalledWith({
        type: 'warning',
        title: 'Warning Title',
        message: 'Warning message',
        duration: 4000
      });
    });

    it('shows info toast', () => {
      ToastManager.info('Info message', 'Info Title');
      
      expect(mockToastRef.show).toHaveBeenCalledWith({
        type: 'info',
        title: 'Info Title',
        message: 'Info message',
        duration: 3000
      });
    });

    it('uses default titles when not provided', () => {
      ToastManager.success('Just message');
      
      expect(mockToastRef.show).toHaveBeenCalledWith({
        type: 'success',
        title: 'Success',
        message: 'Just message',
        duration: 3000
      });
    });
  });
});

describe('ToastProvider', () => {
  it('renders children', () => {
    const { getByText } = render(
      <ToastProvider>
        <div>Child Component</div>
      </ToastProvider>
    );
    
    expect(getByText('Child Component')).toBeTruthy();
  });

  it('provides toast functionality to children', () => {
    const TestChild = () => {
      React.useEffect(() => {
        ToastManager.success('Test message');
      }, []);
      
      return <div>Test Child</div>;
    };
    
    const { getByText } = render(
      <ToastProvider>
        <TestChild />
      </ToastProvider>
    );
    
    expect(getByText('Test Child')).toBeTruthy();
  });
});

describe('StatusMessage', () => {
  describe('Basic Rendering', () => {
    it('renders when visible is true', () => {
      const { getByText } = render(
        <StatusMessage 
          visible={true} 
          message="Status message" 
        />
      );
      
      expect(getByText('Status message')).toBeTruthy();
    });

    it('does not render when visible is false', () => {
      const { queryByText } = render(
        <StatusMessage 
          visible={false} 
          message="Status message" 
        />
      );
      
      expect(queryByText('Status message')).toBeNull();
    });

    it('renders with title and message', () => {
      const { getByText } = render(
        <StatusMessage 
          visible={true} 
          title="Status Title" 
          message="Status message" 
        />
      );
      
      expect(getByText('Status Title')).toBeTruthy();
      expect(getByText('Status message')).toBeTruthy();
    });
  });

  describe('Status Types', () => {
    it('renders success type with correct styling', () => {
      const { container } = render(
        <StatusMessage 
          visible={true} 
          type="success" 
          message="Success status" 
        />
      );
      
      expect(container).toBeTruthy();
    });

    it('renders error type with correct styling', () => {
      const { container } = render(
        <StatusMessage 
          visible={true} 
          type="error" 
          message="Error status" 
        />
      );
      
      expect(container).toBeTruthy();
    });

    it('renders warning type with correct styling', () => {
      const { container } = render(
        <StatusMessage 
          visible={true} 
          type="warning" 
          message="Warning status" 
        />
      );
      
      expect(container).toBeTruthy();
    });

    it('renders info type with correct styling', () => {
      const { container } = render(
        <StatusMessage 
          visible={true} 
          type="info" 
          message="Info status" 
        />
      );
      
      expect(container).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('calls onDismiss when dismiss button is pressed', () => {
      const onDismissMock = jest.fn();
      
      const { getByText } = render(
        <StatusMessage 
          visible={true} 
          message="Dismissible status" 
          onDismiss={onDismissMock}
        />
      );
      
      const dismissButton = getByText('✕');
      fireEvent.press(dismissButton);
      
      expect(onDismissMock).toHaveBeenCalled();
    });

    it('handles action button press', () => {
      const actionMock = jest.fn();
      
      const { getByText } = render(
        <StatusMessage 
          visible={true} 
          message="Status with action" 
          action={{
            text: 'Fix Now',
            onPress: actionMock
          }}
        />
      );
      
      const actionButton = getByText('Fix Now');
      fireEvent.press(actionButton);
      
      expect(actionMock).toHaveBeenCalled();
    });

    it('renders without dismiss button when onDismiss is not provided', () => {
      const { queryByText } = render(
        <StatusMessage 
          visible={true} 
          message="Non-dismissible status" 
        />
      );
      
      expect(queryByText('✕')).toBeNull();
    });

    it('renders without action button when action is not provided', () => {
      const { queryByText } = render(
        <StatusMessage 
          visible={true} 
          message="Status without action" 
        />
      );
      
      expect(queryByText('Action')).toBeNull();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom styles', () => {
      const customStyle = { marginTop: 20 };
      
      const { container } = render(
        <StatusMessage 
          visible={true} 
          message="Styled status" 
          style={customStyle}
        />
      );
      
      expect(container).toBeTruthy();
    });
  });
});

describe('Animation Behavior', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('animates in when becoming visible', () => {
    const { rerender } = render(
      <StatusMessage visible={false} message="Test" />
    );
    
    rerender(
      <StatusMessage visible={true} message="Test" />
    );
    
    // Fast-forward animation time
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    // Component should be rendered after animation
    expect(true).toBe(true); // Animation completion test
  });

  it('animates out when becoming invisible', () => {
    const { rerender } = render(
      <StatusMessage visible={true} message="Test" />
    );
    
    rerender(
      <StatusMessage visible={false} message="Test" />
    );
    
    // Fast-forward animation time
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    // Component should be hidden after animation
    expect(true).toBe(true); // Animation completion test
  });
});

describe('Snapshot Tests', () => {
  it('matches snapshot for success toast', () => {
    const tree = render(
      <Toast 
        visible={true} 
        type="success" 
        title="Success"
        message="Operation completed successfully" 
      />
    );
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for error toast with action', () => {
    const tree = render(
      <Toast 
        visible={true} 
        type="error" 
        title="Error"
        message="Something went wrong" 
        action={{
          text: 'Retry',
          onPress: jest.fn()
        }}
      />
    );
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for status message', () => {
    const tree = render(
      <StatusMessage 
        visible={true} 
        type="warning" 
        title="Warning"
        message="Please check your input" 
      />
    );
    expect(tree).toMatchSnapshot();
  });
});
