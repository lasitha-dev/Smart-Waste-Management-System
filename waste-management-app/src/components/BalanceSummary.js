/**
 * Balance Summary Component
 * Displays account balance summary in a 4-card grid
 * @module BalanceSummary
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';
import { formatCurrency } from '../utils/paymentHelpers';
import { formatTimestamp } from '../utils/dateFormatter';

/**
 * BalanceSummary Component
 * @param {Object} props - Component props
 * @param {Object} props.summaryData - Summary data object
 * @param {Function} props.onCardPress - Handler for card press
 */
const BalanceSummary = ({ summaryData, onCardPress }) => {
  if (!summaryData) {
    return null;
  }

  const cards = [
    {
      id: 'balance',
      title: 'Amount Due',
      value: formatCurrency(summaryData.balance),
      subtitle: summaryData.unpaidBillsCount > 0 
        ? `${summaryData.unpaidBillsCount} unpaid ${summaryData.unpaidBillsCount === 1 ? 'bill' : 'bills'}`
        : 'All bills paid',
      color: summaryData.balance > 0 ? COLORS.alertRed : COLORS.accentGreen,
      icon: '💰',
    },
    {
      id: 'lastPayment',
      title: 'Last Payment',
      value: formatCurrency(summaryData.lastPaymentAmount),
      subtitle: summaryData.lastPaymentDate 
        ? formatTimestamp(summaryData.lastPaymentDate, 'date')
        : 'No payments yet',
      color: COLORS.accentGreen,
      icon: '✓',
    },
    {
      id: 'credits',
      title: 'Available Credits',
      value: formatCurrency(summaryData.totalCredits),
      subtitle: `${summaryData.creditCount} active ${summaryData.creditCount === 1 ? 'credit' : 'credits'}`,
      color: '#2196F3',
      icon: '🎁',
    },
    {
      id: 'totalPaid',
      title: 'Total Paid (YTD)',
      value: formatCurrency(summaryData.totalPaidYTD),
      subtitle: 'Year to date',
      color: '#6B7280',
      icon: '📊',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={styles.card}
            onPress={() => onCardPress && onCardPress(card.id)}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>{card.icon}</Text>
              <Text style={styles.cardTitle}>{card.title}</Text>
            </View>
            <Text style={[styles.cardValue, { color: card.color }]}>
              {card.value}
            </Text>
            <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
    fontWeight: FONTS.weight.semiBold,
    flex: 1,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: FONTS.weight.bold,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: FONTS.weight.regular,
  },
});

export default BalanceSummary;
