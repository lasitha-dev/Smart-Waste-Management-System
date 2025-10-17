/**
 * Status Message Component
 * Displays inline error/success/warning messages
 * @module StatusMessage
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

/**
 * StatusMessage Component
 * @param {Object} props - Component props
 * @param {string} props.type - Message type: 'success', 'error', 'warning', 'info'
 * @param {string} props.message - Message text
 * @param {boolean} props.visible - Whether message is visible
 */
const StatusMessage = ({ type = 'info', message = '', visible = true }) => {
  if (!visible || !message) {
    return null;
  }

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: styles.successContainer,
          text: styles.successText,
        };
      case 'error':
        return {
          container: styles.errorContainer,
          text: styles.errorText,
        };
      case 'warning':
        return {
          container: styles.warningContainer,
          text: styles.warningText,
        };
      case 'info':
      default:
        return {
          container: styles.infoContainer,
          text: styles.infoText,
        };
    }
  };

  const statusStyles = getStyles();

  return (
    <View style={[styles.container, statusStyles.container]}>
      <Text style={[styles.message, statusStyles.text]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
  },
  message: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.regular,
  },
  successContainer: {
    backgroundColor: '#D1FAE5',
    borderColor: COLORS.accentGreen,
  },
  successText: {
    color: '#065F46',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderColor: COLORS.alertRed,
  },
  errorText: {
    color: '#991B1B',
  },
  warningContainer: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FF9800',
  },
  warningText: {
    color: '#92400E',
  },
  infoContainer: {
    backgroundColor: '#DBEAFE',
    borderColor: COLORS.primaryDarkTeal,
  },
  infoText: {
    color: '#1E3A8A',
  },
});

export default StatusMessage;
