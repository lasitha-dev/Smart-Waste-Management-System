/**
 * Toast Notification Component
 * Displays temporary notification messages
 * @module Toast
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

/**
 * Toast Component
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether toast is visible
 * @param {string} props.message - Toast message
 * @param {string} props.type - Toast type: 'success', 'error', 'warning', 'info'
 * @param {number} props.duration - Duration in milliseconds (default: 3000)
 * @param {Function} props.onDismiss - Callback when toast is dismissed
 */
const Toast = ({ 
  visible = false, 
  message = '', 
  type = 'info', 
  duration = 3000,
  onDismiss 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, duration]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onDismiss) {
        onDismiss();
      }
    });
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return COLORS.accentGreen;
      case 'error':
        return COLORS.alertRed;
      case 'warning':
        return '#FF9800';
      case 'info':
      default:
        return COLORS.primaryDarkTeal;
    }
  };

  if (!visible && fadeAnim._value === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity 
        style={styles.content} 
        onPress={handleDismiss}
        activeOpacity={0.9}
      >
        <Text style={styles.message}>{message}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    zIndex: 10000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    flex: 1,
    fontSize: FONTS.size.small,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weight.semiBold,
  },
});

export default Toast;
