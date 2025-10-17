/**
 * Schedule Auto-Pay Screen
 * Allows users to set up automatic bill payments
 * @module ScheduleAutoPay
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';
import Toast from '../../components/Toast';
import LoadingIndicator from '../../components/LoadingIndicator';

const RESIDENT_ID = 'RES001';

const ScheduleAutoPay = ({ navigation, route }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [autoApplyCredits, setAutoApplyCredits] = useState(true);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [notifyDaysBefore, setNotifyDaysBefore] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const [autoPayConfig, setAutoPayConfig] = useState(null);

  useEffect(() => {
    loadAutoPayData();
  }, []);

  const loadAutoPayData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      const mockPaymentMethods = [
        {
          id: 'PM001',
          type: 'card',
          cardBrand: 'Visa',
          last4Digits: '4242',
          expiryMonth: 12,
          expiryYear: 2026,
          isDefault: true,
        },
        {
          id: 'PM002',
          type: 'card',
          cardBrand: 'Mastercard',
          last4Digits: '5555',
          expiryMonth: 8,
          expiryYear: 2027,
          isDefault: false,
        },
      ];

      setPaymentMethods(mockPaymentMethods);
      setSelectedMethod(mockPaymentMethods[0].id);

      // Check if auto-pay already exists
      const existingAutoPay = null; // Simulate no existing auto-pay
      setAutoPayConfig(existingAutoPay);
    } catch (err) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
  };

  const handleSetupAutoPay = async () => {
    if (!selectedMethod) {
      showToast('Please select a payment method', 'error');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const config = {
        id: 'AUTOPAY_' + Date.now(),
        userId: RESIDENT_ID,
        paymentMethodId: selectedMethod,
        billingCycle,
        autoApplyCredits,
        notificationEnabled,
        notificationDaysBefore: notifyDaysBefore,
        status: 'pending_confirmation',
      };

      setAutoPayConfig(config);
      showToast('Auto-pay setup initiated! Check your email to confirm.', 'success');
      setModalVisible(false);
    } catch (err) {
      showToast('Failed to setup auto-pay', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAutoPay = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAutoPayConfig(null);
      showToast('Auto-pay cancelled successfully', 'success');
    } catch (err) {
      showToast('Failed to cancel auto-pay', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderSetupModal = () => (
    <Modal
      visible={modalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.modalTitle}>Setup Auto-Pay</Text>
            <Text style={styles.modalSubtitle}>
              Automatically pay your bills on the due date
            </Text>

            {/* Payment Method Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Payment Method</Text>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.methodCard,
                    selectedMethod === method.id && styles.methodCardSelected,
                  ]}
                  onPress={() => setSelectedMethod(method.id)}
                >
                  <View style={[styles.radio, selectedMethod === method.id && styles.radioSelected]}>
                    {selectedMethod === method.id && <View style={styles.radioInner} />}
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodText}>
                      {method.cardBrand} •••• {method.last4Digits}
                    </Text>
                    <Text style={styles.methodExpiry}>
                      Expires {method.expiryMonth}/{method.expiryYear}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Billing Cycle */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Billing Cycle</Text>
              {['monthly', 'quarterly', 'half_yearly', 'yearly'].map((cycle) => (
                <TouchableOpacity
                  key={cycle}
                  style={[
                    styles.cycleOption,
                    billingCycle === cycle && styles.cycleOptionSelected,
                  ]}
                  onPress={() => setBillingCycle(cycle)}
                >
                  <Text style={styles.cycleText}>
                    {cycle.charAt(0).toUpperCase() + cycle.slice(1).replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Auto-Apply Credits */}
            <View style={styles.section}>
              <View style={styles.switchRow}>
                <View style={styles.switchLabel}>
                  <Text style={styles.switchTitle}>Auto-apply credits</Text>
                  <Text style={styles.switchHint}>
                    Available credits will be deducted before charging
                  </Text>
                </View>
                <Switch
                  value={autoApplyCredits}
                  onValueChange={setAutoApplyCredits}
                  trackColor={{ false: '#D1D5DB', true: '#34D399' }}
                  thumbColor={autoApplyCredits ? '#FFFFFF' : '#F3F4F6'}
                />
              </View>
            </View>

            {/* Notification Settings */}
            <View style={styles.section}>
              <View style={styles.switchRow}>
                <View style={styles.switchLabel}>
                  <Text style={styles.switchTitle}>Send reminders</Text>
                  <Text style={styles.switchHint}>
                    Get notified {notifyDaysBefore} days before charge
                  </Text>
                </View>
                <Switch
                  value={notificationEnabled}
                  onValueChange={setNotificationEnabled}
                  trackColor={{ false: '#D1D5DB', true: '#34D399' }}
                  thumbColor={notificationEnabled ? '#FFFFFF' : '#F3F4F6'}
                />
              </View>
            </View>

            {notificationEnabled && (
              <View style={styles.sliderSection}>
                <Text style={styles.sliderLabel}>Remind me {notifyDaysBefore} days before</Text>
                <View style={styles.sliderButtons}>
                  {[1, 3, 7, 14].map((days) => (
                    <TouchableOpacity
                      key={days}
                      style={[
                        styles.sliderButton,
                        notifyDaysBefore === days && styles.sliderButtonActive,
                      ]}
                      onPress={() => setNotifyDaysBefore(days)}
                    >
                      <Text
                        style={[
                          styles.sliderButtonText,
                          notifyDaysBefore === days && styles.sliderButtonTextActive,
                        ]}
                      >
                        {days}d
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Benefits */}
            <View style={styles.benefitsSection}>
              <Text style={styles.benefitsTitle}>Benefits</Text>
              <Text style={styles.benefit}>✓ Never miss a payment</Text>
              <Text style={styles.benefit}>✓ Avoid late fees</Text>
              <Text style={styles.benefit}>✓ Cancel anytime</Text>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* Buttons */}
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
                onPress={handleSetupAutoPay}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.textPrimary} />
                ) : (
                  <Text style={styles.confirmButtonText}>Setup Auto-Pay</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (loading && !autoPayConfig) {
    return <LoadingIndicator type="spinner" message="Loading..." />;
  }

  return (
    <View style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ ...toast, visible: false })}
      />

      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Auto-Pay</Text>
          <View style={{ width: 24 }} />
        </View>

        {!autoPayConfig ? (
          /* No Auto-Pay Setup */
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⚡</Text>
            <Text style={styles.emptyTitle}>Setup Auto-Pay</Text>
            <Text style={styles.emptySubtitle}>
              Never miss a payment. Bills are automatically paid on their due date.
            </Text>

            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>Automatic payment on due date</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>Auto-apply available credits</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>Get reminders before charging</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>Cancel anytime</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.setupButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.setupButtonText}>Setup Auto-Pay</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Auto-Pay Active */
          <View style={styles.activeState}>
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Text style={styles.statusTitle}>Auto-Pay Status</Text>
                <View style={[
                  styles.statusBadge,
                  autoPayConfig.status === 'active' && styles.statusBadgeActive,
                  autoPayConfig.status === 'pending_confirmation' && styles.statusBadgePending,
                ]}>
                  <Text style={styles.statusBadgeText}>
                    {autoPayConfig.status === 'active' ? 'Active' : 'Pending Confirmation'}
                  </Text>
                </View>
              </View>
              {autoPayConfig.status === 'pending_confirmation' && (
                <Text style={styles.statusMessage}>
                  Check your email to confirm auto-pay setup
                </Text>
              )}
            </View>

            <View style={styles.detailsCard}>
              <Text style={styles.detailsTitle}>Payment Method</Text>
              <Text style={styles.detailsValue}>
                {paymentMethods.find(m => m.id === autoPayConfig.paymentMethodId)?.cardBrand} ••••{' '}
                {paymentMethods.find(m => m.id === autoPayConfig.paymentMethodId)?.last4Digits}
              </Text>
            </View>

            <View style={styles.detailsCard}>
              <Text style={styles.detailsTitle}>Settings</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Billing Cycle:</Text>
                <Text style={styles.detailValue}>
                  {autoPayConfig.billingCycle.charAt(0).toUpperCase() + 
                   autoPayConfig.billingCycle.slice(1).replace('_', ' ')}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Auto-apply Credits:</Text>
                <Text style={styles.detailValue}>
                  {autoPayConfig.autoApplyCredits ? 'Yes' : 'No'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Notifications:</Text>
                <Text style={styles.detailValue}>
                  {autoPayConfig.notificationEnabled
                    ? `${autoPayConfig.notificationDaysBefore} days before`
                    : 'Disabled'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.cancelAutoPayButton}
              onPress={handleCancelAutoPay}
            >
              <Text style={styles.cancelAutoPayButtonText}>Cancel Auto-Pay</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {renderSetupModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.primaryDarkTeal,
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  headerTitle: {
    fontSize: FONTS.size.heading,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: FONTS.size.heading,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: FONTS.size.body,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  featureList: {
    width: '100%',
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 20,
    color: COLORS.accentGreen,
    marginRight: 12,
  },
  featureText: {
    fontSize: FONTS.size.body,
    color: '#374151',
  },
  setupButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  setupButtonText: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
  activeState: {
    padding: 16,
  },
  statusCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: FONTS.size.subheading,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeActive: {
    backgroundColor: '#D1FAE5',
  },
  statusBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeText: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.semiBold,
    color: '#065F46',
  },
  statusMessage: {
    fontSize: FONTS.size.small,
    color: '#92400E',
  },
  detailsCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: FONTS.size.subheading,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 12,
  },
  detailsValue: {
    fontSize: FONTS.size.body,
    color: '#374151',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: FONTS.size.body,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.semiBold,
    color: '#374151',
  },
  cancelAutoPayButton: {
    backgroundColor: COLORS.alertRed,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelAutoPayButtonText: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: FONTS.size.heading,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: FONTS.size.body,
    color: '#6B7280',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: FONTS.size.subheading,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodCardSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#EFF6FF',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#2196F3',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2196F3',
  },
  methodInfo: {
    flex: 1,
  },
  methodText: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.semiBold,
    color: '#374151',
  },
  methodExpiry: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
  },
  cycleOption: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cycleOptionSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#EFF6FF',
  },
  cycleText: {
    fontSize: FONTS.size.body,
    color: '#374151',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    flex: 1,
    marginRight: 12,
  },
  switchTitle: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.semiBold,
    color: '#374151',
    marginBottom: 4,
  },
  switchHint: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
  },
  sliderSection: {
    marginBottom: 24,
  },
  sliderLabel: {
    fontSize: FONTS.size.body,
    color: '#374151',
    marginBottom: 12,
  },
  sliderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sliderButtonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2196F3',
  },
  sliderButtonText: {
    fontSize: FONTS.size.body,
    color: '#6B7280',
  },
  sliderButtonTextActive: {
    color: '#2196F3',
    fontWeight: FONTS.weight.bold,
  },
  benefitsSection: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: FONTS.size.subheading,
    fontWeight: FONTS.weight.bold,
    color: '#065F46',
    marginBottom: 12,
  },
  benefit: {
    fontSize: FONTS.size.body,
    color: '#065F46',
    marginBottom: 6,
  },
  errorText: {
    fontSize: FONTS.size.small,
    color: COLORS.alertRed,
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: '#6B7280',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  confirmButtonText: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
});

export default ScheduleAutoPay;
