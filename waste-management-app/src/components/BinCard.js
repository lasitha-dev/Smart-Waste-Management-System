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

  const getStatusColor = () => {
    if (disabled || bin.status !== 'Active') return colors.disabled;
    if (needsAuto) return colors.warning;
    if (fillPercentage > 70) return colors.high;
    if (fillPercentage > 40) return colors.medium;
    return colors.low;
  };

  const getTypeIcon = () => {
    const icons = {
      'General Waste': '🗑️',
      'Recyclable': '♻️',
      'Organic': '🌱',
      'Bulky Items': '📦'
    };
    return icons[bin.type] || '🗑️';
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

const colors = {
  primary: '#4CAF50',
  secondary: '#2196F3',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#f44336',
  disabled: '#9E9E9E',
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#f44336',
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
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative'
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: '#E8F5E8'
  },
  disabled: {
    opacity: 0.6
  },
  loading: {
    opacity: 0.8,
    borderColor: colors.primary,
    backgroundColor: '#F0F8F0'
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
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8
  },
  checkmarkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  autoPickupBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8
  },
  autoPickupText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold'
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
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500'
  },
  value: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600'
  },
  activeStatus: {
    color: colors.success
  },
  inactiveStatus: {
    color: colors.error
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
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500'
  },
  fillLevelPercentage: {
    fontSize: 14,
    color: colors.text,
    fontWeight: 'bold'
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
    minWidth: 2
  },
  smartBinContainer: {
    backgroundColor: colors.surface,
    padding: 8,
    borderRadius: 8,
    marginBottom: 8
  },
  smartBinLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: 4
  },
  smartFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  feature: {
    fontSize: 11,
    color: colors.textSecondary,
    marginRight: 12,
    marginBottom: 2
  },
  featureEnabled: {
    color: colors.success
  },
  featureDisabled: {
    color: colors.error
  },
  lastEmptiedContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8
  },
  lastEmptiedText: {
    fontSize: 12,
    color: colors.textSecondary,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.disabled
  }
});

export default BinCard;
