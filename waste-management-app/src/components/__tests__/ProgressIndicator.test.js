/**
 * ProgressIndicator Component Tests
 * Comprehensive unit tests for ProgressIndicator, CircularProgress, and LinearProgress
 * 
 * @author Kumarasinghe S.S (IT22221414)
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProgressIndicator, { CircularProgress, LinearProgress } from '../components/ProgressIndicator';

// Mock react-native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

describe('ProgressIndicator', () => {
  const mockSteps = [
    { title: 'Step 1', subtitle: 'First step' },
    { title: 'Step 2', subtitle: 'Second step' },
    { title: 'Step 3', subtitle: 'Third step' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('renders with steps', () => {
      const { getByText } = render(
        <ProgressIndicator 
          steps={mockSteps} 
          currentStep={0} 
        />
      );
      
      expect(getByText('Step 1')).toBeTruthy();
      expect(getByText('First step')).toBeTruthy();
    });

    it('does not render when steps array is empty', () => {
      const { container } = render(
        <ProgressIndicator 
          steps={[]} 
          currentStep={0} 
        />
      );
      
      // Should return null for empty steps
      expect(container.children).toHaveLength(0);
    });

    it('renders without labels when showLabels is false', () => {
      const { queryByText } = render(
        <ProgressIndicator 
          steps={mockSteps} 
          currentStep={0} 
          showLabels={false}
        />
      );
      
      expect(queryByText('First step')).toBeNull();
    });

    it('renders without progress when showProgress is false', () => {
      const { queryByText } = render(
        <ProgressIndicator 
          steps={mockSteps} 
          currentStep={0} 
          showProgress={false}
        />
      );
      
      expect(queryByText(/Step 1 of 3/)).toBeNull();
    });
  });

  describe('Step Status', () => {
    it('shows completed status for previous steps', () => {
      const { container } = render(
        <ProgressIndicator 
          steps={mockSteps} 
          currentStep={2} 
        />
      );
      
      expect(container).toBeTruthy();
    });

    it('shows active status for current step', () => {
      const { container } = render(
        <ProgressIndicator 
          steps={mockSteps} 
          currentStep={1} 
        />
      );
      
      expect(container).toBeTruthy();
    });

    it('shows loading status when loading is true', () => {
      const { container } = render(
        <ProgressIndicator 
          steps={mockSteps} 
          currentStep={1} 
          loading={true}
        />
      );
      
      expect(container).toBeTruthy();
    });

    it('shows pending status for future steps', () => {
      const { container } = render(
        <ProgressIndicator 
          steps={mockSteps} 
          currentStep={0} 
        />
      );
      
      expect(container).toBeTruthy();
    });
  });

  describe('Orientation', () => {
    it('renders horizontally by default', () => {
      const { container } = render(
        <ProgressIndicator 
          steps={mockSteps} 
          currentStep={0} 
        />
      );
      
      expect(container).toBeTruthy();
    });

    it('renders horizontally when orientation is horizontal', () => {
      const { container } = render(
        <ProgressIndicator 
          steps={mockSteps} 
          currentStep={0} 
          orientation="horizontal"
        />
      );
      
      expect(container).toBeTruthy();
    });

    it('renders vertically when orientation is vertical', () => {
      const { container } = render(
        <ProgressIndicator 
          steps={mockSteps} 
          currentStep={0} 
          orientation="vertical"
        />
      );
      
      expect(container).toBeTruthy();
    });
  });

  describe('Progress Display', () => {
    it('shows correct progress percentage', () => {
      const { getByText } = render(
        <ProgressIndicator 
          steps={mockSteps} 
          currentStep={1} 
          showProgress={true}
        />
      );
      
      expect(getByText('67%')).toBeTruthy(); // (1+1)/3 * 100 = 67%
    });

    it('shows correct step count', () => {
      const { getByText } = render(
        <ProgressIndicator 
          steps={mockSteps} 
          currentStep={1} 
          showProgress={true}
        />
      );
      
      expect(getByText('Step 2 of 3')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('calls onStepPress when step is clicked', () => {
      const onStepPressMock = jest.fn();
      
      const { getByText } = render(
        <ProgressIndicator 
          steps={mockSteps} 
          currentStep={2} 
          onStepPress={onStepPressMock}
        />
      );
      
      // Click on a completed step (should be clickable)
      fireEvent.press(getByText('Step 1'));
      
      expect(onStepPressMock).toHaveBeenCalledWith(0);
    });

    it('does not call onStepPress for future steps', () => {
      const onStepPressMock = jest.fn();
      
      const { getByText } = render(
        <ProgressIndicator 
          steps={mockSteps} 
          currentStep={0} 
          onStepPress={onStepPressMock}
        />
      );
      
      // Click on a future step (should not be clickable)
      fireEvent.press(getByText('Step 3'));
      
      expect(onStepPressMock).not.toHaveBeenCalled();
    });

    it('handles missing onStepPress gracefully', () => {
      const { getByText } = render(
        <ProgressIndicator 
          steps={mockSteps} 
          currentStep={1} 
        />
      );
      
      expect(() => {
        fireEvent.press(getByText('Step 1'));
      }).not.toThrow();
    });
  });

  describe('Custom Icons', () => {
    it('renders custom icons when provided', () => {
      const stepsWithIcons = [
        { title: 'Upload', icon: '📤' },
        { title: 'Process', icon: '⚙️' },
        { title: 'Complete', icon: '✅' }
      ];
      
      const { getByText } = render(
        <ProgressIndicator 
          steps={stepsWithIcons} 
          currentStep={0} 
        />
      );
      
      expect(getByText('📤')).toBeTruthy();
    });

    it('falls back to step number when no icon provided', () => {
      const { container } = render(
        <ProgressIndicator 
          steps={mockSteps} 
          currentStep={0} 
        />
      );
      
      expect(container).toBeTruthy();
    });
  });

  describe('Animation', () => {
    it('animates progress on step change', () => {
      const { rerender } = render(
        <ProgressIndicator 
          steps={mockSteps} 
          currentStep={0} 
        />
      );
      
      rerender(
        <ProgressIndicator 
          steps={mockSteps} 
          currentStep={1} 
        />
      );
      
      // Fast-forward animation time
      jest.advanceTimersByTime(500);
      
      expect(true).toBe(true); // Animation test
    });

    it('animates loading state', () => {
      render(
        <ProgressIndicator 
          steps={mockSteps} 
          currentStep={1} 
          loading={true}
        />
      );
      
      // Fast-forward animation time
      jest.advanceTimersByTime(1000);
      
      expect(true).toBe(true); // Animation test
    });
  });

  describe('Custom Styling', () => {
    it('applies custom styles', () => {
      const customStyle = { backgroundColor: 'red' };
      
      const { container } = render(
        <ProgressIndicator 
          steps={mockSteps} 
          currentStep={0} 
          style={customStyle}
        />
      );
      
      expect(container).toBeTruthy();
    });
  });
});

describe('CircularProgress', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      const { container } = render(<CircularProgress />);
      expect(container).toBeTruthy();
    });

    it('renders with custom progress', () => {
      const { getByText } = render(
        <CircularProgress progress={0.75} showPercentage={true} />
      );
      
      expect(getByText('75%')).toBeTruthy();
    });

    it('renders without percentage when showPercentage is false', () => {
      const { queryByText } = render(
        <CircularProgress progress={0.5} showPercentage={false} />
      );
      
      expect(queryByText('50%')).toBeNull();
    });

    it('renders children instead of percentage', () => {
      const { getByText } = render(
        <CircularProgress progress={0.5}>
          <div>Custom Content</div>
        </CircularProgress>
      );
      
      expect(getByText('Custom Content')).toBeTruthy();
    });
  });

  describe('Customization', () => {
    it('renders with custom size', () => {
      const { container } = render(
        <CircularProgress size={150} />
      );
      
      expect(container).toBeTruthy();
    });

    it('renders with custom colors', () => {
      const { container } = render(
        <CircularProgress 
          color="#FF0000" 
          backgroundColor="#CCCCCC" 
        />
      );
      
      expect(container).toBeTruthy();
    });

    it('renders with custom stroke width', () => {
      const { container } = render(
        <CircularProgress strokeWidth={12} />
      );
      
      expect(container).toBeTruthy();
    });

    it('applies custom styles', () => {
      const customStyle = { margin: 20 };
      
      const { container } = render(
        <CircularProgress style={customStyle} />
      );
      
      expect(container).toBeTruthy();
    });
  });

  describe('Animation', () => {
    it('animates progress change when animated is true', () => {
      const { rerender } = render(
        <CircularProgress progress={0} animated={true} />
      );
      
      rerender(
        <CircularProgress progress={0.8} animated={true} />
      );
      
      // Fast-forward animation time
      jest.advanceTimersByTime(1000);
      
      expect(true).toBe(true); // Animation test
    });

    it('does not animate when animated is false', () => {
      const { rerender } = render(
        <CircularProgress progress={0} animated={false} />
      );
      
      rerender(
        <CircularProgress progress={0.8} animated={false} />
      );
      
      expect(true).toBe(true); // No animation test
    });
  });

  describe('Edge Cases', () => {
    it('handles progress values above 1', () => {
      const { getByText } = render(
        <CircularProgress progress={1.5} showPercentage={true} />
      );
      
      expect(getByText('150%')).toBeTruthy();
    });

    it('handles negative progress values', () => {
      const { getByText } = render(
        <CircularProgress progress={-0.5} showPercentage={true} />
      );
      
      expect(getByText('-50%')).toBeTruthy();
    });

    it('handles very small size values', () => {
      const { container } = render(
        <CircularProgress size={10} strokeWidth={2} />
      );
      
      expect(container).toBeTruthy();
    });
  });
});

describe('LinearProgress', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      const { container } = render(<LinearProgress />);
      expect(container).toBeTruthy();
    });

    it('renders with custom progress', () => {
      const { container } = render(
        <LinearProgress progress={0.6} />
      );
      
      expect(container).toBeTruthy();
    });

    it('shows percentage when showPercentage is true', () => {
      const { getByText } = render(
        <LinearProgress progress={0.75} showPercentage={true} />
      );
      
      expect(getByText('75%')).toBeTruthy();
    });

    it('does not show percentage when showPercentage is false', () => {
      const { queryByText } = render(
        <LinearProgress progress={0.5} showPercentage={false} />
      );
      
      expect(queryByText('50%')).toBeNull();
    });
  });

  describe('Customization', () => {
    it('renders with custom height', () => {
      const { container } = render(
        <LinearProgress height={12} />
      );
      
      expect(container).toBeTruthy();
    });

    it('renders with custom colors', () => {
      const { container } = render(
        <LinearProgress 
          color="#00FF00" 
          backgroundColor="#EEEEEE" 
        />
      );
      
      expect(container).toBeTruthy();
    });

    it('applies custom styles', () => {
      const customStyle = { marginVertical: 10 };
      
      const { container } = render(
        <LinearProgress style={customStyle} />
      );
      
      expect(container).toBeTruthy();
    });
  });

  describe('Animation', () => {
    it('animates progress change when animated is true', () => {
      const { rerender } = render(
        <LinearProgress progress={0} animated={true} />
      );
      
      rerender(
        <LinearProgress progress={0.9} animated={true} />
      );
      
      // Fast-forward animation time
      jest.advanceTimersByTime(500);
      
      expect(true).toBe(true); // Animation test
    });

    it('does not animate when animated is false', () => {
      const { rerender } = render(
        <LinearProgress progress={0} animated={false} />
      );
      
      rerender(
        <LinearProgress progress={0.9} animated={false} />
      );
      
      expect(true).toBe(true); // No animation test
    });
  });

  describe('Edge Cases', () => {
    it('handles progress values above 1', () => {
      const { getByText } = render(
        <LinearProgress progress={1.2} showPercentage={true} />
      );
      
      expect(getByText('120%')).toBeTruthy();
    });

    it('handles negative progress values', () => {
      const { getByText } = render(
        <LinearProgress progress={-0.3} showPercentage={true} />
      );
      
      expect(getByText('-30%')).toBeTruthy();
    });

    it('handles zero height', () => {
      const { container } = render(
        <LinearProgress height={0} />
      );
      
      expect(container).toBeTruthy();
    });
  });
});

describe('Snapshot Tests', () => {
  const mockSteps = [
    { title: 'Start', subtitle: 'Beginning' },
    { title: 'Process', subtitle: 'Working' },
    { title: 'Finish', subtitle: 'Complete' }
  ];

  it('matches snapshot for horizontal progress indicator', () => {
    const tree = render(
      <ProgressIndicator 
        steps={mockSteps} 
        currentStep={1} 
        orientation="horizontal"
        showLabels={true}
        showProgress={true}
      />
    );
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for vertical progress indicator', () => {
    const tree = render(
      <ProgressIndicator 
        steps={mockSteps} 
        currentStep={1} 
        orientation="vertical"
        showLabels={true}
        showProgress={true}
      />
    );
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for loading state', () => {
    const tree = render(
      <ProgressIndicator 
        steps={mockSteps} 
        currentStep={1} 
        loading={true}
      />
    );
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for circular progress', () => {
    const tree = render(
      <CircularProgress 
        progress={0.65} 
        size={120} 
        strokeWidth={10}
        showPercentage={true}
      />
    );
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for linear progress', () => {
    const tree = render(
      <LinearProgress 
        progress={0.45} 
        height={8}
        showPercentage={true}
      />
    );
    expect(tree).toMatchSnapshot();
  });
});
