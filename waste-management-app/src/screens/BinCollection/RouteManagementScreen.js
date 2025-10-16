/**
 * RouteManagementScreen Component
 * Displays the route management interface for bin collection
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';
import { useRoute } from '../../context/RouteContext';
import StatCard from '../../components/StatCard';
import ProgressBar from '../../components/ProgressBar';
import NextStopCard from '../../components/NextStopCard';

/**
 * RouteManagementScreen
 * Main screen for managing bin collection routes
 * @returns {JSX.Element} The RouteManagementScreen component
 */
const RouteManagementScreen = ({ navigation }) => {
  // Get route data and functions from context
  const { getStatistics, getPendingStops, routeInfo } = useRoute();
  const stats = getStatistics();
  const pendingStops = getPendingStops();

  const handleStopPress = (stop) => {
    // Navigate to stop details or bin details
    console.log('Navigate to stop:', stop.binId);
  };

  const handleMapViewPress = () => {
    // Navigate to map view (placeholder for future implementation)
    console.log('Navigate to map view');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Route Management</Text>
            <Text style={styles.routeInfo}>{routeInfo.routeNumber}</Text>
          </View>
          <TouchableOpacity 
            style={styles.mapButton}
            onPress={handleMapViewPress}
          >
            <Text style={styles.mapButtonIcon}>🗺️</Text>
            <Text style={styles.mapButtonText}>Map View</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsRow}>
          <StatCard 
            label="Completed" 
            value={stats.completed}
            style={styles.statCard}
          />
          <StatCard 
            label="Remaining" 
            value={stats.remaining}
            style={styles.statCard}
          />
          <StatCard 
            label="Issues" 
            value={stats.issues}
            style={styles.statCard}
          />
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressPercentage}>{stats.percentage}%</Text>
            <Text style={styles.etaText}>ETA: {stats.eta}</Text>
          </View>
          <ProgressBar 
            percentage={stats.percentage} 
            showPercentage={false}
            fillColor={COLORS.accentGreen}
            backgroundColor={COLORS.textSecondary + '40'}
            height={12}
          />
        </View>

        {/* Next Stops Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Next Stops</Text>
          <Text style={styles.sectionSubtitle}>
            {pendingStops.length} stops remaining
          </Text>
          
          {pendingStops.length > 0 ? (
            pendingStops.map((stop, index) => (
              <NextStopCard
                key={stop.id}
                stop={stop}
                sequence={index + 1}
                onPress={handleStopPress}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>✅</Text>
              <Text style={styles.emptyStateText}>
                All stops completed!
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Great work today!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryDarkTeal,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: FONTS.size.heading,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  routeInfo: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.regular,
    color: COLORS.textSecondary,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightCard,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  mapButtonIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  mapButtonText: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.primaryDarkTeal,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 8,
  },
  statCard: {
    flex: 1,
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressPercentage: {
    fontSize: FONTS.size.heading,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
  etaText: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.textSecondary,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: FONTS.size.subheading,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.regular,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: FONTS.size.subheading,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.regular,
    color: COLORS.textSecondary,
  },
});

export default RouteManagementScreen;
