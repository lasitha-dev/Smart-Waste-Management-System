/**
 * NextStopCard Component
 * Displays the next stop information with sequence, bin ID, address, priority, distance, and fill level
 */

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';
import PriorityBadge from './PriorityBadge';

/**
 * NextStopCard Component
 * @param {Object} props - Component props
 * @param {Object} props.stop - Stop object containing bin information
 * @param {number} props.sequence - Sequence number in the route
 * @param {string} props.backgroundColor - Background color of the card
 * @param {Function} props.onPress - Callback when card is pressed
 * @param {Object} props.style - Additional styles
 * @returns {JSX.Element} The NextStopCard component
 */
const NextStopCard = ({
  stop = {},
  sequence = 0,
  backgroundColor = COLORS.lightCard,
  onPress,
  style,
}) => {
  const {
    binId = '',
    address = '',
    priority,
    distance = '',
    fillLevel,
  } = stop;

  const testID = `next-stop-card-${sequence}`;
  const fillLevelDisplay = fillLevel != null ? `${fillLevel}%` : '';

  const handlePress = () => {
    if (onPress) {
      onPress(stop);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor }, style]}
      testID={testID}
      onPress={handlePress}
      accessible={true}
      activeOpacity={0.7}
    >
      {/* Sequence Number */}
      <View style={styles.sequenceContainer} testID="sequence-number">
        <Text style={styles.sequenceNumber}>{sequence}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Bin ID and Priority */}
        <View style={styles.headerRow}>
          <Text style={styles.binId}>{binId}</Text>
          {priority && (
            <PriorityBadge priority={priority} style={styles.priorityBadge} />
          )}
        </View>

        {/* Address */}
        <Text style={styles.address}>{address}</Text>

        {/* Distance and Fill Level */}
        <View style={styles.infoRow}>
          {distance && (
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📍</Text>
              <Text style={styles.infoText}>{distance}</Text>
            </View>
          )}
          {fillLevel != null && (
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>🗑️</Text>
              <Text style={styles.infoText}>{fillLevelDisplay}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Arrow Button */}
      <View style={styles.arrowContainer}>
        <Text style={styles.arrow}>→</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sequenceContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryDarkTeal,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sequenceNumber: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  binId: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
    marginRight: 8,
  },
  priorityBadge: {
    marginLeft: 0,
  },
  address: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.regular,
    color: COLORS.primaryDarkTeal,
    opacity: 0.7,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  infoText: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.regular,
    color: COLORS.primaryDarkTeal,
    opacity: 0.7,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryDarkTeal + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  arrow: {
    fontSize: 18,
    color: COLORS.primaryDarkTeal,
  },
});

export default NextStopCard;
