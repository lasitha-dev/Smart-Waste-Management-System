/**
 * RouteListItem Component
 * Displays a single stop item in the route management list
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS } from '../constants/theme';

/**
 * RouteListItem
 * Renders a card displaying stop information including bin ID, address, and priority
 * @param {Object} props - Component props
 * @param {Object} props.stop - Stop object containing id, binId, address, status, and priority
 * @returns {JSX.Element} The RouteListItem component
 */
const RouteListItem = ({ stop }) => {
  const navigation = useNavigation();

  /**
   * Get priority tag color based on priority level
   * @param {string} priority - Priority level (high, medium, low)
   * @returns {string} Color hex code
   */
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return COLORS.highPriorityRed;
      case 'medium':
        return COLORS.accentGreen;
      case 'low':
        return COLORS.textSecondary;
      default:
        return COLORS.textSecondary;
    }
  };

  /**
   * Handle press event to navigate to ScanBin screen
   */
  const handlePress = () => {
    navigation.navigate('ScanBin', { stop });
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.7}
      testID={`route-item-${stop.id}`}
    >
      <View style={styles.contentContainer}>
        <View style={styles.mainInfo}>
          <Text style={styles.binId}>{stop.binId}</Text>
          <Text style={styles.address}>{stop.address}</Text>
        </View>
        <View style={[styles.priorityTag, { backgroundColor: getPriorityColor(stop.priority) }]}>
          <Text style={styles.priorityText}>{stop.priority}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  mainInfo: {
    flex: 1,
    marginRight: 12,
  },
  binId: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 4,
  },
  address: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.regular,
    color: COLORS.primaryDarkTeal,
    opacity: 0.7,
  },
  priorityTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
  },
});

export default RouteListItem;
