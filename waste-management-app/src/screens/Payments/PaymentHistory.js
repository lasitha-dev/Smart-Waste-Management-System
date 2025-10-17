/**
 * Payment History Screen
 * Displays list of past payment transactions with pagination
 * @module PaymentHistory
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';
import LoadingIndicator from '../../components/LoadingIndicator';
import Toast from '../../components/Toast';
import StatusMessage from '../../components/StatusMessage';
import { getPaymentHistory, getReceipt } from '../../api/paymentService';
import { formatCurrency } from '../../utils/paymentHelpers';
import { formatTimestamp } from '../../utils/dateFormatter';

const RESIDENT_ID = 'RES001';
const PAGE_SIZE = 10;

/**
 * PaymentHistory Component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object
 */
const PaymentHistory = ({ navigation }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPayments();
  }, []);

  /**
   * Loads payment history
   */
  const loadPayments = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (payments.length === 0) {
        setLoading(true);
      }

      const history = await getPaymentHistory(RESIDENT_ID, PAGE_SIZE);
      setPayments(history);
      setHasMore(history.length >= PAGE_SIZE);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load payment history');
      showToast('Failed to load payment history', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Handles pull-to-refresh
   */
  const onRefresh = useCallback(() => {
    loadPayments(true);
  }, []);

  /**
   * Handles load more (pagination)
   */
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      showToast('Loading more payments...', 'info');
      setTimeout(() => {
        setLoadingMore(false);
        setHasMore(false);
      }, 1000);
    }
  };

  /**
   * Shows toast notification
   */
  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
  };

  /**
   * Handles payment item press
   */
  const handlePaymentPress = async (payment) => {
    try {
      const receipt = await getReceipt(payment.receiptId);
      navigation.navigate('ReceiptView', { receiptData: receipt });
    } catch (err) {
      showToast('Failed to load receipt', 'error');
    }
  };

  /**
   * Renders payment item
   */
  const renderPaymentItem = ({ item }) => {
    const statusColor = item.status === 'completed' ? COLORS.accentGreen : COLORS.alertRed;

    return (
      <TouchableOpacity
        style={styles.paymentCard}
        onPress={() => handlePaymentPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.paymentHeader}>
          <View style={styles.paymentLeft}>
            <Text style={styles.billId}>{item.billId}</Text>
            <Text style={styles.paymentDate}>
              {formatTimestamp(item.completedAt, 'full')}
            </Text>
          </View>
          <View style={styles.paymentRight}>
            <Text style={styles.paymentAmount}>{formatCurrency(item.finalAmount)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>
                {item.status === 'completed' ? '✓ PAID' : 'FAILED'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.paymentDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID:</Text>
            <Text style={styles.detailValue}>{item.transactionId}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method:</Text>
            <Text style={styles.detailValue}>{item.paymentMethodDisplay}</Text>
          </View>
          {item.creditsApplied > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Credits Applied:</Text>
              <Text style={[styles.detailValue, { color: COLORS.accentGreen }]}>
                {formatCurrency(item.creditsApplied)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.viewReceiptContainer}>
          <Text style={styles.viewReceiptText}>Tap to view receipt →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * Renders empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📜</Text>
      <Text style={styles.emptyTitle}>No Payment History</Text>
      <Text style={styles.emptySubtitle}>
        Your payment transactions will appear here
      </Text>
    </View>
  );

  /**
   * Renders footer (loading more indicator)
   */
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <LoadingIndicator type="inline" message="Loading more..." size="small" />
      </View>
    );
  };

  if (loading) {
    return <LoadingIndicator type="spinner" message="Loading payment history..." />;
  }

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
        <Text style={styles.headerTitle}>Payment History</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Error Message */}
      {error && (
        <StatusMessage type="error" message={error} visible={true} />
      )}

      {/* Payment List */}
      <FlatList
        data={payments}
        renderItem={renderPaymentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
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
  listContent: {
    paddingVertical: 8,
  },
  paymentCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentLeft: {
    flex: 1,
  },
  billId: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
    fontWeight: FONTS.weight.regular,
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: FONTS.size.subheading,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  paymentDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
    fontWeight: FONTS.weight.regular,
    flex: 1,
  },
  detailValue: {
    fontSize: FONTS.size.small,
    color: COLORS.primaryDarkTeal,
    fontWeight: FONTS.weight.semiBold,
    flex: 1,
    textAlign: 'right',
  },
  viewReceiptContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  viewReceiptText: {
    fontSize: FONTS.size.small,
    color: COLORS.accentGreen,
    fontWeight: FONTS.weight.semiBold,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: FONTS.size.subheading,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: FONTS.size.body,
    color: '#6B7280',
    fontWeight: FONTS.weight.regular,
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 16,
  },
});

export default PaymentHistory;
