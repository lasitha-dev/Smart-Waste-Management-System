/**
 * Payment Page Screen
 * 3-step payment process: Review Bill -> Select Method -> Confirm & Process
 * @module PaymentPage
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';
import { usePayment } from '../../context/PaymentContext';
import useFormSubmit from '../../hooks/useFormSubmit';
import LoadingIndicator from '../../components/LoadingIndicator';
import Toast from '../../components/Toast';
import StatusMessage from '../../components/StatusMessage';
import PaymentMethodCard from '../../components/PaymentMethodCard';
import {
  getBillById,
  getPaymentMethods,
  applyCreditsToPayment,
  processPayment,
  recordPaymentSuccess,
  recordPaymentFailure,
  sendPaymentConfirmation,
  sendPaymentFailureNotification,
} from '../../api/paymentService';
import { formatCurrency } from '../../utils/paymentHelpers';
import { formatTimestamp, getDueDateStatus } from '../../utils/dateFormatter';

const RESIDENT_ID = 'RES001';

/**
 * PaymentPage Component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object
 * @param {Object} props.route - Route object with params
 */
const PaymentPage = ({ navigation, route }) => {
  const { billId } = route.params;
  const { currentSession, selectPaymentMethod, markPaymentInProgress, storePaymentResult } = usePayment();

  const [currentStep, setCurrentStep] = useState(1);
  const [billData, setBillData] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [creditsToApply, setCreditsToApply] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const [error, setError] = useState(null);

  /**
   * Loads bill and payment methods data
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        const [bill, methods] = await Promise.all([
          getBillById(billId),
          getPaymentMethods(RESIDENT_ID),
        ]);

        setBillData(bill);
        setPaymentMethods(methods);
        setFinalAmount(bill.finalAmount);
        setCreditsToApply(bill.appliedCredits || 0);

        if (methods.length > 0) {
          const defaultMethod = methods.find(m => m.isDefault) || methods[0];
          setSelectedMethod(defaultMethod);
          selectPaymentMethod(defaultMethod);
        }
      } catch (err) {
        setError(err.message || 'Failed to load payment data');
      }
    };

    loadData();
  }, [billId]);

  /**
   * Shows toast notification
   */
  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
  };

  /**
   * Handles apply credits
   */
  const handleApplyCredits = async () => {
    if (!currentSession) {
      showToast('Session expired. Please restart payment.', 'error');
      return;
    }

    try {
      const result = await applyCreditsToPayment(currentSession.sessionId, creditsToApply);
      setFinalAmount(result.newFinalAmount);
      showToast('Credits applied successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to apply credits', 'error');
    }
  };

  /**
   * Handles next step
   */
  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedMethod) {
        showToast('Please select a payment method', 'error');
        return;
      }
      setCurrentStep(3);
    }
  };

  /**
   * Handles back step
   */
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  /**
   * Handles payment submission
   */
  const handleCompletePayment = async () => {
    if (!termsAccepted) {
      showToast('Please accept terms and conditions', 'error');
      return;
    }

    if (!selectedMethod) {
      showToast('Please select a payment method', 'error');
      return;
    }

    if (!currentSession) {
      showToast('Session expired. Please restart payment.', 'error');
      return;
    }

    setProcessing(true);
    markPaymentInProgress(true);

    try {
      const paymentResult = await processPayment(
        currentSession.sessionId,
        selectedMethod,
        null
      );

      if (paymentResult.success) {
        const recordResult = await recordPaymentSuccess(
          currentSession.sessionId,
          paymentResult.transactionId,
          paymentResult.amount
        );

        await sendPaymentConfirmation(RESIDENT_ID, {
          billId: billData.id,
          amount: paymentResult.amount,
          transactionId: paymentResult.transactionId,
          receiptId: recordResult.receiptId,
        });

        storePaymentResult({
          success: true,
          transactionId: paymentResult.transactionId,
          receiptId: recordResult.receiptId,
          amount: paymentResult.amount,
        });

        navigation.replace('PaymentConfirmation', {
          transactionId: paymentResult.transactionId,
          receiptId: recordResult.receiptId,
          amount: paymentResult.amount,
        });
      } else {
        await recordPaymentFailure(
          currentSession.sessionId,
          'PAYMENT_FAILED',
          paymentResult.error
        );

        await sendPaymentFailureNotification(RESIDENT_ID, paymentResult.error);

        showToast(paymentResult.error, 'error');
        setError(paymentResult.error);
      }
    } catch (err) {
      showToast(err.message || 'Payment processing failed', 'error');
      setError(err.message);
    } finally {
      setProcessing(false);
      markPaymentInProgress(false);
    }
  };

  if (!billData) {
    return <LoadingIndicator type="spinner" message="Loading payment details..." />;
  }

  return (
    <View style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ ...toast, visible: false })}
      />

      {processing && (
        <LoadingIndicator type="overlay" message="Processing payment..." />
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        <View style={styles.stepContainer}>
          <View style={[styles.stepCircle, currentStep >= 1 && styles.stepCircleActive]}>
            <Text style={[styles.stepNumber, currentStep >= 1 && styles.stepNumberActive]}>1</Text>
          </View>
          <Text style={styles.stepLabel}>Review</Text>
        </View>
        <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />
        <View style={styles.stepContainer}>
          <View style={[styles.stepCircle, currentStep >= 2 && styles.stepCircleActive]}>
            <Text style={[styles.stepNumber, currentStep >= 2 && styles.stepNumberActive]}>2</Text>
          </View>
          <Text style={styles.stepLabel}>Method</Text>
        </View>
        <View style={[styles.stepLine, currentStep >= 3 && styles.stepLineActive]} />
        <View style={styles.stepContainer}>
          <View style={[styles.stepCircle, currentStep >= 3 && styles.stepCircleActive]}>
            <Text style={[styles.stepNumber, currentStep >= 3 && styles.stepNumberActive]}>3</Text>
          </View>
          <Text style={styles.stepLabel}>Confirm</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Step 1: Review Bill */}
        {currentStep === 1 && (
          <View style={styles.step}>
            <Text style={styles.stepTitle}>Review Bill Details</Text>

            <View style={styles.billCard}>
              <View style={styles.billHeader}>
                <Text style={styles.billId}>{billData.id}</Text>
                <Text style={styles.billingPeriod}>{billData.billingPeriod}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.amountBreakdown}>
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Base Amount:</Text>
                  <Text style={styles.amountValue}>{formatCurrency(billData.amount)}</Text>
                </View>
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Taxes (10%):</Text>
                  <Text style={styles.amountValue}>{formatCurrency(billData.taxes)}</Text>
                </View>
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Subtotal:</Text>
                  <Text style={styles.amountValue}>{formatCurrency(billData.subtotal)}</Text>
                </View>
                {creditsToApply > 0 && (
                  <View style={styles.amountRow}>
                    <Text style={styles.creditLabel}>Credits Applied:</Text>
                    <Text style={styles.creditValue}>-{formatCurrency(creditsToApply)}</Text>
                  </View>
                )}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>TOTAL DUE:</Text>
                  <Text style={styles.totalValue}>{formatCurrency(finalAmount)}</Text>
                </View>
              </View>

              <View style={styles.dueDateContainer}>
                <Text style={styles.dueDateLabel}>Due Date:</Text>
                <Text style={styles.dueDateValue}>
                  {formatTimestamp(billData.dueDate, 'date')} ({getDueDateStatus(billData.dueDate)})
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.editCreditsButton}
              onPress={() => showToast('Edit credits feature', 'info')}
            >
              <Text style={styles.editCreditsText}>EDIT CREDITS</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: Select Payment Method */}
        {currentStep === 2 && (
          <View style={styles.step}>
            <Text style={styles.stepTitle}>Select Payment Method</Text>

            {paymentMethods.length === 0 ? (
              <StatusMessage
                type="warning"
                message="No payment methods available. Please add a payment method."
                visible={true}
              />
            ) : (
              paymentMethods.map((method) => (
                <PaymentMethodCard
                  key={method.id}
                  methodData={method}
                  selected={selectedMethod?.id === method.id}
                  onPress={() => {
                    setSelectedMethod(method);
                    selectPaymentMethod(method);
                  }}
                  showActions={false}
                />
              ))
            )}

            <TouchableOpacity
              style={styles.addMethodButton}
              onPress={() => showToast('Add payment method feature', 'info')}
            >
              <Text style={styles.addMethodText}>+ ADD NEW PAYMENT METHOD</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3: Confirm & Process */}
        {currentStep === 3 && (
          <View style={styles.step}>
            <Text style={styles.stepTitle}>Confirm Payment</Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Payment Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Bill ID:</Text>
                <Text style={styles.summaryValue}>{billData.id}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(finalAmount)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Payment Method:</Text>
                <Text style={styles.summaryValue}>
                  {selectedMethod?.type === 'card'
                    ? `${selectedMethod.cardBrand} **** ${selectedMethod.last4Digits}`
                    : `${selectedMethod?.bankName} **** ${selectedMethod?.accountLast4}`}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setTermsAccepted(!termsAccepted)}
            >
              <View style={styles.checkbox}>
                {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                I accept the Terms & Conditions
              </Text>
            </TouchableOpacity>

            <View style={styles.securityBadges}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>🔒 SSL Encrypted</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>✓ PCI DSS</Text>
              </View>
            </View>

            {error && (
              <StatusMessage type="error" message={error} visible={true} />
            )}
          </View>
        )}
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        {currentStep < 3 ? (
          <View style={styles.footerButtons}>
            <TouchableOpacity
              style={[styles.footerButton, styles.backFooterButton]}
              onPress={handleBack}
            >
              <Text style={styles.backButtonText}>BACK</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerButton, styles.nextButton]}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>NEXT</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.completeButton,
              (!termsAccepted || processing) && styles.completeButtonDisabled,
            ]}
            onPress={handleCompletePayment}
            disabled={!termsAccepted || processing}
          >
            <Text style={styles.completeButtonText}>
              {processing ? 'PROCESSING...' : 'COMPLETE PAYMENT'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: COLORS.modalBackground,
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: COLORS.accentGreen,
  },
  stepNumber: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: '#9CA3AF',
  },
  stepNumberActive: {
    color: COLORS.textPrimary,
  },
  stepLabel: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
    fontWeight: FONTS.weight.regular,
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: COLORS.accentGreen,
  },
  content: {
    flex: 1,
  },
  step: {
    padding: 16,
  },
  stepTitle: {
    fontSize: FONTS.size.subheading,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 16,
  },
  billCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  billHeader: {
    marginBottom: 12,
  },
  billId: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 4,
  },
  billingPeriod: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
    fontWeight: FONTS.weight.regular,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  amountBreakdown: {
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
    fontWeight: FONTS.weight.regular,
  },
  amountValue: {
    fontSize: FONTS.size.small,
    color: COLORS.primaryDarkTeal,
    fontWeight: FONTS.weight.semiBold,
  },
  creditLabel: {
    fontSize: FONTS.size.small,
    color: COLORS.accentGreen,
    fontWeight: FONTS.weight.regular,
  },
  creditValue: {
    fontSize: FONTS.size.small,
    color: COLORS.accentGreen,
    fontWeight: FONTS.weight.semiBold,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: COLORS.primaryDarkTeal,
  },
  totalLabel: {
    fontSize: FONTS.size.body,
    color: COLORS.primaryDarkTeal,
    fontWeight: FONTS.weight.bold,
  },
  totalValue: {
    fontSize: FONTS.size.heading,
    color: COLORS.alertRed,
    fontWeight: FONTS.weight.bold,
  },
  dueDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dueDateLabel: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
    fontWeight: FONTS.weight.regular,
  },
  dueDateValue: {
    fontSize: FONTS.size.small,
    color: COLORS.primaryDarkTeal,
    fontWeight: FONTS.weight.semiBold,
  },
  editCreditsButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.accentGreen,
    alignItems: 'center',
  },
  editCreditsText: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.accentGreen,
  },
  addMethodButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primaryDarkTeal,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  addMethodText: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
  },
  summaryCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
    fontWeight: FONTS.weight.regular,
  },
  summaryValue: {
    fontSize: FONTS.size.small,
    color: COLORS.primaryDarkTeal,
    fontWeight: FONTS.weight.semiBold,
    flex: 1,
    textAlign: 'right',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.primaryDarkTeal,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 16,
    color: COLORS.accentGreen,
    fontWeight: FONTS.weight.bold,
  },
  termsText: {
    fontSize: FONTS.size.small,
    color: COLORS.primaryDarkTeal,
    fontWeight: FONTS.weight.regular,
  },
  securityBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  badgeText: {
    fontSize: FONTS.size.small,
    color: COLORS.primaryDarkTeal,
    fontWeight: FONTS.weight.semiBold,
  },
  footer: {
    backgroundColor: COLORS.modalBackground,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  backFooterButton: {
    backgroundColor: '#E5E7EB',
  },
  backButtonText: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
  },
  nextButton: {
    backgroundColor: COLORS.accentGreen,
  },
  nextButtonText: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
  completeButton: {
    backgroundColor: COLORS.accentGreen,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  completeButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  completeButtonText: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
});

export default PaymentPage;
