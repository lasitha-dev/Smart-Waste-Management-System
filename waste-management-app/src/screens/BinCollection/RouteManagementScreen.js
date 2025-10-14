/**
 * RouteManagementScreen Component
 * Displays the route management interface for bin collection
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';
import RouteListItem from '../../components/RouteListItem';
import { MOCK_STOPS } from '../../api/mockData';

/**
 * RouteManagementScreen
 * Main screen for managing bin collection routes
 * @returns {JSX.Element} The RouteManagementScreen component
 */
const RouteManagementScreen = () => {
  // State to manage the list of stops
  const [stops, setStops] = useState(MOCK_STOPS);

  /**
   * Updates the status of a stop
   * @param {number} stopId - ID of the stop to update
   * @param {string} newStatus - New status value
   */
  const updateStopStatus = (stopId, newStatus) => {
    setStops((prevStops) =>
      prevStops.map((stop) =>
        stop.id === stopId ? { ...stop, status: newStatus } : stop
      )
    );
  };

  /**
   * Renders a single route list item
   * @param {Object} params - Render item parameters
   * @param {Object} params.item - Stop object
   * @returns {JSX.Element} RouteListItem component
   */
  const renderItem = ({ item }) => (
    <RouteListItem stop={item} onStatusUpdate={updateStopStatus} />
  );

  /**
   * Extracts the key for each item
   * @param {Object} item - Stop object
   * @returns {string} Unique key
   */
  const keyExtractor = (item) => item.id.toString();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Route Management</Text>
      </View>
      <FlatList
        data={stops}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        testID="route-flatlist"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryDarkTeal,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.primaryDarkTeal,
  },
  title: {
    fontSize: FONTS.size.subheading,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.textPrimary,
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default RouteManagementScreen;
