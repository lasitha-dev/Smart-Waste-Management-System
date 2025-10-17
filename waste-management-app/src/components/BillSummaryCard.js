/**
 * Bill Summary Card Component
 * Displays bill information in a card format
 * @module BillSummaryCard
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';
import { formatCurrency, getPaymentUrgency } from '../utils/paymentHelpers';
import { formatTimestamp, getDueDateStatus, getUrgencyColor } from '../utils/dateFormatter';

/**
 * BillSummaryCard Component
 * @param {Object} props - Component props
 * @param {Object} props.billData - Bill data object
 * @param {Function} props.onPress - Handler for card press
 * @param {boolean} props.showPayButton - Whether to show pay button
 */
const BillSummaryCard = ({ billData, onPress, showPayButton = true }) => {
  if (!billData) {
    return null;
  }

  const urgency = getPaymentUrgency(billData.dueDate);
  const urgencyColor = getUrgencyColor(billData.dueDate);
  const dueDateStatus = getDueDateStatus(billData.dueDate);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        urgency === 'overdue' && styles.overdueCard,
        urgency === 'urgent' && styles.urgentCard,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.billId}>{billData.id}</Text>
          <Text style={styles.billingPeriod}>{billData.billingPeriod}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: urgencyColor }]}>
          <Text style={styles.statusText}>
            {billData.status === 'paid' ? 'PAID' : urgency.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.amountSection}>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Base Amount:</Text>
          <Text style={styles.amountValue}>{formatCurrency(billData.amount)}</Text>
        </View>

        {billData.appliedCredits > 0 && (
          <View style={styles.amountRow}>
            <Text style={styles.creditLabel}>Credits Applied:</Text>
            <Text style={styles.creditValue}>-{formatCurrency(billData.appliedCredits)}</Text>
          </View>
        )}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Amount Due:</Text>
          <Text style={[styles.totalValue, { color: urgencyColor }]}>
            {formatCurrency(billData.finalAmount)}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dueDateContainer}>
          <Text style={styles.dueDateLabel}>Due Date:</Text>
          <Text style={[styles.dueDateValue, { color: urgencyColor }]}>
            {formatTimestamp(billData.dueDate, 'date')}
          </Text>
        </View>
        <Text style={[styles.dueDateStatus, { color: urgencyColor }]}>
          {dueDateStatus}
        </Text>
      </View>

      {showPayButton && billData.status === 'unpaid' && (
        <TouchableOpacity
          style={[styles.payButton, { backgroundColor: urgencyColor }]}
          onPress={onPress}
        >
          <Text style={styles.payButtonText}>PAY NOW</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
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
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.alertRed,
  },
  urgentCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.highPriorityRed,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  amountSection: {
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
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: FONTS.size.body,
    color: COLORS.primaryDarkTeal,
    fontWeight: FONTS.weight.bold,
  },
  totalValue: {
    fontSize: FONTS.size.subheading,
    fontWeight: FONTS.weight.bold,
  },
  footer: {
    marginTop: 8,
  },
  dueDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dueDateLabel: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
    fontWeight: FONTS.weight.regular,
  },
  dueDateValue: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.semiBold,
  },
  dueDateStatus: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.bold,
    textAlign: 'right',
  },
  payButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  payButtonText: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
});

export default BillSummaryCard;
