/**
 * Confirmation Modal Component
 * Beautiful modal popup for payment confirmation with next steps
 * @module ConfirmationModal
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

/**
 * ConfirmationModal Component
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether modal is visible
 * @param {string} props.title - Modal title (e.g., "Payment Confirmed!")
 * @param {string} props.confirmationNumber - Confirmation/Transaction ID
 * @param {string} props.message - Success message
 * @param {Array} props.nextSteps - Array of next step strings
 * @param {Function} props.onDone - Handler for done button
 * @param {string} props.iconType - Icon type: 'success', 'info', 'warning'
 */
const ConfirmationModal = ({
  visible = false,
  title = 'Payment Confirmed!',
  confirmationNumber = '',
  message = 'Payment processed successfully',
  nextSteps = [],
  onDone,
  iconType = 'success',
}) => {
  const getIconColor = () => {
    switch (iconType) {
      case 'success':
        return COLORS.accentGreen;
      case 'info':
        return '#2196F3';
      case 'warning':
        return '#FF9800';
      default:
        return COLORS.accentGreen;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDone}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Success Icon */}
            <View style={[styles.iconContainer, { backgroundColor: getIconColor() }]}>
              <Text style={styles.iconText}>✓</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Confirmation Number */}
            {confirmationNumber && (
              <View style={styles.confirmationBox}>
                <Text style={styles.confirmationLabel}>Confirmation Number:</Text>
                <Text style={styles.confirmationNumber}>{confirmationNumber}</Text>
              </View>
            )}

            {/* Message */}
            {message && (
              <Text style={styles.message}>{message}</Text>
            )}

            {/* Next Steps */}
            {nextSteps && nextSteps.length > 0 && (
              <View style={styles.nextStepsContainer}>
                <Text style={styles.nextStepsTitle}>Next Steps:</Text>
                {nextSteps.map((step, index) => (
                  <View key={index} style={styles.stepRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Done Button */}
            <TouchableOpacity
              style={[styles.doneButton, { backgroundColor: getIconColor() }]}
              onPress={onDone}
              activeOpacity={0.8}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: COLORS.modalBackground,
    borderRadius: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  scrollContent: {
    padding: 32,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 48,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weight.bold,
  },
  title: {
    fontSize: 28,
    fontWeight: FONTS.weight.bold,
    color: COLORS.accentGreen,
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmationBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 16,
  },
  confirmationLabel: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
    fontWeight: FONTS.weight.semiBold,
    marginBottom: 4,
    textAlign: 'center',
  },
  confirmationNumber: {
    fontSize: FONTS.size.body,
    color: COLORS.primaryDarkTeal,
    fontWeight: FONTS.weight.bold,
    textAlign: 'center',
  },
  message: {
    fontSize: FONTS.size.body,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 24,
  },
  nextStepsContainer: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 24,
  },
  nextStepsTitle: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.accentGreen,
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: FONTS.size.body,
    color: COLORS.accentGreen,
    marginRight: 8,
    marginTop: 2,
  },
  stepText: {
    flex: 1,
    fontSize: FONTS.size.small,
    color: '#065F46',
    lineHeight: 20,
  },
  doneButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  doneButtonText: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
});

export default ConfirmationModal;
