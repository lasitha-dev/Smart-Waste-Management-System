/**
 * Receipt View Screen
 * Full screen view for displaying and managing receipts
 * @module ReceiptViewScreen
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';
import Toast from '../../components/Toast';
import ReceiptView from '../../components/ReceiptView';
import { generateReceiptPDF, sendReceiptEmail } from '../../api/paymentService';

const RESIDENT_ID = 'RES001';

/**
 * ReceiptViewScreen Component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object
 * @param {Object} props.route - Route object with params
 */
const ReceiptViewScreen = ({ navigation, route }) => {
  const { receiptData } = route.params;
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  /**
   * Shows toast notification
   */
  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
  };

  /**
   * Handles download receipt
   */
  const handleDownload = async () => {
    try {
      const result = await generateReceiptPDF(receiptData.id);
      if (result.success) {
        showToast('Receipt downloaded successfully', 'success');
      }
    } catch (error) {
      showToast('Failed to download receipt', 'error');
    }
  };

  /**
   * Handles print receipt
   */
  const handlePrint = () => {
    showToast('Print feature - Coming soon', 'info');
  };

  /**
   * Handles share receipt
   */
  const handleShare = async () => {
    try {
      await sendReceiptEmail(RESIDENT_ID, receiptData.id);
      showToast('Receipt sent to your email', 'success');
    } catch (error) {
      showToast('Failed to send receipt', 'error');
    }
  };

  return (
    <View style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ ...toast, visible: false })}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Receipt</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Receipt Content */}
      <ReceiptView
        receiptData={receiptData}
        onDownload={handleDownload}
        onPrint={handlePrint}
        onShare={handleShare}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.primaryDarkTeal,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  headerTitle: {
    fontSize: FONTS.size.subheading,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
});

export default ReceiptViewScreen;
