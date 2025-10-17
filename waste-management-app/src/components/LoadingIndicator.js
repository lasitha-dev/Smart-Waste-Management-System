/**
 * Loading Indicator Component
 * Displays loading states with multiple types
 * @module LoadingIndicator
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

/**
 * LoadingIndicator Component
 * @param {Object} props - Component props
 * @param {string} props.type - Type of loading indicator: 'spinner', 'overlay', 'inline'
 * @param {string} props.message - Optional loading message
 * @param {string} props.size - Size of spinner: 'small', 'large'
 * @param {string} props.color - Color of spinner
 */
const LoadingIndicator = ({ 
  type = 'spinner', 
  message = 'Loading...', 
  size = 'large',
  color = COLORS.accentGreen 
}) => {
  if (type === 'overlay') {
    return (
      <View style={styles.overlayContainer}>
        <View style={styles.overlayContent}>
          <ActivityIndicator size={size} color={color} />
          {message && <Text style={styles.overlayMessage}>{message}</Text>}
        </View>
      </View>
    );
  }

  if (type === 'inline') {
    return (
      <View style={styles.inlineContainer}>
        <ActivityIndicator size={size} color={color} />
        {message && <Text style={styles.inlineMessage}>{message}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.spinnerContainer}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.spinnerMessage}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  overlayContent: {
    backgroundColor: COLORS.modalBackground,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minWidth: 150,
  },
  overlayMessage: {
    marginTop: 12,
    fontSize: FONTS.size.small,
    color: COLORS.primaryDarkTeal,
    fontWeight: FONTS.weight.semiBold,
  },
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  spinnerMessage: {
    marginTop: 12,
    fontSize: FONTS.size.small,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weight.regular,
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  inlineMessage: {
    marginLeft: 12,
    fontSize: FONTS.size.small,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weight.regular,
  },
});

export default LoadingIndicator;
