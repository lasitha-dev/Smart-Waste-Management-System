/**
 * ProgressIndicator Component
 * Multi-step progress indicator with loading states and animations
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module ProgressIndicator
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity
} from 'react-native';

const { width } = Dimensions.get('window');

/**
 * Step indicator component for progress tracking
 * @param {Object} props - Component props
 * @param {Array} props.steps - Array of step objects
 * @param {number} props.currentStep - Current active step (0-based)
 * @param {boolean} props.loading - Whether current step is loading
 * @param {Function} props.onStepPress - Callback when step is pressed
 * @param {string} props.orientation - Layout orientation ('horizontal', 'vertical')
 * @param {boolean} props.showLabels - Whether to show step labels
 * @param {boolean} props.showProgress - Whether to show progress percentage
 * @param {string} props.style - Additional styles
 */
const ProgressIndicator = ({
  steps = [],
  currentStep = 0,
  loading = false,
  onStepPress,
  orientation = 'horizontal',
  showLabels = true,
  showProgress = true,
  style
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const loadingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate progress
    const progress = steps.length > 0 ? (currentStep + 1) / steps.length : 0;
    
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false
    }).start();
  }, [currentStep, steps.length]);

  useEffect(() => {
    // Loading animation
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(loadingAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
          }),
          Animated.timing(loadingAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true
          })
        ])
      ).start();
    } else {
      loadingAnim.setValue(0);
    }
  }, [loading]);

  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return loading ? 'loading' : 'active';
    return 'pending';
  };

  const getStepIcon = (step, status, index) => {
    if (status === 'completed') return '✓';
    if (status === 'loading') return '⏳';
    if (step.icon) return step.icon;
    return index + 1;
  };

  const renderStep = (step, stepIndex) => {
    const status = getStepStatus(stepIndex);
    const isClickable = onStepPress && (status === 'completed' || stepIndex <= currentStep);

    const stepOpacity = loadingAnim.interpolate({
      inputRange: [0, 1],
      outputRange: status === 'loading' ? [0.5, 1] : [1, 1]
    });

    return (
      <TouchableOpacity
        key={stepIndex}
        style={styles.stepContainer}
        onPress={() => isClickable && onStepPress(stepIndex)}
        disabled={!isClickable}
        activeOpacity={isClickable ? 0.7 : 1}
      >
        <Animated.View
          style={[
            styles.stepCircle,
            styles[`step${status.charAt(0).toUpperCase() + status.slice(1)}`],
            { opacity: stepOpacity }
          ]}
        >
          <Text style={[
            styles.stepText,
            styles[`stepText${status.charAt(0).toUpperCase() + status.slice(1)}`]
          ]}>
            {getStepIcon(step, status, stepIndex)}
          </Text>
        </Animated.View>

        {showLabels && (
          <View style={styles.stepLabelContainer}>
            <Text style={[
              styles.stepLabel,
              status === 'active' && styles.stepLabelActive
            ]}>
              {step.title || `Step ${stepIndex + 1}`}
            </Text>
            {step.subtitle && (
              <Text style={styles.stepSubtitle}>
                {step.subtitle}
              </Text>
            )}
          </View>
        )}

        {/* Connection line */}
        {stepIndex < steps.length - 1 && (
          <View style={styles.connectionLine}>
            <View style={[
              styles.connectionLineFill,
              stepIndex < currentStep && styles.connectionLineCompleted
            ]} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderHorizontalProgress = () => (
    <View style={[styles.horizontalContainer, style]}>
      {showProgress && (
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>
            Step {currentStep + 1} of {steps.length}
          </Text>
          <Text style={styles.progressPercentage}>
            {Math.round(((currentStep + 1) / steps.length) * 100)}%
          </Text>
        </View>
      )}

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarTrack} />
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              })
            }
          ]}
        />
      </View>

      <View style={styles.stepsRow}>
        {steps.map((step, index) => renderStep(step, index))}
      </View>
    </View>
  );

  const renderVerticalProgress = () => (
    <View style={[styles.verticalContainer, style]}>
      {showProgress && (
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>
            Progress: {currentStep + 1}/{steps.length}
          </Text>
          <Text style={styles.progressPercentage}>
            {Math.round(((currentStep + 1) / steps.length) * 100)}%
          </Text>
        </View>
      )}

      <View style={styles.stepsColumn}>
        {steps.map((step, index) => (
          <View key={index} style={styles.verticalStepContainer}>
            {renderStep(step, index)}
          </View>
        ))}
      </View>
    </View>
  );

  if (steps.length === 0) return null;

  return orientation === 'horizontal' 
    ? renderHorizontalProgress() 
    : renderVerticalProgress();
};

/**
 * Circular progress indicator
 */
export const CircularProgress = ({
  progress = 0,
  size = 100,
  strokeWidth = 8,
  color = '#4CAF50',
  backgroundColor = '#E0E0E0',
  showPercentage = true,
  animated = true,
  children,
  style
}) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedProgress, {
        toValue: progress,
        duration: 1000,
        useNativeDriver: false
      }).start();
    } else {
      animatedProgress.setValue(progress);
    }
  }, [progress, animated]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={[styles.circularContainer, { width: size, height: size }, style]}>
      <Animated.View style={styles.circularProgress}>
        {/* Background circle */}
        <View
          style={[
            styles.circle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: backgroundColor
            }
          ]}
        />

        {/* Progress circle */}
        <Animated.View
          style={[
            styles.circle,
            styles.progressCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: color,
              transform: [{
                rotate: animatedProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['-90deg', '270deg']
                })
              }]
            }
          ]}
        />
      </Animated.View>

      {/* Content */}
      <View style={styles.circularContent}>
        {children || (showPercentage && (
          <Text style={[styles.percentageText, { color }]}>
            {Math.round(progress * 100)}%
          </Text>
        ))}
      </View>
    </View>
  );
};

/**
 * Linear progress bar
 */
export const LinearProgress = ({
  progress = 0,
  height = 6,
  color = '#4CAF50',
  backgroundColor = '#E0E0E0',
  animated = true,
  showPercentage = false,
  style
}) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedProgress, {
        toValue: progress,
        duration: 500,
        useNativeDriver: false
      }).start();
    } else {
      animatedProgress.setValue(progress);
    }
  }, [progress, animated]);

  return (
    <View style={[styles.linearContainer, style]}>
      <View style={[
        styles.linearTrack,
        { height, backgroundColor }
      ]}>
        <Animated.View
          style={[
            styles.linearFill,
            {
              height,
              backgroundColor: color,
              width: animatedProgress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              })
            }
          ]}
        />
      </View>
      
      {showPercentage && (
        <Text style={styles.linearPercentage}>
          {Math.round(progress * 100)}%
        </Text>
      )}
    </View>
  );
};

const colors = {
  primary: '#4CAF50',
  secondary: '#2196F3',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#f44336',
  disabled: '#9E9E9E',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#212121',
  textSecondary: '#757575',
  border: '#E0E0E0'
};

const styles = StyleSheet.create({
  horizontalContainer: {
    padding: 16
  },
  verticalContainer: {
    padding: 16
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginBottom: 24,
    overflow: 'hidden'
  },
  progressBarTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  stepsColumn: {
    flexDirection: 'column'
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
    position: 'relative'
  },
  verticalStepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2
  },
  stepPending: {
    backgroundColor: colors.surface,
    borderColor: colors.border
  },
  stepActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  stepCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success
  },
  stepLoading: {
    backgroundColor: colors.warning,
    borderColor: colors.warning
  },
  stepText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  stepTextPending: {
    color: colors.textSecondary
  },
  stepTextActive: {
    color: colors.background
  },
  stepTextCompleted: {
    color: colors.background
  },
  stepTextLoading: {
    color: colors.background
  },
  stepLabelContainer: {
    alignItems: 'center',
    maxWidth: 80
  },
  stepLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: colors.textSecondary,
    fontWeight: '500'
  },
  stepLabelActive: {
    color: colors.text,
    fontWeight: '600'
  },
  stepSubtitle: {
    fontSize: 10,
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 2
  },
  connectionLine: {
    position: 'absolute',
    top: 20,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: colors.border,
    zIndex: -1
  },
  connectionLineFill: {
    height: '100%',
    backgroundColor: colors.border
  },
  connectionLineCompleted: {
    backgroundColor: colors.success
  },
  circularContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  },
  circularProgress: {
    position: 'absolute'
  },
  circle: {
    position: 'absolute'
  },
  progressCircle: {
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent'
  },
  circularContent: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  percentageText: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  linearContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  linearTrack: {
    flex: 1,
    borderRadius: 3,
    overflow: 'hidden'
  },
  linearFill: {
    borderRadius: 3
  },
  linearPercentage: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    minWidth: 35
  }
});

export default ProgressIndicator;
