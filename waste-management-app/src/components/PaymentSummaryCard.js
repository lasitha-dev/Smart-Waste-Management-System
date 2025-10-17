/**
 * Payment Summary Card Component
 * Displays payment breakdown with services, subtotal, credit discount, and total
 * @module PaymentSummaryCard
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';
import { formatCurrency } from '../utils/paymentHelpers';

/**
 * PaymentSummaryCard Component
 * @param {Object} props - Component props
 * @param {Array} props.services - Array of service items {name, amount}
 * @param {number} props.subtotal - Subtotal amount
 * @param {number} props.creditDiscount - Credit points discount amount
 * @param {number} props.totalAmount - Final total amount
 */
const PaymentSummaryCard = ({
  services = [],
  subtotal = 0,
  creditDiscount = 0,
  totalAmount = 0,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Summary</Text>

      {/* Service Items */}
      {services.map((service, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.label}>{service.name}</Text>
          <Text style={styles.value}>{formatCurrency(service.amount)}</Text>
        </View>
      ))}

      {/* Subtotal */}
      {subtotal > 0 && (
        <View style={[styles.row, styles.subtotalRow]}>
          <Text style={styles.subtotalLabel}>Subtotal</Text>
          <Text style={styles.subtotalValue}>{formatCurrency(subtotal)}</Text>
        </View>
      )}

      {/* Credit Points Discount */}
      {creditDiscount > 0 && (
        <View style={styles.row}>
          <Text style={styles.discountLabel}>Credit Points Discount</Text>
          <Text style={styles.discountValue}>-{formatCurrency(creditDiscount)}</Text>
        </View>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Total Amount */}
      <View style={styles.row}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: FONTS.size.subheading,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
    fontWeight: FONTS.weight.regular,
  },
  value: {
    fontSize: FONTS.size.small,
    color: COLORS.primaryDarkTeal,
    fontWeight: FONTS.weight.semiBold,
  },
  subtotalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  subtotalLabel: {
    fontSize: FONTS.size.body,
    color: COLORS.primaryDarkTeal,
    fontWeight: FONTS.weight.semiBold,
  },
  subtotalValue: {
    fontSize: FONTS.size.body,
    color: COLORS.primaryDarkTeal,
    fontWeight: FONTS.weight.bold,
  },
  discountLabel: {
    fontSize: FONTS.size.small,
    color: COLORS.accentGreen,
    fontWeight: FONTS.weight.semiBold,
  },
  discountValue: {
    fontSize: FONTS.size.small,
    color: COLORS.accentGreen,
    fontWeight: FONTS.weight.bold,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: FONTS.size.subheading,
    color: COLORS.primaryDarkTeal,
    fontWeight: FONTS.weight.bold,
  },
  totalValue: {
    fontSize: FONTS.size.heading,
    color: '#2196F3',
    fontWeight: FONTS.weight.bold,
  },
});

export default PaymentSummaryCard;
