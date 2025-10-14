/**
 * FeeDisplay Component
 * Component for displaying fee breakdown and calculations
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module FeeDisplay
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing
} from 'react-native';
import { formatCurrency } from '../utils/schedulingHelpers';

/**
 * FeeDisplay component for showing fee breakdown
 * @param {Object} props - Component props
 * @param {Object} props.feeData - Fee breakdown data
 * @param {boolean} props.loading - Whether fee calculation is in progress
 * @param {string} props.error - Error message if calculation failed
 * @param {boolean} props.showBreakdown - Whether to show detailed breakdown
 * @param {Function} props.onBreakdownToggle - Callback when breakdown is toggled
 * @param {string} props.style - Additional styles
 */
const FeeDisplay = ({
  feeData,
  loading = false,
  error = null,
  showBreakdown = false,
  onBreakdownToggle,
  style
}) => {
  const [animatedHeight] = useState(new Animated.Value(0));
  const [isExpanded, setIsExpanded] = useState(showBreakdown);

  React.useEffect(() => {
    if (showBreakdown !== isExpanded) {
      toggleBreakdown();
    }
  }, [showBreakdown]);

  const toggleBreakdown = () => {
    const toValue = isExpanded ? 0 : 1;
    
    Animated.timing(animatedHeight, {
      toValue,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false
    }).start();

    setIsExpanded(!isExpanded);
    
    if (onBreakdownToggle) {
      onBreakdownToggle(!isExpanded);
    }
  };

  const getBillingModelName = (model) => {
    const names = {
      flat: 'Flat Rate',
      weightBased: 'Weight-Based',
      hybrid: 'Hybrid Model'
    };
    return names[model] || model;
  };

  const getBillingModelDescription = (model) => {
    const descriptions = {
      flat: 'Fixed fee per collection regardless of weight',
      weightBased: 'Fee calculated based on actual weight',
      hybrid: 'Combination of flat rate and weight-based pricing'
    };
    return descriptions[model] || '';
  };

  const renderLoadingState = () => (
    <View style={[styles.container, styles.loadingContainer, style]}>
      <View style={styles.loadingContent}>
        <View style={styles.loadingSpinner}>
          <Text style={styles.loadingText}>💰</Text>
        </View>
        <Text style={styles.loadingLabel}>Calculating fees...</Text>
      </View>
    </View>
  );

  const renderErrorState = () => (
    <View style={[styles.container, styles.errorContainer, style]}>
      <View style={styles.errorContent}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Fee Calculation Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    </View>
  );

  const renderFeeBreakdown = () => {
    if (!feeData) return null;

    const breakdownHeight = animatedHeight.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 250] // Approximate height of breakdown content
    });

    return (
      <Animated.View style={[styles.breakdown, { height: breakdownHeight }]}>
        <View style={styles.breakdownContent}>
          {/* Billing Model Info */}
          <View style={styles.modelInfo}>
            <Text style={styles.modelName}>
              {getBillingModelName(feeData.model)}
            </Text>
            <Text style={styles.modelDescription}>
              {getBillingModelDescription(feeData.model)}
            </Text>
          </View>

          {/* Fee Components */}
          <View style={styles.feeComponents}>
            {feeData.baseFee > 0 && (
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Base Fee</Text>
                <Text style={styles.feeValue}>
                  {formatCurrency(feeData.baseFee, feeData.currency)}
                </Text>
              </View>
            )}

            {feeData.binFee > 0 && (
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>
                  Additional Bins ({feeData.binCount - 1})
                </Text>
                <Text style={styles.feeValue}>
                  {formatCurrency(feeData.binFee, feeData.currency)}
                </Text>
              </View>
            )}

            {feeData.weightFee > 0 && (
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>
                  Weight-based Fee ({feeData.estimatedWeight}kg)
                </Text>
                <Text style={styles.feeValue}>
                  {formatCurrency(feeData.weightFee, feeData.currency)}
                </Text>
              </View>
            )}

            {feeData.wasteTypeFee > 0 && (
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Waste Type Surcharge</Text>
                <Text style={styles.feeValue}>
                  {formatCurrency(feeData.wasteTypeFee, feeData.currency)}
                </Text>
              </View>
            )}

            {/* Subtotal */}
            <View style={styles.separator} />
            <View style={styles.feeRow}>
              <Text style={styles.subtotalLabel}>Subtotal</Text>
              <Text style={styles.subtotalValue}>
                {formatCurrency(feeData.subtotal, feeData.currency)}
              </Text>
            </View>

            {/* Tax */}
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Tax (18% VAT)</Text>
              <Text style={styles.feeValue}>
                {formatCurrency(feeData.tax, feeData.currency)}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderFeeDisplay = () => (
    <View style={[styles.container, style]}>
      {/* Main Fee Display */}
      <View style={styles.mainFeeContainer}>
        <View style={styles.feeHeader}>
          <Text style={styles.feeTitle}>Collection Fee</Text>
          {feeData?.wasteType && (
            <View style={styles.wasteTypeBadge}>
              <Text style={styles.wasteTypeIcon}>{feeData.wasteType.icon}</Text>
              <Text style={styles.wasteTypeLabel}>{feeData.wasteType.label}</Text>
            </View>
          )}
        </View>

        <View style={styles.totalFeeContainer}>
          <Text style={styles.totalFeeLabel}>Total Amount</Text>
          <Text style={styles.totalFeeValue}>
            {formatCurrency(feeData.total, feeData.currency)}
          </Text>
        </View>

        {/* Breakdown Toggle */}
        <TouchableOpacity
          style={styles.breakdownToggle}
          onPress={toggleBreakdown}
          testID="fee-breakdown-toggle"
        >
          <Text style={styles.breakdownToggleText}>
            {isExpanded ? 'Hide' : 'Show'} Fee Breakdown
          </Text>
          <Text style={[
            styles.breakdownToggleIcon,
            isExpanded && styles.breakdownToggleIconExpanded
          ]}>
            ▼
          </Text>
        </TouchableOpacity>

        {/* Fee Breakdown */}
        <View testID="fee-breakdown">
          {renderFeeBreakdown()}
        </View>

        {/* Additional Info */}
        {feeData && (
          <View style={styles.additionalInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Bins Selected:</Text>
              <Text style={styles.infoValue}>{feeData.binCount}</Text>
            </View>
            
            {feeData.estimatedWeight > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Estimated Weight:</Text>
                <Text style={styles.infoValue}>{feeData.estimatedWeight}kg</Text>
              </View>
            )}
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Billing Model:</Text>
              <Text style={styles.infoValue}>
                {getBillingModelName(feeData.model)}
              </Text>
            </View>
          </View>
        )}

        {/* Payment Note */}
        <View style={styles.paymentNote}>
          <Text style={styles.paymentNoteIcon}>💳</Text>
          <Text style={styles.paymentNoteText}>
            Payment will be processed after booking confirmation
          </Text>
        </View>
      </View>
    </View>
  );

  // Render based on state
  if (loading) {
    return renderLoadingState();
  }

  if (error) {
    return renderErrorState();
  }

  if (!feeData) {
    return (
      <View style={[styles.container, styles.noDataContainer, style]}>
        <Text style={styles.noDataText}>
          Select bins and waste type to calculate fees
        </Text>
      </View>
    );
  }

  return renderFeeDisplay();
};

const colors = {
  primary: '#4CAF50',
  secondary: '#2196F3',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#f44336',
  disabled: '#9E9E9E',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#212121',
  textSecondary: '#757575',
  border: '#E0E0E0'
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center'
  },
  loadingContent: {
    alignItems: 'center'
  },
  loadingSpinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  loadingText: {
    fontSize: 24
  },
  loadingLabel: {
    fontSize: 16,
    color: colors.textSecondary
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center'
  },
  errorContent: {
    alignItems: 'center'
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: 8
  },
  errorMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center'
  },
  noDataContainer: {
    padding: 24,
    alignItems: 'center'
  },
  noDataText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center'
  },
  mainFeeContainer: {
    padding: 20
  },
  feeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  feeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text
  },
  wasteTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  wasteTypeIcon: {
    fontSize: 16,
    marginRight: 6
  },
  wasteTypeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary
  },
  totalFeeContainer: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16
  },
  totalFeeLabel: {
    fontSize: 16,
    color: 'white',
    marginBottom: 4
  },
  totalFeeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white'
  },
  breakdownToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  breakdownToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
    marginRight: 8
  },
  breakdownToggleIcon: {
    fontSize: 12,
    color: colors.secondary,
    transform: [{ rotate: '0deg' }]
  },
  breakdownToggleIconExpanded: {
    transform: [{ rotate: '180deg' }]
  },
  breakdown: {
    overflow: 'hidden'
  },
  breakdownContent: {
    padding: 16,
    backgroundColor: colors.surface
  },
  modelInfo: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8
  },
  modelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4
  },
  modelDescription: {
    fontSize: 12,
    color: colors.textSecondary
  },
  feeComponents: {
    marginBottom: 8
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6
  },
  feeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8
  },
  subtotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text
  },
  subtotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text
  },
  additionalInfo: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    marginTop: 16
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text
  },
  paymentNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 16
  },
  paymentNoteIcon: {
    fontSize: 16,
    marginRight: 8
  },
  paymentNoteText: {
    fontSize: 12,
    color: colors.secondary,
    flex: 1
  }
});

export default FeeDisplay;
