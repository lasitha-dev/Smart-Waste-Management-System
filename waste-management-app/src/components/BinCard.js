/**
 * BinCard Component
 * Reusable component for displaying waste bin information with selection capability
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module BinCard
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated
} from 'react-native';
import { InlineLoader } from './LoadingIndicator';
import { estimateBinWeight, needsAutoPickup } from '../utils/schedulingHelpers';
import { COLORS, FONTS, STYLES, createTextStyle } from '../constants/theme';
import colors from '../constants/colors';
import { typography } from '../constants/typography';

const { width } = Dimensions.get('window');

/**
 * BinCard component for displaying bin information
 * @param {Object} props - Component props
 * @param {Object} props.bin - Bin data object
 * @param {boolean} props.selected - Whether the bin is selected
 * @param {Function} props.onPress - Callback when bin is pressed
 * @param {boolean} props.disabled - Whether the bin is disabled
 * @param {boolean} props.showWeight - Whether to show estimated weight
 * @param {boolean} props.loading - Whether the bin is in loading state
 * @param {string} props.style - Additional styles
 */
const BinCard = ({
  bin,
  selected = false,
  onPress,
  disabled = false,
  showWeight = false,
  loading = false,
  style
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  if (!bin) {
    return null;
  }

  const estimatedWeight = showWeight ? estimateBinWeight(bin) : 0;
  const needsAuto = needsAutoPickup(bin);
  const fillPercentage = bin.currentFillLevel || 0;

  const handlePress = () => {
    if (disabled || loading) return;
    
    if (onPress) {
      // Animate press feedback
      setIsPressed(true);
      
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true
        })
      ]).start(() => {
        setIsPressed(false);
        onPress(bin);
      });
    }
  };

  /**
   * Determines the appropriate status color based on bin state
   * @returns {string} Color code for the current bin status
   */
  const getStatusColor = () => {
    if (disabled || bin.status !== 'Active') return colors.disabled;
    if (needsAuto) return COLORS.alertRed;
    if (fillPercentage > 70) return COLORS.highPriorityRed;
    if (fillPercentage > 40) return COLORS.accentGreen;
    return COLORS.progressStart;
  };

  /**
   * Returns the appropriate emoji icon for the waste bin type
   * @returns {string} Emoji representing the bin type
   */
  const getTypeIcon = () => {
    const WASTE_TYPE_ICONS = {
      'General Waste': '🗑️',
      'Recyclable': '♻️',
      'Organic': '🌱',
      'Bulky Items': '📦'
    };
    return WASTE_TYPE_ICONS[bin.type] || '🗑️';
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.container,
          selected && styles.selected,
          disabled && styles.disabled,
          loading && styles.loading,
          style
        ]}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.7}
        testID={`bin-card-${bin.id}`}
      >
        <View style={styles.header}>
          <View style={styles.typeContainer}>
            <Text style={styles.typeIcon}>{getTypeIcon()}</Text>
            <Text style={styles.typeText}>{bin.type}</Text>
          </View>
          
          {loading ? (
            <InlineLoader size="small" color={colors.primary} />
          ) : (
            <>
              {selected && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
              
              {needsAuto && (
                <View style={styles.autoPickupBadge}>
                  <Text style={styles.autoPickupText}>AUTO</Text>
                </View>
              )}
            </>
          )}
        </View>

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Location:</Text>
          <Text style={styles.value}>{bin.location}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Capacity:</Text>
          <Text style={styles.value}>{bin.capacity}L</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[
            styles.value,
            bin.status === 'Active' ? styles.activeStatus : styles.inactiveStatus
          ]}>
            {bin.status}
          </Text>
        </View>

        {showWeight && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Est. Weight:</Text>
            <Text style={styles.value}>{estimatedWeight}kg</Text>
          </View>
        )}
      </View>

      {/* Fill Level Indicator */}
      <View style={styles.fillLevelContainer}>
        <View style={styles.fillLevelHeader}>
          <Text style={styles.fillLevelLabel}>Fill Level</Text>
          <Text style={styles.fillLevelPercentage}>{fillPercentage}%</Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${fillPercentage}%`,
                backgroundColor: getStatusColor()
              }
            ]}
          />
        </View>
      </View>

      {/* Smart Bin Features */}
      {bin.isSmartBin && (
        <View style={styles.smartBinContainer}>
          <Text style={styles.smartBinLabel}>📱 Smart Bin</Text>
          <View style={styles.smartFeatures}>
            <Text style={[
              styles.feature,
              bin.sensorEnabled ? styles.featureEnabled : styles.featureDisabled
            ]}>
              Sensor: {bin.sensorEnabled ? 'ON' : 'OFF'}
            </Text>
            
            {bin.autoPickupThreshold && (
              <Text style={styles.feature}>
                Auto-pickup at {bin.autoPickupThreshold}%
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Last Emptied */}
      {bin.lastEmptied && (
        <View style={styles.lastEmptiedContainer}>
          <Text style={styles.lastEmptiedText}>
            Last emptied: {new Date(bin.lastEmptied).toLocaleDateString()}
          </Text>
        </View>
      )}

        {/* Disabled/Loading Overlay */}
        {(disabled || loading) && (
          <View style={styles.disabledOverlay}>
            {loading ? (
              <InlineLoader text="Processing..." size="small" color={colors.primary} />
            ) : (
              <Text style={styles.disabledText}>Unavailable</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};


const styles = StyleSheet.create({
  container: {
    ...STYLES.card,
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative'
  },
  selected: {
    borderColor: COLORS.accentGreen,
    backgroundColor: COLORS.modalBackground
  },
  disabled: {
    opacity: 0.6
  },
  loading: {
    opacity: 0.8,
    borderColor: COLORS.accentGreen,
    backgroundColor: COLORS.modalBackground
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  typeIcon: {
    fontSize: 24,
    marginRight: 8
  },
  typeText: {
    fontSize: FONTS.size.subheading,
    fontWeight: FONTS.weight.bold,
    color: colors.text,
    flex: 1
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accentGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8
  },
  checkmarkText: {
    color: COLORS.textPrimary,
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold
  },
  autoPickupBadge: {
    backgroundColor: COLORS.alertRed,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8
  },
  autoPickupText: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: FONTS.weight.bold
  },
  content: {
    marginBottom: 12
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  label: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.regular,
    color: colors.textLight
  },
  value: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.semiBold,
    color: colors.text
  },
  activeStatus: {
    color: COLORS.accentGreen
  },
  inactiveStatus: {
    color: COLORS.alertRed
  },
  fillLevelContainer: {
    marginBottom: 12
  },
  fillLevelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  fillLevelLabel: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.regular,
    color: colors.textLight
  },
  fillLevelPercentage: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.bold,
    color: colors.text
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.textSecondary,
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
    minWidth: 2
  },
  smartBinContainer: {
    backgroundColor: COLORS.modalBackground,
    padding: 8,
    borderRadius: 8,
    marginBottom: 8
  },
  smartBinLabel: {
    fontSize: FONTS.size.small - 2,
    fontWeight: FONTS.weight.bold,
    color: colors.info,
    marginBottom: 4
  },
  smartFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  feature: {
    fontSize: 11,
    fontWeight: FONTS.weight.regular,
    color: colors.textLight,
    marginRight: 12,
    marginBottom: 2
  },
  featureEnabled: {
    color: COLORS.accentGreen
  },
  featureDisabled: {
    color: COLORS.alertRed
  },
  lastEmptiedContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8
  },
  lastEmptiedText: {
    fontSize: FONTS.size.small - 2,
    fontWeight: FONTS.weight.regular,
    color: colors.textLight,
    textAlign: 'center'
  },
  disabledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12
  },
  disabledText: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: colors.disabled
  }
});

export default BinCard;
