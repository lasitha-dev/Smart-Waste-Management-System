/**
 * Home Screen
 * Main dashboard screen for the Smart Waste Management System
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module HomeScreen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SchedulingService from '../api/schedulingService';
import { mockResident } from '../api/mockData';
import { NavigationHelpers } from '../navigation/NavigationHelpers';
import { needsAutoPickup } from '../utils/schedulingHelpers';
import colors from '../constants/colors';
import spacing from '../constants/spacing';
import typography from '../constants/typography';

/**
 * Home Screen Component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object
 */
const HomeScreen = ({ navigation }) => {
  const [dashboardData, setDashboardData] = useState({
    bins: [],
    upcomingBookings: [],
    autoPickupBins: [],
    loading: true
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  /**
   * Loads dashboard data
   */
  const loadDashboardData = async () => {
    try {
      // Load bins
      const binsResult = await SchedulingService.getResidentBins(mockResident.id);
      
      // Load booking history
      const historyResult = await SchedulingService.getBookingHistory(mockResident.id);
      const upcomingBookings = historyResult.data.bookings
        .filter(booking => booking.status === 'confirmed')
        .slice(0, 3);

      setDashboardData({
        bins: binsResult.data.bins,
        upcomingBookings,
        autoPickupBins: binsResult.data.autoPickupBins,
        loading: false
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  /**
   * Handles quick schedule action
   */
  const handleQuickSchedule = () => {
    NavigationHelpers.navigateToScheduling(navigation);
  };

  /**
   * Handles urgent pickup alert
   */
  const handleUrgentPickup = () => {
    Alert.alert(
      'Urgent Pickup Required',
      `${dashboardData.autoPickupBins.length} of your bins need immediate pickup. Would you like to schedule now?`,
      [
        { text: 'Later', style: 'cancel' },
        { text: 'Schedule Now', onPress: handleQuickSchedule }
      ]
    );
  };

  /**
   * Renders welcome section
   */
  const renderWelcomeSection = () => (
    <View style={styles.welcomeSection}>
      <Text style={styles.welcomeText}>Welcome back,</Text>
      <Text style={styles.userName}>{mockResident.name}! 👋</Text>
      <Text style={styles.welcomeSubtext}>
        Let's keep your environment clean and green
      </Text>
    </View>
  );

  /**
   * Renders urgent alerts
   */
  const renderUrgentAlerts = () => {
    if (dashboardData.autoPickupBins.length === 0) return null;

    return (
      <TouchableOpacity style={styles.urgentAlert} onPress={handleUrgentPickup}>
        <View style={styles.alertHeader}>
          <Text style={styles.alertIcon}>🚨</Text>
          <Text style={styles.alertTitle}>Urgent Pickup Required</Text>
        </View>
        <Text style={styles.alertMessage}>
          {dashboardData.autoPickupBins.length} bin(s) are nearly full and need immediate collection
        </Text>
        <Text style={styles.alertAction}>Tap to schedule →</Text>
      </TouchableOpacity>
    );
  };

  /**
   * Renders quick actions
   */
  const renderQuickActions = () => (
    <View style={styles.quickActionsSection}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionCard} onPress={handleQuickSchedule}>
          <Text style={styles.actionIcon}>📅</Text>
          <Text style={styles.actionTitle}>Schedule Pickup</Text>
          <Text style={styles.actionSubtitle}>Book a collection</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => NavigationHelpers.navigateToHistory(navigation)}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionTitle}>View History</Text>
          <Text style={styles.actionSubtitle}>Past collections</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCard}>
          <Text style={styles.actionIcon}>💳</Text>
          <Text style={styles.actionTitle}>Payments</Text>
          <Text style={styles.actionSubtitle}>Billing & invoices</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCard}>
          <Text style={styles.actionIcon}>📞</Text>
          <Text style={styles.actionTitle}>Support</Text>
          <Text style={styles.actionSubtitle}>Get help</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /**
   * Renders bins overview
   */
  const renderBinsOverview = () => (
    <View style={styles.overviewSection}>
      <Text style={styles.sectionTitle}>Your Bins</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {dashboardData.bins.map(bin => (
          <View key={bin.id} style={styles.binOverviewCard}>
            <Text style={styles.binType}>{bin.type}</Text>
            <Text style={styles.binLocation}>{bin.location}</Text>
            <View style={styles.fillLevelContainer}>
              <Text style={styles.fillLevelText}>{bin.currentFillLevel}%</Text>
              <View style={styles.fillLevelBar}>
                <View 
                  style={[
                    styles.fillLevelProgress,
                    { 
                      width: `${bin.currentFillLevel}%`,
                      backgroundColor: bin.currentFillLevel > 80 ? '#f44336' : 
                                     bin.currentFillLevel > 50 ? '#FF9800' : '#4CAF50'
                    }
                  ]} 
                />
              </View>
            </View>
            {needsAutoPickup(bin) && (
              <Text style={styles.urgentBadge}>URGENT</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );

  /**
   * Renders upcoming bookings
   */
  const renderUpcomingBookings = () => {
    if (dashboardData.upcomingBookings.length === 0) return null;

    return (
      <View style={styles.bookingsSection}>
        <Text style={styles.sectionTitle}>Upcoming Collections</Text>
        
        {dashboardData.upcomingBookings.map(booking => (
          <View key={booking.id} style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
              <Text style={styles.bookingDate}>
                {new Date(booking.scheduledDate).toLocaleDateString()}
              </Text>
              <Text style={styles.bookingStatus}>{booking.status}</Text>
            </View>
            <Text style={styles.bookingDetails}>
              {booking.timeSlot} • {booking.wasteType} • {booking.binIds.length} bin(s)
            </Text>
          </View>
        ))}
      </View>
    );
  };

  if (dashboardData.loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingIcon}>🗑️</Text>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        {renderWelcomeSection()}
        
        {/* Urgent Alerts */}
        {renderUrgentAlerts()}
        
        {/* Quick Actions */}
        {renderQuickActions()}
        
        {/* Bins Overview */}
        {renderBinsOverview()}
        
        {/* Upcoming Bookings */}
        {renderUpcomingBookings()}
      </ScrollView>
    </SafeAreaView>
  );
};

// Colors imported from constants

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: 16
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary
  },
  welcomeSection: {
    padding: 24,
    backgroundColor: colors.primary,
  },
  welcomeText: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4
  },
  welcomeSubtext: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8
  },
  urgentAlert: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.error
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  alertIcon: {
    fontSize: 20,
    marginRight: 8
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.error
  },
  alertMessage: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8
  },
  alertAction: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '600'
  },
  quickActionsSection: {
    padding: 16
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  actionCard: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4
  },
  actionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center'
  },
  overviewSection: {
    padding: 16
  },
  binOverviewCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 140,
    position: 'relative'
  },
  binType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4
  },
  binLocation: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12
  },
  fillLevelContainer: {
    marginBottom: 8
  },
  fillLevelText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4
  },
  fillLevelBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden'
  },
  fillLevelProgress: {
    height: '100%',
    borderRadius: 3
  },
  urgentBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.error,
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8
  },
  bookingsSection: {
    padding: 16
  },
  bookingCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  bookingDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text
  },
  bookingStatus: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  bookingDetails: {
    fontSize: 14,
    color: colors.textSecondary
  }
});

export default HomeScreen;
