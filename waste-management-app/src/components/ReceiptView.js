/**
 * Receipt View Component
 * Displays payment receipt details
 * @module ReceiptView
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';
import { formatCurrency } from '../utils/paymentHelpers';
import { formatReceiptTimestamp } from '../utils/dateFormatter';

/**
 * ReceiptView Component
 * @param {Object} props - Component props
 * @param {Object} props.receiptData - Receipt data object
 * @param {Function} props.onDownload - Handler for download action
 * @param {Function} props.onPrint - Handler for print action
 * @param {Function} props.onShare - Handler for share action
 */
const ReceiptView = ({ receiptData, onDownload, onPrint, onShare }) => {
  if (!receiptData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No receipt data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.receiptCard}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Payment Receipt</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>✓ PAID</Text>
          </View>
        </View>

        {/* Receipt ID */}
        <View style={styles.receiptIdContainer}>
          <Text style={styles.receiptIdLabel}>Receipt ID</Text>
          <Text style={styles.receiptId}>{receiptData.id}</Text>
        </View>

        <View style={styles.divider} />

        {/* Resident Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resident Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{receiptData.residentName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{receiptData.residentEmail}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Payment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Bill ID:</Text>
            <Text style={styles.infoValue}>{receiptData.billId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Billing Period:</Text>
            <Text style={styles.infoValue}>{receiptData.billingPeriod}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Date:</Text>
            <Text style={styles.infoValue}>
              {formatReceiptTimestamp(receiptData.completedAt)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Transaction ID:</Text>
            <Text style={styles.infoValue}>{receiptData.transactionId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Method:</Text>
            <Text style={styles.infoValue}>{receiptData.paymentMethod}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Amount Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amount Breakdown</Text>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Base Amount:</Text>
            <Text style={styles.amountValue}>{formatCurrency(receiptData.amount)}</Text>
          </View>
          {receiptData.creditsApplied > 0 && (
            <View style={styles.amountRow}>
              <Text style={styles.creditLabel}>Credits Applied:</Text>
              <Text style={styles.creditValue}>
                -{formatCurrency(receiptData.creditsApplied)}
              </Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(receiptData.finalAmount)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for your payment!
          </Text>
          <Text style={styles.footerSubtext}>
            This is an official receipt from Smart Waste Management System
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {onDownload && (
          <TouchableOpacity
            style={[styles.actionButton, styles.downloadButton]}
            onPress={onDownload}
          >
            <Text style={styles.actionButtonText}>📥 DOWNLOAD PDF</Text>
          </TouchableOpacity>
        )}
        {onPrint && (
          <TouchableOpacity
            style={[styles.actionButton, styles.printButton]}
            onPress={onPrint}
          >
            <Text style={styles.actionButtonText}>🖨️ PRINT</Text>
          </TouchableOpacity>
        )}
        {onShare && (
          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={onShare}
          >
            <Text style={styles.actionButtonText}>📤 SHARE</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: FONTS.size.body,
    color: '#6B7280',
    fontWeight: FONTS.weight.regular,
  },
  receiptCard: {
    backgroundColor: COLORS.modalBackground,
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: FONTS.size.heading,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
  },
  statusBadge: {
    backgroundColor: COLORS.accentGreen,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
  receiptIdContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  receiptIdLabel: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
    fontWeight: FONTS.weight.regular,
    marginBottom: 4,
  },
  receiptId: {
    fontSize: FONTS.size.subheading,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
    fontWeight: FONTS.weight.regular,
    flex: 1,
  },
  infoValue: {
    fontSize: FONTS.size.small,
    color: COLORS.primaryDarkTeal,
    fontWeight: FONTS.weight.semiBold,
    flex: 2,
    textAlign: 'right',
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
    fontSize: FONTS.size.subheading,
    color: COLORS.accentGreen,
    fontWeight: FONTS.weight.bold,
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: FONTS.size.body,
    color: COLORS.primaryDarkTeal,
    fontWeight: FONTS.weight.semiBold,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
    fontWeight: FONTS.weight.regular,
    textAlign: 'center',
  },
  actionsContainer: {
    padding: 16,
    paddingBottom: 32,
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
  shareButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
});

export default ReceiptView;
