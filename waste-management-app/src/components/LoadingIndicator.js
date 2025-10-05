/**
 * LoadingIndicator Component
 * Reusable loading indicators with different styles and animations
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module LoadingIndicator
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import colors from '../constants/colors';
import spacing from '../constants/spacing';
import typography from '../constants/typography';

const { width } = Dimensions.get('window');

/**
 * LoadingIndicator component for various loading states
 * @param {Object} props - Component props
 * @param {string} props.type - Type of loading indicator ('spinner', 'dots', 'pulse', 'skeleton')
 * @param {string} props.size - Size of indicator ('small', 'medium', 'large')
 * @param {string} props.text - Loading text to display
 * @param {string} props.color - Primary color for the indicator
 * @param {boolean} props.overlay - Whether to show as full screen overlay
 * @param {string} props.style - Additional styles
 */
const LoadingIndicator = ({
  type = 'spinner',
  size = 'medium',
  text = 'Loading...',
  color = '#4CAF50',
  overlay = false,
  style
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const dotValues = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]).current;

  useEffect(() => {
    startAnimation();
  }, [type]);

  const startAnimation = () => {
    switch (type) {
      case 'pulse':
        startPulseAnimation();
        break;
      case 'dots':
        startDotsAnimation();
        break;
      default:
        startSpinnerAnimation();
    }
  };

  const startSpinnerAnimation = () => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ).start();
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
          duration: 600,
          easing: Easing.ease,
          useNativeDriver: true
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 600,
          easing: Easing.ease,
          useNativeDriver: true
        })
      ])
    ).start();
  };

  const startDotsAnimation = () => {
    const animateDots = () => {
      const animations = dotValues.map((value, index) =>
        Animated.sequence([
          Animated.delay(index * 200),
          Animated.timing(value, {
            toValue: 1,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true
          })
        ])
      );

      Animated.loop(
        Animated.parallel(animations)
      ).start();
    };

    animateDots();
  };

  const getSizeConfig = () => {
    const configs = {
      small: { iconSize: 20, textSize: 12, spacing: 8 },
      medium: { iconSize: 30, textSize: 14, spacing: 12 },
      large: { iconSize: 40, textSize: 16, spacing: 16 }
    };
    return configs[size] || configs.medium;
  };

  const sizeConfig = getSizeConfig();

  const renderSpinner = () => {
    const rotation = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    });

    return (
      <Animated.View
        style={[
          styles.spinner,
          {
            width: sizeConfig.iconSize,
            height: sizeConfig.iconSize,
            borderColor: `${color}20`,
            borderTopColor: color,
            transform: [{ rotate: rotation }]
          }
        ]}
      />
    );
  };

  const renderPulse = () => (
    <Animated.View
      style={[
        styles.pulse,
        {
          width: sizeConfig.iconSize,
          height: sizeConfig.iconSize,
          backgroundColor: color,
          transform: [{ scale: pulseValue }]
        }
      ]}
    />
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {dotValues.map((value, index) => {
        const opacity = value.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 1]
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: sizeConfig.iconSize * 0.3,
                height: sizeConfig.iconSize * 0.3,
                backgroundColor: color,
                opacity,
                marginHorizontal: 2
              }
            ]}
          />
        );
      })}
    </View>
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      <View style={[styles.skeletonLine, styles.skeletonTitle]} />
      <View style={[styles.skeletonLine, styles.skeletonSubtitle]} />
      <View style={[styles.skeletonLine, styles.skeletonText]} />
    </View>
  );

  const renderActivityIndicator = () => (
    <ActivityIndicator
      size={size === 'small' ? 'small' : 'large'}
      color={color}
    />
  );

  const renderIndicator = () => {
    switch (type) {
      case 'spinner':
        return renderSpinner();
      case 'pulse':
        return renderPulse();
      case 'dots':
        return renderDots();
      case 'skeleton':
        return renderSkeleton();
      default:
        return renderActivityIndicator();
    }
  };

  const containerStyle = [
    styles.container,
    overlay && styles.overlay,
    style
  ];

  return (
    <View style={containerStyle}>
      <View style={styles.content}>
        {renderIndicator()}
        {text && type !== 'skeleton' && (
          <Text style={[
            styles.text,
            { fontSize: sizeConfig.textSize, marginTop: sizeConfig.spacing }
          ]}>
            {text}
          </Text>
        )}
      </View>
    </View>
  );
};

/**
 * Inline loading component for buttons and small areas
 */
export const InlineLoader = ({ 
  size = 'small', 
  color = '#FFFFFF', 
  text = '', 
  style 
}) => (
  <View style={[styles.inlineContainer, style]}>
    <ActivityIndicator size={size} color={color} />
    {text && <Text style={[styles.inlineText, { color }]}>{text}</Text>}
  </View>
);

/**
 * Page loading overlay component
 */
export const PageLoader = ({ 
  text = 'Loading...', 
  visible = true, 
  transparent = false 
}) => {
  if (!visible) return null;

  return (
    <View style={[
      styles.pageLoader,
      transparent && styles.transparentLoader
    ]}>
      <View style={styles.pageLoaderContent}>
        <LoadingIndicator
          type="pulse"
          size="large"
          text={text}
          color="#4CAF50"
        />
      </View>
    </View>
  );
};

/**
 * Skeleton loading component for list items
 */
export const SkeletonLoader = ({ count = 3, style }) => (
  <View style={style}>
    {Array.from({ length: count }, (_, index) => (
      <View key={index} style={styles.skeletonItem}>
        <View style={styles.skeletonAvatar} />
        <View style={styles.skeletonContent}>
          <View style={[styles.skeletonLine, styles.skeletonTitle]} />
          <View style={[styles.skeletonLine, styles.skeletonSubtitle]} />
          <View style={[styles.skeletonLine, styles.skeletonText]} />
        </View>
      </View>
    ))}
  </View>
);

// Colors imported from constants

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1000
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    color: colors.textSecondary,
    textAlign: 'center'
  },
  spinner: {
    borderWidth: 2,
    borderRadius: 20
  },
  pulse: {
    borderRadius: 20
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dot: {
    borderRadius: 10
  },
  skeletonContainer: {
    width: width - 32,
    padding: 16
  },
  skeletonItem: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 8
  },
  skeletonAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.border,
    marginRight: 16
  },
  skeletonContent: {
    flex: 1
  },
  skeletonLine: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    marginBottom: 8
  },
  skeletonTitle: {
    width: '80%',
    height: 16
  },
  skeletonSubtitle: {
    width: '60%',
    height: 14
  },
  skeletonText: {
    width: '40%',
    height: 12
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  inlineText: {
    marginLeft: 8,
    fontSize: 14
  },
  pageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  },
  transparentLoader: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)'
  },
  pageLoaderContent: {
    backgroundColor: colors.background,
    padding: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8
  }
});

export default LoadingIndicator;
