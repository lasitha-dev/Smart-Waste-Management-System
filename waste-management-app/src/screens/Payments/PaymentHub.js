/**
 * Payment Hub Screen
 * Main dashboard for payments module with account summary, bills, and payment methods
 * @module PaymentHub
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';
import { usePayment } from '../../context/PaymentContext';
import LoadingIndicator from '../../components/LoadingIndicator';
import Toast from '../../components/Toast';
import StatusMessage from '../../components/StatusMessage';
import BalanceSummary from '../../components/BalanceSummary';
import BillSummaryCard from '../../components/BillSummaryCard';
import PaymentMethodCard from '../../components/PaymentMethodCard';
import {
  getResidentSummary,
  getUnpaidBills,
  getAvailableCredits,
  getPaymentMethods,
  initiatePaymentSession,
} from '../../api/paymentService';
import { calculateTotalCredits } from '../../utils/paymentHelpers';

const RESIDENT_ID = 'RES001';

/**
 * PaymentHub Component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object
 */
const PaymentHub = ({ navigation }) => {
  const { selectBill, startPaymentSession } = usePayment();
  
  const [summaryData, setSummaryData] = useState(null);
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [credits, setCredits] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  /**
   * Loads all data for the hub
   */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [summary, bills, creditsData, methods] = await Promise.all([
        getResidentSummary(RESIDENT_ID),
        getUnpaidBills(RESIDENT_ID),
        getAvailableCredits(RESIDENT_ID),
        getPaymentMethods(RESIDENT_ID),
      ]);

      setSummaryData(summary);
      setUnpaidBills(bills);
      setCredits(creditsData);
      setPaymentMethods(methods);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      showToast('Failed to load data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  /**
   * Handles pull-to-refresh
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  /**
   * Shows toast notification
   */
  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
  };

  /**
   * Handles pay now button press
   */
  const handlePayNow = async (bill) => {
    try {
      selectBill(bill);
      
      const session = await initiatePaymentSession(RESIDENT_ID, bill.id);
      startPaymentSession(session);
      
      navigation.navigate('PaymentPage', { billId: bill.id });
    } catch (error) {
      showToast(error.message || 'Failed to start payment', 'error');
    }
  };

  /**
   * Handles quick pay action
   */
  const handleQuickPay = async () => {
    if (unpaidBills.length === 0) {
      showToast('No unpaid bills available', 'info');
      return;
    }

    const firstBill = unpaidBills[0];
    await handlePayNow(firstBill);
  };

  /**
   * Handles check points action
   */
  const handleCheckPoints = () => {
    navigation.navigate('CheckPoints');
  };

  /**
   * Handles apply points action
   */
  const handleApplyPoints = () => {
    if (credits.length === 0) {
      showToast('No credit points available to apply', 'info');
      return;
    }
    navigation.navigate('ApplyPoints');
  };

  /**
   * Handles schedule auto-pay action
   */
  const handleScheduleAutoPay = () => {
    navigation.navigate('ScheduleAutoPay');
  };

  /**
   * Handles apply credits action
   */
  const handleApplyCredits = () => {
    if (credits.length === 0) {
      showToast('No credits available to apply', 'info');
      return;
    }
    navigation.navigate('ApplyPoints');
  };

  /**
   * Handles balance card press
   */
  const handleBalanceCardPress = (cardId) => {
    if (cardId === 'credits') {
      navigation.navigate('CheckPoints');
    } else if (cardId === 'lastPayment' || cardId === 'totalPaid') {
      navigation.navigate('PaymentHistory');
    }
  };

  if (loading && !summaryData) {
    return <LoadingIndicator type="spinner" message="Loading payment hub..." />;
  }

  return (
    <View style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ ...toast, visible: false })}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Payments</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error && (
          <StatusMessage
            type="error"
            message="Some data failed to load. Pull down to refresh."
            visible={true}
          />
        )}

        {/* Balance Summary */}
        {summaryData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Summary</Text>
            <BalanceSummary
              summaryData={summaryData}
              onCardPress={handleBalanceCardPress}
            />
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.checkPointsButton]}
              onPress={handleCheckPoints}
            >
              <Text style={styles.actionIcon}>🔍</Text>
              <Text style={styles.actionText}>Check Points</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.applyPointsButton]}
              onPress={handleApplyPoints}
            >
              <Text style={styles.actionIcon}>🎁</Text>
              <Text style={styles.actionText}>Apply Points</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.actionButton, styles.autoPayButton]}
            onPress={handleScheduleAutoPay}
          >
            <Text style={styles.actionIcon}>⏰</Text>
            <Text style={styles.actionText}>Schedule Auto-Pay</Text>
          </TouchableOpacity>
        </View>

        {/* Unpaid Bills */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Unpaid Bills</Text>
            {unpaidBills.length > 0 && (
              <Text style={styles.billCount}>{unpaidBills.length} bill{unpaidBills.length !== 1 ? 's' : ''}</Text>
            )}
          </View>
          {unpaidBills.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✓</Text>
              <Text style={styles.emptyTitle}>All Bills Paid!</Text>
              <Text style={styles.emptySubtitle}>You have no outstanding bills</Text>
            </View>
          ) : (
            unpaidBills.map((bill) => (
              <BillSummaryCard
                key={bill.id}
                billData={bill}
                onPress={() => handlePayNow(bill)}
                showPayButton={true}
              />
            ))
          )}
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment Methods</Text>
            <TouchableOpacity onPress={() => showToast('Add payment method', 'info')}>
              <Text style={styles.addButton}>+ ADD NEW</Text>
            </TouchableOpacity>
          </View>
          {paymentMethods.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💳</Text>
              <Text style={styles.emptyTitle}>No Payment Methods</Text>
              <Text style={styles.emptySubtitle}>Add a payment method to get started</Text>
            </View>
          ) : (
            paymentMethods.map((method) => (
              <PaymentMethodCard
                key={method.id}
                methodData={method}
                onPress={() => showToast('Payment method selected', 'info')}
                showActions={false}
              />
            ))
          )}
        </View>

        {/* Credits Section */}
        {credits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Credits</Text>
            <View style={styles.creditsCard}>
              <View style={styles.creditsHeader}>
                <Text style={styles.creditsAmount}>
                  {calculateTotalCredits(credits)} LKR
                </Text>
                <Text style={styles.creditsCount}>
                  {credits.length} active credit{credits.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.creditsActions}>
                <TouchableOpacity
                  style={styles.creditsButton}
                  onPress={handleApplyCredits}
                >
                  <Text style={styles.creditsButtonText}>APPLY CREDITS</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.creditsButton, styles.creditsButtonSecondary]}
                  onPress={() => showToast('View credit details', 'info')}
                >
                  <Text style={styles.creditsButtonTextSecondary}>VIEW DETAILS</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* View History Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => navigation.navigate('PaymentHistory')}
          >
            <Text style={styles.historyButtonText}>📜 VIEW PAYMENT HISTORY</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  headerTitle: {
    fontSize: FONTS.size.heading,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
  section: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: FONTS.size.subheading,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  billCount: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
    fontWeight: FONTS.weight.semiBold,
  },
  addButton: {
    fontSize: FONTS.size.small,
    color: COLORS.accentGreen,
    fontWeight: FONTS.weight.bold,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkPointsButton: {
    backgroundColor: '#2196F3',
  },
  applyPointsButton: {
    backgroundColor: COLORS.accentGreen,
  },
  autoPayButton: {
    backgroundColor: '#FF9800',
    marginHorizontal: 20,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  actionText: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
  emptyState: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 32,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
    fontWeight: FONTS.weight.regular,
  },
  creditsCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  creditsHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  creditsAmount: {
    fontSize: 32,
    fontWeight: FONTS.weight.bold,
    color: '#2196F3',
    marginBottom: 4,
  },
  creditsCount: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
    fontWeight: FONTS.weight.regular,
  },
  creditsActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  creditsButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#2196F3',
    marginHorizontal: 4,
  },
  creditsButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  creditsButtonText: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
  creditsButtonTextSecondary: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.bold,
    color: '#2196F3',
  },
  historyButton: {
    backgroundColor: COLORS.primaryDarkTeal,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  historyButtonText: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
});

export default PaymentHub;
