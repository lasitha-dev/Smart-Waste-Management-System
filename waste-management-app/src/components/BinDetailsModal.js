/**
 * BinDetailsModal Component
 * Modal displaying bin details with action buttons
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

/**
 * BinDetailsModal
 * Displays a modal with bin information and action buttons
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the modal is visible
 * @param {string} props.binId - The bin identifier
 * @param {string} props.location - The bin location/address
 * @param {Function} props.onConfirm - Callback for confirm collection button
 * @param {Function} props.onReportIssue - Callback for report issue button
 * @param {Function} props.onClose - Callback to close the modal
 * @returns {JSX.Element} The BinDetailsModal component
 */
const BinDetailsModal = ({
  visible,
  binId,
  location,
  onConfirm,
  onReportIssue,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <Text style={styles.title}>Bin Details</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Bin ID:</Text>
              <Text style={styles.value}>{binId}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Location:</Text>
              <Text style={styles.value}>{location}</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>Confirm Collection</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.reportButton]}
              onPress={onReportIssue}
              activeOpacity={0.8}
            >
              <Text style={styles.reportButtonText}>Report Issue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.modalBackground,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textSecondary,
    paddingBottom: 12,
  },
  title: {
    fontSize: FONTS.size.heading,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
  },
  content: {
    marginBottom: 24,
  },
  infoRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 4,
    opacity: 0.7,
  },
  value: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.regular,
    color: COLORS.primaryDarkTeal,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    backgroundColor: COLORS.accentGreen,
  },
  confirmButtonText: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.textPrimary,
  },
  reportButton: {
    backgroundColor: COLORS.modalBackground,
    borderWidth: 2,
    borderColor: COLORS.alertRed,
  },
  reportButtonText: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.alertRed,
  },
});

export default BinDetailsModal;
