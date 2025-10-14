/**
 * DashboardScreen Component
 * Main dashboard displaying collection statistics and overview
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';
import { useRoute } from '../../context/RouteContext';

/**
 * SummaryCard Component
 * Displays a single stat card with label and value
 */
const SummaryCard = ({ label, value, color }) => (
  <View style={[styles.card, { borderLeftColor: color }]}>
    <Text style={styles.cardLabel}>{label}</Text>
    <Text style={styles.cardValue}>{value}</Text>
  </View>
);

/**
 * DashboardScreen
 * Main dashboard screen for bin collection overview
 * @returns {JSX.Element} The DashboardScreen component
 */
const DashboardScreen = () => {
  // Get dynamic statistics from RouteContext
  const { getStatistics } = useRoute();
  const stats = getStatistics();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good Morning, Alex!</Text>
          <Text style={styles.subtitle}>Here's your collection summary</Text>
        </View>

        {/* Summary Cards Grid */}
        <View style={styles.statsGrid}>
          <SummaryCard
            label="Completed"
            value={stats.completed}
            color={COLORS.accentGreen}
          />
          <SummaryCard
            label="Pending"
            value={stats.pending}
            color={COLORS.primaryDarkTeal}
          />
          <SummaryCard
            label="Efficiency"
            value={stats.efficiency}
            color={COLORS.accentGreen}
          />
          <SummaryCard
            label="Issues"
            value={stats.issues}
            color={COLORS.alertRed}
          />
        </View>

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <Text style={styles.placeholder}>Route Management</Text>
            <Text style={styles.placeholder}>View Reports</Text>
          </View>
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
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: FONTS.size.heading,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.regular,
    color: COLORS.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardLabel: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 8,
    opacity: 0.7,
  },
  cardValue: {
    fontSize: FONTS.size.heading,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: FONTS.size.subheading,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  actionsContainer: {
    gap: 12,
  },
  placeholder: {
    fontSize: FONTS.size.body,
    color: COLORS.textSecondary,
    padding: 12,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
  },
});

export default DashboardScreen;
