/**
 * RouteManagementScreen Component
 * Displays the route management interface for bin collection
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';

/**
 * RouteManagementScreen
 * Main screen for managing bin collection routes
 * @returns {JSX.Element} The RouteManagementScreen component
 */
const RouteManagementScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Route Management</Text>
      </View>
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
});

export default RouteManagementScreen;
