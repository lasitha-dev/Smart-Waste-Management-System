/**
 * Admin Home Screen
 * Main dashboard screen for admin/scheduling users
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
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../../constants/theme';

/**
 * Home Screen Component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object
 */
const HomeScreen = ({ navigation }) => {
  const [dashboardData, setDashboardData] = useState({
    bins: [
      { id: '1', type: 'General Waste', location: 'Kitchen', currentFillLevel: 75 },
      { id: '2', type: 'Recyclable', location: 'Garage', currentFillLevel: 60 },
      { id: '3', type: 'Organic Waste', location: 'Backyard', currentFillLevel: 85 },
    ],
    upcomingBookings: [
      {
        id: 'b1',
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        timeSlot: '08:00 AM - 12:00 PM',
        wasteType: 'General Waste',
        status: 'confirmed',
        binIds: ['1', '2']
      }
    ],
    autoPickupBins: [],
    loading: false
  });

  useEffect(() => {
    // Simulate data loading
    const autoPickup = dashboardData.bins.filter(bin => bin.currentFillLevel > 80);
    setDashboardData(prev => ({ ...prev, autoPickupBins: autoPickup }));
  }, []);

  /**
   * Handles quick schedule action
   */
  const handleQuickSchedule = () => {
    navigation.navigate('Schedule');
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
      <Text style={styles.userName}>Admin User! 👋</Text>
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
          <Text style={styles.alertIcon}>⚠️</Text>
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
          onPress={() => navigation.navigate('History')}
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
                      backgroundColor: bin.currentFillLevel > 80 ? '#F44336' : 
                                     bin.currentFillLevel > 50 ? '#FF9800' : '#4CAF50'
                    }
                  ]} 
                />
              </View>
            </View>
            {bin.currentFillLevel > 80 && (
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
                {booking.scheduledDate.toLocaleDateString()}
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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
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
    color: '#666',
    marginTop: 16
  },
  welcomeSection: {
    padding: 24,
    backgroundColor: '#E8F5E9',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666'
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#666'
  },
  urgentAlert: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336'
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
    color: '#F44336'
  },
  alertMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8
  },
  alertAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336'
  },
  quickActionsSection: {
    padding: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 6,
    marginHorizontal: 4,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  overviewSection: {
    padding: 16
  },
  binOverviewCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 140,
    position: 'relative'
  },
  binType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  binLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12
  },
  fillLevelContainer: {
    marginBottom: 8
  },
  fillLevelText: {
    fontSize: 12,
    color: '#666',
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
    backgroundColor: '#F44336',
    color: '#FFFFFF',
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
    backgroundColor: '#F5F5F5',
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
    color: '#333'
  },
  bookingStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    textTransform: 'uppercase'
  },
  bookingDetails: {
    fontSize: 14,
    color: '#666'
  }
});

export default HomeScreen;
