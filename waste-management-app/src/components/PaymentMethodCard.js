/**
 * Payment Method Card Component
 * Displays saved payment methods
 * @module PaymentMethodCard
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';
import { formatCardExpiry } from '../utils/dateFormatter';

/**
 * PaymentMethodCard Component
 * @param {Object} props - Component props
 * @param {Object} props.methodData - Payment method data
 * @param {Function} props.onPress - Handler for card press
 * @param {Function} props.onEdit - Handler for edit action
 * @param {Function} props.onRemove - Handler for remove action
 * @param {boolean} props.selected - Whether this method is selected
 * @param {boolean} props.showActions - Whether to show action buttons
 */
const PaymentMethodCard = ({
  methodData,
  onPress,
  onEdit,
  onRemove,
  selected = false,
  showActions = false,
}) => {
  if (!methodData) {
    return null;
  }

  const getMethodIcon = () => {
    if (methodData.type === 'card') {
      return '💳';
    }
    if (methodData.type === 'bank') {
      return '🏦';
    }
    return '💰';
  };

  const getMethodDisplay = () => {
    if (methodData.type === 'card') {
      return `${methodData.cardBrand} **** ${methodData.last4Digits}`;
    }
    if (methodData.type === 'bank') {
      return `${methodData.bankName} **** ${methodData.accountLast4}`;
    }
    return 'Unknown Method';
  };

  const getMethodDetails = () => {
    if (methodData.type === 'card') {
      return `Expires ${formatCardExpiry(methodData.expiryMonth, methodData.expiryYear)}`;
    }
    if (methodData.type === 'bank') {
      return 'Bank Transfer';
    }
    return '';
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        selected && styles.selectedCard,
        methodData.isDefault && styles.defaultCard,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{getMethodIcon()}</Text>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.methodName}>{getMethodDisplay()}</Text>
            {methodData.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>DEFAULT</Text>
              </View>
            )}
          </View>
          <Text style={styles.methodDetails}>{getMethodDetails()}</Text>
          {methodData.holderName && (
            <Text style={styles.holderName}>{methodData.holderName}</Text>
          )}
        </View>
      </View>

      {showActions && (
        <View style={styles.actionsContainer}>
          {onEdit && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit(methodData)}
            >
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
          {onRemove && !methodData.isDefault && (
            <TouchableOpacity
              style={[styles.actionButton, styles.removeButton]}
              onPress={() => onRemove(methodData)}
            >
              <Text style={[styles.actionButtonText, styles.removeButtonText]}>
                Remove
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {selected && (
        <View style={styles.selectedIndicator}>
          <Text style={styles.selectedIcon}>✓</Text>
        </View>
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
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderColor: COLORS.accentGreen,
    backgroundColor: '#F0FDF4',
  },
  defaultCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primaryDarkTeal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryDarkTeal,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  infoContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  methodName: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: COLORS.accentGreen,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
  methodDetails: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
    fontWeight: FONTS.weight.regular,
    marginBottom: 2,
  },
  holderName: {
    fontSize: FONTS.size.small,
    color: '#9CA3AF',
    fontWeight: FONTS.weight.regular,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primaryDarkTeal,
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.textPrimary,
  },
  removeButton: {
    backgroundColor: COLORS.alertRed,
  },
  removeButtonText: {
    color: COLORS.textPrimary,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accentGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIcon: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weight.bold,
  },
});

export default PaymentMethodCard;
