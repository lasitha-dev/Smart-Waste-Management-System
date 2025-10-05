/**
 * Profile Screen
 * User profile and account management screen
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module ProfileScreen
 */

import React from 'react';
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
import { mockResident } from '../api/mockData';

/**
 * Profile Screen Component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object
 */
const ProfileScreen = ({ navigation }) => {

  /**
   * Handles contact support
   */
  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Phone: +94 11 123 4567\nEmail: support@wastemanagement.lk\n\nWould you like to call now?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Now', onPress: () => console.log('📞 Calling support...') }
      ]
    );
  };

  /**
   * Handles logout
   */
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => {
          console.log('👋 User logged out');
          // In a real app, this would clear auth tokens and navigate to login
        }}
      ]
    );
  };

  /**
   * Renders profile header
   */
  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>
          {mockResident.name.split(' ').map(n => n[0]).join('')}
        </Text>
      </View>
      <Text style={styles.userName}>{mockResident.name}</Text>
      <Text style={styles.userEmail}>{mockResident.email}</Text>
      <Text style={styles.userAddress}>{mockResident.address}</Text>
    </View>
  );

  /**
   * Renders account info section
   */
  const renderAccountInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Account Information</Text>
      
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Account Status:</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: mockResident.accountStatus === 'active' ? colors.success : colors.error }
          ]}>
            <Text style={styles.statusText}>
              {mockResident.accountStatus.toUpperCase()}
            </Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Member Since:</Text>
          <Text style={styles.infoValue}>
            {new Date(mockResident.registrationDate).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Billing Model:</Text>
          <Text style={styles.infoValue}>
            {mockResident.billingModel === 'hybrid' ? 'Hybrid Model' :
             mockResident.billingModel === 'flat' ? 'Flat Rate' : 'Weight-Based'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Linked Bins:</Text>
          <Text style={styles.infoValue}>{mockResident.linkedBins.length} bins</Text>
        </View>
      </View>
    </View>
  );

  /**
   * Renders settings section
   */
  const renderSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Settings</Text>
      
      <TouchableOpacity style={styles.settingItem}>
        <Text style={styles.settingIcon}>🔔</Text>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>Notifications</Text>
          <Text style={styles.settingSubtitle}>Manage your notification preferences</Text>
        </View>
        <Text style={styles.settingArrow}>›</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.settingItem}>
        <Text style={styles.settingIcon}>💳</Text>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>Payment Methods</Text>
          <Text style={styles.settingSubtitle}>Manage payment options</Text>
        </View>
        <Text style={styles.settingArrow}>›</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.settingItem}>
        <Text style={styles.settingIcon}>🗑️</Text>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>Bin Management</Text>
          <Text style={styles.settingSubtitle}>Add or remove bins</Text>
        </View>
        <Text style={styles.settingArrow}>›</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.settingItem}>
        <Text style={styles.settingIcon}>🌍</Text>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>Environmental Impact</Text>
          <Text style={styles.settingSubtitle}>View your sustainability metrics</Text>
        </View>
        <Text style={styles.settingArrow}>›</Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * Renders support section
   */
  const renderSupport = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Support</Text>
      
      <TouchableOpacity style={styles.settingItem} onPress={handleContactSupport}>
        <Text style={styles.settingIcon}>📞</Text>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>Contact Support</Text>
          <Text style={styles.settingSubtitle}>Get help with your account</Text>
        </View>
        <Text style={styles.settingArrow}>›</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.settingItem}>
        <Text style={styles.settingIcon}>❓</Text>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>FAQ</Text>
          <Text style={styles.settingSubtitle}>Frequently asked questions</Text>
        </View>
        <Text style={styles.settingArrow}>›</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.settingItem}>
        <Text style={styles.settingIcon}>📋</Text>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>Terms & Privacy</Text>
          <Text style={styles.settingSubtitle}>Legal information</Text>
        </View>
        <Text style={styles.settingArrow}>›</Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * Renders logout section
   */
  const renderLogout = () => (
    <View style={styles.section}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        {renderProfileHeader()}
        
        {/* Account Information */}
        {renderAccountInfo()}
        
        {/* Settings */}
        {renderSettings()}
        
        {/* Support */}
        {renderSupport()}
        
        {/* Logout */}
        {renderLogout()}
        
        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Smart Waste Management v1.0.0</Text>
          <Text style={styles.versionText}>© 2024 Waste Management Solutions</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const colors = {
  primary: '#4CAF50',
  secondary: '#2196F3',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#f44336',
  disabled: '#9E9E9E',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#212121',
  textSecondary: '#757575',
  border: '#E0E0E0'
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flex: 1
  },
  profileHeader: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.primary
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white'
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4
  },
  userAddress: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center'
  },
  section: {
    padding: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold'
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: 'center'
  },
  settingContent: {
    flex: 1
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2
  },
  settingSubtitle: {
    fontSize: 14,
    color: colors.textSecondary
  },
  settingArrow: {
    fontSize: 20,
    color: colors.textSecondary
  },
  logoutButton: {
    backgroundColor: colors.error,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  versionContainer: {
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  versionText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4
  }
});

export default ProfileScreen;
