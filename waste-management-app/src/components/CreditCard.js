/**
 * Credit Card Component
 * Displays individual credit information with status and actions
 * @module CreditCard
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';
import { getSourceIcon, getSourceLabel } from '../utils/creditHelpers';

/**
 * CreditCard Component
 * @param {Object} props - Component props
 * @param {Object} props.credit - Credit data object
 * @param {Function} props.onApply - Callback when apply button is pressed
 * @param {Function} props.onDetails - Callback when details button is pressed
 * @param {boolean} props.showActions - Whether to show action buttons
 * @param {string} props.variant - Display variant: 'active', 'redeemed', 'expired'
 */
const CreditCard = ({
  credit,
  onApply,
  onDetails,
  showActions = true,
  variant = 'active'
}) => {
  if (!credit) return null;

  const icon = getSourceIcon(credit.source);
  const label = getSourceLabel(credit.source);
  const expirationStatus = credit.expirationStatus || {};

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = () => {
    if (variant === 'redeemed') return COLORS.accentGreen;
    if (variant === 'expired') return '#9CA3AF';
    if (expirationStatus.status === 'expiring_today' || expirationStatus.status === 'expiring_soon') {
      return '#F59E0B';
    }
    return COLORS.primaryDarkTeal;
  };

  return (
    <View style={[styles.container, { borderLeftColor: getStatusColor() }]}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{label}</Text>
        
        <View style={styles.amountRow}>
          <Text style={styles.amount}>Rs. {credit.amount.toLocaleString()}</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.earnedDate}>
            Earned {formatDate(credit.earnedDate)}
          </Text>
        </View>

        {variant === 'active' && (
          <View style={styles.statusRow}>
            <Text 
              style={[
                styles.expirationText,
                { color: expirationStatus.color || '#6B7280' }
              ]}
            >
              {expirationStatus.label || 'No expiration'}
            </Text>
            {expirationStatus.daysRemaining !== null && 
             expirationStatus.daysRemaining <= 7 && (
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentText}>URGENT</Text>
              </View>
            )}
          </View>
        )}

        {variant === 'redeemed' && (
          <View style={styles.statusRow}>
            <Text style={[styles.statusText, { color: COLORS.accentGreen }]}>
              ✓ Applied to Bill #{credit.redeemedBillId}
            </Text>
            <Text style={styles.redeemedDate}>
              on {formatDate(credit.redeemedDate)}
            </Text>
          </View>
        )}

        {variant === 'expired' && (
          <View style={styles.statusRow}>
            <Text style={[styles.statusText, { color: '#9CA3AF' }]}>
              Expired on {formatDate(credit.expirationDate)}
            </Text>
          </View>
        )}

        {credit.sourceEvent && (
          <Text style={styles.eventDetails}>
            {credit.sourceEvent.quantity && `${credit.sourceEvent.quantity} • `}
            {credit.sourceEvent.location}
          </Text>
        )}
      </View>

      {showActions && (
        <View style={styles.actions}>
          {variant === 'active' && onApply && (
            <TouchableOpacity 
              style={[styles.button, styles.applyButton]}
              onPress={() => onApply(credit)}
            >
              <Text style={styles.applyButtonText}>APPLY</Text>
            </TouchableOpacity>
          )}
          
          {onDetails && (
            <TouchableOpacity 
              style={[styles.button, styles.detailsButton]}
              onPress={() => onDetails(credit)}
            >
              <Text style={styles.detailsButtonText}>
                {variant === 'active' ? 'DETAILS' : 'VIEW'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 4,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  amount: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.semiBold,
    color: '#2196F3',
  },
  separator: {
    fontSize: FONTS.size.body,
    color: '#9CA3AF',
    marginHorizontal: 6,
  },
  earnedDate: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
    fontWeight: FONTS.weight.regular,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  expirationText: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.regular,
  },
  statusText: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.semiBold,
    marginRight: 6,
  },
  redeemedDate: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
    fontWeight: FONTS.weight.regular,
  },
  urgentBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  urgentText: {
    fontSize: 10,
    fontWeight: FONTS.weight.bold,
    color: '#F59E0B',
  },
  eventDetails: {
    fontSize: FONTS.size.small,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: FONTS.weight.regular,
  },
  actions: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 6,
  },
  applyButton: {
    backgroundColor: '#2196F3',
  },
  applyButtonText: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
  detailsButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  detailsButtonText: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.bold,
    color: '#2196F3',
  },
});

export default CreditCard;
