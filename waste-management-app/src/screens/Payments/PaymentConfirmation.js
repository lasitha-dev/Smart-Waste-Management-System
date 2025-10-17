/**
 * Payment Confirmation Screen
 * Displays successful payment confirmation with receipt details
 * @module PaymentConfirmation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';
import { usePayment } from '../../context/PaymentContext';
import LoadingIndicator from '../../components/LoadingIndicator';
import Toast from '../../components/Toast';
import ConfirmationModal from '../../components/ConfirmationModal';
import { getReceipt, generateReceiptPDF, sendReceiptEmail } from '../../api/paymentService';
import { formatCurrency } from '../../utils/paymentHelpers';
import { formatReceiptTimestamp } from '../../utils/dateFormatter';

const RESIDENT_ID = 'RES001';

/**
 * PaymentConfirmation Component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object
 * @param {Object} props.route - Route object with params
 */
const PaymentConfirmation = ({ navigation, route }) => {
  const { transactionId, receiptId, amount } = route.params;
  const { resetPaymentState } = usePayment();

  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const [checkmarkScale] = useState(new Animated.Value(0));
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadReceipt();
    animateCheckmark();
    // Show modal after a short delay
    setTimeout(() => setShowModal(true), 500);
  }, []);

  /**
   * Loads receipt data
   */
  const loadReceipt = async () => {
    try {
      const receipt = await getReceipt(receiptId);
      setReceiptData(receipt);
    } catch (error) {
      showToast('Failed to load receipt details', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Animates success checkmark
   */
  const animateCheckmark = () => {
    Animated.spring(checkmarkScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  /**
   * Shows toast notification
   */
  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
  };

  /**
   * Handles download receipt
   */
  const handleDownloadReceipt = async () => {
    try {
      const result = await generateReceiptPDF(receiptId);
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
  const handlePrintReceipt = () => {
    showToast('Print feature - Coming soon', 'info');
  };

  /**
   * Handles email receipt
   */
  const handleEmailReceipt = async () => {
    try {
      await sendReceiptEmail(RESIDENT_ID, receiptId);
      showToast('Receipt sent to your email', 'success');
    } catch (error) {
      showToast('Failed to send receipt', 'error');
    }
  };

  /**
   * Handles view history
   */
  const handleViewHistory = () => {
    resetPaymentState();
    navigation.navigate('PaymentHistory');
  };

  /**
   * Handles return to hub
   */
  const handleReturnToHub = () => {
    resetPaymentState();
    navigation.navigate('PaymentHub');
  };

  /**
   * Handles modal done button
   */
  const handleModalDone = () => {
    setShowModal(false);
  };

  if (loading) {
    return <LoadingIndicator type="spinner" message="Loading receipt..." />;
  }

  const nextSteps = [
    'A confirmation email has been sent to your registered email address',
    'Your receipt is available for download below',
    'You can view this transaction in your payment history anytime',
    'Your bill status has been updated to "Paid"',
  ];

  return (
    <View style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ ...toast, visible: false })}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showModal}
        title="Payment Confirmed!"
        confirmationNumber={transactionId}
        message="Payment processed successfully"
        nextSteps={nextSteps}
        onDone={handleModalDone}
        iconType="success"
      />

      <ScrollView style={styles.content}>
        {/* Success Animation */}
        <View style={styles.successContainer}>
          <Animated.View
            style={[
              styles.checkmarkContainer,
              { transform: [{ scale: checkmarkScale }] },
            ]}
          >
            <Text style={styles.checkmark}>✓</Text>
          </Animated.View>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSubtitle}>
            Your payment has been processed successfully
          </Text>
        </View>

        {/* Payment Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Payment Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount Paid:</Text>
            <Text style={styles.detailValue}>{formatCurrency(amount)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID:</Text>
            <Text style={styles.detailValueSmall}>{transactionId}</Text>
          </View>

          {receiptData && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Completed At:</Text>
                <Text style={styles.detailValueSmall}>
                  {formatReceiptTimestamp(receiptData.completedAt)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Receipt ID:</Text>
                <Text style={styles.detailValueSmall}>{receiptId}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Bill ID:</Text>
                <Text style={styles.detailValueSmall}>{receiptData.billId}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Method:</Text>
                <Text style={styles.detailValueSmall}>{receiptData.paymentMethod}</Text>
              </View>

              {receiptData.creditsApplied > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Credits Applied:</Text>
                  <Text style={[styles.detailValue, { color: COLORS.accentGreen }]}>
                    {formatCurrency(receiptData.creditsApplied)}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.downloadButton]}
            onPress={handleDownloadReceipt}
          >
            <Text style={styles.actionButtonText}>📥 DOWNLOAD RECEIPT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.printButton]}
            onPress={handlePrintReceipt}
          >
            <Text style={styles.actionButtonText}>🖨️ PRINT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.emailButton]}
            onPress={handleEmailReceipt}
          >
            <Text style={styles.actionButtonText}>📧 EMAIL RECEIPT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.historyButton]}
            onPress={handleViewHistory}
          >
            <Text style={styles.actionButtonText}>📜 VIEW HISTORY</Text>
          </TouchableOpacity>
        </View>

        {/* Confirmation Message */}
        <View style={styles.confirmationBox}>
          <Text style={styles.confirmationText}>
            A confirmation has been sent to your email and phone number.
          </Text>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.returnButton} onPress={handleReturnToHub}>
          <Text style={styles.returnButtonText}>RETURN TO PAYMENTS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.modalBackground,
  },
  checkmarkContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.accentGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkmark: {
    fontSize: 60,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weight.bold,
  },
  successTitle: {
    fontSize: FONTS.size.heading,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: FONTS.size.body,
    color: '#6B7280',
    fontWeight: FONTS.weight.regular,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  detailsCard: {
    backgroundColor: COLORS.cardBackground,
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: FONTS.size.subheading,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
    fontWeight: FONTS.weight.regular,
    flex: 1,
  },
  detailValue: {
    fontSize: FONTS.size.body,
    color: COLORS.primaryDarkTeal,
    fontWeight: FONTS.weight.bold,
    flex: 1,
    textAlign: 'right',
  },
  detailValueSmall: {
    fontSize: FONTS.size.small,
    color: COLORS.primaryDarkTeal,
    fontWeight: FONTS.weight.semiBold,
    flex: 1,
    textAlign: 'right',
  },
  actionsContainer: {
    padding: 16,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  downloadButton: {
    backgroundColor: COLORS.accentGreen,
  },
  printButton: {
    backgroundColor: COLORS.primaryDarkTeal,
  },
  emailButton: {
    backgroundColor: '#2196F3',
  },
  historyButton: {
    backgroundColor: '#FF9800',
  },
  actionButtonText: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
  confirmationBox: {
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  confirmationText: {
    fontSize: FONTS.size.small,
    color: '#1E3A8A',
    fontWeight: FONTS.weight.regular,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: COLORS.modalBackground,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  returnButton: {
    backgroundColor: COLORS.primaryDarkTeal,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  returnButtonText: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
});

export default PaymentConfirmation;
